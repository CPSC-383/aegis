import Link from 'next/link';
import { guides } from '@/lib/source';
import { NebulaBackground, NebulaPresets } from '@/components/nebula';
import { Compass, Stars } from 'lucide-react';

export default function GuidesPage() {
  const posts = guides.getPages();

  return (
    <main className="relative flex flex-col h-full items-center px-4 py-12 text-white">
      <NebulaBackground {...NebulaPresets.guides} />

      <div className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4 text-cyan-300">
          <Stars className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider">
            Strategic Deployment Protocols
          </span>
          <Stars className="w-4 h-4 animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2 leading-[1.2]">
          Navigation Charts
        </h1>

        <p className="text-sm sm:text-base max-w-2xl mx-auto text-slate-300 leading-relaxed">
          Field-tested guides to optimize deployment strategies, streamline integrations, and ensure mission success across galactic zones.
        </p>
      </div>

      <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="group flex flex-col gap-2 p-5 rounded-lg border border-cyan-500/20 
            bg-slate-900/60 backdrop-blur-sm
            hover:bg-slate-800/80 hover:border-cyan-400/40
            transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className="flex items-center gap-2 text-cyan-300">
              <Compass className="w-4 h-4" />
              <h2 className="text-lg font-semibold group-hover:text-cyan-300 transition-colors">
                {post.data.title}
              </h2>
            </div>
            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              {post.data.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="relative z-10 mt-16 text-slate-400 text-xs text-center max-w-md">
        <p className="text-slate-500 italic">
          "Charted paths save lives, every guide a light through the void."
        </p>
        <p className="text-slate-600 mt-1">
          Logged from Orbital Relay Node: Cerulean Grid 7.429.1
        </p>
      </div>
    </main>
  );
}
