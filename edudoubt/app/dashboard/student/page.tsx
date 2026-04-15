'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import axios from 'axios';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import dynamic from 'next/dynamic';

const MathRenderer = dynamic(() => import('@/components/MathRenderer'), { ssr: false });

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDoubt, setExpandedDoubt] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      axios.get('/api/dashboard/student').then((res) => {
        setData(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
        <TableSkeleton />
      </div>
    </div>
  );

  const user = session?.user;
  const stats = data?.stats || {};

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src={(user as any)?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=6C63FF&color=fff`}
              alt=""
              className="w-14 h-14 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-gray-500 text-sm">Ready to solve some doubts today?</p>
            </div>
          </div>
          <Link href="/doubt" className="btn-primary">Ask a Doubt</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Doubts Asked', value: stats.doubtsAsked || 0, icon: '❓', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
            { label: 'Sessions Done', value: stats.sessionsDone || 0, icon: '📹', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
            { label: 'Subjects Studied', value: stats.subjectsStudied || 0, icon: '📚', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className={`card flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent doubts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Doubts</h2>
              <Link href="/doubt" className="text-sm text-[#6C63FF] hover:underline">View all</Link>
            </div>
            {!data?.recentDoubts?.length ? (
              <div className="card text-center py-10 text-gray-500">
                <div className="text-4xl mb-3">🤔</div>
                <p>No doubts yet. <Link href="/doubt" className="text-[#6C63FF] hover:underline">Ask your first question!</Link></p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentDoubts.map((doubt: any) => (
                  <div key={doubt._id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-2 py-0.5 rounded-full">{doubt.subject}</span>
                          <span className="text-xs text-gray-400">{new Date(doubt.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{doubt.question}</p>
                      </div>
                      <button
                        onClick={() => setExpandedDoubt(expandedDoubt === doubt._id ? null : doubt._id)}
                        className="text-xs text-[#6C63FF] hover:underline flex-shrink-0"
                      >
                        {expandedDoubt === doubt._id ? 'Hide' : 'View Answer'}
                      </button>
                    </div>
                    {expandedDoubt === doubt._id && doubt.aiAnswer && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="space-y-2">
                          {doubt.aiAnswer.steps?.map((step: string, i: number) => (
                            <div key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="text-[#6C63FF] font-bold flex-shrink-0">{i + 1}.</span>
                              <MathRenderer text={step} />
                            </div>
                          ))}
                        </div>
                        {doubt.aiAnswer.finalAnswer && (
                          <div className="mt-3 p-3 bg-[#00C9A7]/10 rounded-lg text-sm font-medium">
                            <MathRenderer text={doubt.aiAnswer.finalAnswer} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming sessions */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Sessions</h2>
              {!data?.upcomingSessions?.length ? (
                <div className="card text-center py-6 text-gray-500 text-sm">
                  <p>No upcoming sessions.</p>
                  <Link href="/experts" className="text-[#6C63FF] hover:underline mt-1 block">Book a session</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingSessions.map((s: any) => (
                    <div key={s._id} className="card p-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{s.expertId?.userId?.name || 'Expert'}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(s.scheduledAt).toLocaleString()}</div>
                      <div className="text-xs text-[#6C63FF] mt-1">{s.duration} min • ₹{s.amount}</div>
                      <Link href={`/room/${s._id}`} className="mt-2 block text-center text-xs bg-[#6C63FF] text-white py-1.5 rounded-lg hover:bg-[#5a52e0]">
                        Join
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription card */}
            <div className="card bg-gradient-to-br from-[#6C63FF] to-[#00C9A7] text-white">
              <div className="text-sm font-medium mb-1">Current Plan</div>
              <div className="text-xl font-bold mb-3">Free Plan</div>
              <p className="text-purple-100 text-xs mb-4">Upgrade for unlimited AI answers and priority expert access.</p>
              <button className="w-full bg-white text-[#6C63FF] font-semibold py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
