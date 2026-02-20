import React from 'react';

interface SpeechBubbleProps {
  text: string;
  visible: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, visible }) => {
  if (!visible) return null;

  return (
    <div className="animate-bubble-enter animate-bubble-float relative">
      <div className="bg-card rounded-3xl px-6 py-4 shadow-xl border border-border max-w-[280px]">
        <p className="font-heading text-base sm:text-lg text-foreground leading-snug text-center">{text}</p>
      </div>
      {/* Tail */}
      <div className="absolute -bottom-3 left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-card drop-shadow-sm" />
    </div>
  );
};

export default SpeechBubble;
