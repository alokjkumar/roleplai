'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Chat, Message } from '../types';

interface ChatStore {
  chats: Chat[];
  messages: Record<string, Message[]>; // chatId → messages

  addChat: (data: { name: string; participantIds: string[] }) => Chat;
  updateChat: (id: string, data: Partial<Omit<Chat, 'id' | 'createdAt'>>) => void;
  deleteChat: (id: string) => void;
  getChat: (id: string) => Chat | undefined;

  addMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => Message;
  appendStreamChunk: (messageId: string, chatId: string, chunk: string) => void;
  finalizeMessage: (messageId: string, chatId: string, content?: string) => void;
  setMessageError: (messageId: string, chatId: string, error: string) => void;
  getMessages: (chatId: string) => Message[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      messages: {},

      addChat: (data) => {
        const chat: Chat = {
          id: nanoid(),
          name: data.name,
          participantIds: data.participantIds,
          lastResponderId: null,
          contextMode: 'full',
          windowSize: 20,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ chats: [chat, ...s.chats] }));
        return chat;
      },

      updateChat: (id, data) => {
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: Date.now() } : c
          ),
        }));
      },

      deleteChat: (id) => {
        set((s) => {
          const messages = { ...s.messages };
          delete messages[id];
          return { chats: s.chats.filter((c) => c.id !== id), messages };
        });
      },

      getChat: (id) => get().chats.find((c) => c.id === id),

      addMessage: (data) => {
        const msg: Message = { ...data, id: nanoid(), createdAt: Date.now() };
        set((s) => ({
          messages: {
            ...s.messages,
            [data.chatId]: [...(s.messages[data.chatId] ?? []), msg],
          },
        }));
        return msg;
      },

      appendStreamChunk: (messageId, chatId, chunk) => {
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: (s.messages[chatId] ?? []).map((m) =>
              m.id === messageId ? { ...m, content: m.content + chunk } : m
            ),
          },
        }));
      },

      finalizeMessage: (messageId, chatId, content) => {
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: (s.messages[chatId] ?? []).map((m) =>
              m.id === messageId
                ? { ...m, isStreaming: false, content: content ?? m.content }
                : m
            ),
          },
        }));
      },

      setMessageError: (messageId, chatId, error) => {
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: (s.messages[chatId] ?? []).map((m) =>
              m.id === messageId
                ? { ...m, isStreaming: false, error }
                : m
            ),
          },
        }));
      },

      getMessages: (chatId) => get().messages[chatId] ?? [],
    }),
    {
      name: 'roleplai-chats',
      // Don't persist isStreaming state
      partialize: (s) => ({
        chats: s.chats,
        messages: Object.fromEntries(
          Object.entries(s.messages).map(([chatId, msgs]) => [
            chatId,
            msgs.map((m) => ({ ...m, isStreaming: false })),
          ])
        ),
      }),
    }
  )
);
