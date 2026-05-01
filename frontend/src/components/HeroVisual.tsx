import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

const ParticleEye = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Points>(null);

  const { positions, count } = useMemo(() => {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute on a slightly squashed sphere to evoke an iris/eye
      const t = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const r = 1.6 + (Math.random() - 0.5) * 0.15;
      const sq = Math.sqrt(1 - u * u);
      positions[i * 3] = r * sq * Math.cos(t);
      positions[i * 3 + 1] = r * sq * Math.sin(t) * 0.85;
      positions[i * 3 + 2] = r * u * 0.6;
    }
    return { positions, count };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.12;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={color}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Iris = ({ color, accent }: { color: string; accent: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={ref}>
        <torusGeometry args={[1.05, 0.018, 16, 120]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.35, 0.01, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <Sphere args={[0.42, 32, 32]}>
        <meshBasicMaterial color={accent} transparent opacity={0.18} />
      </Sphere>
      <Sphere args={[0.18, 32, 32]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </Float>
  );
};

export const HeroVisual = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const primary = isDark ? "#60a5fa" : "#2563eb";
  const accent = isDark ? "#2dd4bf" : "#14b8a6";

  return (
    <div className="relative h-full w-full">
      {/* Glow background */}
      <div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 50%, hsl(217 91% 50% / 0.25), transparent 60%)"
            : "radial-gradient(circle at 50% 50%, hsl(221 90% 80% / 0.5), transparent 60%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <ParticleEye color={primary} />
          <Iris color={primary} accent={accent} />
        </Suspense>
      </Canvas>
    </div>
  );
};
