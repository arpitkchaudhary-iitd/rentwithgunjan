// Decorative NYC skyline as seen from Hoboken, NJ
// Deterministic star positions (no Math.random to avoid hydration mismatch)
const STARS = Array.from({ length: 38 }, (_, i) => ({
  cx: ((i * 389 + 127) % 1380) + 30,
  cy: ((i * 173 + 61) % 110) + 8,
  r: i % 4 === 0 ? 1.3 : i % 3 === 0 ? 1.0 : 0.7,
  opacity: 0.25 + (i % 7) * 0.09,
}));

export default function Skyline() {
  return (
    <div className="w-full overflow-hidden leading-none">
      <svg
        viewBox="0 0 1440 280"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="60%" stopColor="#0c1a2e" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1a2e" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="roofGlow" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1440" height="280" fill="url(#skyGrad)" />

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.opacity} />
        ))}

        {/* Distant/background buildings (lighter layer for depth) */}
        <path
          fill="#131f30"
          opacity="0.7"
          d="M0,280 L0,210 L60,210 L60,202 L100,202 L100,195 L130,195
             L130,175 L150,175 L150,185 L170,185 L170,172 L200,172
             L200,162 L230,162 L230,172 L260,172 L260,158 L290,158
             L290,170 L320,170 L320,155 L355,155 L355,168 L385,168
             L385,152 L415,152 L415,165 L445,165 L445,150 L480,150
             L480,162 L515,162 L515,148 L545,148 L545,135 L570,135
             L570,125 L600,125 L600,115 L630,115 L630,105 L660,105
             L660,118 L690,118 L690,108 L720,108 L720,122 L755,122
             L755,110 L785,110 L785,122 L815,122 L815,135 L850,135
             L850,148 L885,148 L885,160 L920,160 L920,172 L960,172
             L960,182 L1010,182 L1010,190 L1065,190 L1065,198
             L1130,198 L1130,205 L1200,205 L1200,210 L1440,210 L1440,280 Z"
        />

        {/* Main foreground silhouette
            Key landmarks (left→right):
            • One World Trade Center  ~x=120 (tallest left cluster, y≈38)
            • Empire State Building   ~x=595 (center, stepped spire, y≈18)
            • Chrysler Building       ~x=740 (slightly shorter spire, y≈52)
        */}
        <path
          fill="url(#bldGrad)"
          d="
            M0,280 L0,218
            L25,218 L25,212 L50,212 L50,206 L72,206 L72,200 L88,200 L88,210
            L95,210 L95,192 L105,192
            L105,168 L110,168 L110,95 L112,82 L115,65 L117,50 L119,38 L121,28
            L123,38 L125,50 L127,65 L129,82 L131,95 L131,168 L136,168
            L136,148 L152,148 L152,162 L168,162 L168,144 L185,144
            L185,155 L202,155 L202,138 L218,138 L218,150 L235,150
            L235,132 L252,132 L252,144 L270,144 L270,128 L288,128
            L288,140 L306,140 L306,124 L324,124 L324,136 L342,136
            L342,120 L360,120 L360,133 L378,133 L378,118 L396,118
            L396,130 L415,130 L415,120 L432,120 L432,132
            L448,132 L448,148 L464,148 L464,135 L480,135
            L480,122 L498,122 L498,135 L515,135 L515,118
            L532,118 L532,130 L550,130 L550,115 L566,115 L566,105
            L575,105 L575,95 L582,95 L582,86 L587,86 L587,78
            L591,78 L591,68 L594,68 L594,58 L597,58 L597,48
            L599,48 L599,38 L601,30 L603,22 L605,15 L607,22
            L609,30 L611,38 L613,48 L615,48 L615,58 L618,58
            L618,68 L621,68 L621,78 L625,78 L625,86 L630,86
            L630,95 L637,95 L637,105 L645,105
            L645,92 L660,92 L660,82 L676,82 L676,92 L693,92
            L693,80 L710,80 L710,90
            L720,90 L720,78 L726,72 L730,65 L733,57 L736,52
            L739,57 L742,65 L745,72 L748,78 L748,90 L762,90
            L762,80 L778,80 L778,90 L795,90 L795,100
            L812,100 L812,112 L830,112 L830,124 L848,124
            L848,136 L866,136 L866,148 L885,148
            L885,158 L904,158 L904,166 L924,166 L924,174
            L945,174 L945,182 L968,182 L968,188
            L995,188 L995,194 L1025,194 L1025,198
            L1058,198 L1058,203 L1095,203 L1095,207
            L1135,207 L1135,211 L1180,211 L1180,214
            L1230,214 L1230,217 L1285,217 L1285,219
            L1350,219 L1350,221 L1440,221
            L1440,280 Z
          "
        />

        {/* Cyan roofline glow on the tallest spires */}
        <g filter="url(#roofGlow)" opacity="0.35">
          {/* One WTC spire */}
          <path fill="none" stroke="#22d3ee" strokeWidth="1.2"
            d="M119,38 L121,28 L123,38 L125,50 L127,65 L129,82 L131,95" />
          {/* Empire State spire */}
          <path fill="none" stroke="#22d3ee" strokeWidth="1.2"
            d="M601,30 L603,22 L605,15 L607,22 L609,30 L611,38 L613,48" />
          {/* Chrysler-style spire */}
          <path fill="none" stroke="#22d3ee" strokeWidth="0.9"
            d="M733,57 L736,52 L739,57 L742,65 L745,72" />
        </g>

        {/* Water */}
        <rect x="0" y="236" width="1440" height="44" fill="url(#waterGrad)" opacity="0.95" />

        {/* Subtle reflection in water (flipped, very faint) */}
        <g opacity="0.08" transform="translate(0,472) scale(1,-1)">
          <path
            fill="#22d3ee"
            d="M105,168 L110,95 L112,82 L119,38 L121,28 L123,38 L131,95 L131,168 Z
               M599,48 L601,30 L605,15 L609,30 L613,48 L615,58 Z"
          />
        </g>

        {/* Horizon glow */}
        <rect x="0" y="220" width="1440" height="18"
          fill="url(#skyGrad)" opacity="0.6" />

        {/* Location caption */}
        <text
          x="720" y="268"
          textAnchor="middle"
          fill="#475569"
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          letterSpacing="4"
        >
          NEW YORK CITY  ·  AS SEEN FROM HOBOKEN, NJ
        </text>
      </svg>
    </div>
  );
}
