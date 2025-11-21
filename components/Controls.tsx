import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { STROKES } from '../constants';
import { StrokeState } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  speed: number;
  angle: number;
  currentStroke: StrokeState;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (angle: number) => void;
  onReset: () => void;
  onSelectStroke: (strokeId: StrokeState) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, 
  speed, 
  angle, 
  currentStroke,
  onTogglePlay, 
  onSpeedChange, 
  onSeek,
  onReset,
  onSelectStroke
}) => {
  // Normalize angle to 0-720 range for the slider
  const currentCycleAngle = (angle % (4 * Math.PI));
  const degrees = Math.round(currentCycleAngle * (180 / Math.PI));

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deg = parseFloat(e.target.value);
    const rad = deg * (Math.PI / 180);
    onSeek(rad);
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-xl border border-slate-700 shadow-xl w-full flex flex-col gap-6">
      
      {/* Mode/Stroke Selection */}
      <div>
        <h3 className="text-xs text-slate-400 uppercase font-bold mb-2 tracking-wider">工作模式 (Select Stroke)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {STROKES.map((stroke) => (
            <button
              key={stroke.id}
              onClick={() => onSelectStroke(stroke.id)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                currentStroke === stroke.id 
                  ? 'bg-slate-700 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {stroke.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>0°</span>
          <span>720°</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="720" 
          value={degrees} 
          onChange={handleSeek}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-center mt-2 font-mono text-blue-400 text-sm">
          CRANK ANGLE: {degrees}°
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={onReset}
            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            title="Reset Cycle"
          >
            <RotateCcw size={20} />
          </button>
          
          <button 
            onClick={onTogglePlay}
            className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          <div className="flex bg-slate-700 rounded-lg p-1">
            <button 
              onClick={() => onSpeedChange(0.5)}
              className={`px-3 py-1 rounded text-xs font-bold ${speed === 0.5 ? 'bg-slate-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              0.5x
            </button>
            <button 
              onClick={() => onSpeedChange(1)}
              className={`px-3 py-1 rounded text-xs font-bold ${speed === 1 ? 'bg-slate-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              1x
            </button>
            <button 
              onClick={() => onSpeedChange(2)}
              className={`px-3 py-1 rounded text-xs font-bold ${speed === 2 ? 'bg-slate-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              2x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
