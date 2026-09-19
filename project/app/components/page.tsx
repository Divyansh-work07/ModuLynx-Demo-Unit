'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard } from '@/components/layout/shared';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MemoryStick, HardDrive, Wifi, Monitor, Battery, Fan, Cpu, CircuitBoard, Expand } from 'lucide-react';
import { components, componentCategories } from '@/data/componentDatabase';
import type { ComponentCategory } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MemoryStick, HardDrive, Wifi, Monitor, Battery, Fan, Cpu, CircuitBoard, Expand,
};

export default function ComponentsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch =
        c.brand.toLowerCase().includes(search.toLowerCase()) ||
        c.model.toLowerCase().includes(search.toLowerCase()) ||
        c.interface.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <AppShell>
      <PageHeader
        badge="Component Database"
        title="Components"
        subtitle="Searchable catalog of laptop components with specifications. Demo data for demonstration purposes."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by brand, model, or interface..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56 bg-secondary/40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {componentCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((comp) => {
          const cat = componentCategories.find((c) => c.value === comp.category);
          const Icon = cat ? (iconMap[cat.icon] ?? Cpu) : Cpu;
          return (
            <TechCard key={comp.id} className="corner-marks p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded border border-primary/30 bg-primary/5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-primary/70">{comp.brand}</div>
                    <div className="text-sm font-semibold">{comp.model}</div>
                  </div>
                </div>
                <span className="text-[10px] mono uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                  {comp.category}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Interface</span><span>{comp.interface}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Form Factor</span><span>{comp.formFactor}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dimensions</span><span>{comp.dimensions.length}×{comp.dimensions.width}×{comp.dimensions.height}mm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Power</span><span>{comp.power}W</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Thermal</span><span>{comp.thermal}W</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Protocol</span><span>{comp.protocol}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Connector</span><span>{comp.connector}</span></div>
              </div>
              {comp.firmwareRequirements && comp.firmwareRequirements.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-1">Firmware Requirements</div>
                  <div className="text-xs text-warning">{comp.firmwareRequirements.join(', ')}</div>
                </div>
              )}
            </TechCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <TechCard className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No components found matching your search.</p>
        </TechCard>
      )}
    </AppShell>
  );
}
