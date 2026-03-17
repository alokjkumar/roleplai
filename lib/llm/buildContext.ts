import { ModelMessage } from 'ai';
import { Chat, Message, Participant } from '../types';

export function buildContextForParticipant(
  messages: Message[],
  target: Participant,
  allParticipants: Participant[],
  chat: Chat
): ModelMessage[] {
  const slice =
    chat.contextMode === 'windowed'
      ? messages.slice(-chat.windowSize)
      : messages;

  return slice
    .filter((m) => !m.isStreaming && !m.error)
    .map((msg): ModelMessage => {
      if (msg.role === 'user') {
        return { role: 'user', content: `[User]: ${msg.content}` };
      }
      if (msg.participantId === target.id) {
        return { role: 'assistant', content: msg.content };
      }
      const name =
        allParticipants.find((p) => p.id === msg.participantId)?.name ?? 'AI';
      return { role: 'user', content: `[${name}]: ${msg.content}` };
    });
}
