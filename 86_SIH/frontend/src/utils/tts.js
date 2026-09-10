/**
 * Universal Text-to-Speech (TTS) Utility
 * Supports Odia (or), Hindi (hi), and English (en) audio synthesis.
 * Uses Google Translate Audio API for natural pronunciation across all OS/Browsers,
 * with automatic fallback to Web Speech API (window.speechSynthesis).
 */

let currentAudio = null;

export const playTextToSpeech = ({ text, lang = 'en', onStart, onEnd, onError }) => {
  if (!text) return;

  // Stop any active playing audio or browser speech
  stopTextToSpeech();

  // Clean text and limit to 180 chars for fast HTTP audio streaming
  const cleanText = text.replace(/[\n\r]+/g, ' ').replace(/[#*_`]/g, '').trim().slice(0, 180);
  const langCode = lang === 'or' ? 'or' : lang === 'hi' ? 'hi' : 'en';

  // Primary: Google Translate Audio API (works on Windows, Mac, Android, iOS for Odia/Hindi/English)
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${langCode}&client=tw-ob`;

  const audio = new Audio();
  currentAudio = audio;

  audio.onplay = () => {
    if (onStart) onStart();
  };

  audio.onended = () => {
    currentAudio = null;
    if (onEnd) onEnd();
  };

  const fallbackToWebSpeech = () => {
    currentAudio = null;
    if (!('speechSynthesis' in window)) {
      if (onError) onError();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'or' ? 'or-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.85;
      utterance.pitch = 1;

      utterance.onstart = () => { if (onStart) onStart(); };
      utterance.onend = () => { if (onEnd) onEnd(); };
      utterance.onerror = () => { if (onError) onError(); };

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const match = voices.find(v => v.lang.startsWith(lang));
        if (match) utterance.voice = match;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (onError) onError();
    }
  };

  audio.onerror = () => {
    fallbackToWebSpeech();
  };

  audio.src = ttsUrl;
  audio.play().catch(() => {
    fallbackToWebSpeech();
  });
};

export const stopTextToSpeech = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};
