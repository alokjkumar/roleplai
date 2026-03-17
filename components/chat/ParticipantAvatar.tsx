'use client';

import { Participant } from '@/lib/types';

interface Props {
  participant: Participant;
  size?: 'sm' | 'md' | 'lg';
}

export function ParticipantAvatar({ participant, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ring-2 ring-background`}
      style={{ backgroundColor: participant.avatarColor }}
      title={participant.name}
    >
      {participant.name[0]?.toUpperCase()}
    </div>
  );
}
