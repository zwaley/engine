import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, ContactShadows } from '@react-three/drei';
import EngineModel from './EngineModel';
import { StrokeState } from '../types';
import * as THREE from 'three';

interface EngineSceneProps {
  angle: number;
  currentStroke: StrokeState;
  onHoverPart?: (partId: string | null) => void;
}

const EngineScene: React.FC<EngineSceneProps> = ({ angle, currentStroke, onHoverPart }) => {
  return (
    <div className="w-full h-full bg-slate-950 relative overflow-hidden rounded-xl shadow-2xl border border-slate-800">
      <Canvas shadows camera={{ position: [0, 4, 14], fov: 40 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <color attach="background" args={['#0b101a']} />
        {/* Push fog further back so it doesn't obscure the model */}
        <fog attach="fog" args={['#0b101a', 20, 45]} />
        
        {/* Basic Lights */}
        <ambientLight intensity={0.7} />
        {/* Main Key Light */}
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow shadow-bias={-0.0001} />
        {/* Fill Light (Cool) */}
        <pointLight position={[-10, 5, -10]} intensity={0.8} color="#3b82f6" />
        {/* Rim Light (Warm) to separate model from background */}
        <spotLight position={[0, 10, -5]} intensity={2} color="#f8fafc" angle={0.5} penumbra={1} />

        <group position={[0, -1.5, 0]}>
          <EngineModel angle={angle} currentStroke={currentStroke} onHoverPart={onHoverPart} />
        </group>

        {/* Deferred Environment Loading */}
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.4} far={10} color="#000000" />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        </Suspense>
        
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={8}
          maxDistance={25}
        />
      </Canvas>
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_60%,rgba(0,0,0,0.6)_100%)]"></div>
    </div>
  );
};

export default EngineScene;