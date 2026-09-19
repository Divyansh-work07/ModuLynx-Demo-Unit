'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard, StatusDot } from '@/components/layout/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowDown, AlertTriangle, Check, Wrench, Lightbulb, GitBranch, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { components, getComponentById } from '@/data/componentDatabase';
import { analyzeCompatibility, statusLabel, statusColor } from '@/services/compatibilityEngine';
import { translateCompatibility } from '@/services/translatorEngine';
import { laptops } from '@/data/componentDatabase';
import type { Translation, ComponentSpec, PinMapping } from '@/types';
import { motion } from 'framer-motion';

const pinStatusColors: Record<PinMapping['status'], string> = {
  matched: 'bg-success',
  mismatched: 'bg-destructive',
  unused: 'bg-muted-foreground/30',
  requires_conversion: 'bg-warning',
};

const pinStatusLabels: Record<PinMapping['status'], string> = {
  matched: 'MATCHED',
  mismatched: 'MISMATCHED',
  unused: 'UNUSED',
  requires_conversion: 'REQUIRES CONVERSION',
};

export default function TranslatorPage() {
  const { currentResult } = useApp();
  const { toast } = useToast();
  const [currentId, setCurrentId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [laptopId, setLaptopId] = useState<string>('');
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  const current = getComponentById(currentId);
  const target = getComponentById(targetId);
  const laptop = laptops.find((l) => l.id === laptopId);

  function handleTranslate() {
    if (!current || !target || !laptop) {
      toast({ title: 'Incomplete selection', description: 'Select a laptop and both components.', variant: 'destructive' });
      return;
    }
    const result = analyzeCompatibility(laptop, current, target);
    const trans = translateCompatibility(result, current, target);
    setTranslation(trans);
    setSelectedPin(null);
  }

  function useCurrentResult() {
    if (!currentResult) {
      toast({ title: 'No result', description: 'Run a compatibility analysis first.', variant: 'destructive' });
      return;
    }
    const cur = getComponentById(currentResult.currentComponentId);
    const tgt = getComponentById(currentResult.targetComponentId);
    const lap = laptops.find((l) => l.id === currentResult.laptopId);
    if (!cur || !tgt || !lap) return;
    setCurrentId(cur.id);
    setTargetId(tgt.id);
    setLaptopId(lap.id);
    const trans = translateCompatibility(currentResult, cur, tgt);
    setTranslation(trans);
  }

  return (
    <AppShell>
      <PageHeader
        badge="Killer Feature"
        title="Compatibility Translator"
        subtitle="When direct compatibility fails, D-SPIC finds adapters, pinout mappings, and workarounds instead of just saying no."
        actions={
          currentResult && (
            <Button variant="outline" size="sm" onClick={useCurrentResult}>
              Use Last Analysis
            </Button>
          )
        }
      />

      {/* Input */}
      <TechCard className="corner-marks p-5 mb-6">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <Label className="text-xs mono uppercase tracking-wider">Laptop</Label>
            <Select value={laptopId} onValueChange={setLaptopId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select laptop" /></SelectTrigger>
              <SelectContent>
                {laptops.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.brand} {l.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mono uppercase tracking-wider">Current Component</Label>
            <Select value={currentId} onValueChange={setCurrentId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select component" /></SelectTrigger>
              <SelectContent>
                {components.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.brand} {c.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mono uppercase tracking-wider">Target Component</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select component" /></SelectTrigger>
              <SelectContent>
                {components.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.brand} {c.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 text-xs text-muted-foreground mono">
            {current && target ? `${current.model} → ${target.model}` : 'Select components to translate'}
          </div>
          <Button onClick={handleTranslate} disabled={!current || !target || !laptop} className="gap-2">
            Translate <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TechCard>

      {translation && current && target && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Direct compatibility + Translation path */}
          <div className="grid lg:grid-cols-2 gap-4">
            <TechCard className="corner-marks p-5">
              <h3 className="text-sm font-semibold mb-4">Direct Compatibility</h3>
              <div className={cn('flex items-center gap-3 p-4 rounded-md border', translation.directCompatibility ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10')}>
                {translation.directCompatibility ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <div className={cn('text-sm font-semibold', translation.directCompatibility ? 'text-success' : 'text-destructive')}>
                    {translation.directCompatibility ? 'PASSED' : 'FAILED'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {translation.directCompatibility ? 'Components are directly compatible.' : 'Direct connection not possible — translation required.'}
                  </div>
                </div>
              </div>
            </TechCard>

            <TechCard className="corner-marks p-5">
              <h3 className="text-sm font-semibold mb-4">Translation Path</h3>
              <div className="flex flex-col gap-2">
                {translation.path.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <ArrowDown className="h-3 w-3 text-muted-foreground" />}
                    <div className={cn('flex-1 flex items-center justify-between px-3 py-2 rounded border', p.type === 'Bridge' || p.type === 'Translation' ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/30')}>
                      <span className="text-sm">{p.step}</span>
                      <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{p.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          {/* Pinout Mapper */}
          <TechCard className="corner-marks p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" /> Pinout Mapper
              </h3>
              <div className="flex items-center gap-3 text-[10px] mono uppercase tracking-wider">
                {Object.entries(pinStatusLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', pinStatusColors[key as PinMapping['status']])} />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Source pins */}
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2 text-center">Source Connector</div>
                <div className="space-y-1.5">
                  {translation.pinoutMappings.map((pin, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPin(i)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded border text-left transition-colors',
                        selectedPin === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full shrink-0', pinStatusColors[pin.status])} />
                      <span className="text-xs mono text-muted-foreground w-12">{pin.sourcePin}</span>
                      <span className="text-sm">{pin.signal}</span>
                      <span className="text-[10px] mono text-muted-foreground/70 ml-auto">{pin.voltage}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Target pins */}
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2 text-center">Target Connector</div>
                <div className="space-y-1.5">
                  {translation.pinoutMappings.map((pin, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded border',
                        selectedPin === i ? 'border-primary bg-primary/10' : 'border-border'
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full shrink-0', pin.targetPin ? pinStatusColors[pin.status] : 'bg-muted-foreground/30')} />
                      <span className="text-xs mono text-muted-foreground w-12">{pin.targetPin ?? '—'}</span>
                      <span className="text-sm text-muted-foreground">{pin.targetPin ? pin.signal : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {translation.warning && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded border border-warning/40 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{translation.warning}</p>
              </div>
            )}
          </TechCard>

          {/* Adapter Suggester */}
          <TechCard className="corner-marks p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" /> Adapter Suggestions
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {translation.adapters.map((a) => (
                <div key={a.id} className="panel p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold">{a.name}</h4>
                    <span className={cn(
                      'text-[10px] mono uppercase tracking-wider px-2 py-0.5 rounded',
                      a.compatibility === 'HIGH' && 'bg-success/20 text-success',
                      a.compatibility === 'MEDIUM' && 'bg-warning/20 text-warning',
                      a.compatibility === 'LOW' && 'bg-destructive/20 text-destructive'
                    )}>
                      {a.compatibility}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{a.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Modification</span><span>{a.modification}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Risk</span><span className={a.risk === 'LOW' ? 'text-success' : a.risk === 'MEDIUM' ? 'text-warning' : 'text-destructive'}>{a.risk}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span>{a.difficulty}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          {/* Workaround Engine */}
          <TechCard className="corner-marks p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Alternative Paths
            </h3>
            <div className="space-y-3">
              {translation.workarounds.map((w, i) => (
                <div key={w.id} className={cn('panel p-4', i === 0 && 'border-primary/40')}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{w.name}</span>
                        {i === 0 && (
                          <span className="text-[10px] mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                            Best Option
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{w.description}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] mono uppercase tracking-wider">
                        <span className="text-muted-foreground">Compatibility: <span className="text-foreground">{w.compatibility}%</span></span>
                        <span className="text-muted-foreground">Cost: <span className="text-foreground">{w.cost}</span></span>
                        <span className="text-muted-foreground">Difficulty: <span className="text-foreground">{w.difficulty}</span></span>
                        <span className="text-muted-foreground">Risk: <span className={w.risk === 'LOW' ? 'text-success' : w.risk === 'MEDIUM' ? 'text-warning' : 'text-destructive'}>{w.risk}</span></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-primary">{w.recommendationScore}</div>
                      <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          {/* Risk summary */}
          <TechCard className="corner-marks p-5">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs mono uppercase tracking-wider text-muted-foreground">Risk</span>
                <span className={cn('text-sm font-semibold', translation.risk === 'LOW' ? 'text-success' : translation.risk === 'MEDIUM' ? 'text-warning' : 'text-destructive')}>
                  {translation.risk}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <span className="text-xs mono uppercase tracking-wider text-muted-foreground">Difficulty</span>
                <span className="text-sm font-semibold">{translation.difficulty}</span>
              </div>
            </div>
          </TechCard>
        </motion.div>
      )}

      {!translation && (
        <TechCard className="corner-marks p-12 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Select a laptop and two components to generate a compatibility translation.</p>
        </TechCard>
      )}
    </AppShell>
  );
}
