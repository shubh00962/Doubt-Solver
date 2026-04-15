import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expert from '@/models/Expert';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const minRating = searchParams.get('rating');
    const onlineOnly = searchParams.get('online') === 'true';
    const search = searchParams.get('search');

    const query: Record<string, any> = {};
    if (subject && subject !== 'All') query.subjects = { $in: [subject] };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (onlineOnly) query.isOnline = true;

    const experts = await Expert.find(query)
      .populate('userId', 'name email avatar')
      .sort({ rating: -1 });

    const filtered = search
      ? experts.filter((e) =>
          (e.userId as any)?.name?.toLowerCase().includes(search.toLowerCase())
        )
      : experts;

    return NextResponse.json({ experts: filtered });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
