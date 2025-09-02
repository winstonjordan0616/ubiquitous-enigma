import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type OutputChunk = {
  content?: Array<{ type?: string; text?: string }>;
};

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const res = await client.responses.create({
      model: 'gpt-4o-mini',
      input: `You are a concise, helpful assistant.\n\nUser: ${prompt}`,
    });

    // Prefer convenience field if present
    let text = res.output_text?.trim();

    // Fallback: walk output safely (no 'any')
    if (!text) {
      const parts: string[] = [];
      const output = (res.output as OutputChunk[] | undefined) ?? [];
      for (const item of output) {
        const content = item.content ?? [];
        for (const c of content) {
          if (c?.type === 'output_text' && typeof c.text === 'string') {
            parts.push(c.text);
          }
        }
      }
      text = parts.join('\n').trim();
    }

    if (!text) text = 'No response text.';

    return NextResponse.json({ ok: true, text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
