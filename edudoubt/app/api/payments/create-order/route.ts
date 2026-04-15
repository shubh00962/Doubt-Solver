import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';

// Mock payment — no Razorpay needed (free)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, sessionId } = await req.json();
    const mockOrderId = `mock_order_${Date.now()}`;

    await connectDB();
    await Payment.create({
      userId: (session.user as any).id,
      sessionId,
      razorpayOrderId: mockOrderId,
      amount,
      status: 'created',
    });

    return NextResponse.json({ orderId: mockOrderId, amount, currency: 'INR', mock: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
