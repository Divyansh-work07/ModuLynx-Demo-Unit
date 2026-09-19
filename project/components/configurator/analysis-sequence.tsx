'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  'Loading laptop profile',
  'Reading component specification',
  'Checking physical clearance',
  'Checking thermal budget',
  'Checking power budget',
  'Checking protocol',
  'Checking firmware',
  'Traversing compatibility graph',
  'Generating recommendation',
];

export function AnalysisSequence({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setDone(true);
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="relative panel corner-marks p-6 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 grid-bg-sm opacity-20 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-xs mono uppercase tracking-[0.2em] text-primary">
            Initializing Constraint Engine
          </span>
        </div>
        <div className="space-y-2.5">
          {steps.map((step, i) => {
            const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: status === 'pending' ? 0.3 : 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] shrink-0',
                    status === 'done' && 'border-success bg-success/20 text-success',
                    status === 'active' && 'border-primary bg-primary/20 text-primary',
                    status === 'pending' && 'border-border text-muted-foreground'
                  )}
                >
                  {status === 'done' ? (
                    <Check className="h-3 w-3" />
                  ) : status === 'active' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="mono">{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm mono',
                    status === 'done' && 'text-foreground',
                    status === 'active' && 'text-primary',
                    status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-4 border-t border-border/40"
          >
            <div className="flex items-center gap-2 text-success">
              <Check className="h-4 w-4" />
              <span className="text-xs mono uppercase tracking-wider">Analysis Complete</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
