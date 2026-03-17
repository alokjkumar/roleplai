'use client';

import { Message, Participant } from '@/lib/types';
import { ParticipantAvatar } from './ParticipantAvatar';
import { AlertCircle } from 'lucide-react';

interface Props {
  message: Message;
  participant?: Participant;
}

export function MessageBubble({ message, participant }: Props) {
  const isUser = message.role === 'user' && !message.participantId;

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-1">
      {participant && <ParticipantAvatar participant={participant} />}
      <div className="flex-1 min-w-0">
        {participant && (
          <span
            className="text-xs font-semibold mb-1 block"
            style={{ color: participant.avatarColor }}
          >
            {participant.name}
          </span>
        )}
        <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm text-foreground inline-block max-w-full">
          {message.error ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{message.error}</span>
            </div>
          ) : (
            <>
              <span className="whitespace-pre-wrap break-words">{message.content}</span>
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-current opacity-70 animate-pulse align-text-bottom" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
