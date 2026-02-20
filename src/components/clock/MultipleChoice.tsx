import React from 'react';

interface MultipleChoiceProps {
  options: string[];
  selectedOption: string | null;
  correctOption: string;
  answerState: 'waiting' | 'correct' | 'wrong';
  onSelect: (option: string) => void;
  disabled: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options, selectedOption, correctOption, answerState, onSelect, disabled,
}) => {
  const getButtonClasses = (option: string, index: number) => {
    const base = 'font-heading text-xl sm:text-2xl px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border-2 transition-all duration-200 shadow-md select-none';

    if (answerState !== 'waiting') {
      if (option === correctOption) {
        return `${base} bg-correct/15 border-correct text-correct animate-bounce-correct animate-glow-correct shadow-lg`;
      }
      if (option === selectedOption && option !== correctOption) {
        return `${base} bg-wrong/15 border-wrong text-wrong animate-shake`;
      }
      return `${base} bg-muted border-border text-muted-foreground opacity-40`;
    }

    if (option === selectedOption) {
      return `${base} bg-primary/15 border-primary text-primary ring-2 ring-primary/30 scale-105 shadow-lg`;
    }

    return `${base} bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:scale-105 hover:shadow-lg hover:-translate-y-1 active:scale-95`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 w-full max-w-3xl">
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => !disabled && onSelect(option)}
          disabled={disabled}
          className={getButtonClasses(option, i)}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultipleChoice;
