import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Popup, useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import {
  Layers, ArrowRight, Filter, Wind, Thermometer, Cloud,
  BarChart3, Globe, ChevronDown, RefreshCw, Eye,
  Search, MapPin, LocateFixed, Droplets, Sunrise, Sunset, Eye as Visibility, Gauge
} from 'lucide-react';

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

const WMO_CODE = {
  0: { en: 'Clear Sky', hi: 'साफ आसमान', or: 'ସ୍ଵଚ୍ଛ ଆକାଶ', emoji: '☀️' },
  1: { en: 'Mainly Clear', hi: 'मुख्यतः साफ', or: 'ମୁଖ୍ୟତଃ ସ୍ଵଚ୍ଛ', emoji: '🌤️' },
  2: { en: 'Partly Cloudy', hi: 'आंशिक बादल', or: 'ଆଂଶିକ ମେଘ', emoji: '⛅' },
  3: { en: 'Overcast', hi: 'बादलों से ढका', or: 'ମେଘାଚ୍ଛନ୍ନ', emoji: '☁️' },
  45: { en: 'Foggy', hi: 'कोहरा', or: 'କୁହୁଡ଼ି', emoji: '🌫️' },
  48: { en: 'Rime Fog', hi: 'बर्फीला कोहरा', or: 'ବରଫ କୁହୁଡ଼ି', emoji: '🌫️' },
  51: { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी', or: 'ହାଲୁକା ବୃଷ୍ଟି', emoji: '🌦️' },
  53: { en: 'Moderate Drizzle', hi: 'मध्यम बूंदाबांदी', or: 'ମଧ୍ୟମ ବୃଷ୍ଟି', emoji: '🌦️' },
  55: { en: 'Dense Drizzle', hi: 'तेज बूंदाबांदी', or: 'ତୀବ୍ର ବୃଷ୍ଟି', emoji: '🌧️' },
  61: { en: 'Slight Rain', hi: 'हल्की बारिश', or: 'ହାଲୁକା ବର୍ଷା', emoji: '🌧️' },
  63: { en: 'Moderate Rain', hi: 'मध्यम बारिश', or: 'ମଧ୍ୟମ ବର୍ଷା', emoji: '🌧️' },
  65: { en: 'Heavy Rain', hi: 'भारी बारिश', or: 'ପ୍ରବଳ ବର୍ଷା', emoji: '🌧️' },
  71: { en: 'Slight Snow', hi: 'हल्का हिमपात', or: 'ହାଲୁକା ବରଫ', emoji: '🌨️' },
  73: { en: 'Moderate Snow', hi: 'मध्यम हिमपात', or: 'ମଧ୍ୟମ ବରଫ', emoji: '🌨️' },
  75: { en: 'Heavy Snow', hi: 'भारी हिमपात', or: 'ପ୍ରବଳ ବରଫ', emoji: '❄️' },
  80: { en: 'Slight Showers', hi: 'हल्की बारिश', or: 'ହାଲୁକା ବର୍ଷା', emoji: '🌦️' },
  81: { en: 'Moderate Showers', hi: 'मध्यम बारिश', or: 'ମଧ୍ୟମ ବର୍ଷା', emoji: '🌧️' },
  82: { en: 'Violent Showers', hi: 'तेज बारिश', or: 'ତୀବ୍ର ବର୍ଷା', emoji: '⛈️' },
  95: { en: 'Thunderstorm', hi: 'तूफान', or: 'ଝଡ଼', emoji: '⛈️' },
  96: { en: 'Thunderstorm + Hail', hi: 'तूफान + ओले', or: 'ଝଡ଼ + ଶିଳାହୃଷ୍ଟ', emoji: '⛈️' },
  99: { en: 'Thunderstorm + Heavy Hail', hi: 'तूफान + भारी ओले', or: 'ଝଡ଼ + ପ୍ରବଳ ଶିଳାହୃଷ୍ଟ', emoji: '⛈️' },
};

function getWMO(code, lang = 'en') {
  const entry = WMO_CODE[code] || WMO_CODE[0];
  return { emoji: entry.emoji, label: entry[lang] || entry.en };
}

function getWindDirLabel(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export const RiskMapPage = () => {
  const { selectedBlock, selectedDistrict, farmerLanguage, setActiveTab } = useApp();
  const lang = farmerLanguage || 'en';

  const t = useMemo(() => ({
    title: lang === 'hi' ? 'मेरा क्षेत्र' : lang === 'or' ? 'ମୋ ଅଞ୍ଚଳ' : 'My Area',
    subtitle: lang === 'hi' ? 'पिनकोड से मौसम देखें' : lang === 'or' ? 'ପିନକୋଡ୍ ରୁ ପାଣିପାଗ ଦେଖନ୍ତୁ' : 'Weather by Pincode',
    search: lang === 'hi' ? 'खोजें' : lang === 'or' ? 'ସନ୍ଧାନ' : 'Search',
    enterPin: lang === 'hi' ? '6 अंकों का पिनकोड' : lang === 'or' ? '୬ ଅଙ୍କ ପିନକୋଡ୍' : 'Enter 6-digit pincode',
    example: lang === 'hi' ? 'जैसे 754212 / 755003' : lang === 'or' ? 'ଯେପରି ୭୫୪୨୧୨ / ୭୫୫୦୦୩' : 'e.g. 754212 / 755003',
    detected: lang === 'hi' ? 'आपका क्षेत्र' : lang === 'or' ? 'ଆପଣଙ୍କ ଅଞ୍ଚଳ' : 'Your Area',
    temp: lang === 'hi' ? 'तापमान' : lang === 'or' ? 'ତାପମାନ' : 'Temp',
    feelsLike: lang === 'hi' ? 'अनुभव' : lang === 'or' ? 'ଅନୁଭବ' : 'Feels',
    humidity: lang === 'hi' ? 'नमी' : lang === 'or' ? 'ଆର୍ଦ୍ରତା' : 'Humidity',
    wind: lang === 'hi' ? 'हवा' : lang === 'or' ? 'ପବନ' : 'Wind',
    rain: lang === 'hi' ? 'बारिश' : lang === 'or' ? 'ବର୍ଷା' : 'Rain',
    uv: lang === 'hi' ? 'UV' : lang === 'or' ? 'UV' : 'UV',
    visibility: lang === 'hi' ? 'दृश्यता' : lang === 'or' ? 'ଦୃଶ୍ୟତା' : 'Visibility',
    pressure: lang === 'hi' ? 'दबाव' : lang === 'or' ? 'ଚାପ' : 'Pressure',
    sunrise: lang === 'hi' ? 'सूर्योदय' : lang === 'or' ? 'ସୂର୍ଯ୍ୟୋଦୟ' : 'Sunrise',
    sunset: lang === 'hi' ? 'सूर्यास्त' : lang === 'or' ? 'ସୂର୍ଯ୍ୟାସ୍ତ' : 'Sunset',
    forecast: lang === 'hi' ? '3 दिन का पूर्वानुमान' : lang === 'or' ? '୩ ଦିନର ପୂର୍ବାନୁମାନ' : '3-Day Forecast',
    climate: lang === 'hi' ? 'जलवायु संकेत' : lang === 'or' ? 'ଜଳବାୟୁ ସଙ୍କେତ' : 'Climate Signals',
    kph: lang === 'hi' ? 'किमी/घं' : lang === 'or' ? 'କିମି/ଘं' : 'km/h',
    mm: 'mm',
  }), [lang]);

  const [pincode, setPincode] = useState('');
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=3`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather(data.current);
      setForecast(data.daily);
    } catch (err) {
      console.warn('Weather fetch failed:', err);
    }
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (pincode.length !== 6) {
      setStatus(lang === 'hi' ? '6 अंकों का पिनकोड डालें' : lang === 'or' ? '୬ ଅଙ୍କ ପିନକୋଡ୍ ଦିଅନ୍ତୁ' : 'Enter 6-digit pincode');
      return;
    }
    setLoading(true);
    setStatus(lang === 'hi' ? 'खोज रहे हैं...' : lang === 'or' ? 'ସନ୍ଧାନ କରୁଛି...' : 'Searching...');
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${pincode}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (geoData.results?.length) {
        const r = geoData.results[0];
        setCoords({ lat: r.latitude, lon: r.longitude, name: r.name || pincode, country: r.admin1 || 'India' });
        await fetchWeather(r.latitude, r.longitude);
        setStatus(`📍 ${r.name} (${r.admin1 || 'India'})`);
      } else {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const pinData = await pinRes.json();
        if (pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length) {
          const po = pinData[0].PostOffice[0];
          const nominatim = await fetch(`https://nominatim.openstreetmap.org/search?q=${po.Name}+${po.District}+Odisha+India&format=json&limit=1`);
          const nomData = await nominatim.json();
          if (nomData.length) {
            const lat = parseFloat(nomData[0].lat);
            const lon = parseFloat(nomData[0].lon);
            setCoords({ lat, lon, name: po.Name, country: po.District });
            await fetchWeather(lat, lon);
            setStatus(`📍 ${po.Name}, ${po.District}`);
          } else {
            setStatus(lang === 'hi' ? 'स्थान नहीं मिला' : lang === 'or' ? 'ସ୍ଥାନ ମିଳିଲା ନାହିଁ' : 'Location not found');
          }
        } else {
          setStatus(lang === 'hi' ? 'पिनकोड नहीं मिला' : lang === 'or' ? 'ପିନକୋଡ୍ ମିଳିଲା ନାହିଁ' : 'Pincode not found');
        }
      }
    } catch (err) {
      setStatus(lang === 'hi' ? 'खोज में त्रुटि' : lang === 'or' ? 'ସନ୍ଧାନ ତ୍ରୁଟି' : 'Search error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedBlock && !coords) {
      const defaultSearch = async () => {
        setLoading(true);
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${selectedBlock}+${selectedDistrict}+Odisha+India&format=json&limit=1`);
          const nomData = await nomRes.json();
          if (nomData.length) {
            const lat = parseFloat(nomData[0].lat);
            const lon = parseFloat(nomData[0].lon);
            setCoords({ lat, lon, name: selectedBlock, country: selectedDistrict });
            await fetchWeather(lat, lon);
            setStatus(`📍 ${selectedBlock}, ${selectedDistrict}`);
          }
        } catch (err) {}
        setLoading(false);
      };
      defaultSearch();
    }
  }, [selectedBlock, selectedDistrict]);

  const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '4ymFs6LvsUF6t0HAQ95O';
  const getTileUrl = (style) => {
    if (style === 'maptiler-satellite') return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`;
    if (style === 'maptiler-dark') return `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${maptilerKey}`;
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  const w = weather;
  const f = forecast;
  const wmo = w ? getWMO(w.weather_code, lang) : null;

  const dayLabels = lang === 'hi' ? ['आज', 'कल', 'परसों'] : lang === 'or' ? ['ଆଜି', 'ଆସନ୍ତାକାଲି', 'ପରଦିନ'] : ['Today', 'Tomorrow', 'Day 3'];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-6rem)]">

      {/* Sidebar */}
      <div className="w-full lg:w-[340px] flex-shrink-0 bg-slate-950 border-r border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-900/30">
            <LocateFixed className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white">{t.title}</h1>
            <p className="text-[10px] text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Pincode Search */}
        <form onSubmit={handleSearch} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 space-y-2 shadow-lg">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {t.search}
          </span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t.enterPin}
              maxLength={6}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              {t.search}
            </button>
          </div>
          <div className="text-[9px] text-slate-500">{t.example}</div>
          {status && <div className="text-[10px] font-mono text-emerald-400 pt-0.5">{status}</div>}
        </form>

        {/* Current Weather - ONLY if loaded */}
        {w && wmo && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700 p-4 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{t.detected}</span>
                <h2 className="text-sm font-extrabold text-white">{coords?.name}</h2>
                <p className="text-[10px] text-slate-400">{coords?.country}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl">{wmo.emoji}</div>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white font-mono">{Math.round(w.temperature_2m)}°</span>
              <div className="pb-1">
                <div className="text-xs font-bold text-slate-300">{wmo.label}</div>
                <div className="text-[10px] text-slate-500">{t.feelsLike} {Math.round(w.apparent_temperature)}°C</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-base">💧</div>
                <div className="text-[9px] text-slate-400 font-bold">{t.humidity}</div>
                <div className="text-[11px] font-black text-cyan-300 font-mono">{w.relative_humidity_2m}%</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-base">💨</div>
                <div className="text-[9px] text-slate-400 font-bold">{t.wind}</div>
                <div className="text-[11px] font-black text-sky-300 font-mono">{Math.round(w.wind_speed_10m)} {t.kph}</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-base">🌧️</div>
                <div className="text-[9px] text-slate-400 font-bold">{t.rain}</div>
                <div className="text-[11px] font-black text-emerald-300 font-mono">{w.precipitation} {t.mm}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400 font-bold">{t.uv}</div>
                <div className="text-[11px] font-black text-amber-300 font-mono">{w.uv_index?.toFixed(1)}</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400 font-bold flex items-center justify-center gap-0.5">
                  <Wind className="h-2 w-2" /> {getWindDirLabel(w.wind_direction_10m)}
                </div>
                <div className="text-[10px] font-black text-slate-300 font-mono">{Math.round(w.wind_gusts_10m)} gust</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400 font-bold">{t.pressure}</div>
                <div className="text-[11px] font-black text-violet-300 font-mono">{Math.round(w.surface_pressure)}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Day Forecast */}
        {f && (
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3 w-3 text-sky-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{t.forecast}</span>
            </div>
            <div className="space-y-1.5">
              {f.time?.slice(0, 3).map((date, i) => {
                const dayWMO = getWMO(f.weather_code[i], lang);
                return (
                  <div key={date} className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-2 rounded-lg border border-slate-800">
                    <span className="text-lg">{dayWMO.emoji}</span>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-300">{dayLabels[i]}</div>
                      <div className="text-[9px] text-slate-500">{dayWMO.label}</div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[11px] font-black text-amber-300">{Math.round(f.temperature_2m_max[i])}°</span>
                      <span className="text-[10px] text-slate-500"> / </span>
                      <span className="text-[10px] text-sky-300">{Math.round(f.temperature_2m_min[i])}°</span>
                    </div>
                    <div className="text-[9px] text-cyan-400 font-mono">{f.precipitation_sum[i]}mm</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Climate Signals */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{t.climate}</span>
          </div>
          <div className="space-y-1.5">
            {[
              { emoji: '🔥', label: 'ENSO', value: '+0.8°C', color: '#f59e0b' },
              { emoji: '🌊', label: 'IOD', value: '-0.4', color: '#06b6d4' },
              { emoji: '🌀', label: 'MJO', value: 'Phase 4', color: '#8b5cf6' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-sm">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-slate-500 font-bold">{c.label}</div>
                  <div className="text-[10px] font-black font-mono" style={{ color: c.color }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Map */}
      <div className="flex-1 relative bg-slate-950">
        <MapContainer
          center={coords ? [coords.lat, coords.lon] : [20.712, 86.2]}
          zoom={coords ? 12 : 8}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <MapRecenter center={coords ? [coords.lat, coords.lon] : null} />

          <TileLayer
            attribution='&copy; MapTiler &copy; OSM | MoES NCMRWF'
            url={getTileUrl('maptiler-dark')}
          />

          {/* Single dot marker at user's pincode location */}
          {coords && (
            <Marker
              position={[coords.lat, coords.lon]}
              icon={L.divIcon({
                html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
                  <div style="width:16px;height:16px;background:radial-gradient(circle,#38bdf8 30%,rgba(56,189,248,0.3) 70%,transparent 100%);border-radius:50%;box-shadow:0 0 20px rgba(56,189,248,0.5),0 0 40px rgba(56,189,248,0.2);"></div>
                  <div style="position:absolute;width:6px;height:6px;background:#38bdf8;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>
                  <div style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.3);border-radius:6px;padding:2px 6px;white-space:nowrap;font-family:system-ui;font-size:9px;font-weight:800;color:#38bdf8;text-shadow:0 1px 2px rgba(0,0,0,0.5);">${coords.name}</div>
                </div>`,
                className: 'user-location-dot',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui', fontSize: '12px', padding: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e7490' }}>{coords.name}</div>
                  <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '6px' }}>{coords.country}</div>
                  {w && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontFamily: 'monospace', fontSize: '10px' }}>
                      <div>🌡️ {Math.round(w.temperature_2m)}°C</div>
                      <div>💧 {w.relative_humidity_2m}%</div>
                      <div>💨 {Math.round(w.wind_speed_10m)} km/h</div>
                      <div>{wmo?.emoji} {wmo?.label}</div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Top-right layer badge */}
        <div className="absolute top-3 right-3 z-[500]">
          <div className="bg-slate-900/92 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2">
            <Eye className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
              {coords ? `${coords.name} Weather` : 'Map View'}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-[600] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 bg-slate-900/90 px-6 py-4 rounded-2xl border border-slate-700">
              <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
              <span className="text-xs font-bold text-slate-300">{lang === 'hi' ? 'मौसम लोड हो रहा है...' : lang === 'or' ? 'ପାଣିପାଗ ଲୋଡ୍ ହେଉଛି...' : 'Loading weather...'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskMapPage;
