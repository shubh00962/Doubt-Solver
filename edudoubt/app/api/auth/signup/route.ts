import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Expert from '@/models/Expert';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Test DB connection first
    try {
      await connectDB();
    } catch (dbErr: any) {
      console.error('DB Connection failed:', dbErr.message);
      return NextResponse.json({ error: 'Database connection failed: ' + dbErr.message }, { status: 500 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role: role || 'student' });

    if (role === 'expert') {
      await Expert.create({ userId: user._id, subjects: [], hourlyRate: 500 });
    }

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (err: any) {
    console.error('Signup error:', err.message);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
