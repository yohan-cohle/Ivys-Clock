import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TimeValue, GameSettings, DEFAULT_SETTINGS,
  generateTime, generateOptions, getQuestionText,
  formatTime, timesMatch, timeToAngle, migrateSettings,
} from '@/lib/clockUtils';
import type { GameMode } from '@/lib/clockUtils';

export type TeacherMood = 'idle' | 'talking' | 'happy' | 'confused' | 'celebrating';

interface GameState {
  targetTime: TimeValue;
  questionText: string;
  options: string[];
  selectedOption: string | null;
  clockTime: TimeValue;
  hourAngle: number;
  minuteAngle: number;
  teacherMood: TeacherMood;
  answerState: 'waiting' | 'correct' | 'wrong';
  roundLocked: boolean;
  showConfetti: boolean;
  roundCount: number;
}

export function useClockGame() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('clock-game-settings');
      return saved ? migrateSettings(JSON.parse(saved)) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const moodTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const customTimeIndexRef = useRef(0);
  const lastTimeRef = useRef<TimeValue | null>(null);
  const usedQuestionsRef = useRef<Set<string>>(new Set());

  const createRound = useCallback((s: GameSettings): Pick<GameState, 'targetTime' | 'questionText' | 'options'> => {
    const result = generateTime(s, customTimeIndexRef.current, lastTimeRef.current, usedQuestionsRef.current);
    const targetTime = result.time;

    // Update tracking refs
    if (result.nextCustomIndex !== undefined) {
      customTimeIndexRef.current = result.nextCustomIndex;
    }
    lastTimeRef.current = targetTime;

    const key = `${targetTime.hours}:${targetTime.minutes}`;
    usedQuestionsRef.current.add(key);

    // Reset used questions set when it gets too large (ensures eventual full coverage)
    const maxTracked = s.customTimes.length > 0 ? s.customTimes.length : 30;
    if (usedQuestionsRef.current.size >= maxTracked) {
      usedQuestionsRef.current.clear();
      usedQuestionsRef.current.add(key);
    }

    const questionText = getQuestionText(targetTime, s.questionSettings, s.use24h, s.gameMode);
    const options = generateOptions(targetTime, s.use24h);
    return { targetTime, questionText, options };
  }, []);

  const initRoundState = useCallback((round: Pick<GameState, 'targetTime' | 'questionText' | 'options'>, s: GameSettings): Partial<GameState> => {
    const mode = s.gameMode;
    if (mode === 'pointer' || mode === 'demonstration') {
      const hAngle = timeToAngle(round.targetTime.hours, true) + timeToAngle(round.targetTime.minutes, false) / 12;
      const mAngle = timeToAngle(round.targetTime.minutes, false);
      return {
        clockTime: { hours: round.targetTime.hours, minutes: round.targetTime.minutes },
        hourAngle: hAngle,
        minuteAngle: mAngle,
      };
    }
    return {
      clockTime: { hours: 12, minutes: 0 },
      hourAngle: 0,
      minuteAngle: 0,
    };
  }, []);

  const [state, setState] = useState<GameState>(() => {
    const round = createRound(settings);
    const modeState = initRoundState(round, settings);
    return {
      ...round,
      selectedOption: null,
      clockTime: modeState.clockTime || { hours: 12, minutes: 0 },
      hourAngle: modeState.hourAngle || 0,
      minuteAngle: modeState.minuteAngle || 0,
      teacherMood: 'talking',
      answerState: 'waiting',
      roundLocked: false,
      showConfetti: false,
      roundCount: 0,
    };
  });

  // Save settings to localStorage (teacher options persist)
  useEffect(() => {
    localStorage.setItem('clock-game-settings', JSON.stringify(settings));
  }, [settings]);

  // Clean up old score localStorage keys
  useEffect(() => {
    localStorage.removeItem('clock-score');
    localStorage.removeItem('clock-streak');
    localStorage.removeItem('clock-best-streak');
  }, []);

  useEffect(() => {
    if (state.answerState === 'waiting') {
      setState(s => ({ ...s, teacherMood: 'talking' }));
      moodTimeoutRef.current = setTimeout(() => {
        setState(s => s.answerState === 'waiting' ? { ...s, teacherMood: 'idle' } : s);
      }, 2000);
    }
    return () => { if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current); };
  }, [state.targetTime]);

  const setClockAngles = useCallback((hourAngle: number, minuteAngle: number) => {
    let hour = Math.round(((hourAngle % 360 + 360) % 360) / 30) % 12;
    if (hour === 0) hour = 12;
    let minute = Math.round(((minuteAngle % 360 + 360) % 360) / 6) % 60;
    setState(s => s.roundLocked ? s : {
      ...s,
      hourAngle,
      minuteAngle,
      clockTime: { hours: hour, minutes: minute },
    });
  }, []);

  const selectOption = useCallback((option: string) => {
    setState(s => s.roundLocked ? s : { ...s, selectedOption: option });
  }, []);

  const checkAnswer = useCallback(() => {
    setState(s => {
      if (s.roundLocked) return s;

      const mode = settings.gameMode;
      let isCorrect: boolean;

      if (mode === 'demonstration') {
        isCorrect = true;
      } else if (mode === 'digital-only') {
        isCorrect = s.selectedOption === formatTime(s.targetTime, settings.use24h);
      } else if (mode === 'pointer') {
        isCorrect = s.selectedOption === formatTime(s.targetTime, settings.use24h);
      } else {
        const clockCorrect = timesMatch(s.clockTime, s.targetTime);
        const optionCorrect = !settings.multipleChoiceEnabled || s.selectedOption === formatTime(s.targetTime, settings.use24h);

        if (settings.dragOnlyMode) {
          isCorrect = clockCorrect;
        } else if (settings.multipleChoiceEnabled) {
          isCorrect = clockCorrect && optionCorrect;
        } else {
          isCorrect = clockCorrect;
        }
      }

      const newRoundCount = s.roundCount + 1;
      const showConfetti = isCorrect && newRoundCount > 0 && newRoundCount % 5 === 0;

      return {
        ...s,
        answerState: isCorrect ? 'correct' : 'wrong',
        teacherMood: isCorrect ? (showConfetti ? 'celebrating' : 'happy') : 'confused',
        roundLocked: true,
        showConfetti,
        roundCount: newRoundCount,
      };
    });
  }, [settings]);

  const nextRound = useCallback(() => {
    const round = createRound(settings);
    const modeState = initRoundState(round, settings);
    setState(s => ({
      ...s,
      ...round,
      selectedOption: null,
      clockTime: modeState.clockTime || { hours: 12, minutes: 0 },
      hourAngle: modeState.hourAngle || 0,
      minuteAngle: modeState.minuteAngle || 0,
      answerState: 'waiting',
      roundLocked: false,
      showConfetti: false,
      teacherMood: 'talking',
    }));
  }, [settings, createRound, initRoundState]);

  const updateSettings = useCallback((newSettings: GameSettings) => {
    // Reset custom time index when custom times change
    if (JSON.stringify(newSettings.customTimes) !== JSON.stringify(settings.customTimes)) {
      customTimeIndexRef.current = 0;
      usedQuestionsRef.current.clear();
      lastTimeRef.current = null;
    }
    setSettings(newSettings);
  }, [settings]);

  return {
    state,
    settings,
    setClockAngles,
    selectOption,
    checkAnswer,
    nextRound,
    updateSettings,
  };
}
