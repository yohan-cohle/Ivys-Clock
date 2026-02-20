import React, { useState, useRef } from 'react';
import type { GameSettings, GameMode, TimeValue } from '@/lib/clockUtils';
import { DEFAULT_SETTINGS } from '@/lib/clockUtils';

interface SettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  open: boolean;
  onClose: () => void;
}

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-2 cursor-pointer">
    <span className="font-body text-sm text-foreground">{label}</span>
    <div
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 cursor-pointer ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </label>
);

const GAME_MODES: { value: GameMode; label: string; emoji: string; description: string }[] = [
  { value: 'interactive', label: 'Interactive', emoji: '🖐️', description: 'Drag clock hands + pick digital answer' },
  { value: 'pointer', label: 'Pointer', emoji: '👆', description: 'Read the analog clock; pick digital answer' },
  { value: 'digital-only', label: 'Digital Only', emoji: '🔢', description: 'No analog clock; pick digital answer' },
  { value: 'demonstration', label: 'Demo', emoji: '🎓', description: 'Teacher-controlled; click Next to proceed' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const MAX_CUSTOM_TIMES = 10;

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, open, onClose }) => {
  const [tab, setTab] = useState<'general' | 'questions' | 'mode'>('general');
  const [newHour, setNewHour] = useState(3);
  const [newMinute, setNewMinute] = useState(0);
  const initialSettingsRef = useRef<GameSettings>(settings);

  React.useEffect(() => {
    if (open) {
      initialSettingsRef.current = settings;
    }
  }, [open]);

  if (!open) return null;

  const update = (partial: Partial<GameSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const updateQuestion = (partial: Partial<GameSettings['questionSettings']>) => {
    update({ questionSettings: { ...settings.questionSettings, ...partial } });
  };

  const updateQuestionTypes = (partial: Partial<GameSettings['questionSettings']['questionTypes']>) => {
    updateQuestion({ questionTypes: { ...settings.questionSettings.questionTypes, ...partial } });
  };

  const addCustomTime = () => {
    if (settings.customTimes.length >= MAX_CUSTOM_TIMES) return;
    const exists = settings.customTimes.some(t => t.hours === newHour && t.minutes === newMinute);
    if (exists) return;
    update({ customTimes: [...settings.customTimes, { hours: newHour, minutes: newMinute }] });
  };

  const removeCustomTime = (index: number) => {
    const newTimes = settings.customTimes.filter((_, i) => i !== index);
    update({ customTimes: newTimes });
  };

  const handleReset = () => {
    const resetSettings: GameSettings = {
      ...DEFAULT_SETTINGS,
      customTimes: settings.customTimes,
    };
    onSettingsChange(resetSettings);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-md max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-xl text-foreground">⚙️ Settings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="font-body text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              title="Reset settings to defaults (keeps custom times)"
            >
              🔄 Reset
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('general')}
            className={`flex-1 py-3 font-heading text-sm transition-colors ${
              tab === 'general' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            ⚙️ General
          </button>
          <button
            onClick={() => setTab('mode')}
            className={`flex-1 py-3 font-heading text-sm transition-colors ${
              tab === 'mode' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            🎮 Mode
          </button>
          <button
            onClick={() => setTab('questions')}
            className={`flex-1 py-3 font-heading text-sm transition-colors ${
              tab === 'questions' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            📘 Questions
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-1">
          {tab === 'general' ? (
            <>
              <Toggle label="24-hour format" checked={settings.use24h} onChange={v => update({ use24h: v })} />
              <Toggle label="Digital display" checked={settings.showDigitalDisplay} onChange={v => update({ showDigitalDisplay: v })} />
              <Toggle label="Second hand" checked={settings.showSecondHand} onChange={v => update({ showSecondHand: v })} />
              <Toggle label="Sound effects" checked={settings.soundEnabled} onChange={v => update({ soundEnabled: v })} />
              <Toggle label="Timer" checked={settings.timerEnabled} onChange={v => update({ timerEnabled: v })} />
              <Toggle label="Multiple choice" checked={settings.multipleChoiceEnabled} onChange={v => update({ multipleChoiceEnabled: v })} />
              <Toggle label="Drag-only mode" checked={settings.dragOnlyMode} onChange={v => update({ dragOnlyMode: v })} />
            </>
          ) : tab === 'mode' ? (
            <div className="space-y-3">
              <p className="font-body text-sm text-muted-foreground">Choose how the clock game works:</p>
              {GAME_MODES.map(mode => (
                <label
                  key={mode.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    settings.gameMode === mode.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/30 hover:bg-primary/5'
                  }`}
                  onClick={() => update({ gameMode: mode.value })}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    settings.gameMode === mode.value ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {settings.gameMode === mode.value && (
                      <div className="w-2 h-2 rounded-full bg-card" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-heading text-sm text-foreground flex items-center gap-1.5">
                      <span>{mode.emoji}</span>
                      <span>{mode.label}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {/* Custom Times Picker */}
                <div className="border border-border rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm text-foreground">🕐 Specific times</span>
                    <span className="font-body text-xs text-muted-foreground">
                      {settings.customTimes.length}/{MAX_CUSTOM_TIMES}
                    </span>
                  </div>

                  {settings.customTimes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="font-body text-xs text-muted-foreground">
                        Questions will run in this order (1 → 2 → 3…), then loop:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {settings.customTimes.map((t, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5"
                          >
                            <span className="font-body text-xs text-muted-foreground mr-0.5">{i + 1}.</span>
                            <span className="font-heading text-sm text-foreground">
                              {t.hours}:{t.minutes.toString().padStart(2, '0')}
                            </span>
                            <button
                              onClick={() => removeCustomTime(i)}
                              className="text-muted-foreground hover:text-destructive text-xs leading-none ml-0.5"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings.customTimes.length < MAX_CUSTOM_TIMES && (
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="font-body text-xs text-muted-foreground block mb-1">Hour</label>
                        <select
                          value={newHour}
                          onChange={e => setNewHour(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-heading text-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {HOURS.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <span className="font-heading text-2xl text-foreground pb-1.5">:</span>
                      <div className="flex-1">
                        <label className="font-body text-xs text-muted-foreground block mb-1">Minute</label>
                        <select
                          value={newMinute}
                          onChange={e => setNewMinute(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-heading text-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {MINUTES.map(m => (
                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={addCustomTime}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-heading text-sm hover:scale-105 active:scale-95 transition-transform shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  )}

                  {settings.customTimes.length === 0 && (
                    <p className="font-body text-xs text-muted-foreground">
                      Add specific times to practice. Without any, questions use random times based on the types below.
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-heading text-sm text-foreground block mb-2">Question phrasing</label>
                  <div className="space-y-2">
                    {[
                      { value: 'set' as const, label: '"Set the clock to…"' },
                      { value: 'show' as const, label: '"Can you make the clock show…"' },
                      { value: 'what' as const, label: '"What time is…"' },
                      { value: 'custom' as const, label: 'Custom text' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => updateQuestion({ phraseStyle: opt.value })}
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            settings.questionSettings.phraseStyle === opt.value
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          }`}
                        >
                          {settings.questionSettings.phraseStyle === opt.value && (
                            <div className="w-1.5 h-1.5 rounded-full bg-card" />
                          )}
                        </div>
                        <span className="font-body text-sm text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {settings.questionSettings.phraseStyle === 'custom' && (
                    <input
                      type="text"
                      value={settings.questionSettings.customPhrase}
                      onChange={e => updateQuestion({ customPhrase: e.target.value })}
                      placeholder="Enter custom phrase..."
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <label className="font-heading text-sm text-foreground block mb-2">Question types</label>
                  <Toggle label="Hour only" checked={settings.questionSettings.questionTypes.hourOnly} onChange={v => updateQuestionTypes({ hourOnly: v })} />
                  <Toggle label="Half past" checked={settings.questionSettings.questionTypes.halfPast} onChange={v => updateQuestionTypes({ halfPast: v })} />
                  <Toggle label="Quarter past" checked={settings.questionSettings.questionTypes.quarterPast} onChange={v => updateQuestionTypes({ quarterPast: v })} />
                  <Toggle label="Quarter to" checked={settings.questionSettings.questionTypes.quarterTo} onChange={v => updateQuestionTypes({ quarterTo: v })} />
                  <Toggle label="Any minute (×5)" checked={settings.questionSettings.questionTypes.anyMinute} onChange={v => updateQuestionTypes({ anyMinute: v })} />
                  <Toggle label="Random mix" checked={settings.questionSettings.questionTypes.randomMix} onChange={v => updateQuestionTypes({ randomMix: v })} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
