'use client';

import { useState, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard, StatusDot } from '@/components/layout/shared';
import { Button } from '@/components/ui/button';
import { Upload, ScanLine, ImageIcon, AlertCircle, Check, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { mockBoardScanner, validateImageFile } from '@/services/boardScanner';
import type { ScanResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const pipelineLabels: Record<string, string> = {
  IMAGE_INPUT: 'Image Input',
  OBJECT_DETECTION: 'Object Detection',
  OCR: 'OCR / Text Extraction',
  MODEL_IDENTIFICATION: 'Model Identification',
  SPECIFICATION_MATCH: 'Specification Match',
  COMPATIBILITY_GRAPH: 'Compatibility Graph',
};

export default function ScannerPage() {
  const { demoMode } = useApp();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (selectedFile: File | undefined) => {
      if (!selectedFile) return;
      const error = validateImageFile(selectedFile);
      if (error) {
        toast({ title: 'Upload Error', description: error, variant: 'destructive' });
        return;
      }
      setFile(selectedFile);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    },
    [toast]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleScan() {
    if (!file) {
      toast({ title: 'No image', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }
    setScanning(true);
    setResult(null);
    try {
      const res = await mockBoardScanner.analyze(file);
      setResult(res);
    } catch {
      toast({ title: 'Scan failed', description: 'Unable to identify component with sufficient confidence.', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setScanning(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <AppShell>
      <PageHeader
        badge="AI Pipeline Demo"
        title="AI Board Identification"
        subtitle="Upload a motherboard or component image and let D-SPIC identify the hardware. Production deployment can connect YOLO + OpenCV inference."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload / Preview */}
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'relative panel corner-marks p-12 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[300px]',
                dragActive && 'border-primary bg-primary/5'
              )}
            >
              <div className="absolute inset-0 grid-bg-sm opacity-20 pointer-events-none" />
              <Upload className="h-10 w-10 text-primary/60 mb-4" />
              <h3 className="text-sm font-semibold mb-1">Drag & drop image here</h3>
              <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
              <div className="flex gap-2 text-[10px] mono uppercase tracking-wider text-muted-foreground">
                <span className="px-2 py-1 border border-border rounded">PNG</span>
                <span className="px-2 py-1 border border-border rounded">JPG</span>
                <span className="px-2 py-1 border border-border rounded">JPEG</span>
                <span className="px-2 py-1 border border-border rounded">WEBP</span>
              </div>
            </div>
          ) : (
            <TechCard className="corner-marks overflow-hidden">
              <div className="relative">
                <img src={preview} alt="Board preview" className="w-full h-[300px] object-cover" />
                {scanning && (
                  <>
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="absolute inset-x-0 h-1 scanline" />
                  </>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 glass rounded text-[10px] mono uppercase tracking-wider">
                  <ImageIcon className="h-3 w-3 text-primary" />
                  {file?.name}
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <Button onClick={handleScan} disabled={scanning} className="gap-2 flex-1">
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                  {scanning ? 'Scanning...' : 'Scan Component'}
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </TechCard>
          )}

          {demoMode && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" />
              <span>Demo mode: detection is simulated. Real YOLO/OpenCV can be plugged into <code className="mono text-primary/80">boardScanner.ts</code>.</span>
            </div>
          )}
        </div>

        {/* Results / Pipeline */}
        <div className="space-y-4">
          {!result && !scanning && (
            <TechCard className="corner-marks p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
              <ScanLine className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-sm text-muted-foreground">Upload an image and run a scan to see identification results.</p>
            </TechCard>
          )}

          {scanning && (
            <TechCard className="corner-marks p-6">
              <div className="flex items-center gap-2 mb-6">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="text-xs mono uppercase tracking-[0.2em] text-primary">AI Pipeline Running</span>
              </div>
              <div className="space-y-3">
                {Object.entries(pipelineLabels).map(([key, label], i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.3, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                      <Loader2 className="h-3 w-3 text-primary animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{label}</div>
                      <div className="h-0.5 bg-border mt-1 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: i * 0.3, duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TechCard>
          )}

          <AnimatePresence>
            {result && !scanning && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <TechCard className="corner-marks p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-xs mono uppercase tracking-[0.2em] text-success">Identified Component</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{result.componentName}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground mono uppercase tracking-wider">Confidence</span>
                        <span className="text-primary font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                  {result.boardId && (
                    <div className="text-xs text-muted-foreground mono">Board ID: <span className="text-foreground">{result.boardId}</span></div>
                  )}
                </TechCard>

                <TechCard className="corner-marks p-5">
                  <h4 className="text-xs mono uppercase tracking-wider text-muted-foreground mb-3">Detected Specifications</h4>
                  <div className="space-y-2.5">
                    {result.detected.map((d) => (
                      <div key={d.label} className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="text-sm font-medium text-right">{d.value}</span>
                          <div className="w-16">
                            <div className="h-1 bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-success rounded-full" style={{ width: `${d.confidence * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TechCard>

                <TechCard className="corner-marks p-5">
                  <h4 className="text-xs mono uppercase tracking-wider text-muted-foreground mb-3">Pipeline Trace</h4>
                  <div className="space-y-1.5">
                    {result.pipeline.map((p) => (
                      <div key={p.step} className="flex items-center gap-2 text-xs">
                        <StatusDot status="pass" />
                        <span className="mono text-muted-foreground">{pipelineLabels[p.step] ?? p.step}</span>
                        <span className="ml-auto text-muted-foreground/60">{p.duration}ms</span>
                      </div>
                    ))}
                  </div>
                </TechCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
