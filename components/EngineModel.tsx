import React, { useState } from 'react';
import { Cylinder, Box, Sphere, Cone, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { StrokeState } from '../types';

interface EngineModelProps {
  angle: number; // Current angle in radians (0 to 4PI)
  currentStroke: StrokeState;
  onHoverPart?: (partId: string | null) => void;
}

const EngineModel: React.FC<EngineModelProps> = ({ angle, currentStroke, onHoverPart }) => {
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

  const handleHover = (e: any, partId: string) => {
    e.stopPropagation();
    setHoveredMesh(partId);
    if (onHoverPart) onHoverPart(partId);
    document.body.style.cursor = 'pointer';
  };

  const handleUnhover = (e: any) => {
    setHoveredMesh(null);
    if (onHoverPart) onHoverPart(null);
    document.body.style.cursor = 'auto';
  };

  const highlightMaterialProps = (partId: string, baseColor: string, metalness = 0.6, roughness = 0.3) => {
    const isHovered = hoveredMesh === partId;
    return {
      color: isHovered ? "#fde047" : baseColor, // Bright Yellow highlight
      emissive: isHovered ? "#fde047" : "#000000",
      emissiveIntensity: isHovered ? 0.4 : 0,
      metalness,
      roughness
    };
  };

  // --- Constants for Geometry ---
  const crankRadius = 1.5;
  const rodLength = 5.5;
  const pistonHeight = 1.5;
  const pistonRadius = 1.8;
  const cylinderHeight = 8.5;
  const cylinderRadius = 2.0;
  const valveOffset = 0.8;
  const valveTravel = 0.4;

  // --- Helpers ---
  const safeAngle = typeof angle === 'number' && !isNaN(angle) ? angle : 0;
  const cycleAngle = safeAngle % (4 * Math.PI); 
  const crankRotation = cycleAngle;

  // Calculate Piston Position
  const r = crankRadius;
  const l = rodLength;
  const sinA = Math.sin(crankRotation);
  const cosA = Math.cos(crankRotation);
  
  const term2 = Math.sqrt(l * l - r * r * sinA * sinA);
  const pistonY = r * cosA + term2;

  // Valve Logic
  let intakeValveY = 0;
  let exhaustValveY = 0;
  
  // Intake happens 0 to PI
  if (cycleAngle < Math.PI) {
    // Smooth sine wave opening
    intakeValveY = -Math.sin(cycleAngle) * valveTravel;
  }
  // Exhaust happens 3PI to 4PI
  if (cycleAngle > 3 * Math.PI && cycleAngle < 4 * Math.PI) {
    exhaustValveY = -Math.sin(cycleAngle - 3 * Math.PI) * valveTravel;
  }

  // Spark Logic (near 2PI)
  const isSparking = Math.abs(cycleAngle - 2 * Math.PI) < 0.15;

  // Chamber Gas Visuals
  const headY = 7.5;
  const pistonTopY = pistonY + pistonHeight / 2;
  // Gas height fills space between piston top and head
  const gasHeight = Math.max(0.1, headY - pistonTopY);
  // Gas center position
  const gasY = pistonTopY + gasHeight / 2;

  // Gas Visual Properties
  let gasColor = new THREE.Color("#ffffff");
  let gasOpacity = 0;
  let gasEmissive = new THREE.Color("#000000");
  let gasEmissiveIntensity = 0;

  switch (currentStroke) {
    case StrokeState.Intake:
      // Cool fresh air (Cyan/Blue)
      gasColor.set("#0ea5e9"); // Vivid Sky Blue
      gasOpacity = 0.3;
      break;
    case StrokeState.Compression:
      // Heating up (Blue -> Orange)
      gasColor.set("#38bdf8").lerp(new THREE.Color("#f59e0b"), (cycleAngle - Math.PI) / Math.PI);
      gasOpacity = 0.4 + (0.4 * ((cycleAngle - Math.PI) / Math.PI)); // Get denser
      gasEmissive.set("#f59e0b");
      gasEmissiveIntensity = 0.5 * ((cycleAngle - Math.PI) / Math.PI);
      break;
    case StrokeState.Power:
      // Explosion (White/Yellow -> Orange -> Red)
      const powerProgress = (cycleAngle - 2 * Math.PI) / Math.PI;
      
      if (powerProgress < 0.15) {
        // Initial Flash (White-Yellow)
        gasColor.set("#ffff00");
        gasEmissive.set("#ffffaa");
        gasEmissiveIntensity = 4.0; // Intense Flash
        gasOpacity = 0.9;
      } else {
        // Cooling down to red
        const coolDown = (powerProgress - 0.15) / 0.85;
        gasColor.set("#f59e0b").lerp(new THREE.Color("#ef4444"), coolDown);
        gasEmissive.set("#ff4400").lerp(new THREE.Color("#330000"), coolDown);
        gasEmissiveIntensity = 2.0 * (1 - coolDown);
        gasOpacity = 0.8 * (1 - coolDown);
      }
      break;
    case StrokeState.Exhaust:
      // Dirty Smoke (Grey/Dark)
      gasColor.set("#64748b");
      gasOpacity = 0.5;
      break;
  }

  if (isSparking) {
    gasColor.set("#fff700");
    gasEmissive.set("#fff700");
    gasEmissiveIntensity = 5;
    gasOpacity = 1.0;
  }

  // Rod Angle (simple trig)
  const rodAngle = Math.asin((r * sinA) / l); 

  return (
    <group position={[0, -3, 0]}>
      {/* --- Engine Block / Cylinder --- */}
      <group position={[0, 5.5, 0]}>
        {/* Main Cylinder Glass - Open Ended so we see through clearly */}
        <Cylinder 
          args={[cylinderRadius, cylinderRadius, cylinderHeight, 32, 1, true]} 
          position={[0, 0, 0]}
          onPointerOver={(e) => handleHover(e, 'cylinder')}
          onPointerOut={handleUnhover}
        >
          <meshPhysicalMaterial 
            color="#e0f2fe" // Slight blue tint glass
            transparent 
            opacity={0.2} 
            metalness={0.1} 
            roughness={0.1} 
            side={THREE.DoubleSide}
            transmission={0.9}
            thickness={0.1}
            clearcoat={1}
          />
        </Cylinder>
        
        {/* Cylinder Edges for definition */}
        <Cylinder args={[cylinderRadius + 0.02, cylinderRadius + 0.02, cylinderHeight, 32, 1, true]} position={[0,0,0]}>
           <meshBasicMaterial wireframe color="#94a3b8" transparent opacity={0.2} />
        </Cylinder>

        {/* Combustion Chamber / Gas Volume */}
        <group position={[0, gasY - 5.5, 0]}>
          <Cylinder args={[pistonRadius - 0.02, pistonRadius - 0.02, gasHeight, 32]}>
            <meshStandardMaterial 
              color={gasColor} 
              emissive={gasEmissive}
              emissiveIntensity={gasEmissiveIntensity}
              transparent 
              opacity={gasOpacity} 
              depthWrite={false}
            />
          </Cylinder>
          
          {/* Explosion Effects */}
          {currentStroke === StrokeState.Power && (
            <>
              {/* Dynamic Explosion Light inside the cylinder */}
              <pointLight 
                intensity={8 * gasEmissiveIntensity} 
                color="#ffaa00" 
                distance={6} 
                decay={2} 
              />
              
              {/* Explosion Particles */}
              <Sparkles 
                count={30}
                scale={[pistonRadius * 1.2, gasHeight * 0.8, pistonRadius * 1.2]}
                size={15}
                speed={3}
                opacity={gasOpacity}
                color={gasColor}
                noise={1}
              />
            </>
          )}
        </group>
      </group>

      {/* --- Cylinder Head --- */}
      <group 
        position={[0, 9.75, 0]}
        onPointerOver={(e) => handleHover(e, 'head')}
        onPointerOut={handleUnhover}
      >
        <Box args={[5, 0.5, 5]}>
           <meshStandardMaterial {...highlightMaterialProps('head', "#cbd5e1", 0.5, 0.2)} />
        </Box>
        
        {/* Spark Plug */}
        <group 
          position={[0, 0, 0]}
          onPointerOver={(e) => handleHover(e, 'sparkPlug')}
          onPointerOut={handleUnhover}
        >
          <Cylinder args={[0.15, 0.15, 1.5, 16]} position={[0, 0.5, 0]}>
            <meshStandardMaterial {...highlightMaterialProps('sparkPlug', "#f1f5f9", 0.9, 0.1)} />
          </Cylinder>
          <Sphere args={[0.15]} position={[0, -0.2, 0]}>
            <meshStandardMaterial 
              color={isSparking ? "#ffff00" : "#333"} 
              emissive={isSparking ? "#ffff00" : "#000"}
              emissiveIntensity={isSparking ? 5 : 0}
            />
          </Sphere>
          {isSparking && (
             <pointLight position={[0, -0.5, 0]} intensity={10} color="#ffff00" distance={8} decay={2} />
          )}
        </group>

        {/* Intake Valve */}
        <group 
          position={[-valveOffset, 0, 0]}
          onPointerOver={(e) => handleHover(e, 'intakeValve')}
          onPointerOut={handleUnhover}
        >
          <Cylinder args={[0.08, 0.08, 2, 16]} position={[0, 1 + intakeValveY, 0]}>
            <meshStandardMaterial {...highlightMaterialProps('intakeValve', "#e2e8f0", 0.8)} />
          </Cylinder>
          <Cone args={[0.6, 0.15, 32]} position={[0, intakeValveY - 0.2, 0]} rotation={[Math.PI, 0, 0]}>
             <meshStandardMaterial 
               {...highlightMaterialProps(
                 'intakeValve', 
                 cycleAngle < Math.PI ? "#3b82f6" : "#94a3b8"
               )} 
             />
          </Cone>
        </group>

        {/* Exhaust Valve */}
        <group 
          position={[valveOffset, 0, 0]}
          onPointerOver={(e) => handleHover(e, 'exhaustValve')}
          onPointerOut={handleUnhover}
        >
           <Cylinder args={[0.08, 0.08, 2, 16]} position={[0, 1 + exhaustValveY, 0]}>
            <meshStandardMaterial {...highlightMaterialProps('exhaustValve', "#e2e8f0", 0.8)} />
          </Cylinder>
          <Cone args={[0.6, 0.15, 32]} position={[0, exhaustValveY - 0.2, 0]} rotation={[Math.PI, 0, 0]}>
             <meshStandardMaterial 
               {...highlightMaterialProps(
                 'exhaustValve', 
                 (cycleAngle > 3 * Math.PI && cycleAngle < 4 * Math.PI) ? "#ef4444" : "#94a3b8"
               )} 
             />
          </Cone>
        </group>
      </group>

      {/* --- Moving Parts --- */}
      
      {/* Piston - Shiny Chrome */}
      <group 
        position={[0, pistonY, 0]}
        onPointerOver={(e) => handleHover(e, 'piston')}
        onPointerOut={handleUnhover}
      >
        <Cylinder args={[pistonRadius, pistonRadius, pistonHeight, 32]}>
          <meshStandardMaterial 
             {...highlightMaterialProps('piston', "#ffffff", 1.0, 0.1)} 
          />
        </Cylinder>
        {/* Piston Rings */}
        <Cylinder args={[pistonRadius + 0.01, pistonRadius + 0.01, 0.1, 32]} position={[0, 0.4, 0]}>
           <meshStandardMaterial color="#334155" metalness={0.5} />
        </Cylinder>
        <Cylinder args={[pistonRadius + 0.01, pistonRadius + 0.01, 0.1, 32]} position={[0, 0.1, 0]}>
           <meshStandardMaterial color="#334155" metalness={0.5} />
        </Cylinder>
        
        {/* Piston Pin Area */}
        <Cylinder args={[0.4, 0.4, 3, 16]} rotation={[0, 0, Math.PI / 2]} position={[0, -0.2, 0]}>
           <meshStandardMaterial {...highlightMaterialProps('piston', "#cbd5e1")} />
        </Cylinder>
      </group>

      {/* Connecting Rod - Brushed Metal */}
      <group 
        position={[0, pistonY, 0]}
        onPointerOver={(e) => handleHover(e, 'rod')}
        onPointerOut={handleUnhover}
      >
        <group rotation={[0, 0, rodAngle]}>
          <Box args={[0.5, l, 0.4]} position={[0, -l / 2, 0]}>
             <meshStandardMaterial {...highlightMaterialProps('rod', "#94a3b8", 0.8, 0.3)} />
          </Box>
           {/* Rod bearings visual */}
          <Cylinder args={[0.5, 0.5, 0.45, 16]} rotation={[Math.PI/2, 0, 0]} position={[0, -l, 0]}>
              <meshStandardMaterial {...highlightMaterialProps('rod', "#64748b")} />
          </Cylinder>
        </group>
      </group>

      {/* Crankshaft - Industrial Steel */}
      <group 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
        onPointerOver={(e) => handleHover(e, 'crank')}
        onPointerOut={handleUnhover}
      >
        {/* Main Shaft */}
        <Cylinder args={[0.4, 0.4, 3, 16]} rotation={[Math.PI / 2, 0, 0]}>
           <meshStandardMaterial {...highlightMaterialProps('crank', "#475569", 0.9, 0.3)} />
        </Cylinder>
        
        <group rotation={[0, 0, -crankRotation]}> 
           {/* Counterweights */}
           <Box args={[1.2, r * 1.2, 0.4]} position={[0, -r/2, 0.6]}>
              <meshStandardMaterial {...highlightMaterialProps('crank', "#334155", 0.8, 0.4)} />
           </Box>
           <Box args={[1.2, r * 1.2, 0.4]} position={[0, -r/2, -0.6]}>
              <meshStandardMaterial {...highlightMaterialProps('crank', "#334155", 0.8, 0.4)} />
           </Box>

            {/* Crank Pin */}
           <Cylinder args={[0.38, 0.38, 1.6, 16]} position={[0, r, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial {...highlightMaterialProps('crank', "#cbd5e1", 0.9, 0.2)} />
           </Cylinder>
           
           {/* Arms connecting shaft to pin */}
           <Box args={[1.0, r + 1, 0.4]} position={[0, r/2, 0.6]}>
             <meshStandardMaterial {...highlightMaterialProps('crank', "#475569")} />
           </Box>
           <Box args={[1.0, r + 1, 0.4]} position={[0, r/2,
