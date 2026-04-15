'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

export default function ExpertDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      axios.get('/api/dashboard/expert').then((res) => {
        setData(res.data);
        setIsOnline(res.data.expert?.isOnline || false);
        setSelectedSubjects(res.data.expert?.subjects || []);
        setHourlyRate(res.data.expert?.hourlyRate || 500);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await axios.patch('/api/experts/me', { isOnline: newStatus });
      toast.success(newStatus ? 'You are now online' : 'You are now offline');
    } catch {
      setIsOnline(!newStatus);
      toast.error('Failed to update status');
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await axios.patch('/api/experts/me', { subjects: selectedSubjects, hourlyRate });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
    setSavingProfile(false);
  };

  const handleSessionAction = async (sessionId: string, action: 'accept' | 'decline') => {
    try {
      await axios.patch(`/api/sessions/${sessionId}`, { status: action === 'accept' ? 'active' : 'cancelled' });
      toast.success(action === 'accept' ? 'Session accepted' : 'Session declined');
      setData((prev: any) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter((s: any) => s._id !== sessionId),
      }));
    } catch {
      toast.error('Action failed');
    }
  };

  const chartData = [
    { day: 'Mon', earnings: 0 },
    { day: 'Tue', earnings: 0 },
    { day: 'Wed', earnings: 0 },
    { day: 'Thu', earnings: 0 },
    { day: 'Fri', earnings: 0 },
    { day: 'Sat', earnings: 0 },
    { day: 'Sun', earnings: data?.earnings?.today || 0 },
  ];

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expert Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {session?.user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
            <button
              onClick={toggleOnline}
              className={`relative w-12 h-6 rounded-full transition-colors ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Earnings stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Today's Earnings", value: `₹${data?.earnings?.today || 0}`, icon: '📅', color: 'text-blue-600' },
            { label: 'This Week', value: `₹${data?.earnings?.week || 0}`, icon: '📊', color: 'text-purple-600' },
            { label: 'Total Earnings', value: `₹${data?.earnings?.total || 0}`, icon: '💰', color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Earnings chart */}
        <div className="card mb-8">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Weekly Earnings</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Earnings']} />
              <Bar dataKey="earnings" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Session requests */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Session Requests
                {data?.pendingRequests?.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{data.pendingRequests.length}</span>
                )}
              </h2>
              {!data?.pendingRequests?.length ? (
                <div className="card text-center py-8 text-gray-500 text-sm">No pending requests</div>
              ) : (
                <div className="space-y-3">
                  {data.pendingRequests.map((s: any) => (
                    <div key={s._id} className="card flex items-center gap-4">
                      <img
                        src={s.studentId?.avatar || `https://ui-avatars.com/api/?name=${s.studentId?.name}&background=6C63FF&color=fff`}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{s.studentId?.name}</div>
                        <div className="text-xs text-gray-500">{s.duration} min • ₹{s.amount}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSessionAction(s._id, 'accept')} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Accept</button>
                        <button onClick={() => handleSessionAction(s._id, 'decline')} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming sessions */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Sessions</h2>
              {!data?.upcomingSessions?.length ? (
                <div className="card text-center py-8 text-gray-500 text-sm">No upcoming sessions</div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingSessions.map((s: any) => (
                    <div key={s._id} className="card flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{s.studentId?.name}</div>
                        <div className="text-xs text-gray-500">{new Date(s.scheduledAt).toLocaleString()}</div>
                        <div className="text-xs text-[#6C63FF]">{s.duration} min</div>
                      </div>
                      <Link href={`/room/${s._id}`} className="px-3 py-1.5 bg-[#6C63FF] text-white rounded-lg text-sm hover:bg-[#5a52e0]">
                        Join
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile settings */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="input-field"
                  min={100}
                  step={50}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSubjects((prev) =>
                        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                      )}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedSubjects.includes(s)
                          ? 'bg-[#6C63FF] text-white border-[#6C63FF]'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#6C63FF]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveProfile} disabled={savingProfile} className="btn-primary w-full text-sm">
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
