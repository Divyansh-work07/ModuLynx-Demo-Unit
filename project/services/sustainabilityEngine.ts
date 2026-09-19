import type { Laptop, SustainabilityResult } from '@/types';

export interface SustainabilityInput {
  deviceAge: number;
  replacementCost: number;
  upgradeCost: number;
  expectedExtension: number;
  componentType: string;
  laptop: Laptop;
}

export function calculateSustainability(input: SustainabilityInput): SustainabilityResult {
  const baseLifespan = Math.max(1, 5 - input.deviceAge);
  const currentLifespan = Math.max(0.5, baseLifespan);
  const extendedLifespan = currentLifespan + input.expectedExtension;

  const co2PerYear = 75;
  const co2Saved = Math.round(co2PerYear * input.expectedExtension);

  const moneySaved = Math.max(0, input.replacementCost - input.upgradeCost);

  const repairabilityScore = input.laptop.repairability;

  let recommendation: string;
  if (moneySaved > 0 && input.expectedExtension >= 2) {
    recommendation = 'Upgrade instead of replace. Strong economic and environmental benefit.';
  } else if (moneySaved > 0) {
    recommendation = 'Upgrade recommended. Cost-effective extension of device life.';
  } else if (input.expectedExtension >= 2) {
    recommendation = 'Upgrade recommended for sustainability, despite higher cost.';
  } else {
    recommendation = 'Consider replacement if upgrade cost exceeds device value.';
  }

  return {
    currentLifespan,
    extendedLifespan,
    extensionYears: input.expectedExtension,
    co2Saved,
    moneySaved,
    repairabilityScore,
    recommendation,
  };
}

export function repairabilityBreakdown(laptop: Laptop) {
  return [
    { factor: 'Component Accessibility', score: Math.min(10, laptop.repairability + 0.5) },
    { factor: 'Standard Connectors', score: laptop.biosWhitelist ? 7 : 9 },
    { factor: 'Upgradeable RAM', score: laptop.ram.type.includes('LPDDR') ? 3 : 9 },
    { factor: 'Upgradeable Storage', score: 9 },
    { factor: 'Battery Replaceability', score: Math.min(10, laptop.repairability) },
    { factor: 'Display Replaceability', score: Math.min(10, laptop.repairability - 0.5) },
    { factor: 'BIOS Restrictions', score: laptop.biosWhitelist ? 4 : 9 },
    { factor: 'Parts Availability', score: laptop.brand === 'Framework' ? 10 : 7 },
  ];
}
