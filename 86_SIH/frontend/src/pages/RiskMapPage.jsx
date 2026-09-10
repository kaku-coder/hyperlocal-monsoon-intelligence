import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import {
  Search, MapPin, LocateFixed, Droplets, Wind, RefreshCw, Eye, Globe, Layers, Cloud
} from 'lucide-react';

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 11, { animate: true, duration: 1.5 });
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

const NEARBY_BLOCKS = [
  { name: 'Bhubaneswar', district: 'Khordha', lat: 20.2961, lon: 85.8245 },
  { name: 'Cuttack', district: 'Cuttack', lat: 20.4625, lon: 85.8828 },
  { name: 'Puri', district: 'Puri', lat: 19.8135, lon: 85.8312 },
  { name: 'Rajkanika', district: 'Kendrapara', lat: 20.7300, lon: 86.6600 },
  { name: 'Jajpur', district: 'Jajpur', lat: 20.8500, lon: 86.3300 },
  { name: 'Balasore', district: 'Balasore', lat: 21.4934, lon: 86.9135 },
  { name: 'Sambalpur', district: 'Sambalpur', lat: 21.4669, lon: 83.9812 },
  { name: 'Berhampur', district: 'Ganjam', lat: 19.3150, lon: 84.7941 },
  { name: 'Koraput', district: 'Koraput', lat: 18.8135, lon: 82.7123 },
  { name: 'Rourkela', district: 'Sundargarh', lat: 22.2604, lon: 84.8536 },
  { name: 'Angul', district: 'Angul', lat: 20.8400, lon: 85.1000 },
];

export const RiskMapPage = () => {
  const { selectedBlock, selectedDistrict, farmerLanguage, user, changeLocation } = useApp();
  const lang = farmerLanguage || 'en';

  const [pincode, setPincode] = useState(user?.pincode || '');
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [blockWeathers, setBlockWeathers] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapStyle, setMapStyle] = useState('esri-satellite');
  const [showClouds, setShowClouds] = useState(true);
  const [radarTimestamp, setRadarTimestamp] = useState(null);

  const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '4ymFs6LvsUF6t0HAQ95O';

  const getTileUrl = (style) => {
    if (style === 'esri-satellite') return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    if (style === 'maptiler-satellite') return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`;
    if (style === 'maptiler-dark') return `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${maptilerKey}`;
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  // Fetch RainViewer real-time cloud & precipitation radar timestamp
  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        const latestTime = data.radar?.nowcast?.[0]?.time || data.radar?.past?.[data.radar?.past?.length - 1]?.time;
        if (latestTime) setRadarTimestamp(latestTime);
      } catch (err) {
        console.warn('RainViewer fetch error:', err);
      }
    };
    fetchRadar();
  }, []);

  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather(data.current);
      setForecast(data.daily);
    } catch (err) {
      console.warn('Weather fetch failed:', err);
    }
  }, []);

  // Batch fetch weather for all surrounding block markers across Odisha
  useEffect(() => {
    const fetchBlockWeathers = async () => {
      try {
        const lats = NEARBY_BLOCKS.map(b => b.lat).join(',');
        const lons = NEARBY_BLOCKS.map(b => b.lon).join(',');
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,relative_humidity_2m,precipitation&timezone=auto`);
        const data = await res.json();
        const weatherMap = {};

        if (Array.isArray(data)) {
          data.forEach((item, idx) => {
            weatherMap[NEARBY_BLOCKS[idx].name] = item.current;
          });
        } else if (data.current) {
          weatherMap[NEARBY_BLOCKS[0].name] = data.current;
        }
        setBlockWeathers(weatherMap);
      } catch (err) {
        console.warn('Block weather fetch error:', err);
      }
    };
    fetchBlockWeathers();
  }, []);

  const handleSelectBlockMarker = async (block) => {
    setLoading(true);
    setCoords({ lat: block.lat, lon: block.lon, name: block.name, country: block.district });
    changeLocation(block.district, block.name);
    await fetchWeather(block.lat, block.lon);
    setStatus(`📍 ${block.name}, ${block.district}`);
    setLoading(false);
  };

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
            changeLocation(po.District, po.Block || po.Name);
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

  // Auto-sync with logged in user location / selected navbar block so user never has to re-type pincode!
  useEffect(() => {
    const activeBlock = selectedBlock || user?.block || 'Bhubaneswar';
    const activeDistrict = selectedDistrict || user?.district || 'Khordha';

    if (user?.pincode && !pincode) {
      setPincode(user.pincode);
    }

    const defaultSearch = async () => {
      setLoading(true);
      try {
        const query = user?.pincode ? `${user.pincode}+India` : `${activeBlock}+${activeDistrict}+Odisha+India`;
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const nomData = await nomRes.json();
        if (nomData.length) {
          const lat = parseFloat(nomData[0].lat);
          const lon = parseFloat(nomData[0].lon);
          setCoords({ lat, lon, name: activeBlock, country: activeDistrict });
          await fetchWeather(lat, lon);
          setStatus(`📍 ${activeBlock}, ${activeDistrict}`);
        } else {
          setCoords({ lat: 20.2961, lon: 85.8245, name: 'Bhubaneswar', country: 'Khordha' });
          await fetchWeather(20.2961, 85.8245);
        }
      } catch (err) {
        setCoords({ lat: 20.2961, lon: 85.8245, name: 'Bhubaneswar', country: 'Khordha' });
        await fetchWeather(20.2961, 85.8245);
      }
      setLoading(false);
    };
    defaultSearch();
  }, [selectedBlock, selectedDistrict, user?.pincode, user?.block, user?.district]);

  const w = weather;
  const f = forecast;
  const wmo = w ? getWMO(w.weather_code, lang) : null;

  return (
    <div className="flex-1 relative bg-slate-950 w-full h-[calc(100vh-4rem)] overflow-hidden font-sans">
      
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Search Box */}
        <form onSubmit={handleSearch} className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 px-3 py-2 rounded-2xl shadow-2xl">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={user?.pincode ? `User PIN: ${user.pincode}` : (lang === 'hi' ? '6 अंकों का पिनकोड' : 'Enter Pincode')}
            maxLength={6}
            className="w-44 sm:w-56 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-sans font-semibold"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            <span>{lang === 'hi' ? 'खोजें' : lang === 'or' ? 'ସନ୍ଧାନ' : 'Search'}</span>
          </button>
        </form>

        {/* Right: Layer Switcher, Cloud Radar & Active Location Badge */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          
          {/* Live Cloud Radar Toggle */}
          <button
            onClick={() => setShowClouds(!showClouds)}
            className={`px-3 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border shadow-2xl flex items-center gap-1.5 ${
              showClouds
                ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white border-sky-400 shadow-sky-900/50'
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-cyan-300" />
            <span>☁️ {showClouds ? 'Clouds Radar ON' : 'Clouds Radar OFF'}</span>
          </button>

          {/* Map Layer Style Switcher */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-1 rounded-2xl shadow-2xl flex items-center text-xs">
            <button
              onClick={() => setMapStyle('esri-satellite')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                mapStyle === 'esri-satellite' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌍 ESRI Satellite HD
            </button>
            <button
              onClick={() => setMapStyle('maptiler-satellite')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                mapStyle === 'maptiler-satellite' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛰️ MapTiler Hybrid
            </button>
            <button
              onClick={() => setMapStyle('maptiler-dark')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                mapStyle === 'maptiler-dark' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ Dark GIS
            </button>
          </div>

          {coords && (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2">
              <LocateFixed className="h-4 w-4 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-xs font-black text-white">{coords.name}</div>
                <div className="text-[9px] text-cyan-400 font-semibold">{coords.country}</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Main Fullscreen Leaflet Map */}
      <MapContainer
        center={coords ? [coords.lat, coords.lon] : [20.712, 86.2]}
        zoom={coords ? 11 : 8}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapRecenter center={coords ? [coords.lat, coords.lon] : null} />

        <TileLayer
          attribution='&copy; ESRI &copy; MapTiler &copy; OSM | MoES NCMRWF'
          url={getTileUrl(mapStyle)}
        />

        {/* Real-time Weather Cloud & Rain Radar Tile Overlay Layer */}
        {showClouds && radarTimestamp && (
          <TileLayer
            url={`https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.65}
            zIndex={400}
          />
        )}

        {/* Render Interactive Weather Pins for Surrounding Blocks */}
        {NEARBY_BLOCKS.map((block) => {
          const bw = blockWeathers[block.name];
          const bwmo = bw ? getWMO(bw.weather_code, lang) : { emoji: '🌤️' };
          const tempDisplay = bw ? `${Math.round(bw.temperature_2m)}°` : '--';
          const isSelected = coords?.name === block.name;

          return (
            <Marker
              key={block.name}
              position={[block.lat, block.lon]}
              eventHandlers={{
                click: () => handleSelectBlockMarker(block)
              }}
              icon={L.divIcon({
                html: `<div style="position:relative;display:flex;align-items:center;gap:6px;background:${isSelected ? 'rgba(14,116,144,0.95)' : 'rgba(15,23,42,0.9)'};border:${isSelected ? '2px solid #38bdf8' : '1px solid rgba(148,163,184,0.3)'};padding:4px 8px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.6);backdrop-filter:blur(8px);cursor:pointer;transition:all 0.2s ease;">
                  <span style="font-size:16px;">${bwmo.emoji}</span>
                  <div style="display:flex;flex-direction:column;">
                    <span style="font-family:system-ui;font-size:10px;font-weight:900;color:white;line-height:1.1;">${block.name}</span>
                    <span style="font-family:system-ui;font-size:9px;font-weight:700;color:${isSelected ? '#bae6fd' : '#94a3b8'};">${block.district}</span>
                  </div>
                  <span style="font-family:system-ui;font-size:12px;font-weight:900;color:#38bdf8;margin-left:4px;">${tempDisplay}</span>
                  <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${isSelected ? '#0e7490' : '#0f172a'};"></div>
                </div>`,
                className: 'block-weather-marker',
                iconSize: [110, 36],
                iconAnchor: [55, 36]
              })}
            />
          );
        })}

        {/* Custom Pincode Search Location Marker if outside predefined blocks */}
        {coords && !NEARBY_BLOCKS.some(b => b.name === coords.name) && (
          <Marker
            position={[coords.lat, coords.lon]}
            icon={L.divIcon({
              html: `<div style="position:relative;display:flex;align-items:center;gap:6px;background:rgba(225,29,72,0.95);border:2px solid #f43f5e;padding:4px 8px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.6);backdrop-filter:blur(8px);cursor:pointer;">
                <span style="font-size:16px;">📍</span>
                <div style="display:flex;flex-direction:column;">
                  <span style="font-family:system-ui;font-size:10px;font-weight:900;color:white;line-height:1.1;">${coords.name}</span>
                  <span style="font-family:system-ui;font-size:9px;font-weight:700;color:#fecdd3;">${coords.country}</span>
                </div>
                <span style="font-family:system-ui;font-size:12px;font-weight:900;color:white;margin-left:4px;">${w ? `${Math.round(w.temperature_2m)}°` : ''}</span>
              </div>`,
              className: 'custom-location-marker',
              iconSize: [110, 36],
              iconAnchor: [55, 36]
            })}
          />
        )}
      </MapContainer>

      {/* Floating Bottom Weather Forecast Widget Card (Reference Image Styling) */}
      {w && wmo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] w-[95%] max-w-4xl bg-slate-900/92 backdrop-blur-2xl border border-slate-700/80 p-4 sm:p-5 rounded-3xl shadow-2xl space-y-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Main Current Weather Block */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-5xl sm:text-6xl drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                {wmo.emoji}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{Math.round(w.temperature_2m)}°</span>
                  <span className="text-sm font-bold text-cyan-400">{wmo.label}</span>
                </div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>{coords?.name}</span>
                  <span className="text-xs text-slate-400 font-semibold">({coords?.country})</span>
                </h2>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 mt-1">
                  <span>{lang === 'hi' ? 'अनुभव' : lang === 'or' ? 'ଅନୁଭବ' : 'Feels'}: {Math.round(w.apparent_temperature)}°C</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-cyan-300">💧 {w.relative_humidity_2m}%</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-sky-300">💨 {Math.round(w.wind_speed_10m)} km/h</span>
                </div>
              </div>
            </div>

            {/* Right: 7-Day Forecast Strip (Matching Reference Image Layout) */}
            {f && (
              <div className="w-full md:w-auto flex-1 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  <span>{lang === 'hi' ? '7-दिवसीय मौसम पूर्वानुमान' : lang === 'or' ? '୭-ଦିନିଆ ପାଣିପାଗ ପୂର୍ବାନୁମାନ' : '7-Day Weather Outlook'}</span>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  {f.time?.slice(0, 7).map((date, i) => {
                    const dayWMO = getWMO(f.weather_code[i], lang);
                    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <div key={date} className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{dayName}</span>
                        <span className="text-base my-0.5">{dayWMO.emoji}</span>
                        <div className="text-[10px] font-black text-white">
                          {Math.round(f.temperature_2m_max[i])}°
                        </div>
                        <div className="text-[9px] font-bold text-slate-500">
                          {Math.round(f.temperature_2m_min[i])}°
                        </div>
                        {f.precipitation_sum[i] > 0 && (
                          <div className="text-[8px] font-bold text-cyan-400 mt-0.5">
                            {f.precipitation_sum[i]}m
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[600] bg-slate-950/70 backdrop-blur-md flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 bg-slate-900/95 px-6 py-4 rounded-2xl border border-slate-700 shadow-2xl">
            <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
            <span className="text-xs font-black text-white">{lang === 'hi' ? 'मौसम लोड हो रहा है...' : lang === 'or' ? 'ପାଣିପାଗ ଲୋଡ୍ ହେଉଛି...' : 'Fetching block weather...'}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiskMapPage;
