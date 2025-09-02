'use client';
import { useState } from 'react';

export default function AgentPage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer(null);
    setErr(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data: { ok?: boolean; text?: string; error?: string } = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setAnswer(data.text ?? '');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Agent (MVP)</h1>
      <form onSubmit={ask} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          className="w-full border rounded p-3"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </form>
      {err && <div className="text-red-600">{err}</div>}
      {answer && (
        <div className="border rounded p-3 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </main>
  );
}
