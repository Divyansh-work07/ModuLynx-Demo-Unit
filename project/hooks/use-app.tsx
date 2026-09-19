'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CompatibilityResult, HistoryEntry } from '@/types';
import { demoHistory } from '@/data/demoScenarios';

interface AppState {
  demoMode: boolean;
  toggleDemoMode: () => void;
  currentResult: CompatibilityResult | null;
  setCurrentResult: (r: CompatibilityResult | null) => void;
  history: HistoryEntry[];
  addHistory: (entry: HistoryEntry) => void;
  deleteHistory: (id: string) => void;
  defenseMode: boolean;
  setDefenseMode: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [demoMode, setDemoMode] = useState(true);
  const [currentResult, setCurrentResult] = useState<CompatibilityResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(demoHistory);
  const [defenseMode, setDefenseMode] = useState(false);

  const toggleDemoMode = useCallback(() => setDemoMode((v) => !v), []);

  const addHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 50));
  }, []);

  const deleteHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  useEffect(() => {
    if (demoMode) {
      setHistory(demoHistory);
    }
  }, [demoMode]);

  return (
    <AppContext.Provider
      value={{
        demoMode,
        toggleDemoMode,
        currentResult,
        setCurrentResult,
        history,
        addHistory,
        deleteHistory,
        defenseMode,
        setDefenseMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
