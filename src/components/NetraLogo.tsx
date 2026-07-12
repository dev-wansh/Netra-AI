import React from 'react';

export function NetraLogo({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="netraEyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0A2540" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="netraShieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6F00" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#00A86B" />
        </linearGradient>
      </defs>
      
      {/* Background container glow */}
      <circle cx="80" cy="80" r="48" fill="url(#netraEyeGlow)" />
      
      {/* Outer Eye Shape - Deep Navy / Electric Blue */}
      <path 
        d="M20,80 C35,45 65,30 80,30 C95,30 125,45 140,80 C125,115 95,130 80,130 C65,130 35,115 20,80 Z" 
        stroke="#0A2540" 
        strokeWidth="11" 
        fill="none" 
      />
      <path 
        d="M22,80 C36,48 65,34 80,34 C95,34 124,48 138,80 C124,112 95,126 80,126 C65,126 36,112 22,80 Z" 
        stroke="#1E88E5" 
        strokeWidth="4" 
        fill="none" 
      />

      {/* Iris Circuit Outer Track */}
      <circle cx="80" cy="80" r="32" stroke="#1E88E5" strokeWidth="1.5" strokeDasharray="4, 4" />
      <circle cx="80" cy="80" r="26" stroke="#00C2FF" strokeWidth="1.2" />

      {/* Cyber Pupil & Circuit lines */}
      <circle cx="80" cy="80" r="16" fill="#0A2540" stroke="#1E88E5" strokeWidth="2.5" />
      <circle cx="80" cy="80" r="9" fill="#00C2FF" />
      <circle cx="77" cy="77" r="3.5" fill="#FFFFFF" />

      {/* Circuit lines extending from pupil */}
      <line x1="80" y1="54" x2="80" y2="64" stroke="#1E88E5" strokeWidth="1.5" />
      <circle cx="80" cy="52" r="1.5" fill="#1E88E5" />
      
      <line x1="80" y1="96" x2="80" y2="106" stroke="#1E88E5" strokeWidth="1.5" />
      <circle cx="80" cy="108" r="1.5" fill="#1E88E5" />
      
      <line x1="54" y1="80" x2="64" y2="80" stroke="#1E88E5" strokeWidth="1.5" />
      <circle cx="52" cy="80" r="1.5" fill="#1E88E5" />
      
      <line x1="96" y1="80" x2="106" y2="80" stroke="#1E88E5" strokeWidth="1.5" />
      <circle cx="108" cy="80" r="1.5" fill="#1E88E5" />

      {/* Left-side pixelated break-apart blocks (Saffron, Green, Blue) */}
      <rect x="5" y="76" width="6" height="6" fill="#FF6F00" />
      <rect x="11" y="68" width="5" height="5" fill="#00A86B" />
      <rect x="0" y="82" width="4" height="4" fill="#1E88E5" />
      <rect x="7" y="88" width="5" height="5" fill="#FF6F00" />
      <rect x="13" y="84" width="4" height="4" fill="#00A86B" />

      {/* Protective Shield Outline around right half representing Indian Tricolor */}
      <path 
        d="M80,16 C116,16 149,30 149,72 C149,112 110,141 80,151" 
        stroke="url(#netraShieldGradient)" 
        strokeWidth="4.5" 
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
