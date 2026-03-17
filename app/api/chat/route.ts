import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
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
    case 'ollama':
      return createOllama({
        baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api',
      })(model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function POST(req: Request) {
  const { provider, model, systemPrompt, messages } = await req.json();

  const providerModel = resolveModel(provider as ProviderName, model);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = streamText({
    model: providerModel as any,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
