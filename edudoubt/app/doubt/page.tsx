'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MathRenderer = dynamic(() => import('@/components/MathRenderer'), { ssr: false });

const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

interface AIAnswer {
  steps: string[];
  finalAnswer: string;
  tip: string;
  subject: string;
}

interface DoubtHistory {
  _id: string;
  question: string;
  subject: string;
  aiAnswer: AIAnswer;
  createdAt: string;
}

function DoubtPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [question, setQuestion] = useState(searchParams.get('q') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || 'General');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AIAnswer | null>(null);
  const [history, setHistory] = useState<DoubtHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [voted, setVoted] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) fetchHistory();
    if (searchParams.get('q')) handleSolve();
  }, [session]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get('/api/doubts/history');
      setHistory(res.data.doubts);
    } catch {}
    setHistoryLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/upload', formData);
      setImageUrl(res.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  };

  const handleSolve = async () => {
    if (!question.trim()) return toast.error('Please enter a question');
    if (!session) return router.push('/login');
    setLoading(true);
    setAnswer(null);
    setVoted(null);
    try {
      const res = await axios.post('/api/doubts/solve', { question, imageUrl, subject });
      setAnswer(res.data.aiAnswer);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to solve doubt');
    }
    setLoading(false);
  };

  const handleVote = async (helpful: boolean) => {
    setVoted(helpful);
    if (history[0]) {
      await axios.patch('/api/doubts/history', { doubtId: history[0]._id, helpful });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main area */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ask Your Doubt</h1>

            <div className="card mb-6">
              <div className="mb-4">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field mb-4"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here... e.g. 'Solve x² + 5x + 6 = 0' or 'Explain Newton's second law'"
                  className="input-field min-h-[140px] resize-none text-base"
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSolve(); }}
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    📷 Upload Image
                  </button>
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                      <button onClick={() => { setImageUrl(''); setImagePreview(''); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                    </div>
                  )}
                </div>
                <button onClick={handleSolve} disabled={loading} className="btn-primary">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Solving...
                    </span>
                  ) : '✨ Solve Now'}
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="card animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              </div>
            )}

            {/* AI Answer */}
            {answer && !loading && (
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center text-white text-sm">🤖</div>
                  <h2 className="font-bold text-gray-900 dark:text-white">AI Solution</h2>
                  <span className="ml-auto text-xs bg-[#00C9A7]/10 text-[#00C9A7] px-2 py-1 rounded-full">{answer.subject || subject}</span>
                </div>

                <div className="space-y-4 mb-6">
                  {answer.steps?.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 bg-[#6C63FF]/10 text-[#6C63FF] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        <MathRenderer text={step} />
                      </div>
                    </div>
                  ))}
                </div>

                {answer.finalAnswer && (
                  <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/30 rounded-xl p-4 mb-4">
                    <div className="text-xs font-semibold text-[#00C9A7] mb-1">FINAL ANSWER</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      <MathRenderer text={answer.finalAnswer} />
                    </div>
                  </div>
                )}

                {answer.tip && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                    <div className="text-xs font-semibold text-yellow-600 mb-1">💡 TIP TO REMEMBER</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{answer.tip}</div>
                  </div>
                )}

                {voted === null ? (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Was this helpful?</span>
                    <button onClick={() => handleVote(true)} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors">
                      👍 Yes
                    </button>
                    <button onClick={() => handleVote(false)} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-sm hover:bg-red-100 transition-colors">
                      👎 No
                    </button>
                  </div>
                ) : voted === false ? (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-3">Need more help? Talk to an expert tutor.</p>
                    <Link href="/experts" className="btn-accent inline-block text-sm">
                      👨‍🏫 Talk to an Expert
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-green-600">
                    ✅ Great! Glad it helped.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History sidebar */}
          <div className="lg:w-80">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Doubts</h2>
            {!session ? (
              <div className="card text-center text-sm text-gray-500">
                <Link href="/login" className="text-[#6C63FF] hover:underline">Sign in</Link> to see your history
              </div>
            ) : historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="card text-center text-sm text-gray-500">No doubts yet. Ask your first question!</div>
            ) : (
              <div className="space-y-3">
                {history.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => { setQuestion(d.question); setSubject(d.subject); setAnswer(d.aiAnswer); }}
                    className="w-full text-left card p-4 hover:border-[#6C63FF] transition-colors cursor-pointer"
                  >
                    <div className="text-xs text-[#6C63FF] font-medium mb-1">{d.subject}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{d.question}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(d.createdAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoubtPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full" /></div>}>
      <DoubtPageContent />
    </Suspense>
  );
}
