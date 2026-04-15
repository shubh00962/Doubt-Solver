'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';
import Link from 'next/link';
import axios from 'axios';
import { CardSkeleton } from '@/components/LoadingSkeleton';

export default function ExpertProfilePage() {
  const { id } = useParams();
  const [expert, setExpert] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/experts/${id}`).then((res) => {
      setExpert(res.data.expert);
      setReviews(res.data.reviews);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );

  if (!expert) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Expert not found.</div>
    </div>
  );

  const user = expert.userId;
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6C63FF&color=fff&size=128`}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
              <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${expert.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={expert.rating} size="md" />
                    <span className="text-gray-500 text-sm">{expert.rating.toFixed(1)} ({expert.totalSessions} sessions)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {expert.subjects?.map((s: string) => (
                      <span key={s} className="text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-3 py-1 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#6C63FF]">₹{expert.hourlyRate}</div>
                  <div className="text-sm text-gray-400">/hour</div>
                  <div className={`text-sm mt-1 font-medium ${expert.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {expert.isOnline ? '🟢 Online Now' : '⚫ Offline'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {expert.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{expert.bio}</p>
            </div>
          )}

          {expert.qualifications && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Qualifications</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{expert.qualifications}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {expert.isOnline && (
              <Link href={`/book/${id}?instant=true`} className="btn-accent flex-1 text-center">
                📹 Start Video Call
              </Link>
            )}
            <Link href={`/book/${id}`} className="btn-primary flex-1 text-center">
              📅 Schedule Session
            </Link>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Rating Breakdown</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">{expert.rating.toFixed(1)}</div>
              <StarRating rating={expert.rating} size="lg" />
              <div className="text-sm text-gray-500 mt-1">{reviews.length} reviews</div>
            </div>
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-4">{star}</span>
                  <span className="text-yellow-400 text-sm">★</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Student Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={review.studentId?.avatar || `https://ui-avatars.com/api/?name=${review.studentId?.name}&background=6C63FF&color=fff`}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{review.studentId?.name}</div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="ml-auto text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
