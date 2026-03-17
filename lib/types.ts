export type ProviderName = 'anthropic' | 'openai' | 'google' | 'ollama';

export interface Participant {
  id: string;
  name: string;
  provider: ProviderName;
  model: string;
  systemPrompt: string;
  avatarColor: string; // HSL string
  createdAt: number;
}

export interface Chat {
  id: string;
  name: string;
  participantIds: string[];
  lastResponderId: string | null;
  contextMode: 'full' | 'windowed';
  windowSize: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  participantId: string | null;
  mentionedParticipantId: string | null;
  isStreaming: boolean;
  error: string | null;
  createdAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultWindowSize: number;
}
