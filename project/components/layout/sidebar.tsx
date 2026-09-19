'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sliders,
  CheckCircle2,
  ScanLine,
  Languages,
  Box,
  Database,
  Leaf,
  History,
  Settings,
  Cpu,
  Menu,
  X,
  Shield,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';

const navSections = [
  { label: 'Overview', items: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'Tools', items: [
    { href: '/configurator', label: 'Configurator', icon: Sliders },
    { href: '/compatibility', label: 'Compatibility', icon: CheckCircle2 },
    { href: '/scanner', label: 'AI Scanner', icon: ScanLine },
    { href: '/translator', label: 'Translator', icon: Languages },
    { href: '/visualizer', label: '3D Visualizer', icon: Box },
    { href: '/components', label: 'Components', icon: Database },
  ]},
  { label: 'Insights', items: [
    { href: '/sustainability', label: 'Sustainability', icon: Leaf },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]},
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6 px-3 py-4 flex-1 overflow-y-auto no-scrollbar">
      {navSections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mono">
            {section.label}
          </span>
          {section.items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 relative',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-primary rounded-r-full" />
                )}
                <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SystemStatus() {
  const { demoMode } = useApp();
  return (
    <div className="border-t border-border/60 px-4 py-3 space-y-1.5">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mono">
        System Status
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-muted-foreground">Compatibility Engine Online</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
        <span className="text-muted-foreground">AI Pipeline {demoMode ? 'Demo' : 'Ready'}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-muted-foreground">Database {demoMode ? 'Demo Data' : 'Connected'}</span>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-border/60">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/5">
        <Cpu className="h-5 w-5 text-primary" />
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-foreground">D-SPIC</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mono mt-0.5">
          Configurator
        </span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { demoMode, toggleDemoMode, setDefenseMode } = useApp();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 glass-strong z-40">
        <Brand />
        <NavContent />
        <div className="px-3 pb-2 space-y-2">
          <button
            onClick={toggleDemoMode}
            className={cn(
              'w-full flex items-center justify-between rounded-md border px-3 py-2 text-xs transition-colors',
              demoMode
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="mono uppercase tracking-wider">Demo Mode</span>
            <span className="flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', demoMode ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40')} />
              {demoMode ? 'ACTIVE' : 'OFF'}
            </span>
          </button>
          <Link href="/defense" onClick={() => setDefenseMode(true)}>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs mono uppercase tracking-wider" size="sm">
              <PlayCircle className="h-3.5 w-3.5" />
              Defense Mode
            </Button>
          </Link>
        </div>
        <SystemStatus />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 glass-strong border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/5">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">D-SPIC</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 glass-strong border-r border-border/60">
              <SheetHeader className="px-0 pt-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-border/60">
                  <Brand />
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="absolute top-3 right-3">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <NavContent onNavigate={() => setMobileOpen(false)} />
                <div className="px-3 pb-2 space-y-2">
                  <button
                    onClick={toggleDemoMode}
                    className={cn(
                      'w-full flex items-center justify-between rounded-md border px-3 py-2 text-xs transition-colors',
                      demoMode
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border bg-secondary/40 text-muted-foreground'
                    )}
                  >
                    <span className="mono uppercase tracking-wider">Demo Mode</span>
                    <span className="flex items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 rounded-full', demoMode ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40')} />
                      {demoMode ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>
                  <Link href="/defense" onClick={() => { setDefenseMode(true); setMobileOpen(false); }}>
                    <Button variant="outline" className="w-full justify-start gap-2 text-xs mono uppercase tracking-wider" size="sm">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Defense Mode
                    </Button>
                  </Link>
                </div>
                <SystemStatus />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
