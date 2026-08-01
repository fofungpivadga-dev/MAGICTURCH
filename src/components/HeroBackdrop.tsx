interface HeroBackdropProps {
  linesOpacity?: number;
}

export default function HeroBackdrop({ linesOpacity = 50 }: HeroBackdropProps) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#070709] to-[#E4572E]/15" />
      <div className="absolute inset-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: linesOpacity / 100 }}>
          <defs>
            <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D9A441" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
          <g>
            <rect x="60" y="60" width="60" height="60" fill="#D9A441" fillOpacity="0.18" />
            <rect x="300" y="120" width="60" height="60" fill="#E4572E" fillOpacity="0.18" />
            <rect x="600" y="60" width="60" height="60" fill="#0F6B5C" fillOpacity="0.2" />
            <rect x="780" y="180" width="60" height="60" fill="#7858A8" fillOpacity="0.18" />
            <rect x="900" y="300" width="60" height="60" fill="#D9A441" fillOpacity="0.22" />
            <rect x="180" y="420" width="60" height="60" fill="#0F6B5C" fillOpacity="0.18" />
            <rect x="420" y="300" width="60" height="60" fill="#E4572E" fillOpacity="0.18" />
            <rect x="540" y="480" width="60" height="60" fill="#7858A8" fillOpacity="0.2" />
            <rect x="120" y="600" width="60" height="60" fill="#D9A441" fillOpacity="0.18" />
            <rect x="720" y="600" width="60" height="60" fill="#E4572E" fillOpacity="0.16" />
            <rect x="360" y="540" width="60" height="60" fill="#0F6B5C" fillOpacity="0.18" />
            <rect x="240" y="180" width="30" height="60" fill="#7858A8" fillOpacity="0.2" />
            <rect x="660" y="360" width="60" height="30" fill="#D9A441" fillOpacity="0.2" />
            <rect x="480" y="240" width="60" height="60" fill="none" stroke="#D9A441" strokeWidth="0.9" />
          </g>
          <g stroke="#D9A441" strokeWidth="1.2" fill="none">
            <circle cx="85%" cy="22%" r="160" />
            <circle cx="85%" cy="22%" r="90" strokeDasharray="4 8" />
            <line x1="70%" y1="0" x2="70%" y2="100%" />
            <path d="M0 18% H40%" />
            <path d="M60% 100% L80% 66% H100%" />
            <path d="M0 82% H24%" />
            <polygon points="6%,38% 16%,24% 26%,38% 16%,52%" />
          </g>
        </svg>
      </div>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-[#D9A441]/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-[#E4572E]/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D9A441]/50 to-transparent" />
    </>
  );
}
