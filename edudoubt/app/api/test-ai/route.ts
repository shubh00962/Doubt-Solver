import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 10,
      }),
    });
    const data = await res.json();
    if (data.choices?.[0]?.message?.content) {
      return NextResponse.json({ groq: '✅ Works: ' + data.choices[0].message.content });
    }
    return NextResponse.json({ groq: '❌ ' + JSON.stringify(data.error) });
  } catch (e: any) {
    return NextResponse.json({ groq: '❌ ' + e.message });
  }
}
