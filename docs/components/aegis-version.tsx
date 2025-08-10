import React from 'react';
import { Sparkle } from 'lucide-react';

export default function AegisVersionDisplay({ version }: { version: string }) {
  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-cyan-500/40 rounded-lg px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkle className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 text-cyan-400/30 animate-ping"></div>
            </div>
            <span className="text-xs font-mono text-cyan-400 tracking-wider">
              CORE VERSION
            </span>
          </div>

          <div className="h-4 w-px bg-cyan-500/30"></div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              v{version}
            </span>
            <div className="text-xs font-mono text-green-400 bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30">
              STABLE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
