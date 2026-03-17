'use client';

import { useRef } from 'react';
import { use } from 'react';
import { useChatStore } from '@/lib/stores/chatStore';
import { useParticipantStore } from '@/lib/stores/participantStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { notFound } from 'next/navigation';

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const abortRef = useRef<AbortController | null>(null);

  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));
  const messages = useChatStore((s) => s.messages[chatId] ?? []);
  const participants = useParticipantStore((s) => s.participants);

  if (!chat) return notFound();

  const chatParticipants = participants.filter((p) =>
    chat.participantIds.includes(p.id)
  );

  const isStreaming = messages.some((m) => m.isStreaming);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chat={chat} />
      <MessageList messages={messages} participants={participants} />
      <MessageComposer
        chat={chat}
        participants={chatParticipants}
        isStreaming={isStreaming}
        abortRef={abortRef}
      />
    </div>
  );
}
