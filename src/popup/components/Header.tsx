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
    <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary bg-bg-primary flex-shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="AudioLift" 
            className="logo-fixed block object-contain filter dark:brightness-0 dark:invert" 
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={cycleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary text-text-secondary transition-colors"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🌓'}
        </button>
        <label className="toggle-switch relative inline-block cursor-pointer w-9 h-5">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <span className={`block w-full h-full rounded-full transition-colors ${enabled ? 'bg-accent' : 'bg-border-secondary'}`}></span>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
        </label>
      </div>
    </div>
  );
};

export default Header;
