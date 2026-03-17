'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '../types';

interface SettingsStore extends AppSettings {
  setTheme: (theme: AppSettings['theme']) => void;
  setDefaultWindowSize: (size: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      defaultWindowSize: 20,
      setTheme: (theme) => set({ theme }),
      setDefaultWindowSize: (defaultWindowSize) => set({ defaultWindowSize }),
    }),
    { name: 'roleplai-settings' }
  )
);
