import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="text-center p-2 pt-2 bg-bg-secondary text-[9px] text-text-secondary border-t border-border-primary flex flex-col gap-1.5 flex-shrink-0">
      <div className="pb-1.5 border-b border-border-light">
        Settings auto-saved per site
      </div>
      <div className="flex items-center justify-center gap-2 text-[10px]">
        <a href="https://daiquiri.dev" target="_blank" className="text-accent no-underline inline-flex items-center gap-1 font-medium hover:text-accent-dark hover:underline" title="Website">🌐 daiquiri.dev</a>
        <span className="text-border-secondary text-[8px]">•</span>
        <a href="https://github.daiquiri.dev" target="_blank" className="text-accent no-underline inline-flex items-center gap-1 font-medium hover:text-accent-dark hover:underline" title="GitHub">💖 GitHub</a>
        <span className="text-border-secondary text-[8px]">•</span>
        <a href="https://bmc.daiquiri.dev" target="_blank" className="text-accent no-underline inline-flex items-center gap-1 font-medium hover:text-accent-dark hover:underline" title="Buy me a coffee">☕ Coffee</a>
      </div>
    </div>
  );
};

export default Footer;
