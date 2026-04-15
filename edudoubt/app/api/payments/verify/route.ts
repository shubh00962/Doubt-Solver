import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Session from '@/models/Session';

// Mock payment verification — no Razorpay needed (free)
export async function POST(req: NextRequest) {
  try {
    const { orderId, sessionId } = await req.json();
    await connectDB();
    await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status: 'paid' }
    );
    await Session.findByIdAndUpdate(sessionId, { status: 'pending' });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
