import React from 'react';
import { AudioLiftSettings } from '../../types';

interface QuickToolsProps {
  settings: AudioLiftSettings;
  updateSettings: (settings: Partial<AudioLiftSettings>) => void;
}

const QuickTools: React.FC<QuickToolsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="p-3 border-b border-border-light">
      <div className="flex gap-2">
        <button
          onClick={() => updateSettings({ smartVolume: !settings.smartVolume })}
          className={`tool-btn flex-1 flex items-center justify-center gap-1.5 p-2 border border-black/10 rounded bg-bg-secondary text-text-primary text-[11px] font-medium cursor-pointer transition-all hover:bg-bg-primary hover:border-accent hover:text-accent ${settings.smartVolume ? 'bg-accent-bg border-accent text-accent-dark' : ''}`}
          title="Standardize volume levels"
        >
          <span>📢</span> Smart Volume
        </button>
        <button
          onClick={() => updateSettings({ mono: !settings.mono })}
          className={`tool-btn flex-1 flex items-center justify-center gap-1.5 p-2 border border-black/10 rounded bg-bg-secondary text-text-primary text-[11px] font-medium cursor-pointer transition-all hover:bg-bg-primary hover:border-accent hover:text-accent ${settings.mono ? 'bg-accent-bg border-accent text-accent-dark' : ''}`}
          title="Merge to Mono"
        >
          <span>🔊</span> Mono
        </button>
        <button
          onClick={() => updateSettings({ loudnessMode: !settings.loudnessMode, smartVolume: settings.loudnessMode ? settings.smartVolume : false })}
          className={`tool-btn flex-1 flex items-center justify-center gap-1.5 p-2 border border-black/10 rounded bg-bg-secondary text-text-primary text-[11px] font-medium cursor-pointer transition-all hover:bg-bg-primary hover:border-accent hover:text-accent ${settings.loudnessMode ? 'bg-accent-bg border-accent text-accent-dark' : ''}`}
          title="Enhance bass & treble"
        >
          <span>🎚️</span> Loudness
        </button>
      </div>
    </div>
  );
};

export default QuickTools;
