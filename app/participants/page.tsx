'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useParticipantStore } from '@/lib/stores/participantStore';
import { Participant } from '@/lib/types';
import { ParticipantDialog } from '@/components/participants/ParticipantDialog';
import { PROVIDER_LABELS } from '@/lib/models';
import { ParticipantAvatar } from '@/components/chat/ParticipantAvatar';

export default function ParticipantsPage() {
  const participants = useParticipantStore((s) => s.participants);
  const deleteParticipant = useParticipantStore((s) => s.deleteParticipant);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Participant | undefined>();

  const openNew = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (p: Participant) => {
    setEditing(p);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold">Participants</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI personas and their configurations.
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Participant
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Bot className="h-12 w-12 text-muted-foreground opacity-40" />
            <h2 className="font-medium">No participants yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create a participant by giving them a name, choosing a provider, and
              writing a system prompt that defines their persona.
            </p>
            <Button onClick={openNew} size="sm" className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Create your first participant
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {participants.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <ParticipantAvatar participant={p} size="lg" />
                    <div>
                      <h3 className="font-medium text-sm">{p.name}</h3>
                      <div className="flex gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {PROVIDER_LABELS[p.provider]}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 font-mono">
                          {p.model.split('/').pop()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteParticipant(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {p.systemPrompt && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {p.systemPrompt}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ParticipantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        participant={editing}
      />
    </div>
  );
}
