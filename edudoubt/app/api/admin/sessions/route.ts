import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectDB();
  const sessions = await Session.find().populate('studentId', 'name').populate('expertId').sort({ createdAt: -1 }).limit(50);
  return NextResponse.json({ sessions });
}
