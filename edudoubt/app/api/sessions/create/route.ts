import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { expertId, duration, scheduledAt, amount } = await req.json();
    await connectDB();

    const channelName = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newSession = await Session.create({
      studentId: (session.user as any).id,
      expertId,
      agoraChannelName: channelName,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      duration,
      amount,
      status: 'pending',
    });

    return NextResponse.json({ session: newSession });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
