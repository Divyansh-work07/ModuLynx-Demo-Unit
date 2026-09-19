import type { HistoryEntry } from '@/types';

export const demoHistory: HistoryEntry[] = [
  {
    id: 'h1',
    laptop: 'ThinkPad T14 Gen 3',
    upgrade: 'M.2 2230 → M.2 2280 SSD (2TB)',
    compatibility: 96,
    status: 'COMPATIBLE_WITH_CONDITIONS',
    date: '2026-08-14',
    recommendation: 'Use low-profile mounting adapter.',
  },
  {
    id: 'h2',
    laptop: 'Dell Latitude 5420',
    upgrade: 'Intel AX201 → BE200 Wi-Fi 7',
    compatibility: 42,
    status: 'REQUIRES_ADAPTER',
    date: '2026-08-11',
    recommendation: 'Verify BIOS whitelist and CNVio2 support.',
  },
  {
    id: 'h3',
    laptop: 'HP EliteBook 840 G8',
    upgrade: '32GB → 64GB DDR4 SODIMM',
    compatibility: 88,
    status: 'COMPATIBLE_WITH_CONDITIONS',
    date: '2026-08-08',
    recommendation: 'Thermal budget safe, proceed.',
  },
  {
    id: 'h4',
    laptop: 'Framework Laptop 13',
    upgrade: '1TB → 2TB NVMe SSD',
    compatibility: 99,
    status: 'FULLY_COMPATIBLE',
    date: '2026-08-05',
    recommendation: 'All layers pass — proceed.',
  },
  {
    id: 'h5',
    laptop: 'ThinkPad X1 Carbon Gen 10',
    upgrade: 'Wi-Fi 6E → Wi-Fi 7 module',
    compatibility: 38,
    status: 'NOT_RECOMMENDED',
    date: '2026-08-02',
    recommendation: 'BIOS whitelist blocks non-OEM Wi-Fi 7 cards.',
  },
];

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  laptopId: string;
  currentComponentId: string;
  targetComponentId: string;
  expectedResult: string;
  reason: string;
  recommendation: string;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'scenario-1',
    name: 'ThinkPad SSD Form Factor Upgrade',
    description: 'Upgrade M.2 2230 to M.2 2280 on a ThinkPad T14 Gen 3',
    laptopId: 'thinkpad-t14-g3',
    currentComponentId: 'ssd-2230-gen4',
    targetComponentId: 'ssd-2280-gen4',
    expectedResult: 'PARTIALLY COMPATIBLE',
    reason: 'Physical clearance issue — 2280 exceeds 2242 bay length.',
    recommendation: 'Mounting adapter / clearance verification required.',
  },
  {
    id: 'scenario-2',
    name: 'Wi-Fi 7 Upgrade on Latitude',
    description: 'Upgrade Intel AX201 to BE200 Wi-Fi 7 on Dell Latitude 5420',
    laptopId: 'dell-latitude-5420',
    currentComponentId: 'wifi6-ax210',
    targetComponentId: 'wifi7-be200',
    expectedResult: 'PARTIALLY COMPATIBLE',
    reason: 'Potential BIOS whitelist restriction and CNVio2 requirement.',
    recommendation: 'Verify firmware/BIOS support before installation.',
  },
  {
    id: 'scenario-3',
    name: 'RAM Upgrade on EliteBook',
    description: 'Upgrade to 64GB DDR4 on HP EliteBook 840 G8',
    laptopId: 'hp-elitebook-840-g8',
    currentComponentId: 'ram-ddr4-16gb',
    targetComponentId: 'ram-ddr4-32gb',
    expectedResult: 'COMPATIBLE',
    reason: 'Thermal budget safe, power safe, protocol match.',
    recommendation: 'All layers pass — proceed with upgrade.',
  },
];
