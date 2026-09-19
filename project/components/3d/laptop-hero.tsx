'use client';

import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Chassis() {
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 0.12, 2.2]} />
      <meshStandardMaterial color="#1a1a1f" metalness={0.7} roughness={0.35} />
    </mesh>
  );
}

function Motherboard() {
  return (
    <mesh position={[0, 0.18, 0]}>
      <boxGeometry args={[2.6, 0.04, 1.8]} />
      <meshStandardMaterial color="#0d3b1f" metalness={0.4} roughness={0.6} />
    </mesh>
  );
}

function RAM() {
  return (
    <group position={[-0.7, 0.26, -0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.12, 0.9]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.02, 0.88]} />
        <meshStandardMaterial color="#d4a843" metalness={0.9} roughness={0.2} emissive="#d4a843" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function SSD() {
  return (
    <group position={[0.6, 0.24, 0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.03, 0.22]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.78, 0.01, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} emissive="#1a1a2e" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function WiFi() {
  return (
    <group position={[0.9, 0.22, -0.6]}>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.02, 0.12]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Battery() {
  return (
    <mesh position={[-0.4, 0.14, 0.5]} castShadow>
      <boxGeometry args={[1.6, 0.1, 0.7]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

function CPU() {
  return (
    <group position={[0.1, 0.24, -0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.04, 0.35]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.3, 0.01, 0.3]} />
        <meshStandardMaterial color="#d4a843" metalness={0.9} roughness={0.2} emissive="#d4a843" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Fan() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 1.5;
  });
  return (
    <group position={[1.0, 0.22, 0.6]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
        <meshStandardMaterial color="#1a1a1f" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 5]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.7} roughness={0.3} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Display() {
  return (
    <mesh position={[0, 1.2, -1.0]} rotation={[0.1, 0, 0]}>
      <boxGeometry args={[3.0, 1.8, 0.04]} />
      <meshStandardMaterial color="#0a0a0f" metalness={0.3} roughness={0.2} emissive="#0d3b1f" emissiveIntensity={0.1} />
    </mesh>
  );
}

function HeatPipe() {
  return (
    <mesh position={[0.5, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.02, 0.02, 1.4, 16]} />
      <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.2} />
    </mesh>
  );
}

function LaptopScene({ exploded }: { exploded: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  const explode = (base: number, factor: number) => exploded ? base * factor : base;

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <group position={[0, 0, 0]}>
          <Chassis />
          <group position={[0, explode(0.18, 1.8), 0]}><Motherboard /></group>
          <group position={[-0.7, explode(0.26, 2.5), -0.3]}><RAM /></group>
          <group position={[0.6, explode(0.24, 2.2), 0.3]}><SSD /></group>
          <group position={[0.9, explode(0.22, 2.0), -0.6]}><WiFi /></group>
          <group position={[-0.4, explode(0.14, 0.5), 0.5]}><Battery /></group>
          <group position={[0.1, explode(0.24, 3.0), -0.1]}><CPU /></group>
          <group position={[1.0, explode(0.22, 2.2), 0.6]}><Fan /></group>
          <group position={[0.5, explode(0.28, 1.5), 0]}><HeatPipe /></group>
          <group position={[0, explode(1.2, 1.3), -1.0]}><Display /></group>
        </group>
      </Float>
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={8} blur={2.5} far={4} color="#000000" />
    </group>
  );
}

export function LaptopHero() {
  const [exploded, setExploded] = useState(true);
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px]">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={1.2} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#d4a843" />
        <Suspense fallback={null}>
          <LaptopScene exploded={exploded} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setExploded(true)}
          className={`px-3 py-1.5 text-[10px] mono uppercase tracking-wider rounded border transition-colors ${
            exploded ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Exploded
        </button>
        <button
          onClick={() => setExploded(false)}
          className={`px-3 py-1.5 text-[10px] mono uppercase tracking-wider rounded border transition-colors ${
            !exploded ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Assembled
        </button>
      </div>
    </div>
  );
}
