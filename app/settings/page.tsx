'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Input } from '@/components/ui/input';
import { PROVIDER_LABELS } from '@/lib/models';
import { ProviderName } from '@/lib/types';

const PROVIDERS: ProviderName[] = ['anthropic', 'openai', 'google', 'ollama'];

export default function SettingsPage() {
  const { theme, defaultWindowSize, setTheme, setDefaultWindowSize } =
    useSettingsStore();
  const [providerStatus, setProviderStatus] = useState<
    Record<string, boolean> | null
  >(null);
  const [windowSizeInput, setWindowSizeInput] = useState(String(defaultWindowSize));

  useEffect(() => {
    fetch('/api/providers')
      .then((r) => r.json())
      .then(setProviderStatus)
      .catch(() => setProviderStatus(null));
  }, []);

  const handleWindowSizeBlur = () => {
    const val = parseInt(windowSizeInput);
    if (!isNaN(val) && val >= 5) {
      setDefaultWindowSize(val);
    } else {
      setWindowSizeInput(String(defaultWindowSize));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          App preferences and provider status.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-2xl space-y-8">
        {/* Provider Status */}
        <section className="space-y-3">
          <h2 className="font-medium">Provider Status</h2>
          <p className="text-sm text-muted-foreground">
            Configure API keys in{' '}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env.local</code>{' '}
            (copy from{' '}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env.example</code>
            ).
          </p>
          <div className="space-y-2">
            {PROVIDERS.map((p) => {
              const active = providerStatus?.[p];
              return (
                <div
                  key={p}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <span className="font-medium text-sm">{PROVIDER_LABELS[p]}</span>
                  <div className="flex items-center gap-2 text-sm">
                    {providerStatus === null ? (
                      <span className="text-muted-foreground text-xs">checking…</span>
                    ) : active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">
                          {p === 'ollama' ? 'Local (no key needed)' : 'Key missing'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* App Preferences */}
        <section className="space-y-4">
          <h2 className="font-medium">Preferences</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-md text-sm border capitalize transition-colors ${
                    theme === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default window size</label>
            <p className="text-xs text-muted-foreground">
              Number of messages included in context when using windowed mode.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                max={200}
                value={windowSizeInput}
                onChange={(e) => setWindowSizeInput(e.target.value)}
                onBlur={handleWindowSizeBlur}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">messages</span>
            </div>
          </div>
        </section>

        {/* Setup instructions */}
        <section className="space-y-3">
          <h2 className="font-medium">Setup</h2>
          <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs space-y-1">
            <p className="text-muted-foreground"># 1. Copy env file</p>
            <p>cp .env.example .env.local</p>
            <p className="text-muted-foreground mt-2"># 2. Add your keys to .env.local</p>
            <p>ANTHROPIC_API_KEY=sk-ant-...</p>
            <p>OPENAI_API_KEY=sk-...</p>
            <p>GOOGLE_GENERATIVE_AI_API_KEY=AIza...</p>
            <p className="text-muted-foreground mt-2"># 3. Restart the dev server</p>
            <p>npm run dev</p>
          </div>
        </section>
      </div>
    </div>
  );
}
