import React, { useEffect, useState } from 'react';

interface HeaderProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ enabled, onToggle }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    chrome.storage.local.get('themePreference', (result) => {
      setTheme(result.themePreference || 'auto');
      applyTheme(result.themePreference || 'auto');
    });
  }, []);

  const applyTheme = (newTheme: string) => {
    document.body.classList.remove('light-mode', 'dark-mode');
    if (newTheme === 'light') document.body.classList.add('light-mode');
    if (newTheme === 'dark') document.body.classList.add('dark-mode');
  };

  const cycleTheme = () => {
    const next = theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto';
    setTheme(next);
    applyTheme(next);
    chrome.storage.local.set({ themePreference: next });
  };

  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-primary bg-bg-primary flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <img 
            src="/icons/icon48.png" 
            alt="AudioLift" 
            className="h-[26px] w-auto block filter dark:filter-none invert-[1] brightness-[0.2] sepia-[1] saturate-[5] hue-rotate-[200deg]" 
          />
        </div>
        <button 
          onClick={cycleTheme}
          className="px-2 py-1 border border-border-secondary rounded bg-bg-primary text-text-secondary text-sm hover:bg-bg-secondary hover:border-accent hover:text-accent transition-all"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🌓'}
        </button>
      </div>
      <label className="toggle-switch relative inline-block cursor-pointer">
        <input 
          type="checkbox" 
          checked={enabled} 
          onChange={(e) => onToggle(e.target.checked)}
          className="opacity-0 w-0 h-0 absolute"
        />
        <span className={`toggle-track block w-9 h-3.5 rounded-full transition-colors relative ${enabled ? 'bg-accent' : 'bg-border-secondary'}`}>
          <span className={`toggle-thumb absolute top-[-3px] left-0 w-5 h-5 bg-bg-primary rounded-full shadow-md border border-border-secondary transition-transform ${enabled ? 'translate-x-4 border-accent bg-accent' : ''}`}></span>
        </span>
      </label>
    </div>
  );
};

export default Header;
