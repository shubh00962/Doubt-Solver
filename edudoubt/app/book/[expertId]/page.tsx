'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import axios from 'axios';

const DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
];

function BookingContent() {
  const { expertId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [expert, setExpert] = useState<any>(null);
  const [sessionType, setSessionType] = useState<'instant' | 'scheduled'>(
    searchParams.get('instant') === 'true' ? 'instant' : 'scheduled'
  );
  const [duration, setDuration] = useState(30);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [createdSession, setCreatedSession] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/experts/${expertId}`).then((res) => setExpert(res.data.expert)).catch(() => {});
  }, [expertId]);

  const price = expert ? Math.round((expert.hourlyRate / 60) * duration) : 0;

  const handleBook = async () => {
    if (!session) return router.push('/login');
    if (sessionType === 'scheduled' && !scheduledAt) return toast.error('Please select a time');
    setLoading(true);
    try {
      // Create session
      const sessionRes = await axios.post('/api/sessions/create', {
        expertId,
        duration,
        scheduledAt: sessionType === 'scheduled' ? scheduledAt : undefined,
        amount: price,
      });
      const newSession = sessionRes.data.session;

      // Mock payment — no real money needed
      const orderRes = await axios.post('/api/payments/create-order', {
        amount: price,
        sessionId: newSession._id,
      });

      // Auto-verify mock payment
      await axios.post('/api/payments/verify', {
        orderId: orderRes.data.orderId,
        sessionId: newSession._id,
      });

      setCreatedSession(newSession);
      setConfirmed(true);
      toast.success('Booking confirmed!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed');
    }
    setLoading(false);
  };

  if (confirmed && createdSession) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-8">Your session has been booked successfully.</p>
          <div className="card mb-6 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Expert</span><span className="font-medium">{expert?.userId?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{duration} minutes</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium text-[#6C63FF]">₹{price}</span></div>
              {scheduledAt && <div className="flex justify-between"><span className="text-gray-500">Scheduled At</span><span className="font-medium">{new Date(scheduledAt).toLocaleString()}</span></div>}
            </div>
          </div>
          {sessionType === 'instant' && (
            <button onClick={() => router.push(`/room/${createdSession._id}`)} className="btn-primary w-full mb-3">
              Join Video Call Now
            </button>
          )}
          <button onClick={() => router.push('/dashboard/student')} className="btn-secondary w-full">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Book a Session</h1>

        {expert && (
          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <img
                src={expert.userId?.avatar || `https://ui-avatars.com/api/?name=${expert.userId?.name}&background=6C63FF&color=fff`}
                alt="" className="w-14 h-14 rounded-full"
              />
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{expert.userId?.name}</div>
                <div className="text-sm text-gray-500">{expert.subjects?.join(', ')}</div>
                <div className="text-sm text-[#6C63FF] font-medium">₹{expert.hourlyRate}/hour</div>
              </div>
            </div>
          </div>
        )}

        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Session Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['instant', 'scheduled'] as const).map((type) => (
              <button key={type} onClick={() => setSessionType(type)}
                className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${sessionType === type ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                {type === 'instant' ? '⚡ Instant Call' : '📅 Schedule Later'}
              </button>
            ))}
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Duration</h2>
          <div className="grid grid-cols-3 gap-3">
            {DURATIONS.map((d) => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${duration === d.value ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {sessionType === 'scheduled' && (
          <div className="card mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Pick a Time</h2>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)} className="input-field" />
          </div>
        )}

        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Price Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Session ({duration} min)</span><span>₹{price}</span></div>
            <div className="flex justify-between text-gray-500"><span>Platform fee</span><span>Free</span></div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total</span><span className="text-[#6C63FF]">₹{price}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            💡 Demo mode — no real payment required
          </div>
        </div>

        <button onClick={handleBook} disabled={loading} className="btn-primary w-full text-base py-4">
          {loading ? 'Processing...' : `Confirm Booking — ₹${price}`}
        </button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
