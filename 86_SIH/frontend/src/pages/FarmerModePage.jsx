import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/localization';
import { 
  Sprout, 
  CloudRain, 
  SunMedium, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  PhoneCall, 
  Share2,
  ChevronDown,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const FarmerModePage = () => {
  const { 
    farmerLanguage, 
    setFarmerLanguage,
    selectedBlock,
    selectedDistrict,
    selectedCrop,
    setSelectedCrop,
    forecastData,
    setActiveTab
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  const t = translations[farmerLanguage] || translations.en;

  const m = forecastData?.metrics || {
    onset_probability: 0.76,
    break_probability: 0.68,
    heavy_rain_probability: 0.29,
    expected_rainfall_mm: 54.0,
    soil_moisture_level: 'Low'
  };

  // Determine farmer friendly advice text
  const getTodayAdviceText = () => {
    if (m.break_probability >= 0.60) return t.cautionMessage;
    if (m.heavy_rain_probability >= 0.60) return t.drainageMessage;
    if (m.onset_probability >= 0.70) return t.proceedMessage;
    return t.irrigationMessage;
  };

  const [ttsError, setTtsError] = useState(false);

  const langMap = { en: 'en-IN', hi: 'hi-IN', or: 'or-IN' };

  const handleAudioPlay = () => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      setTimeout(() => setIsPlayingAudio(false), 4000);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    setTtsError(false);

    const textToRead = `${t.appTitle}. ${t.location}: ${selectedBlock}. ${t.todayAdvice}: ${getTodayAdviceText()}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const langCode = langMap[farmerLanguage] || 'en-IN';
    utterance.lang = langCode;
    utterance.rate = 0.85;
    utterance.pitch = 1;

    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const match = voices.find(v => v.lang.startsWith(farmerLanguage));
        if (match) utterance.voice = match;
      }
    } catch (e) { /* ignore */ }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setTtsError(true);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 px-3 py-4 sm:p-6 flex flex-col items-center">
      
      {/* Mobile-Friendly Main Container */}
      <div className="w-full max-w-md space-y-4 font-sans">
        
        {/* Top Header Card */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-2xl shadow-inner">
              🌾
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-tight flex items-center gap-1.5 font-sans">
                {t.appTitle || t.fmAppTitle || "Monsoon Saathi"}
              </h1>
              <p className="text-xs text-emerald-100 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
                <span>📍 {selectedBlock} ({selectedDistrict})</span>
              </p>
            </div>
          </div>

          {/* Language Switch Pills */}
          <div className="flex items-center bg-emerald-950/70 border border-emerald-600/60 rounded-xl p-1 text-xs">
            {['en', 'hi', 'or'].map((lang) => (
              <button
                key={lang}
                onClick={() => setFarmerLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  farmerLanguage === lang
                    ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'ଓ'}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Quick Status Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center">
          
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 space-y-1 shadow-md">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.rainfallStatus || t.fmRainfallStatus || "Rainfall Outlook"}
            </div>
            <div className="text-sm font-black text-sky-300 font-sans">
              {m.expected_rainfall_mm} <span className="text-[10px] font-medium text-slate-400">mm</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              {m.break_probability >= 0.60 ? 'Irregular' : 'Favorable'}
            </div>
          </div>

          <div className="rounded-2xl bg-orange-950/40 border border-orange-800/60 p-3 space-y-1 shadow-md">
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
              {t.sowingRisk || t.fmSowingRisk || "Sowing Risk"}
            </div>
            <div className="text-sm font-black text-orange-300">
              {m.break_probability >= 0.60 ? (t.high || "High") : (t.moderate || "Moderate")}
            </div>
            <div className="text-[10px] text-orange-400/80 font-semibold">
              {m.break_probability >= 0.60 ? 'Caution' : 'Optimal'}
            </div>
          </div>

          <div className="rounded-2xl bg-rose-950/40 border border-rose-800/60 p-3 space-y-1 shadow-md">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              {t.drySpellRisk || t.fmDrySpellRisk || "Dry Spell Risk"}
            </div>
            <div className="text-sm font-black text-rose-300 font-sans">
              {Math.round(m.break_probability * 100)}%
            </div>
            <div className="text-[10px] text-rose-400/80 font-semibold">
              10–14 Days
            </div>
          </div>

        </div>

        {/* Big Actionable Advice Box */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 p-5 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {t.todayAdvice || t.fmTodayAdvice || "Today's Advice"}
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {t[selectedCrop] || selectedCrop}
            </span>
          </div>

          <p className="text-sm sm:text-base font-bold text-white leading-relaxed font-sans">
            {getTodayAdviceText()}
          </p>

          {/* Voice Readout Button */}
          {ttsError ? (
            <button
              onClick={handleAudioPlay}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg bg-yellow-600 hover:bg-yellow-500 text-white"
            >
              <Volume2 className="h-4 w-4" />
              <span>{farmerLanguage === 'hi' ? 'पुनः प्रयास (Voice Retry)' : farmerLanguage === 'or' ? 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ (Voice Retry)' : 'Retry Voice Readout'}</span>
            </button>
          ) : (
            <button
              onClick={handleAudioPlay}
              className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
                isPlayingAudio
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span>
                {isPlayingAudio
                  ? (t.audioPlaying || t.fmAudioPlaying || "Playing Audio...")
                  : (t.audioListen || t.fmAudioListen || "Listen to Voice Advice")}
              </span>
            </button>
          )}
        </div>

        {/* Key Farmer Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Crop Switcher */}
          <button
            onClick={() => setShowCropModal(!showCropModal)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-slate-700 transition-all cursor-pointer"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{t.myCrop || t.fmMyCrop || "My Crop"}</div>
              <div className="text-xs font-bold text-white truncate">
                {t[selectedCrop] || selectedCrop}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* 7-Day Forecast */}
          <button
            onClick={() => setActiveTab('forecast')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-slate-700 transition-all cursor-pointer"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{t.forecast7d || t.fmForecast7d || "7-Day Outlook"}</div>
              <div className="text-xs font-bold text-sky-400">
                {m.expected_rainfall_mm} mm Rain
              </div>
            </div>
            <Calendar className="h-4 w-4 text-sky-400" />
          </button>

        </div>

        {/* Crop Selection Pop-down Menu if open */}
        {showCropModal && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-1.5 shadow-2xl animate-in fade-in duration-200">
            <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
              Select Crop / ଫସଲ ବାଛନ୍ତୁ:
            </div>
            {['rice', 'maize', 'groundnut', 'pulses', 'vegetables', 'cotton'].map(crop => (
              <button
                key={crop}
                onClick={() => {
                  setSelectedCrop(crop);
                  setShowCropModal(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                  selectedCrop === crop
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{t[crop] || crop}</span>
                {selectedCrop === crop && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        )}

        {/* 7-Day Daily Simple Forecast Visual Strip */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>7-Day Rainfall Forecast Strip</span>
            <span className="text-[10px] text-sky-400 font-sans font-semibold">{selectedBlock}</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-sans">
            {[
              { d: "Thu", rain: 14, icon: "🌧️" },
              { d: "Fri", rain: 18, icon: "🌧️" },
              { d: "Sat", rain: 12, icon: "🌦️" },
              { d: "Sun", rain: 8, icon: "⛅" },
              { d: "Mon", rain: 2, icon: "☀️" },
              { d: "Tue", rain: 0, icon: "☀️" },
              { d: "Wed", rain: 0, icon: "☀️" }
            ].map((day, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[9px] font-sans text-slate-400 font-medium">{day.d}</div>
                <div className="text-sm my-0.5">{day.icon}</div>
                <div className={`text-[10px] font-black ${day.rain > 0 ? 'text-sky-300' : 'text-slate-500'}`}>
                  {day.rain}<span className="text-[9px] font-medium text-slate-400 ml-0.5">mm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Kisan Call Center & Disclaimer */}
        <div className="space-y-2 pt-2">
          <a
            href="tel:18001801551"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 transition-colors shadow-md"
          >
            <PhoneCall className="h-4 w-4 text-amber-400" />
            <span>{t.callKisanHelpline || t.fmCallHelpline || "Call Kisan Helpline (1800-180-1551)"}</span>
          </a>

          <p className="text-[10px] text-center text-slate-500 leading-tight">
            {t.disclaimer || "Official MoES/IMD Data Stream"} • Prototype Decision Support
          </p>
        </div>

      </div>

    </div>
  );
};

export default FarmerModePage;
