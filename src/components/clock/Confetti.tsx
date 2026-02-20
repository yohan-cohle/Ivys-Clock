import React from 'react';

interface ConfettiProps {
  active: boolean;
}

const COLORS = [
  'var(--confetti-1)',
  'var(--confetti-2)',
  'var(--confetti-3)',
  'var(--confetti-4)',
  'var(--confetti-5)',
];

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const size = 6 + Math.random() * 8;
        const rotate = Math.random() * 360;

        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${left}%`,
              top: '-10px',
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: `hsl(${color})`,
              borderRadius: '2px',
              transform: `rotate(${rotate}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;
