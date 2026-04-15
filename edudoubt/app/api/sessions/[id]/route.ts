import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Session from '@/models/Session';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await Session.findById(params.id).populate('expertId').populate('studentId', 'name avatar');
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const updated = await Session.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ session: updated });
}
