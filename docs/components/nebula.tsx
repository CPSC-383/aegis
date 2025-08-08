import { useMemo } from 'react';

interface NebulaBackgroundProps {
  /** Number of Lumen particles to render */
  particleCount?: number;
  /** Particle size range */
  particleSize?: {
    min: number;
    max: number;
  };
  /** Animation duration range in seconds */
  animationDuration?: {
    min: number;
    max: number;
  };
  /** Nebula core color */
  nebulaColor?: string;
  /** Background gradient */
  gradient?: string;
  /** Additional CSS classes */
  className?: string;
}

export const NebulaBackground = ({
  particleCount = 30,
  particleSize = { min: 2, max: 4 },
  animationDuration = { min: 3, max: 5 },
  nebulaColor = 'purple-500/10',
  gradient = 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
  className = '',
}: NebulaBackgroundProps) => {
  const lumenParticles = useMemo(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: animationDuration.min + Math.random() * (animationDuration.max - animationDuration.min),
      size: particleSize.min + Math.random() * (particleSize.max - particleSize.min),
    })),
    [particleCount, particleSize, animationDuration]
  );

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ${gradient} ${className}`}>
      {lumenParticles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full opacity-60 animate-pulse bg-gradient-to-r from-cyan-400 to-blue-300`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
          }}
        />
      ))}

      <div className={`absolute inset-0 bg-gradient-radial from-${nebulaColor} via-transparent to-transparent opacity-40`} />

      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-900/5 to-transparent opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-900/5 to-transparent opacity-20" />
    </div>
  );
};

// Preset configurations for different scenes
export const NebulaPresets = {
  // Home page - rich and atmospheric
  home: {
    particleCount: 30,
    particleSize: { min: 2, max: 4 },
    nebulaColor: 'purple-500/10',
    gradient: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
  },

  // Documentation pages - subtle and non-distracting
  docs: {
    particleCount: 15,
    particleSize: { min: 1, max: 2 },
    nebulaColor: 'slate-500/5',
    gradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
  },

  // Guides page - medium intensity
  guides: {
    particleCount: 20,
    particleSize: { min: 1, max: 3 },
    nebulaColor: 'indigo-500/8',
    gradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
  },

  // Alert/danger pages - red tinted
  alert: {
    particleCount: 25,
    particleSize: { min: 2, max: 3 },
    nebulaColor: 'red-500/10',
    gradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950',
  },

  // Clean/minimal - for content pages
  minimal: {
    particleCount: 10,
    particleSize: { min: 1, max: 2 },
    nebulaColor: 'slate-500/3',
    gradient: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  },
};
