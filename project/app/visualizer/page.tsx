'use client';

import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard } from '@/components/layout/shared';
import { Button } from '@/components/ui/button';
import { Box, Eye, Zap, Thermometer, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'exploded' | 'assembled' | 'thermal' | 'power' | 'compatibility';

interface PartInfo {
  id: string;
  name: string;
  interface: string;
  formFactor: string;
  thermal: string;
  status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  emissive?: string;
}

const parts: PartInfo[] = [
  { id: 'chassis', name: 'Chassis', interface: 'Mechanical', formFactor: 'Custom', thermal: 'N/A', status: 'COMPATIBLE', position: [0, 0, 0], size: [3.2, 0.12, 2.2], color: '#1a1a1f' },
  { id: 'motherboard', name: 'Motherboard', interface: '5B21C12345', formFactor: 'Proprietary', thermal: 'N/A', status: 'COMPATIBLE', position: [0, 0.18, 0], size: [2.6, 0.04, 1.8], color: '#0d3b1f' },
  { id: 'cpu', name: 'Intel Core i7-1260P', interface: 'BGA1744', formFactor: 'Socketed', thermal: '28W TDP', status: 'COMPATIBLE', position: [0.1, 0.24, -0.1], size: [0.35, 0.04, 0.35], color: '#2a2a35', emissive: '#d4a843' },
  { id: 'ram', name: 'DDR4 SODIMM 16GB', interface: 'DDR4 SODIMM', formFactor: '260pin', thermal: '3.5W', status: 'COMPATIBLE', position: [-0.7, 0.26, -0.3], size: [0.08, 0.12, 0.9], color: '#0a0a0f', emissive: '#d4a843' },
  { id: 'ssd', name: 'M.2 2280 NVMe SSD', interface: 'PCIe Gen4 x4', formFactor: 'M.2 2280', thermal: '6.5W', status: 'WARNING', position: [0.6, 0.24, 0.3], size: [0.8, 0.03, 0.22], color: '#0a0a0f', emissive: '#e3b341' },
  { id: 'wifi', name: 'Intel AX201 Wi-Fi', interface: 'CNVio2', formFactor: 'M.2 1216', thermal: '1.8W', status: 'COMPATIBLE', position: [0.9, 0.22, -0.6], size: [0.16, 0.02, 0.12], color: '#0a0a0f' },
  { id: 'battery', name: 'Li-Polymer 50Wh', interface: 'DC / SMBus', formFactor: 'Internal', thermal: 'N/A', status: 'COMPATIBLE', position: [-0.4, 0.14, 0.5], size: [1.6, 0.1, 0.7], color: '#1a1a2e' },
  { id: 'fan', name: 'Cooling Fan', interface: 'Mechanical', formFactor: 'Custom', thermal: '35W capacity', status: 'COMPATIBLE', position: [1.0, 0.22, 0.6], size: [0.3, 0.04, 0.3], color: '#1a1a1f' },
  { id: 'display', name: '14" IPS Display', interface: 'eDP 1.4', formFactor: '40pin', thermal: '3.5W', status: 'COMPATIBLE', position: [0, 1.2, -1.0], size: [3.0, 1.8, 0.04], color: '#0a0a0f' },
];

function Part({ info, mode, selected, onSelect }: { info: PartInfo; mode: ViewMode; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const fanRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (info.id === 'fan' && fanRef.current) {
      fanRef.current.rotation.z += delta * 2;
    }
  });

  const explode = mode === 'exploded';
  const pos: [number, number, number] = explode
    ? [info.position[0], info.position[1] * (1.5 + (info.position[1] > 0.2 ? 1.5 : 0)), info.position[2]]
    : info.position;

  let color = info.color;
  if (mode === 'thermal') {
    color = info.thermal.includes('W') && parseFloat(info.thermal) > 5 ? '#f85149' : info.thermal.includes('W') ? '#e3b341' : info.color;
  }
  if (mode === 'power') {
    color = info.interface.includes('DC') || info.interface.includes('SMBus') ? '#d4a843' : info.color;
  }
  if (mode === 'compatibility') {
    color = info.status === 'COMPATIBLE' ? '#3fb950' : info.status === 'WARNING' ? '#e3b341' : '#f85149';
  }

  const emissiveIntensity = selected || hovered ? 0.4 : info.emissive ? 0.2 : 0;

  return (
    <group position={pos}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={info.size} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          emissive={selected || hovered ? '#d4a843' : info.emissive ?? '#000000'}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {info.id === 'fan' && (
        <mesh ref={fanRef} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 5]} />
          <meshStandardMaterial color="#2a2a35" metalness={0.7} roughness={0.3} transparent opacity={0.8} />
        </mesh>
      )}
      {(selected || hovered) && (
        <Html distanceFactor={6} position={[0, info.size[1] / 2 + 0.15, 0]} center>
          <div className="px-2 py-1 glass-strong rounded text-[10px] mono uppercase tracking-wider whitespace-nowrap pointer-events-none">
            {info.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function LaptopModel({ mode, selectedId, onSelect }: { mode: ViewMode; selectedId: string | null; onSelect: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  return (
    <group ref={groupRef}>
      {parts.map((p) => (
        <Part key={p.id} info={p} mode={mode} selected={selectedId === p.id} onSelect={() => onSelect(p.id)} />
      ))}
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={8} blur={2.5} far={4} color="#000000" />
    </group>
  );
}

const viewModes: { value: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'exploded', label: 'Exploded', icon: Box },
  { value: 'assembled', label: 'Assembled', icon: Box },
  { value: 'thermal', label: 'Thermal', icon: Thermometer },
  { value: 'power', label: 'Power', icon: Zap },
  { value: 'compatibility', label: 'Compatibility', icon: CheckCircle2 },
];

export default function VisualizerPage() {
  const [mode, setMode] = useState<ViewMode>('exploded');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPart = parts.find((p) => p.id === selectedId);

  return (
    <AppShell>
      <PageHeader
        badge="3D Visualization"
        title="3D Visualizer"
        subtitle="Interactive exploded-view laptop model. Rotate, zoom, click components to inspect."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-2">
          <TechCard className="corner-marks overflow-hidden">
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
              <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.3} />
                <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={1.2} castShadow />
                <pointLight position={[-5, 3, -5]} intensity={0.5} color="#d4a843" />
                <Suspense fallback={null}>
                  <LaptopModel mode={mode} selectedId={selectedId} onSelect={setSelectedId} />
                  <Environment preset="city" />
                </Suspense>
                <OrbitControls
                  enablePan
                  enableZoom
                  enableRotate
                  minDistance={3}
                  maxDistance={10}
                  maxPolarAngle={Math.PI / 1.8}
                />
              </Canvas>
              <div className="absolute top-3 left-3 px-2 py-1 glass rounded text-[10px] mono uppercase tracking-wider text-muted-foreground">
                Drag to rotate · Scroll to zoom · Click parts
              </div>
            </div>
          </TechCard>
        </div>

        {/* Controls + Info */}
        <div className="space-y-4">
          <TechCard className="corner-marks p-4">
            <h3 className="text-xs mono uppercase tracking-wider text-muted-foreground mb-3">View Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              {viewModes.map((vm) => {
                const Icon = vm.icon;
                return (
                  <button
                    key={vm.value}
                    onClick={() => setMode(vm.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded border text-xs transition-colors',
                      mode === vm.value
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {vm.label}
                  </button>
                );
              })}
            </div>
          </TechCard>

          <TechCard className="corner-marks p-4">
            <h3 className="text-xs mono uppercase tracking-wider text-muted-foreground mb-3">Component Info</h3>
            {selectedPart ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Component</div>
                  <div className="text-sm font-semibold mt-0.5">{selectedPart.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Interface</div>
                    <div className="mt-0.5">{selectedPart.interface}</div>
                  </div>
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Form Factor</div>
                    <div className="mt-0.5">{selectedPart.formFactor}</div>
                  </div>
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Thermal</div>
                    <div className="mt-0.5">{selectedPart.thermal}</div>
                  </div>
                  <div>
                    <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Status</div>
                    <div className={cn('mt-0.5 font-semibold', selectedPart.status === 'COMPATIBLE' ? 'text-success' : selectedPart.status === 'WARNING' ? 'text-warning' : 'text-destructive')}>
                      {selectedPart.status}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Eye className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Click a component in the 3D view to inspect it.</p>
              </div>
            )}
          </TechCard>

          <TechCard className="corner-marks p-4">
            <h3 className="text-xs mono uppercase tracking-wider text-muted-foreground mb-3">Components</h3>
            <div className="space-y-1.5">
              {parts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left',
                    selectedId === p.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/40 text-muted-foreground'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', p.status === 'COMPATIBLE' ? 'bg-success' : p.status === 'WARNING' ? 'bg-warning' : 'bg-destructive')} />
                  {p.name}
                </button>
              ))}
            </div>
          </TechCard>
        </div>
      </div>
    </AppShell>
  );
}
