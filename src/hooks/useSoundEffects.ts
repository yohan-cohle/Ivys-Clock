import { useCallback, useRef } from 'react';

export function useSoundEffects(enabled: boolean) {
  const audioCtx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [enabled, getCtx]);

  const playCorrect = useCallback(() => {
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 100);
    setTimeout(() => playTone(784, 0.3), 200);
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone(300, 0.2, 'square');
    setTimeout(() => playTone(250, 0.3, 'square'), 150);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(800, 0.05, 'sine');
  }, [playTone]);

  const playMilestone = useCallback(() => {
    [523, 587, 659, 784, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2), i * 100);
    });
  }, [playTone]);

  return { playCorrect, playWrong, playClick, playMilestone };
}
