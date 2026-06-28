"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Bars() {
  const groupRef = useRef<THREE.Group>(null);
  const barCount = 64;

  const bars = useMemo(() => {
    return Array.from({ length: barCount }).map((_, i) => ({
      position: [(i - barCount / 2) * 0.15, 0, 0] as [number, number, number],
      height: 0.5 + Math.random() * 2,
      phase: (i / barCount) * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const bar = bars[i];
        const height = 0.5 + Math.abs(Math.sin(clock.elapsedTime * 2 + bar.phase)) * 2;
        mesh.scale.y = height;
        mesh.position.y = height / 2;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(i / barCount * 0.3 + 0.7, 0.8, 0.6)}
            emissive={new THREE.Color().setHSL(i / barCount * 0.3 + 0.7, 0.8, 0.3)}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export function AudioVisualizer() {
  return (
    <div className="h-[300px] w-full rounded-2xl border border-surface-border bg-surface-card">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <Bars />
      </Canvas>
    </div>
  );
}
