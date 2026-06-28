"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group>
      {/* Globe */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#7c5cfc"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>
      {/* Inner glow */}
      <Sphere args={[1.95, 32, 32]}>
        <meshStandardMaterial
          color="#06d6a0"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
      {/* Data points - simulated music hotspots */}
      {Array.from({ length: 50 }).map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 50);
        const theta = Math.sqrt(50 * Math.PI) * phi;
        const x = 2.05 * Math.cos(theta) * Math.sin(phi);
        const y = 2.05 * Math.sin(theta) * Math.sin(phi);
        const z = 2.05 * Math.cos(phi);
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#ff006e" : i % 3 === 1 ? "#06d6a0" : "#ffbe0b"}
              emissive={i % 3 === 0 ? "#ff006e" : "#06d6a0"}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function MusicGlobe() {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Globe />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
