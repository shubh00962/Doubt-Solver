'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import Link from 'next/link';
import axios from 'axios';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'];

function ExpertsContent() {
  const searchParams = useSearchParams();
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(searchParams.get('subject') || 'All');
  const [rating, setRating] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExperts();
  }, [subject, rating, onlineOnly]);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subject !== 'All') params.set('subject', subject);
      if (rating) params.set('rating', rating);
      if (onlineOnly) params.set('online', 'true');
      if (search) params.set('search', search);
      const res = await axios.get(`/api/experts?${params}`);
      setExperts(res.data.experts);
    } catch {}
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExperts();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Expert Tutors</h1>
          <p className="text-gray-500">Connect with verified experts for live doubt-solving sessions</p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary px-4 py-3">Search</button>
            </form>

            <div className="flex flex-wrap gap-3">
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field w-auto">
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="input-field w-auto">
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#6C63FF]"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Online Now</span>
              </label>
            </div>
          </div>
        </div>

        {/* Subject pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                subject === s
                  ? 'bg-[#6C63FF] text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[#6C63FF]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Expert grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p>No experts found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <ExpertCard key={expert._id} expert={expert} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function ExpertCard({ expert }: { expert: any }) {
  const user = expert.userId;
  return (
    <div className="card hover:shadow-md transition-all hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6C63FF&color=fff`}
            alt={user?.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${expert.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating rating={expert.rating} size="sm" />
            <span className="text-xs text-gray-500">({expert.totalSessions} sessions)</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">{expert.isOnline ? '🟢 Online' : '⚫ Offline'}</div>
        </div>
        <div className="text-right">
          <div className="text-[#6C63FF] font-bold">₹{expert.hourlyRate}</div>
          <div className="text-xs text-gray-400">/hour</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {expert.subjects?.slice(0, 3).map((s: string) => (
          <span key={s} className="text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      {expert.bio && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{expert.bio}</p>
      )}

      <div className="flex gap-2">
        <Link href={`/experts/${expert._id}`} className="flex-1 text-center py-2 border border-[#6C63FF] text-[#6C63FF] rounded-xl text-sm font-medium hover:bg-[#6C63FF]/5 transition-colors">
          View Profile
        </Link>
        <Link href={`/book/${expert._id}`} className="flex-1 text-center py-2 bg-[#6C63FF] text-white rounded-xl text-sm font-medium hover:bg-[#5a52e0] transition-colors">
          Book Session
        </Link>
      </div>
    </div>
  );
}

export default function ExpertsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full" /></div>}>
      <ExpertsContent />
    </Suspense>
  );
}
