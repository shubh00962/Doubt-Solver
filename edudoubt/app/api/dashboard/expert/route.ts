import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';
import Expert from '@/models/Expert';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    await connectDB();

    const expert = await Expert.findOne({ userId });
    if (!expert) return NextResponse.json({ error: 'Expert not found' }, { status: 404 });

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const [todayEarnings, weekEarnings, totalEarnings, pendingRequests, upcomingSessions] =
      await Promise.all([
        Session.aggregate([
          { $match: { expertId: expert._id, status: 'completed', createdAt: { $gte: todayStart } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Session.aggregate([
          { $match: { expertId: expert._id, status: 'completed', createdAt: { $gte: weekStart } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Session.aggregate([
          { $match: { expertId: expert._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Session.find({ expertId: expert._id, status: 'pending' })
          .populate('studentId', 'name avatar')
          .sort({ createdAt: -1 })
          .limit(10),
        Session.find({ expertId: expert._id, status: 'pending', scheduledAt: { $gte: new Date() } })
          .populate('studentId', 'name avatar')
          .sort({ scheduledAt: 1 })
          .limit(5),
      ]);

    return NextResponse.json({
      earnings: {
        today: todayEarnings[0]?.total || 0,
        week: weekEarnings[0]?.total || 0,
        total: totalEarnings[0]?.total || 0,
      },
      pendingRequests,
      upcomingSessions,
      expert,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
