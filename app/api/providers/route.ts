import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ollama: true, // Ollama is always "available" — it's local
  });
}
