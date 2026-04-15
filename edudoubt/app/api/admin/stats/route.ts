import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Session from '@/models/Session';
import Doubt from '@/models/Doubt';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const [totalUsers, totalSessions, totalDoubts, revenue] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Doubt.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    return NextResponse.json({
      totalUsers,
      totalSessions,
      totalDoubts,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
