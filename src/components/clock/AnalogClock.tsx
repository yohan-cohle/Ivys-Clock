import React, { useRef, useCallback, useEffect, useState } from 'react';

interface AnalogClockProps {
  hourAngle: number;
  minuteAngle: number;
  showSecondHand: boolean;
  showDigitalDisplay: boolean;
  clockTime: { hours: number; minutes: number };
  use24h: boolean;
  onAnglesChange: (hourAngle: number, minuteAngle: number) => void;
  answerState: 'waiting' | 'correct' | 'wrong';
  locked: boolean;
  interactive?: boolean;
}

const AnalogClock: React.FC<AnalogClockProps> = ({
  hourAngle, minuteAngle, showSecondHand, showDigitalDisplay,
  clockTime, use24h, onAnglesChange, answerState, locked,
  interactive = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<'hour' | 'minute' | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!showSecondHand) return;
    const iv = setInterval(() => setSeconds(s => (s + 1) % 60), 1000);
    return () => clearInterval(iv);
  }, [showSecondHand]);

  const getAngleFromEvent = useCallback((e: MouseEvent | TouchEvent): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - cx;
    const dy = clientY - cy;
    return (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  }, []);

  const handlePointerDown = useCallback((hand: 'hour' | 'minute') => (e: React.MouseEvent | React.TouchEvent) => {
    if (locked || !interactive) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = hand;
  }, [locked, interactive]);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const angle = getAngleFromEvent(e);
      if (dragging.current === 'hour') {
        onAnglesChange(angle, minuteAngle);
      } else {
        const newMinuteAngle = angle;
        const minuteFraction = (angle % 360) / 360;
        const baseHourAngle = Math.round(hourAngle / 30) * 30;
        const adjustedHour = baseHourAngle + minuteFraction * 30;
        onAnglesChange(adjustedHour, newMinuteAngle);
      }
    };

    const handleUp = () => { dragging.current = null; };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [getAngleFromEvent, hourAngle, minuteAngle, onAnglesChange]);

  const glowClass = answerState === 'correct'
    ? 'animate-clock-glow'
    : answerState === 'wrong'
    ? 'animate-shake'
    : '';

  const formatDisplay = () => {
    const h = use24h ? clockTime.hours.toString().padStart(2, '0') : clockTime.hours.toString();
    const m = clockTime.minutes.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const cursorClass = interactive && !locked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default';

  return (
    <div className={`flex flex-col items-center gap-4 ${glowClass}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-110" />
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 select-none touch-none"
        >
          <circle cx="100" cy="100" r="97" fill="none" stroke="hsl(var(--clock-border))" strokeWidth="1" opacity="0.3" />

          <defs>
            <radialGradient id="clockFaceGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" />
              <stop offset="100%" stopColor="hsl(var(--clock-face))" />
            </radialGradient>
            <filter id="innerShadow">
              <feFlood floodColor="hsl(var(--clock-border))" floodOpacity="0.15" />
              <feComposite in2="SourceAlpha" operator="in" />
              <feGaussianBlur stdDeviation="3" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r="95" fill="url(#clockFaceGrad)" stroke="hsl(var(--clock-border))" strokeWidth="4" filter="url(#innerShadow)" />

          {Array.from({ length: 60 }).map((_, i) => {
            if (i % 5 === 0) return null;
            const angle = (i * 6 - 90) * Math.PI / 180;
            return (
              <line
                key={`mt-${i}`}
                x1={100 + Math.cos(angle) * 86}
                y1={100 + Math.sin(angle) * 86}
                x2={100 + Math.cos(angle) * 88}
                y2={100 + Math.sin(angle) * 88}
                stroke="hsl(var(--clock-tick))"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.5"
              />
            );
          })}

          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const outerR = 88;
            const innerR = i % 3 === 0 ? 74 : 78;
            return (
              <line
                key={i}
                x1={100 + Math.cos(angle) * innerR}
                y1={100 + Math.sin(angle) * innerR}
                x2={100 + Math.cos(angle) * outerR}
                y2={100 + Math.sin(angle) * outerR}
                stroke="hsl(var(--clock-tick))"
                strokeWidth={i % 3 === 0 ? 3.5 : 2}
                strokeLinecap="round"
              />
            );
          })}

          {Array.from({ length: 12 }).map((_, i) => {
            const num = i + 1;
            const angle = (num * 30 - 90) * Math.PI / 180;
            const r = 66;
            return (
              <text
                key={num}
                x={100 + Math.cos(angle) * r}
                y={100 + Math.sin(angle) * r + 6}
                textAnchor="middle"
                className="fill-foreground select-none pointer-events-none"
                style={{ fontSize: '16px', fontFamily: 'Fredoka, sans-serif', fontWeight: 700 }}
              >
                {num}
              </text>
            );
          })}

          <line
            x1="100" y1="100"
            x2={100 + Math.sin(minuteAngle * Math.PI / 180) * 62}
            y2={100 - Math.cos(minuteAngle * Math.PI / 180) * 62}
            stroke="hsl(var(--clock-minute-hand))"
            strokeWidth="4.5"
            strokeLinecap="round"
            className={cursorClass}
            onMouseDown={interactive ? handlePointerDown('minute') : undefined}
            onTouchStart={interactive ? handlePointerDown('minute') : undefined}
            style={{ pointerEvents: interactive ? 'stroke' : 'none' }}
          />
          <line
            x1="100" y1="100"
            x2={100 + Math.sin(minuteAngle * Math.PI / 180) * 62}
            y2={100 - Math.cos(minuteAngle * Math.PI / 180) * 62}
            stroke="transparent"
            strokeWidth="20"
            className={cursorClass}
            onMouseDown={interactive ? handlePointerDown('minute') : undefined}
            onTouchStart={interactive ? handlePointerDown('minute') : undefined}
            style={{ pointerEvents: interactive ? 'auto' : 'none' }}
          />

          <line
            x1="100" y1="100"
            x2={100 + Math.sin(hourAngle * Math.PI / 180) * 42}
            y2={100 - Math.cos(hourAngle * Math.PI / 180) * 42}
            stroke="hsl(var(--clock-hour-hand))"
            strokeWidth="7"
            strokeLinecap="round"
            className={cursorClass}
            onMouseDown={interactive ? handlePointerDown('hour') : undefined}
            onTouchStart={interactive ? handlePointerDown('hour') : undefined}
            style={{ pointerEvents: interactive ? 'stroke' : 'none' }}
          />
          <line
            x1="100" y1="100"
            x2={100 + Math.sin(hourAngle * Math.PI / 180) * 42}
            y2={100 - Math.cos(hourAngle * Math.PI / 180) * 42}
            stroke="transparent"
            strokeWidth="22"
            className={cursorClass}
            onMouseDown={interactive ? handlePointerDown('hour') : undefined}
            onTouchStart={interactive ? handlePointerDown('hour') : undefined}
            style={{ pointerEvents: interactive ? 'auto' : 'none' }}
          />

          {showSecondHand && (
            <line
              x1="100" y1="100"
              x2={100 + Math.sin(seconds * 6 * Math.PI / 180) * 58}
              y2={100 - Math.cos(seconds * 6 * Math.PI / 180) * 58}
              stroke="hsl(var(--destructive))"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ transition: 'all 0.3s ease' }}
            />
          )}

          <circle cx="100" cy="100" r="7" fill="hsl(var(--clock-center))" />
          <circle cx="100" cy="100" r="3.5" fill="hsl(var(--card))" opacity="0.8" />
          <circle cx="98" cy="98" r="2" fill="white" opacity="0.4" />
        </svg>
      </div>

      {showDigitalDisplay && (
        <div className="bg-card rounded-2xl px-6 py-3 shadow-md border border-border">
          <span className="font-heading text-2xl sm:text-3xl text-foreground tracking-wider">{formatDisplay()}</span>
        </div>
      )}
    </div>
  );
};

export default AnalogClock;
