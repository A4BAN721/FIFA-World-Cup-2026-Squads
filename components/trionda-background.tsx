"use client";

export function TriondaBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Green flowing blob - Mexico (Eagle) */}
      <div className="absolute -top-20 -left-20 w-96 h-96 animate-blob">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <clipPath id="greenBlob">
              <path d="M200,50 Q350,100 320,200 Q290,300 200,350 Q110,300 80,200 Q50,100 200,50 Z" />
            </clipPath>
          </defs>
          <path
            d="M200,50 Q350,100 320,200 Q290,300 200,350 Q110,300 80,200 Q50,100 200,50 Z"
            fill="oklch(0.55 0.18 145 / 0.15)"
          />
          {/* Eagle silhouette */}
          <g clipPath="url(#greenBlob)" transform="translate(120, 120) scale(0.4)">
            <path
              d="M200,100 L180,140 L120,130 L140,160 L100,180 L150,190 L130,220 L170,210 L180,250 L200,220 L220,250 L230,210 L270,220 L250,190 L300,180 L260,160 L280,130 L220,140 Z"
              fill="oklch(0.55 0.18 145 / 0.4)"
            />
          </g>
        </svg>
      </div>

      {/* Blue flowing blob - USA (Star) */}
      <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] animate-blob animation-delay-2000">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <path
            d="M250,30 Q420,80 450,250 Q420,420 250,470 Q80,420 50,250 Q80,80 250,30 Z"
            fill="oklch(0.45 0.22 250 / 0.12)"
          />
          {/* Star shape */}
          <path
            d="M250,120 L270,200 L350,200 L285,250 L310,330 L250,280 L190,330 L215,250 L150,200 L230,200 Z"
            fill="oklch(0.45 0.22 250 / 0.3)"
          />
        </svg>
      </div>

      {/* Red flowing blob - Canada (Maple Leaf) */}
      <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] animate-blob animation-delay-4000">
        <svg viewBox="0 0 450 450" className="w-full h-full">
          <path
            d="M225,40 Q400,90 410,225 Q400,360 225,410 Q50,360 40,225 Q50,90 225,40 Z"
            fill="oklch(0.55 0.22 25 / 0.12)"
          />
          {/* Maple leaf simplified */}
          <path
            d="M225,100 L240,160 L280,140 L260,180 L310,190 L270,210 L290,250 L250,230 L225,290 L200,230 L160,250 L180,210 L140,190 L190,180 L170,140 L210,160 Z"
            fill="oklch(0.55 0.22 25 / 0.35)"
          />
        </svg>
      </div>

      {/* Additional smaller decorative blobs */}
      <div className="absolute top-2/3 left-10 w-48 h-48 animate-blob animation-delay-2000 opacity-60">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="oklch(0.55 0.18 145 / 0.1)" />
        </svg>
      </div>

      <div className="absolute top-20 right-1/4 w-32 h-32 animate-blob animation-delay-4000 opacity-50">
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <circle cx="75" cy="75" r="60" fill="oklch(0.45 0.22 250 / 0.1)" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 right-20 w-40 h-40 animate-blob opacity-50">
        <svg viewBox="0 0 180 180" className="w-full h-full">
          <circle cx="90" cy="90" r="70" fill="oklch(0.55 0.22 25 / 0.1)" />
        </svg>
      </div>
    </div>
  );
}
