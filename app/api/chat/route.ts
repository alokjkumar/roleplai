import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ProviderName } from '@/lib/types';

function resolveModel(provider: ProviderName, model: string) {
  switch (provider) {
    case 'anthropic':
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(model);
    case 'openai':
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })(model);
    case 'google':
      return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      })(model);
    case 'ollama': {
      // Use Ollama's OpenAI-compatible endpoint — avoids the ollama-ai-provider
      // package which only implements LanguageModelV1 (incompatible with AI SDK 5).
      const base = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');
      return createOpenAI({ baseURL: `${base}/v1`, apiKey: 'ollama' })(model);
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function POST(req: Request) {
  try {
    const { provider, model, systemPrompt, messages } = await req.json();
    const providerModel = resolveModel(provider as ProviderName, model);

    const result = streamText({
      model: providerModel,
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, { status: 500 });
  }
}
