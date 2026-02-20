import React, { useState, useCallback, useEffect } from 'react';
import { useClockGame } from '@/hooks/useClockGame';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import AnalogClock from '@/components/clock/AnalogClock';
import TeacherMascot from '@/components/clock/TeacherMascot';
import SpeechBubble from '@/components/clock/SpeechBubble';
import MultipleChoice from '@/components/clock/MultipleChoice';
import Confetti from '@/components/clock/Confetti';
import SettingsPanel from '@/components/clock/SettingsPanel';
import ScoreBar from '@/components/clock/ScoreBar';
import { formatTime } from '@/lib/clockUtils';

const Index = () => {
  const { state, settings, setClockAngles, selectOption, checkAnswer, nextRound, updateSettings } = useClockGame();
  const { playCorrect, playWrong, playClick, playMilestone } = useSoundEffects(settings.soundEnabled);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const gameMode = settings.gameMode;
  const isDigitalOnly = gameMode === 'digital-only';
  const isPointerMode = gameMode === 'pointer';
  const isDemoMode = gameMode === 'demonstration';
  const showAnalogClock = !isDigitalOnly;
  const clockInteractive = gameMode === 'interactive';
  const showMultipleChoice = gameMode !== 'interactive' || (settings.multipleChoiceEnabled && !settings.dragOnlyMode);

  const handleOptionSelect = useCallback((option: string) => {
    playClick();
    selectOption(option);
  }, [playClick, selectOption]);

  const handleCheck = useCallback(() => {
    playClick();
    checkAnswer();
  }, [playClick, checkAnswer]);

  // Auto-advance after answer ONLY for non-demo modes
  useEffect(() => {
    if (isDemoMode) return;
    if (state.answerState === 'correct') {
      if (state.showConfetti) {
        playMilestone();
      } else {
        playCorrect();
      }
      const timer = setTimeout(nextRound, 2000);
      return () => clearTimeout(timer);
    } else if (state.answerState === 'wrong') {
      playWrong();
      const timer = setTimeout(nextRound, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.answerState, state.showConfetti, isDemoMode]);

  // Play sounds for demo mode (but don't auto-advance)
  useEffect(() => {
    if (!isDemoMode) return;
    if (state.answerState === 'correct') {
      if (state.showConfetti) {
        playMilestone();
      } else {
        playCorrect();
      }
    } else if (state.answerState === 'wrong') {
      playWrong();
    }
  }, [state.answerState, state.showConfetti, isDemoMode]);

  const correctOptionStr = formatTime(state.targetTime, settings.use24h);

  return (
    <div className="min-h-screen bg-game-gradient flex flex-col items-center px-4 py-6 gap-6 overflow-hidden relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-[10%] w-24 h-14 bg-card/40 rounded-full blur-sm animate-cloud" />
        <div className="absolute top-20 right-[15%] w-32 h-16 bg-card/30 rounded-full blur-sm animate-cloud" style={{ animationDelay: '3s' }} />
        <div className="absolute top-6 left-[60%] w-20 h-12 bg-card/25 rounded-full blur-sm animate-cloud" style={{ animationDelay: '7s' }} />
        {/* Doodle shapes */}
        <div className="absolute bottom-20 left-[5%] text-4xl opacity-10 animate-breathe">⭐</div>
        <div className="absolute bottom-40 right-[8%] text-3xl opacity-10 animate-breathe" style={{ animationDelay: '1s' }}>✏️</div>
        <div className="absolute top-[40%] left-[3%] text-3xl opacity-10 animate-breathe" style={{ animationDelay: '2s' }}>🕐</div>
        <div className="absolute top-[35%] right-[4%] text-3xl opacity-10 animate-breathe" style={{ animationDelay: '1.5s' }}>📖</div>
      </div>

      {/* Confetti */}
      <Confetti active={state.showConfetti} />

      {/* Settings button */}
      <div className="relative z-10 w-full flex justify-center">
        <ScoreBar
          onSettingsClick={() => setSettingsOpen(true)}
        />
      </div>

      {/* Main game area */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 w-full max-w-4xl justify-center flex-1">
        {/* Teacher + Speech bubble */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <SpeechBubble
            text={state.questionText}
            visible={true}
          />
          <TeacherMascot mood={state.teacherMood} />
        </div>

        {/* Clock */}
        {showAnalogClock && (
          <div className="flex flex-col items-center gap-4">
            <AnalogClock
              hourAngle={state.hourAngle}
              minuteAngle={state.minuteAngle}
              showSecondHand={settings.showSecondHand}
              showDigitalDisplay={settings.showDigitalDisplay}
              clockTime={state.clockTime}
              use24h={settings.use24h}
              onAnglesChange={setClockAngles}
              answerState={state.answerState}
              locked={state.roundLocked}
              interactive={clockInteractive}
            />
          </div>
        )}
      </div>

      {/* Multiple choice options */}
      {showMultipleChoice && (
        <div className="relative z-10 flex flex-col items-center gap-3 w-full">
          <MultipleChoice
            options={state.options}
            selectedOption={state.selectedOption}
            correctOption={correctOptionStr}
            answerState={state.answerState}
            onSelect={handleOptionSelect}
            disabled={state.roundLocked}
          />
        </div>
      )}

      {/* Check / Next button */}
      <div className="relative z-10 pb-4">
        {state.answerState === 'waiting' ? (
          <button
            onClick={handleCheck}
            className="font-heading text-xl px-10 py-4 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            ✅ Check Answer
          </button>
        ) : (
          isDemoMode ? (
            <button
              onClick={nextRound}
              className="font-heading text-xl px-10 py-4 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ➡️ Next
            </button>
          ) : (
            <button
              onClick={nextRound}
              className={`font-heading text-xl px-10 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ${
                state.answerState === 'correct'
                  ? 'bg-correct text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {state.answerState === 'correct' ? '🎉 Next!' : '➡️ Try Again'}
            </button>
          )
        )}
      </div>

      {/* Settings panel */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={updateSettings}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
