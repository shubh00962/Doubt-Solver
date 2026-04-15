import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  const results: any = {};

  // Check env vars
  results.MONGODB_URI = process.env.MONGODB_URI ? '✅ Set' : '❌ Missing';
  results.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing';
  results.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing';

  // Test DB
  try {
    await connectDB();
    results.database = '✅ Connected';
  } catch (err: any) {
    results.database = '❌ Failed: ' + err.message;
  }

  return NextResponse.json(results);
}
