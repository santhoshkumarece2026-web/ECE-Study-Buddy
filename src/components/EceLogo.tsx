import React from 'react';

interface EceLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const EceLogo: React.FC<EceLogoProps> = ({ 
  className = 'w-8 h-8', 
  size = 32,
  showWordmark = false
}) => {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        width={size}
        height={size}
        className={className}
        aria-label="ECE Study Buddy Logo"
      >
        {/* Grounding Base Chip Carrier */}
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="12"
          fill="#151F32"
          stroke="#2A3850"
          strokeWidth="1.5"
        />

        {/* Subtle PCB Grid Guides */}
        <path
          d="M18 8v48 M32 8v48 M46 8v48 M8 18h48 M8 32h48 M8 46h48"
          stroke="#1B2940"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.6"
        />

        {/* Corner IC Pad Terminals */}
        <rect x="2" y="20" width="3" height="6" rx="1" fill="#3B82F6" />
        <rect x="2" y="38" width="3" height="6" rx="1" fill="#3B82F6" />
        <rect x="59" y="20" width="3" height="6" rx="1" fill="#3B82F6" />
        <rect x="59" y="38" width="3" height="6" rx="1" fill="#3B82F6" />
        <rect x="20" y="2" width="6" height="3" rx="1" fill="#3B82F6" />
        <rect x="38" y="2" width="6" height="3" rx="1" fill="#3B82F6" />
        <rect x="20" y="59" width="6" height="3" rx="1" fill="#3B82F6" />
        <rect x="38" y="59" width="6" height="3" rx="1" fill="#3B82F6" />

        {/* Geometric 'E' Circuit Trace System */}
        {/* Vertical Bus Spine */}
        <path
          d="M20 18v28"
          stroke="#3B82F6"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Top Trace with 45° Chamfer & Via Pad */}
        <path
          d="M20 18h20l4 4"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="22" r="3" fill="#151F32" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="44" cy="22" r="1.2" fill="#F1F5F9" />

        {/* Center Logic Bus & Micro-node */}
        <path
          d="M20 32h16"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="36" cy="32" r="2.5" fill="#38BDF8" />

        {/* Bottom Trace with 45° Chamfer & Via Pad */}
        <path
          d="M20 46h18l6-6"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="40" r="3" fill="#151F32" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="44" cy="40" r="1.2" fill="#F1F5F9" />

        {/* Complementary Integrated Trace / Clock Path */}
        <path
          d="M44 26v10"
          stroke="#2A3850"
          strokeWidth="1.75"
          strokeDasharray="2 2"
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm tracking-tight text-[#F1F5F9]">
            ECE Study Buddy
          </span>
          <span className="text-[10px] font-mono text-[#7F8DA3] tracking-wider uppercase mt-0.5">
            Engineering Console
          </span>
        </div>
      )}
    </div>
  );
};
