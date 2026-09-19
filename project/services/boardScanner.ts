import type { ScanResult } from '@/types';
import { laptops } from '@/data/componentDatabase';

const pipelineSteps = [
  'IMAGE_INPUT',
  'OBJECT_DETECTION',
  'OCR',
  'MODEL_IDENTIFICATION',
  'SPECIFICATION_MATCH',
  'COMPATIBILITY_GRAPH',
];

export interface BoardScannerService {
  analyze(file: File): Promise<ScanResult>;
}

export const mockBoardScanner: BoardScannerService = {
  async analyze(file: File): Promise<ScanResult> {
    await new Promise((r) => setTimeout(r, 1800));

    const laptop = laptops[Math.floor(Math.random() * Math.min(3, laptops.length))];

    const detected = [
      { label: 'Board ID', value: laptop.motherboard, confidence: 0.948 },
      { label: 'RAM', value: laptop.ram.type, confidence: 0.912 },
      { label: 'Storage', value: `${laptop.storage.formFactor} NVMe`, confidence: 0.887 },
      { label: 'Wi-Fi', value: laptop.wifi.includes('AX') ? 'M.2 2230' : 'M.2', confidence: 0.834 },
      { label: 'Display', value: 'eDP', confidence: 0.901 },
      { label: 'CPU', value: laptop.cpu, confidence: 0.865 },
    ];

    const pipeline = pipelineSteps.map((step, i) => ({
      step,
      status: 'complete' as const,
      duration: Math.round((Math.random() * 200 + 80) * 10) / 10,
    }));

    return {
      identified: true,
      componentName: `${laptop.brand} ${laptop.model} Motherboard`,
      confidence: 0.948,
      boardId: laptop.motherboard,
      detected,
      pipeline,
    };
  },
};

export function validateImageFile(file: File): string | null {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return 'Image format unsupported. Use PNG, JPG, JPEG, or WEBP.';
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'Image exceeds 10MB size limit.';
  }
  return null;
}
