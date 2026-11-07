import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';

interface MadrasaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showAmharic?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only' | 'badge';
}

export const MadrasaLogo: React.FC<MadrasaLogoProps> = ({
  size = 'md',
  showText = true,
  showAmharic = true,
  className = '',
}) => {
  const { customLogoUrl, language } = useMadrasa();

  const sizeMap = {
    sm: { icon: 'w-8 h-8', title: 'text-sm font-bold', sub: 'text-[10px]', arabic: 'text-xs' },
    md: { icon: 'w-11 h-11', title: 'text-base font-bold', sub: 'text-xs', arabic: 'text-sm' },
    lg: { icon: 'w-16 h-16', title: 'text-xl font-extrabold', sub: 'text-sm', arabic: 'text-base' },
    xl: { icon: 'w-24 h-24', title: 'text-2xl font-black', sub: 'text-base', arabic: 'text-xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon or Custom Uploaded Logo */}
      <div className={`relative flex-shrink-0 flex items-center justify-center ${currentSize.icon} transition-transform hover:scale-105 duration-200 overflow-hidden rounded-xl`}>
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Al-Imran Madrasa Logo"
            className="w-full h-full object-contain rounded-xl drop-shadow-sm"
          />
        ) : (
          <svg
            viewBox="0 0 240 270"
            className="w-full h-full drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle Star Geometry Halo */}
            <circle cx="120" cy="130" r="105" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            
            {/* Crescent Finial */}
            <path
              d="M120 12 C125 12 128 17 127 22 C123 20 119 23 119 27 C119 31 123 34 127 32 C126 37 121 40 116 38 C111 35 110 27 113 20 C115 15 118 12 120 12Z"
              fill="#059669"
            />
            <line x1="120" y1="27" x2="120" y2="42" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />

            {/* Dome Structure */}
            <path
              d="M120 42 C102 42 86 58 84 80 L156 80 C154 58 138 42 120 42Z"
              fill="#059669"
            />
            {/* Minaret side turrets */}
            <path d="M74 65 L84 68 L84 80 L74 80 Z" fill="#047857" />
            <path d="M166 65 L156 68 L156 80 L166 80 Z" fill="#047857" />

            {/* Arched Windows */}
            <path d="M96 79 L96 66 C96 62 102 62 102 66 L102 79 Z" fill="#ffffff" />
            <path d="M117 79 L117 62 C117 58 123 58 123 62 L123 79 Z" fill="#ffffff" />
            <path d="M138 79 L138 66 C138 62 144 62 144 66 L144 79 Z" fill="#ffffff" />

            {/* Golden Open Quran on Rehal (Stand) */}
            <path
              d="M86 86 L120 98 L154 86 L148 104 L120 112 L92 104 Z"
              fill="#d97706"
            />
            <path
              d="M92 88 L120 97 L148 88 L142 98 L120 106 L98 98 Z"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            <line x1="120" y1="97" x2="120" y2="106" stroke="#b45309" strokeWidth="2" />

            {/* Flowing Calligraphic Silhouette for "آل عمران" */}
            <g transform="translate(0, 0)">
              <path
                d="M72 135 C68 115 88 122 105 130 C125 138 152 132 165 115 C172 106 174 94 175 85 C176 96 177 122 174 140 C170 162 155 186 128 200 C102 214 74 200 68 178 C65 168 67 155 72 135Z"
                fill="#059669"
              />
              <path
                d="M84 150 C80 165 92 188 118 188 C140 188 158 172 162 150 C156 160 142 170 124 170 C106 170 94 158 92 144 C90 136 94 132 84 150Z"
                fill="#ffffff"
              />
              <path
                d="M100 148 C105 140 118 140 126 146 C132 152 128 162 120 162 C110 162 104 154 100 148Z"
                fill="#047857"
              />
              {/* Accents in warm Gold */}
              <circle cx="95" cy="120" r="4" fill="#d97706" />
              <circle cx="146" cy="123" r="4" fill="#d97706" />
              <circle cx="116" cy="190" r="3.5" fill="#d97706" />
            </g>

            {/* Amharic Ge'ez Typography: አል ዒምራን */}
            <text
              x="120"
              y="250"
              textAnchor="middle"
              fontFamily="'Noto Sans Ethiopic', sans-serif"
              fontWeight="bold"
              fontSize="32"
              fill="#047857"
              letterSpacing="2"
            >
              አል ዒምራን
            </text>
          </svg>
        )}
      </div>

      {/* Title & Subtitle */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className={`${currentSize.title} tracking-tight text-slate-900 dark:text-slate-100 font-extrabold`}>
              Al-Imran CMC
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              CMC • Addis
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className={`${currentSize.sub} font-medium`}>
              Madrasa System
            </span>
            {showAmharic && (
              <span className="text-[11px] font-amharic text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">
                • አል ዒምራን
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
