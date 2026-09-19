'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Shield } from 'lucide-react';
import { useApp } from '@/hooks/use-app';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { demoMode } = useApp();
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="min-h-screen pt-14 lg:pt-0">
          {demoMode && (
            <div className="hidden lg:flex items-center gap-2 px-6 py-1.5 border-b border-border/40 bg-primary/5">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-[10px] mono uppercase tracking-[0.18em] text-primary/80">
                Demo Mode Active — Sample data loaded
              </span>
            </div>
          )}
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
