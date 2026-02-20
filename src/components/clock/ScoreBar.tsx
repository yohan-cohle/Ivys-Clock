import React from 'react';

interface ScoreBarProps {
  onSettingsClick: () => void;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ onSettingsClick }) => {
  return (
    <div className="flex items-center justify-end w-full max-w-4xl px-2">
      <button
        onClick={onSettingsClick}
        className="bg-card rounded-2xl px-4 py-3 shadow-md border border-border text-2xl hover:scale-105 active:scale-95 transition-transform"
      >
        ⚙️
      </button>
    </div>
  );
};

export default ScoreBar;
