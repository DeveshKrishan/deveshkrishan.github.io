import { DITHER_FAR_RIDGE, DITHER_NEAR_RIDGE } from './dither-paths';

function DitherBackground() {
  return (
    <div className="intro-heatmap-dither" aria-hidden="true">
      <svg viewBox="0 380 1440 520" preserveAspectRatio="xMidYMid slice">
        <defs>
          <clipPath id="heatmapDitherClip">
            <rect x="0" y="380" width="1440" height="520" />
          </clipPath>
          <linearGradient id="heatmapSkyRamp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="45%" stopColor="#3f3f3f" />
            <stop offset="100%" stopColor="#5a5a5a" />
          </linearGradient>
          <radialGradient id="heatmapCloudSoft">
            <stop offset="0%" stopColor="#7a7a7a" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#4a4a4a" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter
            id="heatmapDitherFx"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.55"
              numOctaves="1"
              seed="11"
              result="noise"
            />
            <feColorMatrix in="noise" type="saturate" values="0" result="grain" />
            <feMorphology in="grain" operator="dilate" radius="0.6" result="grainFat" />
            <feComposite
              in="SourceGraphic"
              in2="grainFat"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="0.85"
              k4="-0.22"
              result="mixed"
            />
            <feComponentTransfer in="mixed">
              <feFuncR type="discrete" tableValues="0.04 0.12 0.22 0.36 0.52" />
              <feFuncG type="discrete" tableValues="0.04 0.12 0.22 0.36 0.52" />
              <feFuncB type="discrete" tableValues="0.04 0.12 0.22 0.36 0.52" />
              <feFuncA type="discrete" tableValues="1 1" />
            </feComponentTransfer>
          </filter>
        </defs>
        <g clipPath="url(#heatmapDitherClip)" filter="url(#heatmapDitherFx)">
          <rect x="0" y="380" width="1440" height="520" fill="url(#heatmapSkyRamp)" />
          <ellipse cx="420" cy="500" rx="260" ry="80" fill="url(#heatmapCloudSoft)" />
          <ellipse cx="780" cy="470" rx="210" ry="65" fill="url(#heatmapCloudSoft)" />
          <ellipse cx="1140" cy="490" rx="240" ry="75" fill="url(#heatmapCloudSoft)" />
          <path d={DITHER_FAR_RIDGE} fill="#2c2c2c" />
          <path d={DITHER_NEAR_RIDGE} fill="#111111" />
        </g>
      </svg>
    </div>
  );
}

export default DitherBackground;
