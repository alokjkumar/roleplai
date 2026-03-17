'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Participant, ProviderName } from '../types';
import { getAvatarColor } from '../models';

interface ParticipantStore {
  participants: Participant[];
  addParticipant: (data: {
    name: string;
    provider: ProviderName;
    model: string;
    systemPrompt: string;
  }) => Participant;
  updateParticipant: (id: string, data: Partial<Omit<Participant, 'id' | 'createdAt'>>) => void;
  deleteParticipant: (id: string) => void;
  getParticipant: (id: string) => Participant | undefined;
}

export const useParticipantStore = create<ParticipantStore>()(
  persist(
    (set, get) => ({
      participants: [],

      addParticipant: (data) => {
        const index = get().participants.length;
        const participant: Participant = {
          id: nanoid(),
          ...data,
          avatarColor: getAvatarColor(index),
          createdAt: Date.now(),
        };
        set((s) => ({ participants: [...s.participants, participant] }));
        return participant;
      },

      updateParticipant: (id, data) => {
        set((s) => ({
          participants: s.participants.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deleteParticipant: (id) => {
        set((s) => ({
          participants: s.participants.filter((p) => p.id !== id),
        }));
      },

      getParticipant: (id) => get().participants.find((p) => p.id === id),
    }),
    { name: 'roleplai-participants' }
  )
);
