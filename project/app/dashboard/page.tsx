'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard, ScoreGauge, StatusDot } from '@/components/layout/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Cpu, Gauge, TrendingUp, Leaf, Activity, Clock, Copy, Trash2, Eye } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { statusLabel, statusColor } from '@/services/compatibilityEngine';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';

const compatibilityData = [
  { layer: 'Physical', value: 96 },
  { layer: 'Thermal', value: 89 },
  { layer: 'Power', value: 94 },
  { layer: 'Protocol', value: 98 },
  { layer: 'Firmware', value: 71 },
  { layer: 'Connector', value: 85 },
];

const upgradeData = [
  { month: 'Mar', upgrades: 4 },
  { month: 'Apr', upgrades: 7 },
  { month: 'May', upgrades: 5 },
  { month: 'Jun', upgrades: 9 },
  { month: 'Jul', upgrades: 12 },
  { month: 'Aug', upgrades: 8 },
];

const sustainabilityData = [
  { name: 'RAM', co2: 45 },
  { name: 'SSD', co2: 80 },
  { name: 'Wi-Fi', co2: 20 },
  { name: 'Battery', co2: 60 },
  { name: 'Display', co2: 35 },
];

const cards = [
  { label: 'Active Configuration', value: 'ThinkPad T14 Gen 3', icon: Cpu, sub: 'Intel Core i7-1260P', progress: null },
  { label: 'Compatibility Score', value: '92%', icon: Gauge, sub: 'HIGH COMPATIBILITY', progress: 92 },
  { label: 'Upgrade Potential', value: 'HIGH', icon: TrendingUp, sub: '3 upgradeable components', progress: 85 },
  { label: 'Repairability', value: '8.7 / 10', icon: Activity, sub: 'Lenovo ThinkPad', progress: 87 },
  { label: 'Carbon Savings', value: '~150 kg', icon: Leaf, sub: 'CO₂ saved vs replacement', progress: 75 },
];

export default function DashboardPage() {
  const { history, deleteHistory } = useApp();

  return (
    <AppShell>
      <PageHeader
        badge="D-SPIC System"
        title="Dashboard"
        subtitle="Good evening. System status: ONLINE."
        actions={
          <Link href="/configurator">
            <Button size="sm" className="gap-1.5">
              New Configuration <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TechCard className="p-4 corner-marks h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-primary/60" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-foreground">{c.value}</div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground/70 mt-1">
                  {c.sub}
                </div>
                {c.progress !== null && (
                  <Progress value={c.progress} className="h-1 mt-3" />
                )}
              </TechCard>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <TechCard className="p-5 corner-marks">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Compatibility Distribution</h3>
            <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">6 Layers</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={compatibilityData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="layer" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard className="p-5 corner-marks">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Upgrade Potential</h3>
            <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={upgradeData}>
              <defs>
                <linearGradient id="upgradeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="upgrades" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#upgradeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard className="p-5 corner-marks">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Sustainability Impact</h3>
            <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">CO₂ kg</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sustainabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
              <Bar dataKey="co2" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      {/* Recent configurations */}
      <TechCard className="corner-marks">
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary/70" />
            <h3 className="text-sm font-semibold">Recent Configurations</h3>
          </div>
          <Link href="/history" className="text-xs mono uppercase tracking-wider text-primary/80 hover:text-primary">
            View All
          </Link>
        </div>
        <div className="divide-y divide-border/30">
          {history.slice(0, 5).map((h) => (
            <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{h.laptop}</span>
                  <span className="text-xs text-muted-foreground truncate">→ {h.upgrade}</span>
                </div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground/70 mt-1">
                  {h.date}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-16">
                    <Progress value={h.compatibility} className="h-1.5" />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{h.compatibility}%</span>
                </div>
                <span className={`text-[10px] mono uppercase tracking-wider ${statusColor(h.status)} w-32 text-right hidden sm:block`}>
                  {statusLabel(h.status)}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteHistory(h.id)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </AppShell>
  );
}
