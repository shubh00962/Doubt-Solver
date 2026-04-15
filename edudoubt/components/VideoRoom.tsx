'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface VideoRoomProps {
  sessionId: string;
  agoraConfig: { token: string; channelName: string; uid: number; appId: string };
  onEndCall: () => void;
  userName: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export default function VideoRoom({ sessionId, agoraConfig, onEndCall, userName }: VideoRoomProps) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [color, setColor] = useState('#6C63FF');
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initSocket();
    initAgora();
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      cleanup();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initSocket = () => {
    fetch('/api/socket').finally(() => {
      const socket = io({ path: '/api/socket' });
      socketRef.current = socket;
      socket.emit('join-room', sessionId);
      socket.on('chat-message', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });
      socket.on('whiteboard-draw', (data: any) => {
        drawOnCanvas(data);
      });
      socket.on('whiteboard-clear', () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    });
  };

  const initAgora = async () => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;

      client.on('user-published', async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      await client.join(agoraConfig.appId, agoraConfig.channelName, agoraConfig.token, agoraConfig.uid);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];
      if (localVideoRef.current) videoTrack.play(localVideoRef.current);
      await client.publish([audioTrack, videoTrack]);
    } catch (err) {
      console.error('Agora init error:', err);
      toast.error('Could not access camera/microphone');
    }
  };

  const cleanup = async () => {
    localTracksRef.current.forEach((track) => { track.stop(); track.close(); });
    if (agoraClientRef.current) await agoraClientRef.current.leave();
    socketRef.current?.disconnect();
  };

  const toggleMute = () => {
    const audioTrack = localTracksRef.current[0];
    if (audioTrack) {
      audioTrack.setEnabled(muted);
      setMuted(!muted);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localTracksRef.current[1];
    if (videoTrack) {
      videoTrack.setEnabled(cameraOff);
      setCameraOff(!cameraOff);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    socketRef.current?.emit('chat-message', { roomId: sessionId, message: msg });
    setMessages((prev) => [...prev, msg]);
    setChatInput('');
  };

  const drawOnCanvas = (data: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = data.color || '#6C63FF';
    ctx.lineWidth = data.tool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    if (data.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    } else if (data.type === 'draw') {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    const data = { type: 'start', x: e.clientX - rect.left, y: e.clientY - rect.top, color, tool };
    drawOnCanvas(data);
    socketRef.current?.emit('whiteboard-draw', { roomId: sessionId, data });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const data = { type: 'draw', x: e.clientX - rect.left, y: e.clientY - rect.top, color, tool };
    drawOnCanvas(data);
    socketRef.current?.emit('whiteboard-draw', { roomId: sessionId, data });
  };

  const handleCanvasMouseUp = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      socketRef.current?.emit('whiteboard-clear', sessionId);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-white font-semibold">EduDoubt Session</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-mono">
          🔴 {formatTime(elapsed)}
        </div>
        <div className="text-gray-400 text-sm">Session ID: {sessionId.slice(-8)}</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative bg-gray-900">
          {/* Remote video (large) */}
          <div ref={remoteVideoRef} className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-5xl mb-3">👤</div>
              <p>Waiting for other participant...</p>
            </div>
          </div>

          {/* Local video (PiP) */}
          <div ref={localVideoRef} className="absolute bottom-4 right-4 w-40 h-28 bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600 shadow-lg" />

          {/* Whiteboard overlay */}
          {whiteboardOpen && (
            <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95">
              <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-white">Whiteboard</span>
                <div className="flex gap-2 ml-4">
                  {(['pen', 'eraser', 'text'] as const).map((t) => (
                    <button key={t} onClick={() => setTool(t)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tool === t ? 'bg-[#6C63FF] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {t === 'pen' ? '✏️' : t === 'eraser' ? '🧹' : '📝'} {t}
                    </button>
                  ))}
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <button onClick={clearCanvas} className="px-3 py-1 rounded-lg text-sm bg-red-50 text-red-500 hover:bg-red-100">Clear</button>
                </div>
                <button onClick={() => setWhiteboardOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full cursor-crosshair"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <span className="text-white font-semibold">Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`${msg.sender === userName ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.sender === userName ? 'bg-[#6C63FF] text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {msg.sender !== userName && <div className="text-xs text-gray-400 mb-1">{msg.sender}</div>}
                    {msg.text}
                    <div className="text-xs opacity-60 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
              />
              <button onClick={sendMessage} className="bg-[#6C63FF] text-white px-3 py-2 rounded-xl text-sm hover:bg-[#5a52e0]">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${muted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🎤'}
          </button>
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${cameraOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title={cameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {cameraOff ? '📵' : '📹'}
          </button>
          <button
            onClick={() => setWhiteboardOpen(!whiteboardOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${whiteboardOpen ? 'bg-[#6C63FF] text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="Whiteboard"
          >
            ✏️
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${chatOpen ? 'bg-[#6C63FF] text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="Chat"
          >
            💬
          </button>
          <button
            onClick={onEndCall}
            className="w-14 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl transition-colors"
            title="End Call"
          >
            📵
          </button>
        </div>
      </div>
    </div>
  );
}
