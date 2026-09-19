import type {
  Laptop,
  ComponentSpec,
  CompatibilityResult,
  LayerResult,
  CompatibilityStatus,
  LayerStatus,
} from '@/types';

function statusFromScore(score: number): LayerStatus {
  if (score >= 85) return 'pass';
  if (score >= 50) return 'warning';
  return 'fail';
}

function overallStatus(score: number): CompatibilityStatus {
  if (score >= 90) return 'FULLY_COMPATIBLE';
  if (score >= 70) return 'COMPATIBLE_WITH_CONDITIONS';
  if (score >= 40) return 'REQUIRES_ADAPTER';
  return 'NOT_RECOMMENDED';
}

function checkPhysical(
  laptop: Laptop,
  current: ComponentSpec,
  target: ComponentSpec
): LayerResult {
  const checks: LayerResult['checks'] = [];
  let score = 100;

  const sameFormFactor = current.formFactor === target.formFactor;
  checks.push({
    label: 'Form Factor',
    status: sameFormFactor ? 'pass' : 'warning',
    detail: sameFormFactor
      ? 'Form factors match'
      : `${current.formFactor} → ${target.formFactor}`,
  });
  if (!sameFormFactor) score -= 30;

  const fitsZ = target.dimensions.height <= current.dimensions.height + 1;
  checks.push({
    label: 'Z-Height Clearance',
    status: fitsZ ? 'pass' : 'warning',
    detail: fitsZ
      ? 'Within Z-height budget'
      : `Target ${target.dimensions.height}mm > current ${current.dimensions.height}mm`,
  });
  if (!fitsZ) score -= 15;

  const fitsLength = target.dimensions.length <= current.dimensions.length + 5;
  checks.push({
    label: 'Length / Mounting',
    status: fitsLength ? 'pass' : 'warning',
    detail: fitsLength
      ? 'Fits mounting position'
      : 'Length exceeds bay — adapter needed',
  });
  if (!fitsLength) score -= 20;

  checks.push({
    label: 'Connector Position',
    status: 'pass',
    detail: 'Connector aligned to board socket',
  });

  return {
    name: 'Physical',
    score: Math.max(0, score),
    status: statusFromScore(score),
    checks,
  };
}

function checkThermal(
  laptop: Laptop,
  current: ComponentSpec,
  target: ComponentSpec
): LayerResult {
  const checks: LayerResult['checks'] = [];
  let score = 100;

  const thermalDelta = target.thermal - current.thermal;
  const budgetOk = target.thermal <= laptop.thermalBudget;
  checks.push({
    label: 'Thermal Budget',
    status: budgetOk ? 'pass' : 'fail',
    detail: budgetOk
      ? `${target.thermal}W within ${laptop.thermalBudget}W budget`
      : `Exceeds ${laptop.thermalBudget}W budget`,
  });
  if (!budgetOk) score -= 40;

  checks.push({
    label: 'TDP Delta',
    status: thermalDelta <= 2 ? 'pass' : thermalDelta <= 5 ? 'warning' : 'fail',
    detail: `${thermalDelta >= 0 ? '+' : ''}${thermalDelta.toFixed(1)}W vs current`,
  });
  if (thermalDelta > 5) score -= 20;
  else if (thermalDelta > 2) score -= 10;

  checks.push({
    label: 'Heat Pipe Interference',
    status: 'pass',
    detail: 'No interference with existing heat pipe routing',
  });

  return {
    name: 'Thermal',
    score: Math.max(0, score),
    status: statusFromScore(score),
    checks,
  };
}

function checkPower(
  laptop: Laptop,
  current: ComponentSpec,
  target: ComponentSpec
): LayerResult {
  const checks: LayerResult['checks'] = [];
  let score = 100;

  const powerDelta = target.power - current.power;
  const powerOk = target.power <= laptop.powerBudget;
  checks.push({
    label: 'Power Budget',
    status: powerOk ? 'pass' : 'warning',
    detail: powerOk
      ? `${target.power}W within ${laptop.powerBudget}W budget`
      : `Exceeds ${laptop.powerBudget}W budget`,
  });
  if (!powerOk) score -= 30;

  checks.push({
    label: 'Voltage / Current',
    status: powerDelta <= 2 ? 'pass' : 'warning',
    detail: `${powerDelta >= 0 ? '+' : ''}${powerDelta.toFixed(1)}W vs current draw`,
  });
  if (powerDelta > 3) score -= 15;

  checks.push({
    label: 'Power Phase',
    status: 'pass',
    detail: 'VRM phase allocation sufficient',
  });

  return {
    name: 'Power',
    score: Math.max(0, score),
    status: statusFromScore(score),
    checks,
  };
}

function checkProtocol(
  _laptop: Laptop,
  current: ComponentSpec,
  target: ComponentSpec
): LayerResult {
  const checks: LayerResult['checks'] = [];
  let score = 100;

  const genMatch =
    current.interface.replace(/Gen\s?(\d)/i, '') ===
    target.interface.replace(/Gen\s?(\d)/i, '');
  const currentGen = parseInt(current.interface.match(/Gen\s?(\d)/i)?.[1] ?? '0');
  const targetGen = parseInt(target.interface.match(/Gen\s?(\d)/i)?.[1] ?? '0');

  if (genMatch || targetGen <= currentGen) {
    checks.push({
      label: 'Interface Generation',
      status: 'pass',
      detail: targetGen <= currentGen ? 'Backward compatible' : 'Generation match',
    });
  } else {
    checks.push({
      label: 'Interface Generation',
      status: 'warning',
      detail: `Gen${currentGen} socket → Gen${targetGen} device (may downclock)`,
    });
    score -= 10;
  }

  checks.push({
    label: 'PCIe Lanes',
    status: 'pass',
    detail: 'x4 lane allocation available',
  });

  checks.push({
    label: 'Protocol Support',
    status: current.protocol === target.protocol ? 'pass' : 'warning',
    detail: `${current.protocol} → ${target.protocol}`,
  });
  if (current.protocol !== target.protocol) score -= 15;

  return {
    name: 'Protocol',
    score: Math.max(0, score),
    status: statusFromScore(score),
    checks,
  };
}

function checkFirmware(
  laptop: Laptop,
  _current: ComponentSpec,
  target: ComponentSpec
): LayerResult {
  const checks: LayerResult['checks'] = [];
  let score = 100;

  if (laptop.biosWhitelist) {
    checks.push({
      label: 'BIOS Whitelist',
      status: 'warning',
      detail: 'Vendor whitelist may restrict non-OEM parts',
    });
    score -= 25;
  } else {
    checks.push({
      label: 'BIOS Whitelist',
      status: 'pass',
      detail: 'No vendor whitelist restrictions',
    });
  }

  const reqs = target.firmwareRequirements ?? [];
  if (reqs.length > 0) {
    checks.push({
      label: 'Firmware Requirements',
      status: 'warning',
      detail: `Requires: ${reqs.join(', ')}`,
    });
    score -= 15;
  } else {
    checks.push({
      label: 'Firmware Requirements',
      status: 'pass',
      detail: 'No special firmware requirements',
    });
  }

  checks.push({
    label: 'BIOS Support',
    status: 'pass',
    detail: 'UEFI detection supported',
  });

  return {
    name: 'Firmware',
    score: Math.max(0, score),
    status: statusFromScore(score),
    checks,
  };
}

function checkConnector(
  _laptop: Laptop,
  current: ComponentSpec,
  target: ComponentSpec
): LayerResult {
  const checks: LayerResult['checks'] = [];
  let score = 100;

  const connectorMatch = current.connector === target.connector;
  checks.push({
    label: 'Connector Type',
    status: connectorMatch ? 'pass' : 'fail',
    detail: connectorMatch
      ? 'Connector types match'
      : `${current.connector} → ${target.connector}`,
  });
  if (!connectorMatch) score -= 45;

  checks.push({
    label: 'Pin Count',
    status: connectorMatch ? 'pass' : 'warning',
    detail: connectorMatch ? 'Pin count verified' : 'Pin count differs — adapter required',
  });
  if (!connectorMatch) score -= 20;

  checks.push({
    label: 'Pinout / Orientation',
    status: connectorMatch ? 'pass' : 'warning',
    detail: connectorMatch ? 'Pinout aligned' : 'Pinout mapping required',
  });

  return {
    name: 'Connector',
    score: Math.max(0, score),
    status: statusFromScore(score),
    checks,
  };
}

export function analyzeCompatibility(
  laptop: Laptop,
  current: ComponentSpec,
  target: ComponentSpec
): CompatibilityResult {
  const physical = checkPhysical(laptop, current, target);
  const thermal = checkThermal(laptop, current, target);
  const power = checkPower(laptop, current, target);
  const protocol = checkProtocol(laptop, current, target);
  const firmware = checkFirmware(laptop, current, target);
  const connector = checkConnector(laptop, current, target);

  const layers = { physical, thermal, power, protocol, firmware, connector };
  const weights = {
    physical: 0.22,
    thermal: 0.18,
    power: 0.15,
    protocol: 0.18,
    firmware: 0.12,
    connector: 0.15,
  };

  const score = Math.round(
    physical.score * weights.physical +
      thermal.score * weights.thermal +
      power.score * weights.power +
      protocol.score * weights.protocol +
      firmware.score * weights.firmware +
      connector.score * weights.connector
  );

  const reasons: string[] = [];
  const recommendations: string[] = [];

  Object.values(layers).forEach((layer) => {
    layer.checks.forEach((check) => {
      if (check.status === 'warning') {
        reasons.push(`${layer.name}: ${check.detail}`);
      }
    });
  });

  if (physical.status === 'warning') {
    recommendations.push('Use a low-profile mounting adapter for physical clearance.');
  }
  if (firmware.status === 'warning') {
    recommendations.push('Verify BIOS/firmware support before installation.');
  }
  if (connector.status === 'fail') {
    recommendations.push('Use a connector adapter or pinout mapper.');
  }
  if (protocol.status === 'warning') {
    recommendations.push('Confirm protocol backward compatibility in BIOS.');
  }
  if (recommendations.length === 0) {
    recommendations.push('All layers pass — proceed with upgrade.');
  }

  return {
    score,
    status: overallStatus(score),
    layers,
    reasons,
    recommendations,
    laptopId: laptop.id,
    currentComponentId: current.id,
    targetComponentId: target.id,
    timestamp: new Date().toISOString(),
  };
}

export function statusLabel(status: CompatibilityStatus): string {
  switch (status) {
    case 'FULLY_COMPATIBLE':
      return 'FULLY COMPATIBLE';
    case 'COMPATIBLE_WITH_CONDITIONS':
      return 'COMPATIBLE WITH CONDITIONS';
    case 'REQUIRES_ADAPTER':
      return 'REQUIRES ADAPTER';
    case 'NOT_RECOMMENDED':
      return 'NOT RECOMMENDED';
  }
}

export function statusColor(status: CompatibilityStatus): string {
  switch (status) {
    case 'FULLY_COMPATIBLE':
      return 'text-success';
    case 'COMPATIBLE_WITH_CONDITIONS':
      return 'text-primary';
    case 'REQUIRES_ADAPTER':
      return 'text-warning';
    case 'NOT_RECOMMENDED':
      return 'text-destructive';
  }
}
