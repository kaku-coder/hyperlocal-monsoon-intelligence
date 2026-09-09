import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 px-4 py-3 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">MoES / NCMRWF</span>
          <span>•</span>
          <span>Smart India Hackathon Working Prototype</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Agro-Climatic Zone 11 (Odisha Coastal & Inland Plains)</span>
          <span>•</span>
          <span className="text-sky-400">FastAPI ML Service v1.2</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
