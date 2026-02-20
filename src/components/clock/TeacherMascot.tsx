import React from 'react';
import type { TeacherMood } from '@/hooks/useClockGame';

interface TeacherMascotProps {
  mood: TeacherMood;
}

const TeacherMascot: React.FC<TeacherMascotProps> = ({ mood }) => {
  const bodyClass = mood === 'happy' || mood === 'celebrating'
    ? 'animate-teacher-bounce'
    : mood === 'confused'
    ? 'animate-teacher-tilt'
    : 'animate-breathe';

  const getMouthPath = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return 'M 32 54 Q 40 62 48 54';
      case 'confused':
        return 'M 34 55 Q 40 52 46 55';
      case 'talking':
        return 'M 34 53 Q 40 59 46 53';
      default:
        return 'M 34 54 Q 40 58 46 54';
    }
  };

  return (
    <div className={`relative ${bodyClass}`} style={{ width: '160px', height: '210px' }}>
      <svg viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Body / Shirt */}
        <ellipse cx="40" cy="95" rx="28" ry="18" fill="hsl(var(--teacher-shirt))" />
        <rect x="12" y="80" width="56" height="20" rx="4" fill="hsl(var(--teacher-shirt))" />

        {/* Arms */}
        {mood === 'talking' && (
          <g className="animate-teacher-arm" style={{ transformOrigin: '14px 85px' }}>
            <rect x="4" y="82" width="10" height="16" rx="4" fill="hsl(var(--teacher-shirt))" />
            <circle cx="9" cy="80" r="5" fill="hsl(var(--teacher-skin))" />
          </g>
        )}

        {/* Neck */}
        <rect x="35" y="68" width="10" height="14" rx="4" fill="hsl(var(--teacher-skin))" />

        {/* Head */}
        <ellipse cx="40" cy="42" rx="22" ry="28" fill="hsl(var(--teacher-skin))" />

        {/* Hair */}
        <ellipse cx="40" cy="22" rx="24" ry="14" fill="hsl(var(--teacher-hair))" />
        <ellipse cx="18" cy="34" rx="6" ry="12" fill="hsl(var(--teacher-hair))" />
        <ellipse cx="62" cy="34" rx="6" ry="12" fill="hsl(var(--teacher-hair))" />

        {/* Eyes */}
        <g className="animate-blink" style={{ transformOrigin: '31px 43px' }}>
          <ellipse cx="31" cy="43" rx="3.5" ry="4" fill="hsl(var(--foreground))" />
          <circle cx="32" cy="42" r="1.2" fill="white" />
        </g>
        <g className="animate-blink" style={{ transformOrigin: '49px 43px' }}>
          <ellipse cx="49" cy="43" rx="3.5" ry="4" fill="hsl(var(--foreground))" />
          <circle cx="50" cy="42" r="1.2" fill="white" />
        </g>

        {/* Eyebrows */}
        {mood === 'confused' ? (
          <>
            <line x1="26" y1="35" x2="35" y2="37" stroke="hsl(var(--teacher-hair))" strokeWidth="2" strokeLinecap="round" />
            <line x1="44" y1="34" x2="53" y2="37" stroke="hsl(var(--teacher-hair))" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="26" y1="36" x2="35" y2="35" stroke="hsl(var(--teacher-hair))" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="44" y1="35" x2="53" y2="36" stroke="hsl(var(--teacher-hair))" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {/* Cheeks */}
        <ellipse cx="24" cy="50" rx="4" ry="2.5" fill="hsl(var(--teacher-cheek))" opacity="0.5" />
        <ellipse cx="56" cy="50" rx="4" ry="2.5" fill="hsl(var(--teacher-cheek))" opacity="0.5" />

        {/* Mouth */}
        <path
          d={getMouthPath()}
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          fill={mood === 'talking' ? 'hsl(var(--teacher-cheek))' : 'none'}
          className={mood === 'talking' ? 'animate-talk' : ''}
        />

        {/* Celebration hand */}
        {mood === 'celebrating' && (
          <g className="animate-teacher-wave" style={{ transformOrigin: '68px 75px' }}>
            <circle cx="72" cy="68" r="5" fill="hsl(var(--teacher-skin))" />
            <rect x="65" y="68" width="8" height="14" rx="3" fill="hsl(var(--teacher-shirt))" />
          </g>
        )}

        {/* Glasses */}
        <circle cx="31" cy="43" r="7" stroke="hsl(var(--teacher-hair))" strokeWidth="1.5" fill="none" />
        <circle cx="49" cy="43" r="7" stroke="hsl(var(--teacher-hair))" strokeWidth="1.5" fill="none" />
        <line x1="38" y1="43" x2="42" y2="43" stroke="hsl(var(--teacher-hair))" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export default TeacherMascot;
