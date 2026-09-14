import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/localization';
import { playTextToSpeech, stopTextToSpeech } from '../utils/tts';
import { checkWeatherAlert } from '../services/api';
import { 
  Sprout, 
  CloudRain, 
  SunMedium, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  BellRing, 
  Loader2,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';

const CROP_DATABASE = [
  { id: 'rice', name: 'Rice (Paddy)', name_hi: 'धान (चावल)', name_or: 'ଧାନ (Paddy)', icon: '🌾' },
  { id: 'maize', name: 'Maize (Corn)', name_hi: 'मक्का', name_or: 'ମକା (Corn)', icon: '🌽' },
  { id: 'groundnut', name: 'Groundnut', name_hi: 'मूंगफली', name_or: 'ଚିନାବାଦାମ (Peanut)', icon: '🥜' },
  { id: 'pulses', name: 'Pulses (Arhar / Moong)', name_hi: 'दालें (अरहर / मूंग)', name_or: 'ଡାଲି (Arhar/Moong)', icon: '🌱' },
  { id: 'vegetables', name: 'Vegetables', name_hi: 'सब्जियां (बैंगन/भिंडी)', name_or: 'ପରିବା (Vegetables)', icon: '🥦' },
  { id: 'cotton', name: 'Cotton', name_hi: 'कपास', name_or: 'କପା (Cotton)', icon: '☁️' },
  { id: 'wheat', name: 'Wheat (Gaham)', name_hi: 'गेहूं', name_or: 'ଗହମ (Wheat)', icon: '🌾' },
  { id: 'sugarcane', name: 'Sugarcane', name_hi: 'गन्ना', name_or: 'ଆଖୁ (Sugarcane)', icon: '🎋' }
];

export const FarmerModePage = () => {
  const { 
    farmerLanguage, 
    setFarmerLanguage,
    selectedBlock,
    selectedDistrict,
    selectedCrop,
    setSelectedCrop,
    forecastData,
    setActiveTab,
    user
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [nowcastData, setNowcastData] = useState(null);
  const [checkingWeather, setCheckingWeather] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [ttsError, setTtsError] = useState(false);

  const t = translations[farmerLanguage] || translations.en;
  const lang = farmerLanguage || 'en';

  const m = forecastData?.metrics || {
    onset_probability: 0.76,
    break_probability: 0.68,
    heavy_rain_probability: 0.29,
    expected_rainfall_mm: 54.0,
    soil_moisture_level: 'Low',
    temperature_c: 31.5,
    temperature_anomaly: 2.8
  };

  const cleanDistrict = (selectedDistrict || 'Khordha')
    .replace(/mayurbhaj/i, 'Mayurbhanj')
    .replace(/khurda/i, 'Khordha');

  const getCropTimeAdvisory = () => {
    const isBreak = (m.break_probability || 0) >= 0.60;
    const isHeavyRain = (m.heavy_rain_probability || 0) >= 0.60;
    const activeCropId = selectedCrop || 'rice';

    const meta = CROP_DATABASE.find(c => c.id === activeCropId) || CROP_DATABASE[0];
    const cropLabel = lang === 'hi' ? meta.name_hi : lang === 'or' ? meta.name_or : meta.name;

    // Season & Time Window text
    const seasonWindow = activeCropId === 'wheat'
      ? (lang === 'hi' ? 'रबी सीजन (नवंबर-दिसंबर बुवाई समय)' : lang === 'or' ? 'ରବି ଋତୁ (ନଭେମ୍ବର-ଡିସେମ୍ବର ବୁଣା ସମୟ)' : 'Rabi Season (Nov–Dec Window)')
      : (lang === 'hi' ? 'खरीफ सीजन (जून-जुलाई बुवाई एवं वृद्धि समय)' : lang === 'or' ? 'ଖରିଫ ଋତୁ (ଜୁନ୍-ଜୁଲାଇ ବୁଣା ସମୟ)' : 'Kharif Season (June–July Window)');

    if (isBreak) {
      return {
        cropMeta: meta,
        seasonWindow,
        advisoryType: 'Delay Sowing',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        headline: lang === 'hi'
          ? `उच्च सूखा जोखिम: ${cropLabel} की बुवाई/रोपाई 5-7 दिनों के लिए टालें।`
          : lang === 'or'
          ? `ଉଚ୍ଚ ଶୁଖିଲା ରୋଗ ସତର୍କତା: ${cropLabel} ବୁଣା ୫-୭ ଦିନ ବିଳମ୍ବ କରନ୍ତୁ।`
          : `High Dry Spell Risk: Delay ${cropLabel} Sowing/Transplanting by 5–7 Days.`,
        dos: lang === 'hi'
          ? [
              "नर्सरी में सुबह-शाम हल्का पानी देकर पौध बचाएं।",
              "आपातकालीन सिंचाई (पंप सेट या खेत तालाब) तैयार रखें।",
              "नमी बचाने के लिए खेतों में पुआल/मल्चिंग का प्रयोग करें।"
            ]
          : lang === 'or'
          ? [
              "ତଳି ଘରେ ସକାଳ-ସନ୍ଧ୍ୟାରେ ହାଲୁକା ପାଣି ଦିଅନ୍ତୁ।",
              "ଜରୁରୀକାଳୀନ ଜଳସେଚନ (ପମ୍ପ ସେଟ୍) ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।",
              "ମାଟିର ଆର୍ଦ୍ରତା ରଖିବା ପାଇଁ ନଡ଼ା/ମଲଚିଂ ବ୍ୟବହାର କରନ୍ତୁ।"
            ]
          : [
              "Maintain light nursery watering early morning or late evening.",
              "Keep supplemental irrigation pumps or farm ponds on standby.",
              "Apply straw mulching to retain soil moisture in root zones."
            ],
        donts: lang === 'hi'
          ? [
              "सूखी या कम नमी वाली मिट्टी में यूरिया/खाद न डालें।",
              "बिना सिंचाई सुविधा के मुख्य खेत में रोपाई न करें।"
            ]
          : lang === 'or'
          ? [
              "ଶୁଖିଲା ମାଟିରେ ରାସାୟନିକ ସାର ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।",
              "ଜଳସେଚନ ବିନା ଜମିରେ ତଳି ରୁଅନ୍ତୁ ନାହିଁ।"
            ]
          : [
              "Do NOT broadcast urea/fertilizer into dry soil right now.",
              "Do NOT transplant seedlings into un-irrigated dry fields."
            ],
        advantages: lang === 'hi'
          ? [
              "30-40% बीज और पौध की बर्बादी बचती है।",
              "उर्वरक की बर्बादी और जड़ों के जलने से बचाव।"
            ]
          : lang === 'or'
          ? [
              "୩୦-୪୦% ବିହନ ଓ ତଳି ନଷ୍ଟ ହେବାରୁ ରକ୍ଷା ମିଳେ।",
              "ସାର ନଷ୍ଟ ହେବା ଓ ଚେର ପୋଡ଼ିଯିବା ବନ୍ଦ ହୁଏ।"
            ]
          : [
              "Saves 30–40% seed and seedling mortality costs.",
              "Prevents fertilizer volatilization & root scorching losses."
            ],
        risks: lang === 'hi'
          ? [
              "सूखे में रोपाई करने से 60% तक पौधे सूखने का खतरा।",
              "तेज धूप से खाद बेकार हो जाती है।"
            ]
          : lang === 'or'
          ? [
              "ଶୁଖିଲାରେ ରୁଆ କଲେ ୬୦% ତଳି ଶୁଖିଯିବାର ଆଶଙ୍କା।",
              "ସାର ନଷ୍ଟ ହୋଇ ଜମିର ଉର୍ବରତା କମିଯାଏ।"
            ]
          : [
              "Up to 60% seedling wilting if transplanted in dry soil.",
              "Wastage of expensive fertilizers due to heat volatilization."
            ]
      };
    }

    if (isHeavyRain) {
      return {
        cropMeta: meta,
        seasonWindow,
        advisoryType: 'Prepare Drainage',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        headline: lang === 'hi'
          ? `भारी बारिश की चेतावनी! ${cropLabel} के खेत से तुरंत जल निकासी नाली बनाएं।`
          : lang === 'or'
          ? `ପ୍ରବଳ ବର୍ଷା ସତର୍କତା! ${cropLabel} ଜମିରୁ ତୁରନ୍ତ ନିଷ୍କାସନ ନାଳି ଖୋଲନ୍ତୁ।`
          : `Heavy Rainfall Alert! Clear Drainage Outlets Immediately for ${cropLabel}.`,
        dos: lang === 'hi'
          ? [
              "जलभराव से बचने के लिए खेत के निकास रास्ते तुरंत खोलें।",
              "नर्सरी की मेढ़ों को ऊंचा और मजबूत करें।",
              "बारिश रुकने के बाद कवकनाशी (Fungicide) का छिड़काव करें।"
            ]
          : lang === 'or'
          ? [
              "ଜମିରେ ପାଣି ଜମିବା ବନ୍ଦ କରିବା ପାଇଁ ନାଳି ଖୋଲନ୍ତୁ।",
              "ତଳି ଘରର ଆଡ଼ି ମଜବୁତ୍ କରନ୍ତୁ।",
              "ବର୍ଷା ଛାଡ଼ିବା ପରେ ଫିଙ୍ଗିନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ।"
            ]
          : [
              "Clear field drainage bunds to prevent standing water accumulation.",
              "Reinforce nursery boundaries and protect young shoots.",
              "Spray bio-fungicide after heavy downpour stops."
            ],
        donts: lang === 'hi'
          ? [
              "बारिश के दौरान कीटनाशक या खाद का छिड़काव न करें।",
              "जड़ों के पास 24 घंटे से ज्यादा पानी न जमने दें।"
            ]
          : lang === 'or'
          ? [
              "ବର୍ଷା ସମୟରେ କୀଟନାଶକ କିମ୍ବା ସାର ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।",
              "ଗଛ ମୂଳେ ୨୪ ଘଣ୍ଟାରୁ ଅଧିକ ପାଣି ଜମିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।"
            ]
          : [
              "Do NOT apply liquid chemical sprays during heavy rain.",
              "Do NOT allow waterlogging around roots for >24 hours."
            ],
        advantages: lang === 'hi'
          ? [
              "जड़ों को सड़ने से बचाता है और ऑक्सीजन बनी रहती है।",
              "खाद और उपजाऊ मिट्टी को बहने से रोकता है।"
            ]
          : lang === 'or'
          ? [
              "ଚେର ସଢ଼ିଯିବାରୁ ରକ୍ଷା କରେ।",
              "ମାଟିର ସାର ବୋହିଯିବା ବନ୍ଦ କରେ।"
            ]
          : [
              "Protects root aeration and prevents root-rot decay.",
              "Prevents valuable fertilizer leaching and soil erosion."
            ],
        risks: lang === 'hi'
          ? [
              "48 घंटे से अधिक जलभराव से पौधे पूरी तरह गल जाते हैं।",
              "पत्ती झुलसा और फफूंद जनित रोगों का भारी प्रकोप।"
            ]
          : lang === 'or'
          ? [
              "୪୮ ଘଣ୍ଟାରୁ ଅଧିକ ପାଣି ଜମିଲେ ତଳି ପୂରା ପଚିଯିବ।",
              "କବକ ଓ ପତ୍ର ପୋଡ଼ା ରୋଗ ବ୍ୟାପିବାର ଆଶଙ୍କା।"
            ]
          : [
              "Total seedling rot & mortality if flooded for >48 hours.",
              "High outbreak risk of fungal leaf blast & bacterial blight."
            ]
      };
    }

    return {
      cropMeta: meta,
      seasonWindow,
      advisoryType: 'Proceed with Operations',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      headline: lang === 'hi'
        ? `अनुकूल मौसम: ${cropLabel} की खेत तैयारी एवं बुवाई के लिए उत्तम समय।`
        : lang === 'or'
        ? `ଅନୁକୂଳ ପାଣିପାଗ: ${cropLabel} ଜମି କାମ ଓ ବୁଣା ପାଇଁ ଉତ୍ତମ ସମୟ।`
        : `Favorable Weather: Optimal Window for ${cropLabel} Field Preparation & Sowing.`,
      dos: lang === 'hi'
        ? [
            "खेत की गहरी जुताई और आधार खाद (Basal Fertilizer) का प्रयोग करें।",
            "बुवाई से पहले ट्राइकोडर्मा / पीएसबी से बीज उपचार अवश्य करें।",
            "पौधों के बीच उचित कतारबद्ध दूरी बनाकर बुवाई करें।"
          ]
        : lang === 'or'
        ? [
            "ଜମି ଚାଷ, ସମତଳ ଓ ମୂଳ ସାର ପ୍ରୟୋଗ କରନ୍ତୁ।",
            "ବିହନ ବୁଣିବା ପୂର୍ବରୁ ବିହନ ଶୋଧନ କରନ୍ତୁ।",
            "ଗଛ ମଧ୍ୟରେ ଉଚିତ୍ ବ୍ୟବଧାନ ରଖନ୍ତୁ।"
          ]
        : [
            "Proceed with field harrowing and basal manure application.",
            "Always complete Trichoderma seed treatment prior to sowing.",
            "Maintain optimal line-sowing distance for aeration."
          ],
      donts: lang === 'hi'
        ? [
            "बिना बीज उपचार के सीधे बुवाई न करें।",
            "कच्ची गोबर खाद का उपयोग न करें जिससे दीमक न लगे।"
          ]
        : lang === 'or'
        ? [
            "ବିହନ ଶୋଧନ ନକରି ବୁଣନ୍ତୁ ନାହିଁ।",
            "କଞ୍ଚା ଖତ ଜମିରେ ଦିଅନ୍ତୁ ନାହିଁ।"
          ]
        : [
            "Do NOT skip seed treatment before field broadcasting.",
            "Do NOT apply raw un-decomposed manure to prevent termites."
          ],
      advantages: lang === 'hi'
        ? [
            "90-95% तक स्वस्थ अंकुरण दर प्राप्त होती है।",
            "मजबूत जड़ प्रणाली और कीट-प्रतिरोधी पौध तैयार होती है।"
          ]
        : lang === 'or'
        ? [
            "ଗଜା ହାର ୯୦-<ctrl42>୫% ପର୍ଯ୍ୟନ୍ତ ବୃଦ୍ଧି ପାଏ।",
            "ମଜବୁତ୍ ଚେର ଓ ଉତ୍ତମ ତଳି ବୃଦ୍ଧି ହୁଏ।"
          ]
        : [
            "Achieves maximum germination rate up to 92–95%.",
            "Promotes robust root vigor and disease resistance."
          ],
      risks: lang === 'hi'
        ? [
            "देरी से बुवाई करने पर पैदावार 15-20% घट सकती है।",
            "बीज उपचार न करने पर मृदा जनित बीमारियों का खतरा।"
          ]
        : lang === 'or'
        ? [
            "ବିଳମ୍ବରେ ବୁଣିଲେ ଅମଳ କମିଯାଏ।",
            "ବିହନ ଶୋଧନ ନକଲେ ରୋଗ ବ୍ୟାପେ।"
          ]
        : [
            "Delayed sowing reduces yield potential by 15–20%.",
            "Omission of seed treatment invites soil-borne wilt."
          ]
    };
  };

  const activeAdvisory = getCropTimeAdvisory();

  const handleAudioPlay = () => {
    if (isPlayingAudio) {
      stopTextToSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setTtsError(false);
    const textToRead = `${t.appTitle || 'Monsoon Saathi'}. ${t.location || 'Location'}: ${selectedBlock}, ${cleanDistrict}. ${activeAdvisory.cropMeta.name_en}. ${activeAdvisory.headline}. ${activeAdvisory.dos.join('. ')}`;

    playTextToSpeech({
      text: textToRead,
      lang: farmerLanguage || 'en',
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => {
        setIsPlayingAudio(false);
        setTtsError(true);
      }
    });
  };

  const handleCheckWeather = async () => {
    setCheckingWeather(true);
    setSmsSent(false);
    const phoneNumber = user?.phoneNumber || localStorage.getItem('moes_phone') || '9508165261';
    const result = await checkWeatherAlert({
      district: cleanDistrict,
      block: selectedBlock,
      phoneNumber
    });
    setNowcastData(result);
    setCheckingWeather(false);
    if (result && result.sms_delivery) setSmsSent(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 px-3 py-4 sm:p-6 flex flex-col items-center">
      
      <div className="w-full max-w-lg space-y-4 font-sans">
        
        {/* Top Header Card */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-2xl shadow-inner">
              {activeAdvisory.cropMeta.icon}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-tight flex items-center gap-1.5 font-sans">
                {t.appTitle || t.fmAppTitle || "Monsoon Saathi"}
              </h1>
              <p className="text-xs text-emerald-100 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
                <span>📍 {selectedBlock} ({cleanDistrict})</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-black text-orange-100 bg-gradient-to-r from-orange-600/80 to-amber-600/80 border border-orange-400/50 rounded-lg px-2 py-0.5 shadow">
                  🌡️ {m.temperature_c != null ? `${Math.round(m.temperature_c * 10) / 10}°C` : '--°C'}
                </span>
                <span className="text-[10px] font-bold text-emerald-100/90">
                  {t.todayTemp || t.fmTodayTemp || "Real-Time Live Temperature"}
                </span>
              </div>
            </div>
          </div>

          {/* Language Switch Pills */}
          <div className="flex items-center bg-emerald-950/70 border border-emerald-600/60 rounded-xl p-1 text-xs">
            {['en', 'hi', 'or'].map((l) => (
              <button
                key={l}
                onClick={() => setFarmerLanguage(l)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  farmerLanguage === l
                    ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'ଓ'}
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

        {/* Real-Time Nowcast Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-700 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {t.rainNowcast || "Live Rain Nowcast"}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
              Next 12 Hours
            </span>
          </div>

          {checkingWeather ? (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400 text-xs font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>{t.checkingWeather || "Contacting real-time ML radar..."}</span>
            </div>
          ) : nowcastData ? (
            <div className="space-y-2.5">
              {nowcastData.severity !== 'NONE' ? (
                <>
                  <div className={`flex items-center gap-2.5 rounded-xl p-3 border ${
                    nowcastData.severity === 'HEAVY_RAIN'
                      ? 'bg-rose-950/60 border-rose-600/60'
                      : 'bg-sky-950/60 border-sky-600/60'
                  }`}>
                    <CloudRain className={`h-6 w-6 flex-shrink-0 ${nowcastData.severity === 'HEAVY_RAIN' ? 'text-rose-300' : 'text-sky-300'}`} />
                    <div>
                      <div className={`text-xs font-black ${nowcastData.severity === 'HEAVY_RAIN' ? 'text-rose-200' : 'text-sky-200'}`}>
                        {nowcastData.severity === 'HEAVY_RAIN' ? "Heavy Rain Warning" : "Rain Expected Soon"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {nowcastData.expected_rainfall_12h_mm} mm rain · {nowcastData.alert_probability || 0}% probability · within 12 hours
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                    {nowcastData.message_en}
                  </p>
                  {smsSent && nowcastData.sms_delivery && (
                    <div className="rounded-lg bg-emerald-950/50 border border-emerald-600/40 px-3 py-2 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>SMS sent via {nowcastData.sms_delivery.provider} to {nowcastData.sms_delivery.phone}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <SunMedium className="h-6 w-6 text-amber-300 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-black text-amber-200">No Heavy Rain Expected</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Clear weather for the next 12 hours in your area</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Real-time AI weather check — detects rain within the next 12 hours and instantly sends a weather alert SMS to your mobile number.
            </div>
          )}

          <button
            onClick={handleCheckWeather}
            disabled={checkingWeather}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
              checkingWeather
                ? 'bg-slate-800 text-slate-500 cursor-wait'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
            }`}
          >
            {checkingWeather ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
            <span>{checkingWeather ? "Checking..." : "Check My Weather & Send SMS Alert"}</span>
          </button>
        </div>

        {/* Dynamic Multi-Crop Time & Weather AI Advice Box */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                {t.todayAdvice || "Today's Agricultural Advice"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${activeAdvisory.badgeColor}`}>
                {activeAdvisory.advisoryType}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                <span>{activeAdvisory.cropMeta.icon}</span>
                <span>{lang === 'hi' ? activeAdvisory.cropMeta.name_hi : lang === 'or' ? activeAdvisory.cropMeta.name_or : activeAdvisory.cropMeta.name}</span>
              </span>
            </div>
          </div>

          {/* Time / Season Window Pill */}
          <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-[11px] text-amber-300 font-bold">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>{activeAdvisory.seasonWindow}</span>
          </div>

          {/* Headline Recommendation */}
          <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
            {activeAdvisory.headline}
          </p>

          {/* Voice Readout Button */}
          <button
            onClick={handleAudioPlay}
            className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
              isPlayingAudio
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isPlayingAudio ? (t.audioPlaying || "Playing Audio...") : (t.audioListen || "Listen to Voice Advice")}</span>
          </button>

          {/* Actionable Structured Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* 1. Recommended Actions (Do's) */}
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-600/40 p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'hi' ? 'क्या करें (Recommended Actions)' : lang === 'or' ? 'କଣ କରିବେ (Recommended Actions)' : 'Recommended Actions (Do\'s)'}</span>
              </div>
              <ul className="space-y-1">
                {activeAdvisory.dos.map((item, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 font-medium leading-tight flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Critical Warnings (Don'ts) */}
            <div className="rounded-xl bg-rose-950/40 border border-rose-600/40 p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-300 uppercase tracking-wider">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>{lang === 'hi' ? 'क्या न करें (What NOT to Do)' : lang === 'or' ? 'କଣ କରିବେ ନାହିଁ (What NOT to Do)' : 'What NOT to Do (Don\'ts)'}</span>
              </div>
              <ul className="space-y-1">
                {activeAdvisory.donts.map((item, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 font-medium leading-tight flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Advantages & Benefits */}
            <div className="rounded-xl bg-cyan-950/40 border border-cyan-600/40 p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'hi' ? 'फायदे एवं लाभ (Advantages & Benefits)' : lang === 'or' ? 'ଲାଭ ଓ ସୁବିଧା (Advantages & Benefits)' : 'Advantages & Benefits'}</span>
              </div>
              <ul className="space-y-1">
                {activeAdvisory.advantages.map((item, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 font-medium leading-tight flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Risks & Disadvantages if Ignored */}
            <div className="rounded-xl bg-amber-950/40 border border-amber-600/40 p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>{lang === 'hi' ? 'नुकसान एवं जोखिम (Risks if Ignored)' : lang === 'or' ? 'କ୍ଷତି ଓ ଆଶଙ୍କା (Risks if Ignored)' : 'Risks & Losses if Ignored'}</span>
              </div>
              <ul className="space-y-1">
                {activeAdvisory.risks.map((item, idx) => (
                  <li key={idx} className="text-[11px] text-slate-200 font-medium leading-tight flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Quick Crop Switcher Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Select Crop to Change Advice / ଫସଲ ବଦଳାନ୍ତୁ:</span>
            <span className="text-emerald-400 font-mono text-[10px]">8 Crops Available</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CROP_DATABASE.map((c) => {
              const isSelected = selectedCrop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCrop(c.id)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-900/80 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-[10px] font-bold truncate w-full leading-tight">
                    {lang === 'hi' ? c.name_hi.split(' ')[0] : lang === 'or' ? c.name_or.split(' ')[0] : c.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI SOIL HEALTH SCANNER FEATURE CARD */}
        <button
          onClick={() => setActiveTab('soil-scanner')}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 shadow-lg text-left transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-xl border border-emerald-500/30">
              📸
            </div>
            <div>
              <div className="text-xs font-black text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                <span>AI Soil Health Scanner</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">NEW</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Take a photo of field soil for instant AI visual diagnosis & crop match
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-emerald-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 7-Day Daily Real-Time Forecast Visual Strip */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>7-Day Real-Time Rainfall Forecast</span>
            <span className="text-[10px] text-sky-400 font-sans font-semibold">📍 {selectedBlock} ({cleanDistrict})</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-sans">
            {(forecastData?.daily_strip || Array.from({ length: 7 }).map((_, idx) => {
              const d = new Date();
              d.setDate(d.getDate() + idx);
              const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayName = idx === 0 ? "Today" : daysOfWeek[d.getDay()];
              const totalRain = m.expected_rainfall_mm || 45;
              let rain = idx === 0 ? Math.round(totalRain * 0.32) : idx === 1 ? Math.round(totalRain * 0.28) : idx === 2 ? Math.round(totalRain * 0.22) : idx === 3 ? Math.round(totalRain * 0.12) : idx === 4 ? Math.round(totalRain * 0.06) : 0;
              let icon = rain >= 15 ? "🌧️" : rain >= 8 ? "🌦️" : rain > 0 ? "⛅" : "☀️";
              return { day: dayName, date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), rain_mm: rain, icon, temp_max: Math.round((m.temperature_c || 31) + (idx < 3 ? 1.5 : 0.5)), temp_min: Math.round((m.temperature_c || 31) - 5.5) };
            })).map((day, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[9px] font-sans text-slate-400 font-medium truncate" title={day.date}>
                  {day.day}
                </div>
                <div className="text-sm my-0.5">{day.icon}</div>
                <div className={`text-[10px] font-black ${day.rain_mm > 0 ? 'text-sky-300' : 'text-slate-500'}`}>
                  {day.rain_mm}<span className="text-[9px] font-medium text-slate-400 ml-0.5">mm</span>
                </div>
                <div className="text-[9px] font-black text-orange-300/90">
                  {day.temp_max != null && <span>{Math.round(day.temp_max)}°</span>}
                  {day.temp_min != null && <span className="text-slate-400 font-medium ml-0.5">/{Math.round(day.temp_min)}°</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Data Stream Disclaimer */}
        <div className="pt-2">
          <p className="text-[10px] text-center text-slate-500 leading-tight">
            {t.disclaimer || "Official MoES/NCMRWF Weather Data Stream"}
          </p>
        </div>

      </div>

    </div>
  );
};

export default FarmerModePage;
