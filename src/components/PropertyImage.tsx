import React from 'react';
import { Building2, Home, Landmark, Castle } from 'lucide-react';
import { PropertyType } from '../types/crm';

interface PropertyImageProps {
  type: PropertyType;
  preset?: 'condo' | 'villa' | 'townhouse' | 'penthouse';
  imageUrl?: string;
  title: string;
  className?: string;
}

const PropertyImageComponent: React.FC<PropertyImageProps> = ({
  type,
  preset = 'condo',
  imageUrl,
  title,
  className = 'h-48 w-full',
}) => {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Domain-specific styled architectural SVG representations
  const getPresetConfig = () => {
    switch (preset) {
      case 'penthouse':
        return {
          gradient: 'from-stone-900 via-emerald-950 to-stone-900',
          accent: 'from-emerald-400 to-amber-500',
          badgeText: 'PENTHOUSE PRESTISIUS',
          Icon: Landmark,
          svgPattern: (
            <g opacity="0.22" stroke="#10B981" strokeWidth="1.2">
              <path d="M 40 240 L 40 50 L 160 50 L 160 240" fill="none" />
              <line x1="40" y1="80" x2="160" y2="80" />
              <line x1="40" y1="120" x2="160" y2="120" />
              <line x1="40" y1="160" x2="160" y2="160" />
              <line x1="40" y1="200" x2="160" y2="200" />
              <line x1="80" y1="50" x2="80" y2="240" />
              <line x1="120" y1="50" x2="120" y2="240" />

              <path d="M 180 240 L 180 30 L 320 30 L 320 240" fill="none" stroke="#F8FAFC" />
              <path d="M 180 30 L 250 10 L 320 30" fill="none" stroke="#10B981" strokeWidth="2" />
              <line x1="200" y1="30" x2="200" y2="240" stroke="#F8FAFC" />
              <line x1="250" y1="30" x2="250" y2="240" stroke="#F8FAFC" />
              <line x1="300" y1="30" x2="300" y2="240" stroke="#F8FAFC" />
              <line x1="180" y1="70" x2="320" y2="70" stroke="#F8FAFC" />
              <line x1="180" y1="110" x2="320" y2="110" stroke="#F8FAFC" />
              <line x1="180" y1="150" x2="320" y2="150" stroke="#F8FAFC" />
              <line x1="180" y1="190" x2="320" y2="190" stroke="#F8FAFC" />
            </g>
          )
        };
      case 'villa':
        return {
          gradient: 'from-emerald-950 via-stone-900 to-emerald-950',
          accent: 'from-emerald-400 to-teal-400',
          badgeText: 'VILLA TROPIS MEWAH',
          Icon: Castle,
          svgPattern: (
            <g opacity="0.22" stroke="#34D399" strokeWidth="1.2">
              <path d="M 30 240 L 30 110 L 140 70 L 250 110 L 250 240 Z" fill="none" />
              <rect x="70" y="140" width="40" height="60" stroke="#F8FAFC" fill="none" />
              <rect x="150" y="140" width="60" height="40" stroke="#F8FAFC" fill="none" />
              <line x1="260" y1="190" x2="380" y2="190" stroke="#10B981" strokeWidth="2" />
              <line x1="270" y1="210" x2="370" y2="210" stroke="#34D399" strokeWidth="2" />
              <line x1="280" y1="230" x2="360" y2="230" stroke="#34D399" strokeWidth="2" />
            </g>
          )
        };
      case 'townhouse':
        return {
          gradient: 'from-stone-900 via-stone-800 to-emerald-950',
          accent: 'from-emerald-400 to-emerald-600',
          badgeText: 'HUNIAN RESIDENSIAL',
          Icon: Home,
          svgPattern: (
            <g opacity="0.22" stroke="#10B981" strokeWidth="1.2">
              <rect x="60" y="70" width="100" height="170" fill="none" />
              <rect x="170" y="50" width="110" height="190" fill="none" stroke="#F8FAFC" />
              <path d="M 60 70 L 110 40 L 160 70" fill="none" />
              <path d="M 170 50 L 225 20 L 280 50" fill="none" stroke="#F8FAFC" />
              <circle cx="110" cy="95" r="14" fill="none" stroke="#F8FAFC" />
              <rect x="85" y="170" width="50" height="70" fill="none" />
              <rect x="195" y="160" width="60" height="80" fill="none" stroke="#F8FAFC" />
            </g>
          )
        };
      default: // condo
        return {
          gradient: 'from-stone-900 via-emerald-950 to-stone-900',
          accent: 'from-emerald-400 to-teal-400',
          badgeText: 'APARTEMEN PREMIUM',
          Icon: Building2,
          svgPattern: (
            <g opacity="0.22" stroke="#34D399" strokeWidth="1.2">
              <rect x="70" y="30" width="120" height="210" fill="none" />
              <rect x="210" y="70" width="90" height="170" fill="none" stroke="#F8FAFC" />
              <line x1="70" y1="60" x2="190" y2="60" />
              <line x1="70" y1="90" x2="190" y2="90" />
              <line x1="70" y1="120" x2="190" y2="120" />
              <line x1="70" y1="150" x2="190" y2="150" />
              <line x1="70" y1="180" x2="190" y2="180" />
              <line x1="110" y1="30" x2="110" y2="240" />
              <line x1="150" y1="30" x2="150" y2="240" />
            </g>
          )
        };
    }
  };

  const config = getPresetConfig();
  const Icon = config.Icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} ${className} flex flex-col justify-between p-4 select-none`}>
      {/* Background SVG Architectural blueprint schematic */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`grid-${preset}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${preset})`} />
        {config.svgPattern}
      </svg>

      {/* Top row with Category and Property Type icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-emerald-300">
          <Icon className="w-3.5 h-3.5 text-emerald-300" />
          <span>{config.badgeText}</span>
        </div>
        <span className="text-[10px] text-stone-300 tracking-wider uppercase font-mono">
          {type}
        </span>
      </div>

      {/* Center ambient glow */}
      <div className="relative z-10 flex items-center justify-center my-auto py-2">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner shadow-white/5">
          <Icon className="w-6 h-6 text-emerald-300" />
        </div>
      </div>

      {/* Bottom overlay with subtle gradient */}
      <div className="relative z-10">
        <p className="text-white text-xs font-medium tracking-wide truncate drop-shadow-sm">
          {title}
        </p>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export const PropertyImage = React.memo(PropertyImageComponent);
export default PropertyImage;
