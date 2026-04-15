import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';

// Agora token generation (simplified - use agora-access-token in production)
function generateAgoraToken(channelName: string, uid: number): string {
  // In production, use the RtcTokenBuilder from agora-access-token package
  // For now return a placeholder that works with testing mode
  return `agora_token_${channelName}_${uid}_${Date.now()}`;
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const dbSession = await Session.findById(params.id);
    if (!dbSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const uid = Math.floor(Math.random() * 100000);
    const token = generateAgoraToken(dbSession.agoraChannelName, uid);

    return NextResponse.json({
      token,
      channelName: dbSession.agoraChannelName,
      uid,
      appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
