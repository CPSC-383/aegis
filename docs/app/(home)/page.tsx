import Link from 'next/link';
import {
  BookText,
  Rocket,
  Compass,
  Bug,
  Stars,
  Satellite,
} from 'lucide-react';

const cards = [
  {
    title: 'Mission Control',
    description: 'Get started with system initialization.',
    href: '/docs/getting-started/installation/',
    icon: Rocket,
  },
  {
    title: 'Command Manual (API)',
    description: 'System reference and protocol definitions.',
    href: '/docs/api',
    icon: BookText,
  },
  {
    title: 'Navigation Charts (Guides)',
    description: 'Strategic playbooks and integrations.',
    href: '/guides',
    icon: Compass,
  },
  {
    title: 'System Diagnostics',
    description: 'Debug anomalies and restore operations.',
    href: '/errors',
    icon: Bug,
  },
];

export default function HomePage() {
  return (
    <main className="relative flex h-full flex-col items-center justify-center px-4 py-12 
      bg-gradient-to-br 
      from-gray-350 via-gray-400 to-gray-450 
      text-black 
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-white
    ">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 dark:bg-white bg-black rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Satellite className="w-20 h-20 text-blue-500 dark:text-blue-300 motion-safe:animate-[spin_5s_linear_infinite]" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-blue-500 dark:text-blue-300">
          Aegis Command
        </h1>

        <div className="flex items-center justify-center gap-2 my-4">
          <Stars className="w-4 h-4 text-yellow-500" />
          <p className="text-xs font-mono uppercase tracking-wider text-gray-600 dark:text-gray-300">
            Advanced Exploration & Rescue
          </p>
          <Stars className="w-4 h-4 text-yellow-500" />
        </div>

        <p className="text-sm sm:text-base max-w-xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
          Access documentation, establish protocols, and launch development ops.
        </p>
      </div>

      <div className="z-10 grid gap-4 sm:grid-cols-2 max-w-3xl w-full">
        {cards.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex gap-4 items-start rounded-lg border border-gray-300 dark:border-gray-700
            bg-white/30 dark:bg-slate-900/80
            hover:bg-gray-200 dark:hover:bg-slate-800
            transition-colors p-4"
          >
            <div className="p-2 bg-slate-700 rounded-full">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="relative z-10 mt-16 flex items-center gap-4 text-gray-500 text-xs">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-700 to-transparent w-20"></div>
        <span className="font-mono tracking-wider uppercase">Made by Goob</span>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-700 to-transparent w-20"></div>
      </div>
    </main>
  );
}
