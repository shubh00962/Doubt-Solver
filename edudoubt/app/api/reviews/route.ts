import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Expert from '@/models/Expert';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, expertId, rating, comment } = await req.json();
    await connectDB();

    const review = await Review.create({
      sessionId,
      studentId: (session.user as any).id,
      expertId,
      rating,
      comment,
    });

    // Update expert average rating
    const reviews = await Review.find({ expertId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Expert.findByIdAndUpdate(expertId, { rating: Math.round(avg * 10) / 10 });

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
