'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = ['Overview', 'Users', 'Sessions', 'Subjects'];
const SUBJECTS_LIST = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>(SUBJECTS_LIST);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'admin') { router.push('/'); return; }
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch {}
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      const res = await axios.get(`/api/admin/users?${params}`);
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users'); }
  };

  useEffect(() => { if (tab === 'Users') fetchUsers(); }, [tab, roleFilter]);

  const chartData = [
    { name: 'Users', value: stats?.totalUsers || 0 },
    { name: 'Sessions', value: stats?.totalSessions || 0 },
    { name: 'Doubts', value: stats?.totalDoubts || 0 },
  ];

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[#6C63FF] text-[#6C63FF]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'text-blue-600' },
                { label: 'Total Sessions', value: stats?.totalSessions || 0, icon: '📹', color: 'text-purple-600' },
                { label: 'Doubts Solved', value: stats?.totalDoubts || 0, icon: '❓', color: 'text-green-600' },
                { label: 'Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: '💰', color: 'text-yellow-600' },
              ].map(s => (
                <div key={s.label} className="card">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6C63FF" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'Users' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..." className="input-field w-64" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-auto">
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="expert">Expert</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={fetchUsers} className="btn-primary px-4 py-2 text-sm">Search</button>
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Name', 'Email', 'Role', 'Joined'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=6C63FF&color=fff`} alt="" className="w-7 h-7 rounded-full" />
                          {u.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'expert' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Sessions' && (
          <div className="card text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📹</div>
            <p>Sessions log — connect to your DB to view live data.</p>
          </div>
        )}

        {tab === 'Subjects' && (
          <div className="card max-w-lg">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Manage Subjects</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                placeholder="Add new subject..." className="input-field flex-1" />
              <button onClick={() => { if (newSubject.trim()) { setSubjects(p => [...p, newSubject.trim()]); setNewSubject(''); toast.success('Subject added'); } }}
                className="btn-primary px-4 py-2 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <div key={s} className="flex items-center gap-1 bg-[#6C63FF]/10 text-[#6C63FF] px-3 py-1.5 rounded-full text-sm">
                  {s}
                  <button onClick={() => { setSubjects(p => p.filter(x => x !== s)); toast.success('Subject removed'); }}
                    className="ml-1 text-[#6C63FF] hover:text-red-500 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
