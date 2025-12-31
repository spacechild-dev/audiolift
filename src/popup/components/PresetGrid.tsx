import React from 'react';
import { presets } from '../presets';
import { AudioLiftSettings } from '../../types';

interface PresetGridProps {
  activePreset: string | null;
  onSelect: (name: string, settings: Partial<AudioLiftSettings>) => void;
}

const PresetGrid: React.FC<PresetGridProps> = ({ activePreset, onSelect }) => {
  return (
    <div className="p-3 border-b border-border-light">
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Presets</div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(65px,1fr))] gap-1">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onSelect(key, preset)}
            className={`preset-btn px-1 py-1.5 border border-black/10 rounded bg-bg-secondary text-[9px] font-medium text-text-secondary cursor-pointer transition-all whitespace-nowrap overflow-hidden text-ellipsis hover:bg-bg-primary hover:border-accent hover:text-accent hover:shadow-sm ${activePreset === key ? 'bg-accent-bg border-accent text-accent-dark font-semibold shadow-none' : ''}`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetGrid;
