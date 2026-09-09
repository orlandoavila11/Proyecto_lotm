import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PathwayCeremonyProps {
  pathwayName: string;
  sequenceName?: string;
  onConfirm?: () => void;
}

// Malla 3D de la Carta del Tarot Místico
function MysticTarotCard({ pathwayName: _pathwayName }: { pathwayName: string }) {
  const cardRef = useRef<THREE.Group>(null);
  const runesRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (cardRef.current) {
      // Rotación suave pendular mística
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.25;
      cardRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.08;
      cardRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.12;
    }
    if (runesRef.current) {
      runesRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group ref={cardRef}>
      {/* Marco Exterior de Oro Viejo de la Carta */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 3.4, 0.06]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Núcleo Interior de la Carta (Terciopelo Carmesí / Negro Sefirah) */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[1.95, 3.15, 0.02]} />
        <meshStandardMaterial
          color="#120b17"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Runa Astral Giratoria en el Centro de la Carta */}
      <mesh ref={runesRef} position={[0, 0.2, 0.05]}>
        <ringGeometry args={[0.5, 0.65, 32]} />
        <meshBasicMaterial
          color="#d8bbf9"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Estrella Central de Ocho Puntas */}
      <mesh position={[0, 0.2, 0.055]}>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial
          color="#e0a93b"
          emissive="#d4af37"
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Anillo de Protección de Bronce */}
      <mesh position={[0, 0.2, 0.045]}>
        <torusGeometry args={[0.82, 0.03, 16, 48]} />
        <meshStandardMaterial
          color="#c59b27"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// Nube de Polvo Cósmico y Estrellas del Destino
function CosmicDustParticles({ count = 350 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const goldColor = new THREE.Color('#d4af37');
    const purpleColor = new THREE.Color('#9333ea');
    const cyanColor = new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? goldColor : i % 3 === 1 ? purpleColor : cyanColor;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

export const PathwayCeremony: React.FC<PathwayCeremonyProps> = ({
  pathwayName,
  sequenceName = 'Secuencia 9',
  onConfirm: _onConfirm
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #4a3825', background: 'radial-gradient(circle at 50% 50%, #1e1424 0%, #0c0810 100%)' }}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 4, 3]} intensity={1.5} color="#ffd700" />
        <pointLight position={[-3, -3, 2]} intensity={0.8} color="#9333ea" />
        <spotLight position={[0, 5, 2]} angle={0.4} penumbra={0.8} intensity={2.0} color="#fff" />
        
        <MysticTarotCard pathwayName={pathwayName} />
        <CosmicDustParticles count={300} />
      </Canvas>

      {/* Overlay de Heráldica Diegética */}
      <div style={{ position: 'absolute', bottom: '12px', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ display: 'inline-block', background: 'rgba(10, 8, 14, 0.85)', padding: '6px 18px', borderRadius: '20px', border: '1px solid #d4af37', backdropFilter: 'blur(4px)' }}>
          <span className="cinzel" style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>
            Arcano Divino: {pathwayName} ({sequenceName})
          </span>
        </div>
      </div>
    </div>
  );
};
