import React, { useState, useEffect, useRef, useCallback } from 'react';
import EngineScene from './components/EngineScene';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import { EngineState, StrokeState } from './types';
import { STROKES, FULL_CYCLE_RAD, BASE_RPM, PART_INFO } from './constants';

function App() {
  const [state, setState] = useState<EngineState>({
    angle: 0,
    isPlaying: true,
    speed: 1
  });

  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  // Refs for animation loop to access latest state without dependencies
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Animation Loop function
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== 0 && state.isPlaying) {
      // Use constant increment per frame for simplicity, or delta time if needed
      // Here we stick to the simple increment to match the requested behavior
      setState(prevState => {
        if (!prevState.isPlaying) return prevState;
        const increment = BASE_RPM * prevState.speed;
        return { ...prevState, angle: prevState.angle + increment };
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [state.isPlaying]); // Re-create animate if play state changes to ensure we check it

  // Effect to manage the animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]); 

  // Determine Current Stroke
  const normalizedAngle = state.angle % FULL_CYCLE_RAD; // 0 to 4PI
  const degree = normalizedAngle * (180 / Math.PI);
  
  let currentStroke = StrokeState.Intake;
  if (degree >= 0 && degree < 180) currentStroke = StrokeState.Intake;
  else if (degree >= 180 && degree < 360) currentStroke = StrokeState.Compression;
  else if (degree >= 360 && degree < 540) currentStroke = StrokeState.Power;
  else if (degree >= 540 && degree < 720) currentStroke = StrokeState.Exhaust;

  const handleSeek = (rad: number) => {
    setState(prev => ({ ...prev, angle: rad, isPlaying: false }));
  };

  const handleStrokeSelect = (strokeId: StrokeState) => {
    const stroke = STROKES.find(s => s.id === strokeId);
    if (stroke) {
      // Jump to slightly after the start of the stroke to make it clear
      const targetRad = stroke.startAngle * (Math.PI / 180);
      setState(prev => ({ ...prev, angle: targetRad, isPlaying: false }));
    }
  };

  const activePartInfo = hoveredPart ? PART_INFO[hoveredPart] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <header className="mb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent inline-block">
            四冲程发动机原理
          </h1>
          <p className="text-slate-400 mt-2">Interactive 4-Stroke Internal Combustion Engine Visualizer</p>
        </div>
        
        {/* Floating Part Info Panel (Desktop top right) */}
        <div className={`hidden md:block transition-all duration-300 ${activePartInfo ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
           {activePartInfo && (
             <div className="bg-slate-800/90 backdrop-blur border border-yellow-500/50 p-4 rounded-lg shadow-2xl max-w-xs">
                <h3 className="text-yellow-400 font-bold text-lg mb-1">{activePartInfo.title}</h3>
                <p className="text-slate-200 text-sm">{activePartInfo.description}</p>
             </div>
           )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-[850px] lg:h-[650px]">
        {/* Left Column: 3D Scene */}
        <div className="lg:col-span-2 h-[400px] lg:h-full relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-700 group bg-slate-900">
          <EngineScene 
            angle={state.angle} 
            currentStroke={currentStroke} 
            onHoverPart={setHoveredPart}
          />
          
          {/* Stroke Indicator Overlay */}
          <div className="absolute top-4 right-4 px-4 py-2 bg-slate-900/80 backdrop-blur text-white rounded-full text-sm font-bold border border-slate-600 shadow-lg z-10 pointer-events-none select-none">
            {STROKES.find(s => s.id === currentStroke)?.title}
          </div>

          {/* Mobile Part Info Overlay (Bottom Center of 3D view) */}
          {activePartInfo && (
             <div className="absolute bottom-4 left-4 right-4 md:hidden bg-slate-800/95 backdrop-blur border border-yellow-500/50 p-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom-2">
                <h3 className="text-yellow-400 font-bold text-sm mb-1">{activePartInfo.title}</h3>
                <p className="text-slate-200 text-xs">{activePartInfo.description}</p>
             </div>
           )}
           
           {!activePartInfo && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               Hover over parts to identify them
             </div>
           )}
        </div>

        {/* Right Column: Info & Controls */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex-grow">
             <InfoPanel currentStroke={currentStroke} />
          </div>
          
          <div>
            <Controls 
              isPlaying={state.isPlaying}
              speed={state.speed}
              angle={state.angle}
              currentStroke={currentStroke}
              onTogglePlay={() => setState(s => ({...s, isPlaying: !s.isPlaying}))}
              onSpeedChange={(speed) => setState(s => ({...s, speed}))}
              onSeek={handleSeek}
              onReset={() => setState(s => ({...s, angle: 0, isPlaying: false}))}
              onSelectStroke={handleStrokeSelect}
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-600 text-sm">
        <p>© 2024 Interactive Education. Built with React Three Fiber.</p>
      </footer>
    </div>
  );
}

export default App;