import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const langMap = { en: 'en-IN', hi: 'hi-IN', or: 'or-IN' };

export const SpeakButton = ({ text, lang = 'en', className = '' }) => {
  const [playing, setPlaying] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
        playing
          ? 'bg-amber-500 text-slate-950 animate-pulse'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
      } ${className}`}
    >
      {playing ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span>{playing ? 'Playing...' : 'Listen'}</span>
    </button>
  );
};

export default SpeakButton;
