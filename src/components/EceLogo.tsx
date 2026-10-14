import React from 'react';

interface EceLogoProps {
  className?: string;
  size?: number;
}

export const EceLogo: React.FC<EceLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="ECE Study Buddy Logo"
    >
      <defs>
        <linearGradient id="eceChipGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="eceNeonCyan" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="eceCapGrad" x1="18" y1="20" x2="46" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Silicon Chip Die Base */}
      <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#eceChipGrad)" stroke="url(#eceNeonCyan)" strokeWidth="2.2" />

      {/* IC Pins */}
      {/* Top */}
      <path d="M22 3v5 M32 3v5 M42 3v5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom */}
      <path d="M22 56v5 M32 56v5 M42 56v5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left */}
      <path d="M3 22h5 M3 32h5 M3 42h5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right */}
      <path d="M56 22h5 M56 32h5 M56 42h5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Corner Traces and Bus Nodes */}
      <path d="M14 14h5v5 M50 14h-5v5 M14 50h5v-5 M50 50h-5v-5" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      <circle cx="19" cy="19" r="1.5" fill="#38bdf8" />
      <circle cx="45" cy="19" r="1.5" fill="#38bdf8" />
      <circle cx="19" cy="45" r="1.5" fill="#38bdf8" />
      <circle cx="45" cy="45" r="1.5" fill="#38bdf8" />

      {/* Engineering Graduation Cap merged with AI Microprocessor */}
      <path d="M32 18L49 26L32 34L15 26Z" fill="url(#eceCapGrad)" />
      <path d="M22 29.5v5c0 4.5 4.5 7.5 10 7.5s10-3 10-7.5v-5" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 28.5v8c0 1.5 1 2.5 2 2.5" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="46" cy="39" r="1.2" fill="#fbbf24" />

      {/* AI Silicon Core Node */}
      <circle cx="32" cy="26" r="2.5" fill="#ffffff" />
      <circle cx="32" cy="26" r="4" fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.8" />
    </svg>
  );
};
