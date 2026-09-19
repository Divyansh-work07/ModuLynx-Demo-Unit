'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard } from '@/components/layout/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight, ChevronLeft, Check, Cpu, MemoryStick, HardDrive, Wifi, Monitor, Battery, Fan, CircuitBoard, Expand, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { laptops, components, componentCategories, getComponentsByCategory } from '@/data/componentDatabase';
import { analyzeCompatibility, statusLabel } from '@/services/compatibilityEngine';
import { AnalysisSequence } from '@/components/configurator/analysis-sequence';
import { demoScenarios } from '@/data/demoScenarios';
import type { Laptop, ComponentSpec, ComponentCategory, CompatibilityResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MemoryStick, HardDrive, Wifi, Monitor, Battery, Fan, Cpu, CircuitBoard, Expand,
};

const steps = ['Select Laptop', 'Select Component', 'Select Target', 'Analyze'];

export default function ConfiguratorPage() {
  const router = useRouter();
  const { setCurrentResult, addHistory } = useApp();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(null);
  const [currentComponent, setCurrentComponent] = useState<ComponentSpec | null>(null);
  const [targetComponent, setTargetComponent] = useState<ComponentSpec | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const filteredLaptops = laptops.filter(
    (l) =>
      l.model.toLowerCase().includes(search.toLowerCase()) ||
      l.brand.toLowerCase().includes(search.toLowerCase())
  );

  const targetComponents = selectedCategory
    ? getComponentsByCategory(selectedCategory).filter((c) => c.id !== currentComponent?.id)
    : [];

  function handleSelectLaptop(laptop: Laptop) {
    setSelectedLaptop(laptop);
    setStep(1);
  }

  function handleSelectCategory(category: ComponentCategory) {
    setSelectedCategory(category);
    const comps = getComponentsByCategory(category);
    if (comps.length > 0) setCurrentComponent(comps[0]);
    setStep(2);
  }

  function handleAnalyze() {
    if (!selectedLaptop || !currentComponent || !targetComponent) {
      toast({
        title: 'Configuration incomplete',
        description: 'Please select a laptop, current component, and target component.',
        variant: 'destructive',
      });
      return;
    }
    setAnalyzing(true);
    setResult(null);
  }

  function handleAnalysisComplete() {
    if (!selectedLaptop || !currentComponent || !targetComponent) return;
    const res = analyzeCompatibility(selectedLaptop, currentComponent, targetComponent);
    setResult(res);
    setCurrentResult(res);
    setAnalyzing(false);
    addHistory({
      id: `h-${Date.now()}`,
      laptop: `${selectedLaptop.brand} ${selectedLaptop.model}`,
      upgrade: `${currentComponent.model} → ${targetComponent.model}`,
      compatibility: res.score,
      status: res.status,
      date: new Date().toISOString().split('T')[0],
      recommendation: res.recommendations[0] ?? '',
    });
  }

  function loadScenario(scenarioId: string) {
    const scenario = demoScenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    const laptop = laptops.find((l) => l.id === scenario.laptopId);
    const current = components.find((c) => c.id === scenario.currentComponentId);
    const target = components.find((c) => c.id === scenario.targetComponentId);
    if (!laptop || !current || !target) return;
    setSelectedLaptop(laptop);
    setSelectedCategory(current.category);
    setCurrentComponent(current);
    setTargetComponent(target);
    setStep(3);
    toast({ title: 'Demo scenario loaded', description: scenario.name });
  }

  function reset() {
    setStep(0);
    setSelectedLaptop(null);
    setSelectedCategory(null);
    setCurrentComponent(null);
    setTargetComponent(null);
    setResult(null);
    setAnalyzing(false);
  }

  return (
    <AppShell>
      <PageHeader
        badge="Main Feature"
        title="Configurator"
        subtitle="Multi-step configuration workflow with 6-layer compatibility analysis."
      />

      {/* Demo scenarios */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Demo Scenarios:</span>
        {demoScenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => loadScenario(s.id)}
            className="px-3 py-1.5 text-xs rounded-md border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 sm:gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium shrink-0',
                  i < step && 'border-success bg-success/20 text-success',
                  i === step && 'border-primary bg-primary/20 text-primary',
                  i > step && 'border-border text-muted-foreground'
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn('text-xs sm:text-sm hidden sm:block', i === step ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-px', i < step ? 'bg-success/40' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Select Laptop */}
        {step === 0 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TechCard className="corner-marks p-5 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search laptops by brand or model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/40"
                />
              </div>
            </TechCard>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLaptops.map((laptop) => (
                <button
                  key={laptop.id}
                  onClick={() => handleSelectLaptop(laptop)}
                  className="group text-left panel corner-marks p-5 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[10px] mono uppercase tracking-wider text-primary/70">{laptop.brand}</div>
                      <div className="text-sm font-semibold mt-1">{laptop.model}</div>
                    </div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{laptop.generation}</div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>CPU</span><span className="text-foreground/80">{laptop.cpu}</span></div>
                    <div className="flex justify-between"><span>RAM</span><span className="text-foreground/80">{laptop.ram.capacity} {laptop.ram.type}</span></div>
                    <div className="flex justify-between"><span>Storage</span><span className="text-foreground/80">{laptop.storage.capacity} {laptop.storage.formFactor}</span></div>
                    <div className="flex justify-between"><span>Repairability</span><span className="text-primary">{laptop.repairability}/10</span></div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs mono uppercase tracking-wider text-primary/80 group-hover:gap-2 transition-all">
                    Select <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Select Component Category */}
        {step === 1 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TechCard className="corner-marks p-5 mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Selected Laptop</div>
                <div className="text-sm font-semibold mt-1">{selectedLaptop?.brand} {selectedLaptop?.model}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Change</Button>
            </TechCard>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {componentCategories.map((cat) => {
                const Icon = iconMap[cat.icon] ?? Cpu;
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleSelectCategory(cat.value)}
                    className="group panel corner-marks p-5 hover:border-primary/40 transition-all text-center"
                  >
                    <Icon className="h-7 w-7 text-primary/70 mx-auto mb-3 group-hover:text-primary transition-colors" />
                    <div className="text-xs font-medium">{cat.label}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Select Target Component */}
        {step === 2 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TechCard className="corner-marks p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Current Component</div>
                  <div className="text-sm font-semibold mt-1">{currentComponent?.brand} {currentComponent?.model}</div>
                  <div className="text-xs text-muted-foreground mt-1">{currentComponent?.formFactor} · {currentComponent?.interface}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Change Category</Button>
              </div>
            </TechCard>
            <div className="mb-4 text-xs mono uppercase tracking-wider text-muted-foreground">Select Target Component</div>
            {targetComponents.length === 0 ? (
              <TechCard className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No alternative components available for this category in the demo database.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setStep(1)}>Choose another category</Button>
              </TechCard>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {targetComponents.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => { setTargetComponent(comp); setStep(3); }}
                    className="group text-left panel corner-marks p-5 hover:border-primary/40 transition-all"
                  >
                    <div className="text-[10px] mono uppercase tracking-wider text-primary/70">{comp.brand}</div>
                    <div className="text-sm font-semibold mt-1">{comp.model}</div>
                    <div className="space-y-1 mt-3 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>Interface</span><span className="text-foreground/80">{comp.interface}</span></div>
                      <div className="flex justify-between"><span>Form Factor</span><span className="text-foreground/80">{comp.formFactor}</span></div>
                      <div className="flex justify-between"><span>Power</span><span className="text-foreground/80">{comp.power}W</span></div>
                      <div className="flex justify-between"><span>Connector</span><span className="text-foreground/80">{comp.connector}</span></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs mono uppercase tracking-wider text-primary/80 group-hover:gap-2 transition-all">
                      Select <ChevronRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4: Analyze */}
        {step === 3 && (
          <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TechCard className="corner-marks p-5 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Laptop</div>
                    <div className="text-sm font-semibold mt-1">{selectedLaptop?.brand} {selectedLaptop?.model}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Current</div>
                    <div className="text-sm font-semibold mt-1">{currentComponent?.model}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-primary/80">Target</div>
                    <div className="text-sm font-semibold mt-1 text-primary">{targetComponent?.model}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>Start Over</Button>
              </div>
            </TechCard>

            {!analyzing && !result && (
              <TechCard className="corner-marks p-8 text-center">
                <Cpu className="h-10 w-10 text-primary/60 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  The constraint engine will evaluate 6 layers: physical, thermal, power, protocol, firmware, and connector compatibility.
                </p>
                <Button size="lg" className="gap-2" onClick={handleAnalyze}>
                  Analyze Compatibility <ArrowRight className="h-4 w-4" />
                </Button>
              </TechCard>
            )}

            {analyzing && (
              <AnalysisSequence onComplete={handleAnalysisComplete} />
            )}

            {result && !analyzing && (
              <CompatibilityResultDisplay result={result} onReset={reset} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function CompatibilityResultDisplay({
  result,
  onReset,
}: {
  result: CompatibilityResult;
  onReset: () => void;
}) {
  const router = useRouter();
  const layerColors: Record<string, string> = {
    pass: 'text-success',
    warning: 'text-warning',
    fail: 'text-destructive',
  };

  return (
    <div className="space-y-4">
      <TechCard className="corner-marks p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <svg className="-rotate-90" width={160} height={160}>
                <circle cx={80} cy={80} r={72} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
                <circle
                  cx={80}
                  cy={80}
                  r={72}
                  fill="none"
                  stroke={result.score >= 90 ? '#3fb950' : result.score >= 70 ? '#d4a843' : result.score >= 40 ? '#e3b341' : '#f85149'}
                  strokeWidth={6}
                  strokeDasharray={2 * Math.PI * 72}
                  strokeDashoffset={2 * Math.PI * 72 - (result.score / 100) * 2 * Math.PI * 72}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: result.score >= 90 ? '#3fb950' : result.score >= 70 ? '#d4a843' : result.score >= 40 ? '#e3b341' : '#f85149' }}>
                  {result.score}%
                </span>
                <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground mt-1">Score</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm font-semibold" style={{ color: result.score >= 90 ? '#3fb950' : result.score >= 70 ? '#d4a843' : result.score >= 40 ? '#e3b341' : '#f85149' }}>
                {statusLabel(result.status)}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(result.layers).map(([key, layer]) => (
              <div key={key} className="panel p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{layer.name}</span>
                  <span className={cn('text-xs', layerColors[layer.status])}>
                    {layer.status === 'pass' ? '✓' : layer.status === 'warning' ? '⚠' : '✕'}
                  </span>
                </div>
                <div className="text-lg font-bold">{layer.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </TechCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <TechCard className="corner-marks p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" /> Why?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {result.reasons.length > 0 ? (
              result.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-warning shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))
            ) : (
              <li className="text-success">All layers pass — no issues detected.</li>
            )}
          </ul>
        </TechCard>

        <TechCard className="corner-marks p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-success" /> Recommended Action
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-success shrink-0">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </TechCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push('/translator')} className="gap-2">
          View Translation <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" onClick={() => router.push('/visualizer')} className="gap-2">
          View 3D Model
        </Button>
        <Button variant="outline" onClick={() => router.push('/sustainability')} className="gap-2">
          View Impact
        </Button>
        <Button variant="ghost" onClick={onReset}>New Configuration</Button>
      </div>
    </div>
  );
}
