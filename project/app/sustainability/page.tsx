'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard, ScoreGauge } from '@/components/layout/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, TrendingUp, Calculator, Recycle, ArrowRight } from 'lucide-react';
import { laptops } from '@/data/componentDatabase';
import { calculateSustainability, repairabilityBreakdown } from '@/services/sustainabilityEngine';
import type { SustainabilityResult } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function SustainabilityPage() {
  const { toast } = useToast();
  const [deviceAge, setDeviceAge] = useState('2');
  const [replacementCost, setReplacementCost] = useState('1200');
  const [upgradeCost, setUpgradeCost] = useState('250');
  const [expectedExtension, setExpectedExtension] = useState('2');
  const [componentType, setComponentType] = useState('SSD');
  const [laptopId, setLaptopId] = useState(laptops[0].id);
  const [result, setResult] = useState<SustainabilityResult | null>(null);

  const laptop = laptops.find((l) => l.id === laptopId);
  const breakdown = laptop ? repairabilityBreakdown(laptop) : [];

  function handleCalculate() {
    if (!laptop) return;
    const age = parseFloat(deviceAge);
    const replace = parseFloat(replacementCost);
    const upgrade = parseFloat(upgradeCost);
    const ext = parseFloat(expectedExtension);
    if (isNaN(age) || isNaN(replace) || isNaN(upgrade) || isNaN(ext)) {
      toast({ title: 'Invalid input', description: 'Please enter valid numbers.', variant: 'destructive' });
      return;
    }
    const res = calculateSustainability({
      deviceAge: age,
      replacementCost: replace,
      upgradeCost: upgrade,
      expectedExtension: ext,
      componentType,
      laptop,
    });
    setResult(res);
  }

  return (
    <AppShell>
      <PageHeader
        badge="Sustainability"
        title="Upgrade vs Replace"
        subtitle="Calculate the environmental and economic impact of upgrading instead of replacing your laptop."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="space-y-4">
          <TechCard className="corner-marks p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-primary" /> Sustainability Calculator
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs mono uppercase tracking-wider">Laptop</Label>
                <Select value={laptopId} onValueChange={setLaptopId}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {laptops.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.brand} {l.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mono uppercase tracking-wider">Device Age (years)</Label>
                  <Input type="number" value={deviceAge} onChange={(e) => setDeviceAge(e.target.value)} className="mt-1.5 bg-secondary/40" />
                </div>
                <div>
                  <Label className="text-xs mono uppercase tracking-wider">Expected Extension (years)</Label>
                  <Input type="number" value={expectedExtension} onChange={(e) => setExpectedExtension(e.target.value)} className="mt-1.5 bg-secondary/40" />
                </div>
                <div>
                  <Label className="text-xs mono uppercase tracking-wider">Replacement Cost ($)</Label>
                  <Input type="number" value={replacementCost} onChange={(e) => setReplacementCost(e.target.value)} className="mt-1.5 bg-secondary/40" />
                </div>
                <div>
                  <Label className="text-xs mono uppercase tracking-wider">Upgrade Cost ($)</Label>
                  <Input type="number" value={upgradeCost} onChange={(e) => setUpgradeCost(e.target.value)} className="mt-1.5 bg-secondary/40" />
                </div>
              </div>
              <div>
                <Label className="text-xs mono uppercase tracking-wider">Component Type</Label>
                <Select value={componentType} onValueChange={setComponentType}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['RAM', 'SSD', 'WiFi', 'Display', 'Battery', 'Cooling'].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCalculate} className="w-full gap-2">
                Calculate Impact <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TechCard>

          {/* Repairability breakdown */}
          {laptop && (
            <TechCard className="corner-marks p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Recycle className="h-4 w-4 text-primary" /> Repairability Breakdown
              </h3>
              <div className="flex items-center justify-center mb-4">
                <ScoreGauge score={Math.round(laptop.repairability * 10)} size={120} label="REPAIR" colorClass="#3fb950" />
              </div>
              <div className="space-y-2">
                {breakdown.map((b) => (
                  <div key={b.factor} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-40 shrink-0">{b.factor}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${b.score * 10}%`,
                          background: b.score >= 8 ? '#3fb950' : b.score >= 5 ? '#e3b341' : '#f85149',
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right">{b.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </TechCard>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && (
            <TechCard className="corner-marks p-12 text-center">
              <Leaf className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Enter your device details and calculate to see the sustainability impact.</p>
            </TechCard>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Lifespan comparison */}
              <TechCard className="corner-marks p-5">
                <h3 className="text-sm font-semibold mb-4">Lifespan Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="panel p-4 text-center">
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-1">Current Device</div>
                    <div className="text-3xl font-bold text-muted-foreground">{result.currentLifespan.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground mt-1">years expected</div>
                  </div>
                  <div className="panel p-4 text-center border-primary/40">
                    <div className="text-[10px] mono uppercase tracking-wider text-primary mb-1">With D-SPIC Upgrade</div>
                    <div className="text-3xl font-bold text-primary">{result.extendedLifespan.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground mt-1">years expected</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-success">+{result.extensionYears} YEARS</span>
                  <span className="text-xs mono uppercase tracking-wider text-muted-foreground">Extended Life</span>
                </div>
              </TechCard>

              {/* Savings */}
              <div className="grid grid-cols-2 gap-4">
                <TechCard className="corner-marks p-5 text-center">
                  <Leaf className="h-5 w-5 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">~{result.co2Saved} KG</div>
                  <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mt-1">CO₂ Saved</div>
                </TechCard>
                <TechCard className="corner-marks p-5 text-center">
                  <div className="text-2xl font-bold text-primary">${result.moneySaved}</div>
                  <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mt-1">Money Saved</div>
                </TechCard>
              </div>

              {/* Recommendation */}
              <TechCard className="corner-marks p-5">
                <h3 className="text-sm font-semibold mb-2">Recommendation</h3>
                <div className="flex items-start gap-2 p-3 rounded border border-success/40 bg-success/10">
                  <Leaf className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <p className="text-sm">{result.recommendation}</p>
                </div>
              </TechCard>

              {/* Impact chart */}
              <TechCard className="corner-marks p-5">
                <h3 className="text-sm font-semibold mb-4">Repairability Factors</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="factor" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {breakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.score >= 8 ? '#3fb950' : entry.score >= 5 ? '#e3b341' : '#f85149'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </TechCard>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
