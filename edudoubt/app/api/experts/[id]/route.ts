import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expert from '@/models/Expert';
import Review from '@/models/Review';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const expert = await Expert.findById(params.id).populate('userId', 'name email avatar');
    if (!expert) return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
    const reviews = await Review.find({ expertId: params.id })
      .populate('studentId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    return NextResponse.json({ expert, reviews });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
