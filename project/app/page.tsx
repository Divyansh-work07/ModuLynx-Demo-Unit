'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, ScanLine, Cpu, Leaf, Layers, Activity, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LaptopHero = dynamic(() => import('@/components/3d/laptop-hero').then((m) => m.LaptopHero), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Cpu className="h-10 w-10 text-primary animate-pulse" />
        <span className="text-xs mono uppercase tracking-wider text-muted-foreground">Loading 3D Model</span>
      </div>
    </div>
  ),
});

const stats = [
  { value: '62M+', label: 'Tons of E-Waste / Year', icon: Leaf },
  { value: '+2 Years', label: 'Target Extended Lifespan', icon: Activity },
  { value: '150 KG', label: 'Potential CO₂ Saved / Device', icon: Layers },
];

const features = [
  { title: 'Constraint Solver', desc: '6-layer compatibility engine: physical, thermal, power, protocol, firmware, connector.', icon: Cpu, href: '/configurator' },
  { title: 'AI Board Scanner', desc: 'Upload a motherboard photo for simulated component identification.', icon: ScanLine, href: '/scanner' },
  { title: 'Compatibility Translator', desc: 'When direct compatibility fails, find adapters and workarounds.', icon: Layers, href: '/translator' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/5">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">D-SPIC</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/configurator" className="hover:text-foreground transition-colors">Configurator</Link>
            <Link href="/scanner" className="hover:text-foreground transition-colors">Scanner</Link>
            <Link href="/translator" className="hover:text-foreground transition-colors">Translator</Link>
          </nav>
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5">
              Launch App <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] mono uppercase tracking-[0.2em] text-primary/80">
                  Universal Cross-Brand Configurator
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                D-SPIC
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-xl text-balance">
                Universal Cross-Brand Modular Laptop Configurator & Compatibility Translator.
              </p>
              <p className="mt-2 text-base text-primary/90 italic">
                "Upgrade smarter. Repair longer. Replace less."
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/configurator">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Start Configuration
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/scanner">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    <ScanLine className="h-4 w-4" />
                    Identify My Board
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <LaptopHero />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-border/40 bg-card/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative panel p-6 corner-marks"
                >
                  <Icon className="h-5 w-5 text-primary/70 mb-3" />
                  <div className="text-3xl sm:text-4xl font-bold gold-text">{s.value}</div>
                  <div className="mt-1 text-xs mono uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-[10px] mono uppercase tracking-[0.2em] text-primary/80">Capabilities</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Engineering-grade compatibility analysis</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={f.href} className="group block panel p-6 corner-marks h-full hover:border-primary/30 transition-colors">
                    <Icon className="h-6 w-6 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
                    <div className="flex items-center gap-1 text-xs mono uppercase tracking-wider text-primary/80 group-hover:gap-2 transition-all">
                      Explore <ChevronRight className="h-3 w-3" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 border-t border-border/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative panel p-10 lg:p-14 corner-marks overflow-hidden">
            <div className="absolute inset-0 grid-bg-sm opacity-20 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to upgrade smarter?</h2>
                <p className="mt-2 text-muted-foreground max-w-xl">
                  Start a configuration, run the compatibility engine, and find workarounds when direct compatibility fails.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Open Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/defense">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Defense Mode Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Compatibility Engine Online
          </div>
          <div className="text-xs text-muted-foreground">
            D-SPIC — 3rd Year CSE Project · Demo Build
          </div>
        </div>
      </footer>
    </div>
  );
}
