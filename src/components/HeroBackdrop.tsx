export default function HeroBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#070709] to-[#E4572E]/15" />
      <div className="absolute inset-0 opacity-50">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D9A441" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
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
