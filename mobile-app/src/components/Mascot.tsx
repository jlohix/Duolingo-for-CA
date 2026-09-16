import { useState } from 'react';

export type MascotMood = 'wave' | 'celebrate' | 'jump' | 'bat' | 'think';

/**
 * Maps a mood to the Sunwoo mascot artwork bundled in /public/mascot/
 * (copied from the repo's `mascots/` folder). Animated moods use WebP;
 * static ones use PNG. Falls back to the main sunwoo.png, then an inline SVG.
 */
const MASCOT_SRC: Record<MascotMood, string> = {
  wave: '/mascot/wave.png',
  celebrate: '/mascot/celebrate.webp',
  jump: '/mascot/celebrate.webp',
  bat: '/mascot/bat.png',
  think: '/mascot/sunwoo.png',
};

const FALLBACK = '/mascot/sunwoo.png';

interface Props {
  mood?: MascotMood;
  size?: number;
  float?: boolean;
  className?: string;
}

export default function Mascot({ mood = 'wave', size = 120, float = false, className = '' }: Props) {
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0=primary, 1=fallback png, 2=svg
  const src = stage === 0 ? MASCOT_SRC[mood] : FALLBACK;

  return (
    <div
      className={`inline-flex items-center justify-center ${float ? 'animate-float' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {stage < 2 ? (
        <img
          src={src}
          alt="Sunwoo mascot"
          width={size}
          height={size}
          onError={() => setStage((s) => (s === 0 ? 1 : 2))}
          className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        />
      ) : (
        <SunwooSvg size={size} mood={mood} />
      )}
    </div>
  );
}

/** Inline fallback so the app still renders a mascot if assets are missing. */
function SunwooSvg({ size, mood }: { size: number; mood: MascotMood }) {
  const happy = mood !== 'bat' && mood !== 'think';
  return (
    <svg viewBox="0 0 120 160" width={size} height={size} aria-hidden>
      <path d="M35 45 C30 15 90 15 85 45 C92 40 96 55 88 60 L32 60 C24 55 28 40 35 45Z" fill="#111" />
      <ellipse cx="60" cy="58" rx="26" ry="24" fill="#F2C6A0" />
      {happy ? (
        <>
          <path d="M48 56 q4 -5 8 0" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M64 56 q4 -5 8 0" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M52 66 q8 8 16 0" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="52" cy="56" r="2.5" fill="#222" />
          <circle cx="68" cy="56" r="2.5" fill="#222" />
          <path d="M54 68 q6 -3 12 0" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      <path d="M40 84 h40 l6 46 h-52 Z" fill="#141414" />
      <rect x="46" y="128" width="12" height="26" rx="3" fill="#0d0d0d" />
      <rect x="62" y="128" width="12" height="26" rx="3" fill="#0d0d0d" />
      <rect x="42" y="150" width="18" height="8" rx="4" fill="#cfcfcf" />
      <rect x="60" y="150" width="18" height="8" rx="4" fill="#cfcfcf" />
      <path d="M80 88 q18 -6 14 -26" stroke="#F2C6A0" strokeWidth="9" fill="none" strokeLinecap="round" />
    </svg>
  );
}
