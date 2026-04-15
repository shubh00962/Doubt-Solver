'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import axios from 'axios';
import dynamic from 'next/dynamic';

const VideoRoom = dynamic(() => import('@/components/VideoRoom'), { ssr: false });

export default function RoomPage() {
  const { sessionId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [agoraConfig, setAgoraConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ended, setEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (!session) return;
    axios.post(`/api/sessions/${sessionId}/join`).then((res) => {
      setAgoraConfig(res.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to join session');
      setLoading(false);
    });
    axios.get(`/api/sessions/${sessionId}`).then((res) => setSessionData(res.data.session)).catch(() => {});
  }, [session, sessionId]);

  const handleEndCall = () => setEnded(true);

  const handleSubmitReview = async () => {
    if (!rating) return toast.error('Please select a rating');
    try {
      await axios.post('/api/reviews', {
        sessionId,
        expertId: sessionData?.expertId,
        rating,
        comment,
      });
      toast.success('Review submitted!');
      router.push('/dashboard/student');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Please sign in to join the session.</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-[#6C63FF] border-t-transparent rounded-full mx-auto mb-4" />
        <p>Joining session...</p>
      </div>
    </div>
  );

  if (ended) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Ended</h2>
        <p className="text-gray-500 mb-6">How was your session?</p>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] mb-4 resize-none"
          rows={3}
        />
        <button onClick={handleSubmitReview} className="btn-primary w-full mb-3">Submit Review</button>
        <button onClick={() => router.push('/dashboard/student')} className="btn-secondary w-full">Skip</button>
      </div>
    </div>
  );

  return (
    <VideoRoom
      sessionId={sessionId as string}
      agoraConfig={agoraConfig}
      onEndCall={handleEndCall}
      userName={session.user?.name || 'User'}
    />
  );
}
