import { NextResponse } from 'next/server';

export async function GET() {
  const baseURL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
  try {
    const res = await fetch(`${baseURL}/api/tags`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ models: [] });
    const data = await res.json();
    const models = (data.models ?? []).map((m: { name: string }) => ({
      id: m.name,
      label: m.name,
    }));
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
