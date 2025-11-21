import React from 'react';
import { STROKES } from '../constants';
import { StrokeState } from '../types';
import { Info, Wind, ArrowDown, Zap, Cloud } from 'lucide-react';

interface InfoPanelProps {
  currentStroke: StrokeState;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ currentStroke }) => {
  const strokeInfo = STROKES.find(s => s.id === currentStroke) || STROKES[0];

  // Icon selection based on stroke
  const getIcon = (id: StrokeState) => {
    switch (id) {
      case StrokeState.Intake: return <Wind className="text-blue-400" size={32} />;
      case StrokeState.Compression: return <ArrowDown className="text-yellow-400" size={32} />;
      case StrokeState.Power: return <Zap className="text-red-500" size={32} />;
      case StrokeState.Exhaust: return <Cloud className="text-slate-400" size={32} />;
    }
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-600">
          {getIcon(strokeInfo.id)}
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Phase</div>
          <h2 className="text-2xl font-bold text-white leading-tight">{strokeInfo.title}</h2>
        </div>
      </div>

      <div className="flex-grow">
        <p className="text-slate-300 text-lg leading-relaxed">
          {strokeInfo.description}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Valves:</span>
          <span className="font-mono text-slate-200">
            {strokeInfo.id === StrokeState.Intake ? "Intake OPEN" : 
             strokeInfo.id === StrokeState.Exhaust ? "Exhaust OPEN" : "BOTH CLOSED"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Piston Direction:</span>
          <span className="font-mono text-slate-200">
            {strokeInfo.id === StrokeState.Intake || strokeInfo.id === StrokeState.Power ? "DOWN ↓" : "UP ↑"}
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-500 flex gap-2 items-start">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>Observe the color change in the cylinder indicating air/fuel mixing, compression heat, explosion, and exhaust fumes.</p>
      </div>
    </div>
  );
};

export default InfoPanel;