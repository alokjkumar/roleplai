'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Participant, Chat, Message } from '@/lib/types';
import { useChatStore } from '@/lib/stores/chatStore';
import { useParticipantStore } from '@/lib/stores/participantStore';
import { buildContextForParticipant } from '@/lib/llm/buildContext';

interface Props {
  chat: Chat;
  participants: Participant[];
  isStreaming: boolean;
  abortRef: React.MutableRefObject<AbortController | null>;
}

function parseMention(text: string, participants: Participant[]): Participant | null {
  const match = text.match(/^@(\S+)/);
  if (!match) return null;
  const name = match[1].toLowerCase();
  return participants.find((p) => p.name.toLowerCase() === name) ?? null;
}

export function MessageComposer({ chat, participants, isStreaming, abortRef }: Props) {
  const [text, setText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addMessage = useChatStore((s) => s.addMessage);
  const appendStreamChunk = useChatStore((s) => s.appendStreamChunk);
  const finalizeMessage = useChatStore((s) => s.finalizeMessage);
  const setMessageError = useChatStore((s) => s.setMessageError);
  const updateChat = useChatStore((s) => s.updateChat);
  const getMessages = useChatStore((s) => s.getMessages);
  const allParticipants = useParticipantStore((s) => s.participants);

  // Detect @mention as user types
  const handleTextChange = (value: string) => {
    setText(value);
    const atIdx = value.lastIndexOf('@');
    if (atIdx !== -1 && atIdx === value.lastIndexOf('@')) {
      const query = value.slice(atIdx + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        return;
      }
    }
    setMentionQuery(null);
  };

  const mentionSuggestions = mentionQuery !== null
    ? participants.filter((p) =>
        p.name.toLowerCase().startsWith(mentionQuery.toLowerCase())
      )
    : [];

  const insertMention = (participant: Participant) => {
    const atIdx = text.lastIndexOf('@');
    const newText = text.slice(0, atIdx) + `@${participant.name} `;
    setText(newText);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || isStreaming) return;
    if (participants.length === 0) return;

    // Abort any in-flight stream
    if (abortRef.current) {
      abortRef.current.abort();
    }

    setText('');
    setMentionQuery(null);

    // 1. Resolve target participant
    const mentioned = parseMention(content, participants);
    const targetId =
      mentioned?.id ??
      chat.lastResponderId ??
      chat.participantIds[0];
    const target = participants.find((p) => p.id === targetId) ?? participants[0];

    // 2. Add user message
    addMessage({
      chatId: chat.id,
      role: 'user',
      content,
      participantId: null,
      mentionedParticipantId: mentioned?.id ?? null,
      isStreaming: false,
      error: null,
    });

    // 3. Placeholder AI message
    const aiMsg = addMessage({
      chatId: chat.id,
      role: 'assistant',
      content: '',
      participantId: target.id,
      mentionedParticipantId: null,
      isStreaming: true,
      error: null,
    });

    // 4. Build context (need to get updated messages after adding user msg)
    const currentMessages = getMessages(chat.id);
    // Exclude the streaming placeholder from context
    const historyMessages = currentMessages.filter(
      (m: Message) => m.id !== aiMsg.id
    );
    const contextMessages = buildContextForParticipant(
      historyMessages,
      target,
      allParticipants,
      chat
    );

    // 5. Stream
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: target.provider,
          model: target.model,
          systemPrompt: target.systemPrompt,
          messages: contextMessages,
        }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        setMessageError(aiMsg.id, chat.id, `API error: ${err}`);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        appendStreamChunk(aiMsg.id, chat.id, chunk);
      }

      finalizeMessage(aiMsg.id, chat.id, fullContent);
      updateChat(chat.id, { lastResponderId: target.id });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        finalizeMessage(aiMsg.id, chat.id);
      } else {
        setMessageError(aiMsg.id, chat.id, (err as Error).message);
      }
    } finally {
      abortRef.current = null;
    }
  }, [
    text,
    isStreaming,
    chat,
    participants,
    allParticipants,
    addMessage,
    appendStreamChunk,
    finalizeMessage,
    setMessageError,
    updateChat,
    getMessages,
    abortRef,
  ]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setMentionQuery(null);
    }
  };

  return (
    <div className="relative border-t border-border bg-background px-4 py-3">
      {/* Mention autocomplete */}
      {mentionSuggestions.length > 0 && (
        <div className="absolute bottom-full left-4 mb-1 w-56 rounded-md border border-border bg-popover shadow-lg z-10">
          {mentionSuggestions.map((p) => (
            <button
              key={p.id}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent text-left"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(p);
              }}
            >
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.name[0]}
              </span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            participants.length === 0
              ? 'Add participants to start chatting…'
              : 'Message… (@ to mention a participant)'
          }
          disabled={participants.length === 0}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 max-h-40 overflow-y-auto"
          style={{ minHeight: '44px' }}
        />
        <Button
          onClick={handleSend}
          disabled={!text.trim() || isStreaming || participants.length === 0}
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {participants.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          Enter to send · Shift+Enter for newline · @Name to mention
        </p>
      )}
    </div>
  );
}
