'use client';

import { useEffect, useRef } from 'react';
import { Message, Participant } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  messages: Message[];
  participants: Participant[];
}

export function MessageList({ messages, participants }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Start the conversation below.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="py-4 space-y-1">
        {messages.map((msg) => {
          const participant = msg.participantId
            ? participants.find((p) => p.id === msg.participantId)
            : undefined;
          return (
            <MessageBubble key={msg.id} message={msg} participant={participant} />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
