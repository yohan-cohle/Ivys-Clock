// Clock utility functions

export interface TimeValue {
  hours: number;
  minutes: number;
}

export interface QuestionSettings {
  phraseStyle: 'set' | 'show' | 'what' | 'custom';
  customPhrase: string;
  questionTypes: {
    hourOnly: boolean;
    halfPast: boolean;
    quarterPast: boolean;
    quarterTo: boolean;
    anyMinute: boolean;
    randomMix: boolean;
  };
}

export type GameMode = 'interactive' | 'pointer' | 'digital-only' | 'demonstration';

export interface GameSettings {
  use24h: boolean;
  showDigitalDisplay: boolean;
  showSecondHand: boolean;
  soundEnabled: boolean;
  timerEnabled: boolean;
  multipleChoiceEnabled: boolean;
  dragOnlyMode: boolean;
  gameMode: GameMode;
  questionSettings: QuestionSettings;
  customTimes: TimeValue[];
}

export const DEFAULT_SETTINGS: GameSettings = {
  use24h: false,
  showDigitalDisplay: true,
  showSecondHand: false,
  soundEnabled: true,
  timerEnabled: false,
  multipleChoiceEnabled: true,
  dragOnlyMode: false,
  gameMode: 'interactive',
  questionSettings: {
    phraseStyle: 'show',
    customPhrase: '',
    questionTypes: {
      hourOnly: true,
      halfPast: true,
      quarterPast: true,
      quarterTo: true,
      anyMinute: true,
      randomMix: true,
    },
  },
  customTimes: [],
};

/**
 * Generate a time based on settings.
 * If customTimes are set, use the provided customTimeIndex (sequential).
 * Otherwise, use question type settings with improved randomization.
 */
export function generateTime(
  settings: GameSettings,
  customTimeIndex?: number,
  lastTime?: TimeValue | null,
  usedQuestions?: Set<string>
): { time: TimeValue; nextCustomIndex?: number } {
  // If custom times are set, run in sequence
  if (settings.customTimes.length > 0) {
    const idx = (customTimeIndex ?? 0) % settings.customTimes.length;
    return {
      time: { ...settings.customTimes[idx] },
      nextCustomIndex: (idx + 1) % settings.customTimes.length,
    };
  }

  const types = settings.questionSettings.questionTypes;
  const enabledTypes: string[] = [];

  if (types.hourOnly) enabledTypes.push('hourOnly');
  if (types.halfPast) enabledTypes.push('halfPast');
  if (types.quarterPast) enabledTypes.push('quarterPast');
  if (types.quarterTo) enabledTypes.push('quarterTo');
  if (types.anyMinute) enabledTypes.push('anyMinute');

  if (enabledTypes.length === 0 || types.randomMix) {
    enabledTypes.length = 0;
    enabledTypes.push('hourOnly', 'halfPast', 'quarterPast', 'quarterTo', 'anyMinute');
  }

  // Improved random: try up to 20 times to avoid repeating the same question
  let bestTime: TimeValue | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const type = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    const hours = Math.floor(Math.random() * 12) + 1;
    let time: TimeValue;

    switch (type) {
      case 'hourOnly': time = { hours, minutes: 0 }; break;
      case 'halfPast': time = { hours, minutes: 30 }; break;
      case 'quarterPast': time = { hours, minutes: 15 }; break;
      case 'quarterTo': time = { hours, minutes: 45 }; break;
      case 'anyMinute': time = { hours, minutes: Math.floor(Math.random() * 12) * 5 }; break;
      default: time = { hours, minutes: 0 };
    }

    const key = `${time.hours}:${time.minutes}`;

    // On first attempt with no history, just use it
    if (!lastTime && (!usedQuestions || usedQuestions.size === 0)) {
      return { time };
    }

    // Avoid immediate repeat
    if (lastTime && time.hours === lastTime.hours && time.minutes === lastTime.minutes) {
      continue;
    }

    // Prefer questions not recently used
    if (usedQuestions && usedQuestions.has(key) && attempt < 15) {
      bestTime = bestTime || time; // keep as fallback
      continue;
    }

    return { time };
  }

  // Fallback: use best non-immediate-repeat or generate fresh
  return { time: bestTime || { hours: Math.floor(Math.random() * 12) + 1, minutes: 0 } };
}

export function formatTime(time: TimeValue, use24h: boolean): string {
  const m = time.minutes.toString().padStart(2, '0');
  if (use24h) {
    return `${time.hours.toString().padStart(2, '0')}:${m}`;
  }
  return `${time.hours}:${m}`;
}

export function generateOptions(correct: TimeValue, use24h: boolean): string[] {
  const correctStr = formatTime(correct, use24h);
  const options = new Set<string>([correctStr]);

  while (options.size < 5) {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5;
    const opt = formatTime({ hours: h, minutes: m }, use24h);
    if (opt !== correctStr) options.add(opt);
  }

  return shuffleArray(Array.from(options));
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getQuestionText(time: TimeValue, settings: QuestionSettings, use24h: boolean, gameMode?: GameMode): string {
  const hideTime = gameMode === 'pointer' || settings.phraseStyle === 'custom';

  if (hideTime) {
    if (settings.phraseStyle === 'custom' && settings.customPhrase) {
      return settings.customPhrase;
    }
    const prompts = [
      'What time does the clock show?',
      'Can you read this clock?',
      'What time is it?',
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  const timeStr = formatTime(time, use24h);
  switch (settings.phraseStyle) {
    case 'set': return `Set the clock to ${timeStr}!`;
    case 'show': return `Can you make the clock show ${timeStr}?`;
    case 'what': return `What time is ${timeStr}?`;
    default: return `Can you make the clock show ${timeStr}?`;
  }
}

export function angleToTime(angleDeg: number, isHour: boolean): number {
  let normalized = ((angleDeg % 360) + 360) % 360;
  if (isHour) {
    return Math.round(normalized / 30) % 12 || 12;
  }
  return Math.round(normalized / 6) % 60;
}

export function timeToAngle(value: number, isHour: boolean): number {
  if (isHour) {
    return (value % 12) * 30;
  }
  return value * 6;
}

export function timesMatch(a: TimeValue, b: TimeValue): boolean {
  return a.hours === b.hours && a.minutes === b.minutes;
}

// Migration helper
export function migrateSettings(saved: any): GameSettings {
  const settings = { ...DEFAULT_SETTINGS, ...saved };
  if (saved.customTime && !saved.customTimes) {
    settings.customTimes = [saved.customTime];
  }
  delete (settings as any).customTime;
  if (!Array.isArray(settings.customTimes)) {
    settings.customTimes = [];
  }
  return settings;
}
