import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const res = await client.responses.create({
      model: 'gpt-4o-mini', // low-cost model
      input: `You are a concise, helpful assistant.\n\nUser: ${prompt}`,
    });

    // Prefer the convenience field if present
    let text = res.output_text;

    // Fallback: concatenate any output_text items we can find
    if (!text) {
      try {
        const parts: string[] = [];
        for (const item of res.output ?? []) {
          for (const c of (item as any).content ?? []) {
            if (c?.type === 'output_text' && typeof c.text === 'string') {
              parts.push(c.text);
            }
          }
        }
        text = parts.join('\n').trim();
      } catch {
        // ignore
      }
    }

    if (!text) text = 'No response text.';

    return NextResponse.json({ ok: true, text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
