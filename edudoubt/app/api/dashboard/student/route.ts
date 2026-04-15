import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Doubt from '@/models/Doubt';
import Session from '@/models/Session';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    await connectDB();

    const [doubtsCount, sessionsCount, recentDoubts, upcomingSessions] = await Promise.all([
      Doubt.countDocuments({ studentId: userId }),
      Session.countDocuments({ studentId: userId, status: 'completed' }),
      Doubt.find({ studentId: userId }).sort({ createdAt: -1 }).limit(5),
      Session.find({ studentId: userId, status: 'pending', scheduledAt: { $gte: new Date() } })
        .populate('expertId')
        .sort({ scheduledAt: 1 })
        .limit(5),
    ]);

    const subjects = await Doubt.distinct('subject', { studentId: userId });

    return NextResponse.json({
      stats: { doubtsAsked: doubtsCount, sessionsDone: sessionsCount, subjectsStudied: subjects.length },
      recentDoubts,
      upcomingSessions,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
