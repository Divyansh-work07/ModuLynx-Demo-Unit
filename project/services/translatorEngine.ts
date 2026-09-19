import type {
  ComponentSpec,
  Translation,
  PinMapping,
  AdapterSuggestion,
  WorkaroundOption,
  CompatibilityResult,
} from '@/types';

const pinSignals = [
  { signal: '12V', voltage: '12V' },
  { signal: 'GND', voltage: '0V' },
  { signal: 'DATA+', voltage: '3.3V' },
  { signal: 'DATA-', voltage: '3.3V' },
  { signal: 'CLK', voltage: '3.3V' },
  { signal: 'DATA0', voltage: '1.8V' },
  { signal: 'DATA1', voltage: '1.8V' },
  { signal: 'DATA2', voltage: '1.8V' },
  { signal: 'DATA3', voltage: '1.8V' },
  { signal: 'RESET', voltage: '3.3V' },
];

function generatePinout(current: ComponentSpec, target: ComponentSpec): PinMapping[] {
  const count = Math.max(8, Math.min(12, pinSignals.length));
  const mismatched = current.connector !== target.connector;
  return Array.from({ length: count }, (_, i) => {
    const sig = pinSignals[i];
    const sourcePin = `PIN ${i + 1}`;
    const targetIdx = mismatched ? (i + 3) % count : i;
    const targetPin = `PIN ${targetIdx + 1}`;
    if (i >= 6 && mismatched) {
      return {
        sourcePin,
        targetPin: null,
        signal: sig.signal,
        status: 'unused',
        voltage: sig.voltage,
      };
    }
    if (mismatched && i < 3) {
      return {
        sourcePin,
        targetPin,
        signal: sig.signal,
        status: 'requires_conversion',
        voltage: sig.voltage,
      };
    }
    return {
      sourcePin,
      targetPin,
      signal: sig.signal,
      status: 'matched',
      voltage: sig.voltage,
    };
  });
}

function generateAdapters(current: ComponentSpec, target: ComponentSpec): AdapterSuggestion[] {
  const adapters: AdapterSuggestion[] = [];

  if (current.formFactor !== target.formFactor && current.category === target.category) {
    adapters.push({
      id: 'adapter-formfactor',
      name: `${current.formFactor} → ${target.formFactor} Mounting Adapter`,
      compatibility: 'HIGH',
      modification: 'Physical mounting only',
      risk: 'LOW',
      difficulty: 'EASY',
      description: 'Extends the M.2 slot to accommodate a larger form factor module.',
    });
  }

  if (current.connector !== target.connector) {
    adapters.push({
      id: 'adapter-connector',
      name: `${current.connector} → ${target.connector} Adapter`,
      compatibility: 'MEDIUM',
      modification: 'Pinout rewiring required',
      risk: 'MEDIUM',
      difficulty: 'MODERATE',
      description: 'Bridges connector mismatch with signal-level conversion circuitry.',
    });
  }

  if (current.interface !== target.interface) {
    adapters.push({
      id: 'adapter-protocol',
      name: 'Protocol Bridge Board',
      compatibility: 'MEDIUM',
      modification: 'Active signal translation',
      risk: 'MEDIUM',
      difficulty: 'ADVANCED',
      description: 'Translates between interface generations using an active bridge IC.',
    });
  }

  if (current.category === 'WiFi' && current.interface !== target.interface) {
    adapters.push({
      id: 'adapter-wifi',
      name: 'Wi-Fi Module Adapter',
      compatibility: 'MEDIUM',
      modification: 'CNVi to standard PCIe breakout',
      risk: 'MEDIUM',
      difficulty: 'MODERATE',
      description: 'Allows newer Wi-Fi modules on older CNVi-only sockets.',
    });
  }

  if (adapters.length === 0) {
    adapters.push({
      id: 'adapter-none',
      name: 'No Adapter Required',
      compatibility: 'HIGH',
      modification: 'None',
      risk: 'LOW',
      difficulty: 'EASY',
      description: 'Components are directly compatible.',
    });
  }

  return adapters;
}

function generateWorkarounds(
  result: CompatibilityResult,
  current: ComponentSpec,
  target: ComponentSpec
): WorkaroundOption[] {
  const options: WorkaroundOption[] = [];

  if (result.layers.firmware.status === 'warning') {
    options.push({
      id: 'w-firmware',
      name: 'BIOS / Firmware Update',
      type: 'firmware',
      compatibility: 82,
      cost: 'LOW',
      difficulty: 'EASY',
      risk: 'LOW',
      description: 'Update BIOS to remove whitelist or add device support.',
      recommendationScore: 0,
    });
  }

  if (result.layers.physical.status === 'warning' || result.layers.connector.status !== 'pass') {
    options.push({
      id: 'w-adapter',
      name: 'Hardware Adapter',
      type: 'adapter',
      compatibility: 78,
      cost: 'MEDIUM',
      difficulty: 'EASY',
      risk: 'LOW',
      description: 'Use a physical adapter to bridge form factor or connector differences.',
      recommendationScore: 0,
    });
  }

  if (result.layers.protocol.status === 'warning') {
    options.push({
      id: 'w-bridge',
      name: 'Protocol Bridge',
      type: 'protocol_bridge',
      compatibility: 68,
      cost: 'HIGH',
      difficulty: 'ADVANCED',
      risk: 'MEDIUM',
      description: 'Active signal translation between protocol generations.',
      recommendationScore: 0,
    });
  }

  options.push({
    id: 'w-alternative',
    name: `Alternative ${target.category} Component`,
    type: 'alternative',
    compatibility: 90,
    cost: 'MEDIUM',
    difficulty: 'EASY',
    risk: 'LOW',
    description: `Select a ${target.category} that matches ${current.formFactor} and ${current.connector}.`,
    recommendationScore: 0,
  });

  const costWeight = { LOW: 1, MEDIUM: 0.6, HIGH: 0.3 };
  const diffWeight = { EASY: 1, MODERATE: 0.7, ADVANCED: 0.4 };
  const riskWeight = { LOW: 1, MEDIUM: 0.6, HIGH: 0.3 };

  options.forEach((o) => {
    o.recommendationScore = Math.round(
      o.compatibility * 0.5 +
        costWeight[o.cost] * 20 +
        diffWeight[o.difficulty] * 15 +
        riskWeight[o.risk] * 15
    );
  });

  return options.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

export function translateCompatibility(
  result: CompatibilityResult,
  current: ComponentSpec,
  target: ComponentSpec
): Translation {
  const directCompatibility = result.status === 'FULLY_COMPATIBLE' || result.status === 'COMPATIBLE_WITH_CONDITIONS';

  const path = directCompatibility
    ? [
        { step: current.model, type: 'Component A' },
        { step: 'Direct Connection', type: 'Compatible' },
        { step: target.model, type: 'Component B' },
      ]
    : [
        { step: current.model, type: 'Component A' },
        { step: 'Pinout Mapper', type: 'Translation' },
        { step: 'Adapter', type: 'Bridge' },
        { step: 'Protocol Bridge', type: 'Bridge' },
        { step: target.model, type: 'Component B' },
      ];

  const pinoutMappings = generatePinout(current, target);
  const adapters = generateAdapters(current, target);
  const workarounds = generateWorkarounds(result, current, target);

  const risk =
    result.score >= 70 ? 'LOW' : result.score >= 40 ? 'MEDIUM' : 'HIGH';
  const difficulty =
    result.score >= 70 ? 'EASY' : result.score >= 40 ? 'MODERATE' : 'ADVANCED';

  return {
    directCompatibility,
    path,
    pinoutMappings,
    adapters,
    workarounds,
    risk,
    difficulty,
    warning: directCompatibility
      ? undefined
      : 'Pinout conversion may require a custom adapter. Verify electrical characteristics before physical installation.',
  };
}
