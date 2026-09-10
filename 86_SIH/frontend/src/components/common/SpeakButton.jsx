import React, { useState } from 'react';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';

const langMap = { en: 'en-IN', hi: 'hi-IN', or: 'or-IN' };

export const SpeakButton = ({ text, lang = 'en', t, className = '' }) => {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const label = t?.listen || 'Listen';
  const playingLabel = t?.playing || 'Playing...';

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) { setError(true); return; }

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    setError(false);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = langMap[lang] || 'en-IN';
    utterance.lang = langCode;
    utterance.rate = 0.85;
    utterance.pitch = 1;

    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const match = voices.find(v => v.lang.startsWith(lang));
        if (match) utterance.voice = match;
      }
    } catch (e) { /* ignore */ }

    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => { setPlaying(false); setError(true); };

    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  if (error && !playing) {
    return (
      <button
        onClick={handleSpeak}
        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md bg-yellow-600 hover:bg-yellow-500 text-white ${className}`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>{lang === 'hi' ? 'पुनः प्रयास' : lang === 'or' ? 'ପୁଣି ଚେଷ୍ଟା' : 'Retry Voice'}</span>
      </button>
    );
  }

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
      <span>{playing ? playingLabel : label}</span>
    </button>
  );
};

export default SpeakButton;
