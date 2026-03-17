'use client';

import { useState } from 'react';
import { Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useChatStore } from '@/lib/stores/chatStore';
import { useParticipantStore } from '@/lib/stores/participantStore';
import { Chat } from '@/lib/types';
import { ParticipantAvatar } from './ParticipantAvatar';
import { useRouter } from 'next/navigation';

interface Props {
  chat: Chat;
}

export function ChatHeader({ chat }: Props) {
  const router = useRouter();
  const updateChat = useChatStore((s) => s.updateChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const participants = useParticipantStore((s) => s.participants);
  const [name, setName] = useState(chat.name);

  const chatParticipants = participants.filter((p) =>
    chat.participantIds.includes(p.id)
  );
  const otherParticipants = participants.filter(
    (p) => !chat.participantIds.includes(p.id)
  );

  const handleSaveName = () => {
    if (name.trim()) updateChat(chat.id, { name: name.trim() });
  };

  const handleDelete = () => {
    deleteChat(chat.id);
    router.push('/chats');
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-foreground truncate max-w-[200px]">
          {chat.name}
        </h1>
        <div className="flex -space-x-1">
          {chatParticipants.slice(0, 5).map((p) => (
            <ParticipantAvatar key={p.id} participant={p} size="sm" />
          ))}
          {chatParticipants.length > 5 && (
            <span className="text-xs text-muted-foreground ml-2">
              +{chatParticipants.length - 5}
            </span>
          )}
        </div>
        {chatParticipants.length === 0 && (
          <span className="text-xs text-muted-foreground">No participants</span>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chat Settings</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chat name</label>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
              </div>
            </div>

            <Separator />

            {/* Context mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Context mode</label>
              <div className="flex gap-2">
                {(['full', 'windowed'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateChat(chat.id, { contextMode: mode })}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      chat.contextMode === mode
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {mode === 'full' ? 'Full history' : 'Windowed'}
                  </button>
                ))}
              </div>
              {chat.contextMode === 'windowed' && (
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm text-muted-foreground">
                    Window size
                  </label>
                  <Input
                    type="number"
                    min={5}
                    max={100}
                    value={chat.windowSize}
                    onChange={(e) =>
                      updateChat(chat.id, {
                        windowSize: Math.max(5, parseInt(e.target.value) || 20),
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">messages</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Participants */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Participants</label>
              <div className="space-y-1">
                {chatParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 bg-secondary"
                  >
                    <div className="flex items-center gap-2">
                      <ParticipantAvatar participant={p} size="sm" />
                      <span className="text-sm">{p.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {p.provider}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateChat(chat.id, {
                          participantIds: chat.participantIds.filter(
                            (id) => id !== p.id
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {otherParticipants.length > 0 && (
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-muted-foreground">Add participant</p>
                  {otherParticipants.map((p) => (
                    <button
                      key={p.id}
                      className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 hover:bg-accent text-sm text-left"
                      onClick={() =>
                        updateChat(chat.id, {
                          participantIds: [...chat.participantIds, p.id],
                        })
                      }
                    >
                      <ParticipantAvatar participant={p} size="sm" />
                      <span>{p.name}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {p.provider}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {participants.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No participants yet. Create some in the Participants page.
                </p>
              )}
            </div>

            <Separator />

            {/* Delete chat */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Chat
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
