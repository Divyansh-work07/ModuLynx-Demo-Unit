export type ComponentCategory =
  | 'RAM'
  | 'SSD'
  | 'WiFi'
  | 'Display'
  | 'Battery'
  | 'Cooling'
  | 'CPU'
  | 'GPU'
  | 'Expansion'
  | 'Motherboard';

export type CompatibilityStatus =
  | 'FULLY_COMPATIBLE'
  | 'COMPATIBLE_WITH_CONDITIONS'
  | 'REQUIRES_ADAPTER'
  | 'NOT_RECOMMENDED';

export type LayerStatus = 'pass' | 'warning' | 'fail';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'mm';
}

export interface ComponentSpec {
  id: string;
  category: ComponentCategory;
  brand: string;
  model: string;
  interface: string;
  formFactor: string;
  dimensions: Dimensions;
  power: number;
  thermal: number;
  protocol: string;
  connector: string;
  firmwareRequirements?: string[];
}

export interface Laptop {
  id: string;
  brand: string;
  model: string;
  generation: string;
  motherboard: string;
  cpu: string;
  ram: { type: string; capacity: string; speed: string };
  storage: { type: string; capacity: string; formFactor: string };
  wifi: string;
  display: { size: string; panel: string; connector: string };
  battery: { type: string; wh: number };
  thermalBudget: number;
  powerBudget: number;
  repairability: number;
  biosWhitelist: boolean;
}

export interface LayerResult {
  name: string;
  score: number;
  status: LayerStatus;
  checks: { label: string; status: LayerStatus; detail: string }[];
}

export interface CompatibilityResult {
  score: number;
  status: CompatibilityStatus;
  layers: {
    physical: LayerResult;
    thermal: LayerResult;
    power: LayerResult;
    protocol: LayerResult;
    firmware: LayerResult;
    connector: LayerResult;
  };
  reasons: string[];
  recommendations: string[];
  laptopId: string;
  currentComponentId: string;
  targetComponentId: string;
  timestamp: string;
}

export interface PinMapping {
  sourcePin: string;
  targetPin: string | null;
  signal: string;
  status: 'matched' | 'mismatched' | 'unused' | 'requires_conversion';
  voltage?: string;
}

export interface AdapterSuggestion {
  id: string;
  name: string;
  compatibility: 'HIGH' | 'MEDIUM' | 'LOW';
  modification: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  difficulty: 'EASY' | 'MODERATE' | 'ADVANCED';
  description: string;
}

export interface WorkaroundOption {
  id: string;
  name: string;
  type: 'firmware' | 'adapter' | 'protocol_bridge' | 'alternative';
  compatibility: number;
  cost: 'LOW' | 'MEDIUM' | 'HIGH';
  difficulty: 'EASY' | 'MODERATE' | 'ADVANCED';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  recommendationScore: number;
}

export interface Translation {
  directCompatibility: boolean;
  path: { step: string; type: string }[];
  pinoutMappings: PinMapping[];
  adapters: AdapterSuggestion[];
  workarounds: WorkaroundOption[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  difficulty: 'EASY' | 'MODERATE' | 'ADVANCED';
  warning?: string;
}

export interface ScanResult {
  identified: boolean;
  componentName: string;
  confidence: number;
  boardId?: string;
  detected: {
    label: string;
    value: string;
    confidence: number;
  }[];
  pipeline: { step: string; status: 'complete'; duration: number }[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Laptop' | 'Motherboard' | 'Component' | 'Connector' | 'Protocol' | 'Adapter' | 'Firmware';
  properties: Record<string, string>;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type:
    | 'SUPPORTS'
    | 'CONNECTS_TO'
    | 'REQUIRES'
    | 'INCOMPATIBLE_WITH'
    | 'ADAPTS_TO'
    | 'USES'
    | 'POWERED_BY';
}

export interface HistoryEntry {
  id: string;
  laptop: string;
  upgrade: string;
  compatibility: number;
  status: CompatibilityStatus;
  date: string;
  recommendation: string;
}

export interface SustainabilityResult {
  currentLifespan: number;
  extendedLifespan: number;
  extensionYears: number;
  co2Saved: number;
  moneySaved: number;
  repairabilityScore: number;
  recommendation: string;
}
