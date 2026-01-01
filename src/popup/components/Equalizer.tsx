import React from 'react';
import { AudioLiftSettings } from '../../types';
import Slider from './Slider';

interface EqualizerProps {
  settings: AudioLiftSettings;
  updateSettings: (settings: Partial<AudioLiftSettings>) => void;
  disabled?: boolean;
}

const bands = ['eq32', 'eq64', 'eq125', 'eq250', 'eq500', 'eq1k', 'eq2k', 'eq4k', 'eq8k', 'eq16k'] as const;
const labels = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

const Equalizer: React.FC<EqualizerProps> = ({ settings, updateSettings, disabled }) => {
  return (
    <div className="px-4 py-3 border-b border-border-light">
      <div className="section-title text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-2">10-Band Equalizer</div>
      
      {/* Preamp */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs text-text-primary">Preamp</label>
          <span className="text-[11px] text-text-secondary font-mono min-w-[50px] text-right">
            {settings.preamp >= 0 ? '+' : ''}{settings.preamp} dB
          </span>
        </div>
        <Slider 
          id="preamp" 
          min={-10} max={10} step={0.5} 
          value={settings.preamp} 
          onChange={(v) => updateSettings({ preamp: v })} 
          disabled={disabled}
        />
      </div>

      <div className="flex justify-around items-end p-2 pb-1 bg-bg-secondary rounded gap-1 overflow-x-auto">
        {bands.map((band, index) => (
          <div key={band} className="flex flex-col items-center gap-1 flex-none min-w-[28px]">
            <label className="text-[8px] font-medium text-text-secondary tracking-wide whitespace-nowrap">{labels[index]}</label>
            <Slider
              id={band}
              min={-12} max={12} step={0.5}
              value={settings[band]}
              onChange={(v) => updateSettings({ [band]: v })}
              orientation="vertical"
              disabled={disabled}
            />
            <span className="text-[9px] font-medium text-accent font-mono min-w-[28px] text-center">
              {settings[band]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
