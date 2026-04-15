import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Doubt from '@/models/Doubt';

async function solveWithGroq(question: string, subject: string): Promise<any> {
  const prompt = `You are an expert tutor. Solve this student's doubt step by step.
Subject: ${subject}
Question: ${question}

Reply ONLY with valid JSON (no markdown, no code blocks, no extra text):
{
  "steps": ["step 1 explanation", "step 2 explanation", "step 3 explanation"],
  "finalAnswer": "the final answer here",
  "tip": "a helpful tip to remember this concept",
  "subject": "${subject}"
}
Use LaTeX for math: $inline$ or $$block$$.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq API failed');

  const text = data.choices?.[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  throw new Error('Invalid JSON response');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, imageUrl, subject } = await req.json();
    if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

    let aiAnswer;
    try {
      aiAnswer = await solveWithGroq(question, subject);
    } catch (aiErr: any) {
      console.error('AI error:', aiErr.message);
      aiAnswer = {
        steps: ['Could not connect to AI service. Please check your GROQ_API_KEY.'],
        finalAnswer: aiErr.message,
        tip: 'Get free Groq API key at console.groq.com',
        subject,
      };
    }

    await connectDB();
    const doubt = await Doubt.create({
      studentId: (session.user as any).id,
      question,
      imageUrl,
      subject,
      aiAnswer,
      isResolved: true,
    });

    return NextResponse.json({ doubt, aiAnswer });
  } catch (err: any) {
    console.error('Solve error:', err);
    return NextResponse.json({ error: err.message || 'Failed to solve doubt' }, { status: 500 });
  }
}
