'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard } from '@/components/layout/shared';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Trash2, History as HistoryIcon } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { statusLabel, statusColor } from '@/services/compatibilityEngine';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { history, deleteHistory } = useApp();
  const { toast } = useToast();

  function handleDuplicate(id: string) {
    toast({ title: 'Configuration duplicated', description: 'Loaded into the configurator.' });
  }

  return (
    <AppShell>
      <PageHeader
        badge="History"
        title="Previous Configurations"
        subtitle="View, duplicate, or delete past compatibility analyses."
      />

      {history.length === 0 ? (
        <TechCard className="p-12 text-center">
          <HistoryIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No configurations yet. Run an analysis in the Configurator.</p>
        </TechCard>
      ) : (
        <TechCard className="corner-marks overflow-hidden">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border/40 text-[10px] mono uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Laptop</div>
            <div className="col-span-4">Upgrade</div>
            <div className="col-span-2">Compatibility</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-border/30">
            {history.map((h) => (
              <div key={h.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition-colors">
                <div className="sm:col-span-3">
                  <div className="text-sm font-medium">{h.laptop}</div>
                </div>
                <div className="sm:col-span-4">
                  <div className="text-sm text-muted-foreground">{h.upgrade}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Progress value={h.compatibility} className="h-1.5 flex-1" />
                    <span className="text-sm font-semibold w-10 text-right">{h.compatibility}%</span>
                  </div>
                  <div className={`text-[10px] mono uppercase tracking-wider mt-1 ${statusColor(h.status)}`}>
                    {statusLabel(h.status)}
                  </div>
                </div>
                <div className="sm:col-span-2 text-xs text-muted-foreground mono">{h.date}</div>
                <div className="sm:col-span-1 flex items-center gap-1 sm:justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(h.id)} aria-label="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteHistory(h.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      )}
    </AppShell>
  );
}
