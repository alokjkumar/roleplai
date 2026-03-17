'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useParticipantStore } from '@/lib/stores/participantStore';
import { Participant, ProviderName } from '@/lib/types';
import { MODELS, PROVIDER_LABELS } from '@/lib/models';

interface Props {
  open: boolean;
  onClose: () => void;
  participant?: Participant; // if editing
}

const PROVIDERS: ProviderName[] = ['anthropic', 'openai', 'google', 'ollama'];

export function ParticipantDialog({ open, onClose, participant }: Props) {
  const addParticipant = useParticipantStore((s) => s.addParticipant);
  const updateParticipant = useParticipantStore((s) => s.updateParticipant);

  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ProviderName>('anthropic');
  const [model, setModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [ollamaModels, setOllamaModels] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setProvider(participant.provider);
      setModel(participant.model);
      setSystemPrompt(participant.systemPrompt);
    } else {
      setName('');
      setProvider('anthropic');
      setModel(MODELS.anthropic[0]?.id ?? '');
      setSystemPrompt('');
    }
  }, [participant, open]);

  useEffect(() => {
    if (provider !== 'ollama') {
      const models = MODELS[provider];
      if (models.length > 0 && !models.find((m) => m.id === model)) {
        setModel(models[0].id);
      }
    } else {
      fetch('/api/ollama/models')
        .then((r) => r.json())
        .then((data) => {
          setOllamaModels(data.models ?? []);
          if (data.models?.length > 0) setModel(data.models[0].id);
        })
        .catch(() => setOllamaModels([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const models = provider === 'ollama' ? ollamaModels : MODELS[provider];

  const handleSave = () => {
    if (!name.trim() || !model) return;
    if (participant) {
      updateParticipant(participant.id, { name: name.trim(), provider, model, systemPrompt });
    } else {
      addParticipant({ name: name.trim(), provider, model, systemPrompt });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {participant ? 'Edit Participant' : 'New Participant'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aristotle"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Provider</label>
            <div className="flex gap-2 flex-wrap">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    provider === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {PROVIDER_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Model</label>
            {models.length === 0 ? (
              provider === 'ollama' ? (
                <p className="text-sm text-muted-foreground">
                  No Ollama models found. Make sure Ollama is running.
                </p>
              ) : (
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="model id"
                />
              )
            ) : (
              <div className="flex gap-2 flex-wrap">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      model === m.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
            {model && (
              <Badge variant="outline" className="mt-1 text-xs">
                {model}
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are Aristotle, the ancient Greek philosopher..."
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !model}>
            {participant ? 'Save Changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
