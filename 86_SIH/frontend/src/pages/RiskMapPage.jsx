import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { fetchGeoJSON } from '../services/api';
import {
  Layers, AlertTriangle, Droplets, SunMedium, CloudRain,
  ArrowRight, Filter, Wind, Thermometer, Cloud,
  BarChart3, Activity, Globe, ChevronDown, RefreshCw, Eye
} from 'lucide-react';

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 9, { animate: true });
  }, [center, map]);
  return null;
}

function createLocationCloudIcon(weatherEmoji, isSelected, blockName = '') {
  return L.divIcon({
    html: `<div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.8));
      cursor: pointer;
    ">
      <div style="
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(10px);
        border: 1.5px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.2)'};
        border-radius: 10px;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: transform 0.2s ease;
      ">
        <span style="font-size: ${isSelected ? '22px' : '18px'}; line-height: 1;">${weatherEmoji}</span>
        ${blockName ? `<span style="color: ${isSelected ? '#38bdf8' : '#f8fafc'}; font-size: 11px; font-weight: 800; font-family: system-ui, sans-serif;">${blockName}</span>` : ''}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 7px solid rgba(15, 23, 42, 0.94);
        margin-top: -1px;
      "></div>
    </div>`,
    className: 'location-weather-marker-pin',
    iconSize: [120, 36],
    iconAnchor: [60, 36],
  });
}

function createWindArrow(deg, speed) {
  const s = speed > 25 ? '#ef4444' : speed > 15 ? '#f59e0b' : '#38bdf8';
  const sz = 38;
  return L.divIcon({
    html: `<div style="width:${sz}px;height:${sz}px;transform:rotate(${deg}deg);filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5));">
      <svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="${s}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    </div>`,
    className: 'wind-arrow-marker',
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  });
}

function createBlockLabel(block, isSelected) {
  return L.divIcon({
    html: `<div style="
      background:rgba(15,23,42,0.88);
      backdrop-filter:blur(8px);
      border:1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.15)'};
      border-radius:8px;
      padding:3px 8px;
      font-family:system-ui,-apple-system,sans-serif;
      font-size:10px;
      font-weight:800;
      color:${isSelected ? '#38bdf8' : '#cbd5e1'};
      white-space:nowrap;
      text-align:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      letter-spacing:0.3px;
      pointer-events:none;
    ">${block}</div>`,
    className: 'block-label-marker',
    iconSize: [80, 20],
    iconAnchor: [40, -8],
  });
}

const LAYER_CONFIGS = [
  { id: 'break_risk', label: 'Break / Dry Spell', labelHi: 'विराम / शुष्क काल', labelOr: 'ବିରାମ / ଶୁଷ୍କ', icon: SunMedium, color: 'orange' },
  { id: 'onset_risk', label: 'Monsoon Onset', labelHi: 'मानसून आरंभ', labelOr: 'ମୌସୁମୀ ଆରମ୍ଭ', icon: CloudRain, color: 'emerald' },
  { id: 'heavy_rain', label: 'Heavy Rainfall', labelHi: 'भारी वर्षा', labelOr: 'ପ୍ରବଳ ବର୍ଷା', icon: Droplets, color: 'cyan' },
  { id: 'rainfall_anomaly', label: 'Rain Anomaly', labelHi: 'वर्षा विसंगति', labelOr: 'ବର୍ଷା ବିଚ୍ୟାସ', icon: AlertTriangle, color: 'amber' },
  { id: 'soil_moisture', label: 'Soil Moisture', labelHi: 'मिट्टी नमी', labelOr: 'ମାଟି ଆର୍ଦ୍ରତା', icon: Layers, color: 'indigo' },
];

function getCloudEmoji(props) {
  const heavy = props.heavy_rain_prob || 0;
  const break_ = props.break_prob || 0;
  const onset = props.onset_prob || 0;
  const rain = props.expected_rainfall_14d || 0;

  if (heavy > 70) return '⛈️';
  if (heavy > 50) return '🌧️';
  if (rain > 40 && onset > 60) return '🌧️';
  if (break_ > 70) return '☀️';
  if (break_ > 50) return '⛅';
  if (onset > 70) return '🌦️';
  if (rain > 20) return '🌥️';
  return '⛅';
}

function getCloudLabel(props, lang) {
  const heavy = props.heavy_rain_prob || 0;
  const break_ = props.break_prob || 0;
  const onset = props.onset_prob || 0;

  if (lang === 'hi') {
    if (heavy > 70) return 'भारी बारिश के बादल';
    if (heavy > 50) return 'बारिश के बादल';
    if (break_ > 70) return 'साफ आसमान';
    if (break_ > 50) return 'आंशिक बादल';
    if (onset > 70) return 'मानसून बादल';
    return 'हल्के बादल';
  }
  if (lang === 'or') {
    if (heavy > 70) return 'ପ୍ରବଳ ବର୍ଷା ମେଘ';
    if (heavy > 50) return 'ବର୍ଷା ମେଘ';
    if (break_ > 70) return 'ସ୍ଵଚ୍ଛ ଆକାଶ';
    if (break_ > 50) return 'ଆଂଶିକ ମେଘ';
    if (onset > 70) return 'ମୌସୁମୀ ମେଘ';
    return 'ହାଲୁକା ମେଘ';
  }
  if (heavy > 70) return 'Heavy Storm Clouds';
  if (heavy > 50) return 'Rain Clouds';
  if (break_ > 70) return 'Clear Sky';
  if (break_ > 50) return 'Partly Cloudy';
  if (onset > 70) return 'Monsoon Clouds';
  return 'Light Clouds';
}

export const RiskMapPage = () => {
  const { selectedDistrict, selectedBlock, changeLocation, setActiveTab, farmerLanguage } = useApp();

  const t = useMemo(() => {
    const lang = farmerLanguage || 'en';
    return {
      title: lang === 'hi' ? 'जोखिम मानचित्र' : lang === 'or' ? 'ବିପଦ ମାନଚିତ୍ର' : 'Risk Map',
      subtitle: lang === 'hi' ? 'ओडिशा ब्लॉक-स्तरीय कृषि-जलवायु' : lang === 'or' ? 'ଓଡ଼ିଶା ବ୍ଲକ୍ ସ୍ତରୀୟ କୃଷି-ଜଳବାୟୁ' : 'Odisha Block-Level Agro-Climate',
      selectLayer: lang === 'hi' ? 'जोखिम परत:' : lang === 'or' ? 'ବିପଦ ସ୍ତର:' : 'Risk Layer:',
      inspecting: lang === 'hi' ? 'आपका ब्लॉक' : lang === 'or' ? 'ଆପଣଙ୍କ ବ୍ଲକ୍' : 'Your Block',
      viewDetail: lang === 'hi' ? 'विस्तृत देखें' : lang === 'or' ? 'ବିସ୍ତୃତ ଦେଖନ୍ତୁ' : 'View Detail',
      legend: lang === 'hi' ? 'रंग कोड' : lang === 'or' ? 'ରଙ୍ଗ କୋଡ୍' : 'Color Legend',
      wind: lang === 'hi' ? 'हवा' : lang === 'or' ? 'ପବନ' : 'Wind',
      temp: lang === 'hi' ? 'तापमान' : lang === 'or' ? 'ତାପମାନ' : 'Temp',
      rain: lang === 'hi' ? 'वर्षा' : lang === 'or' ? 'ବର୍ଷା' : 'Rain',
      cloud: lang === 'hi' ? 'बादल' : lang === 'or' ? 'ମେଘ' : 'Cloud',
      climate: lang === 'hi' ? 'जलवायु' : lang === 'or' ? 'ଜଳବାୟୁ' : 'Climate',
      onset: lang === 'hi' ? 'आरंभ' : lang === 'or' ? 'ଆରମ୍ଭ' : 'Onset',
      breakRisk: lang === 'hi' ? 'विराम' : lang === 'or' ? 'ବିରାମ' : 'Break',
      heavyRain: lang === 'hi' ? 'भारी वर्षा' : lang === 'or' ? 'ପ୍ରବଳ ବର୍ଷା' : 'Heavy Rain',
      expected: lang === 'hi' ? 'अनुमानित' : lang === 'or' ? 'ଆଶା' : 'Expected',
      agroImpact: lang === 'hi' ? 'कृषि प्रभाव' : lang === 'or' ? 'କୃଷି ପ୍ରଭାବ' : 'Agro-Impact',
      favorLow: lang === 'hi' ? 'अनुकूल / कम जोखिम' : lang === 'or' ? 'ଅନୁକୂଳ / କମ୍ ବିପଦ' : 'Favorable / Low Risk',
      watchMod: lang === 'hi' ? 'निगरानी / मध्यम' : lang === 'or' ? 'ନଜର / ମଧ୍ୟମ' : 'Watch / Moderate',
      high: lang === 'hi' ? 'उच्च जोखिम' : lang === 'or' ? 'ଉଚ୍ଚ ବିପଦ' : 'High Risk',
      vHigh: lang === 'hi' ? 'अत्यधिक शुष्क' : lang === 'or' ? 'ଅତ୍ୟଧିକ ଶୁଷ୍କ' : 'Very High Dry Spell',
      heavyRisk: lang === 'hi' ? 'भारी वर्षा जोखिम' : lang === 'or' ? 'ପ୍ରବଳ ବର୍ଷା ବିପଦ' : 'Heavy Rainfall Risk',
      ecos: lang === 'hi' ? 'ENSO (+0.8 गर्म)' : lang === 'or' ? 'ENSO (+0.8 ଉଷ୍ଣ)' : 'ENSO (+0.8 Warm)',
      iod: lang === 'hi' ? 'IOD (-0.4 नकारात्मक)' : lang === 'or' ? 'IOD (-0.4 ନକାରାତ୍ମକ)' : 'IOD (-0.4 Negative)',
      mjo: lang === 'hi' ? 'MJO (चरण 4)' : lang === 'or' ? 'MJO (ପ୍ରାଣ ୪)' : 'MJO (Phase 4)',
    };
  }, [farmerLanguage]);

  const [activeLayer, setActiveLayer] = useState('break_risk');
  const [mapStyle, setMapStyle] = useState('maptiler-dark');
  const [geoData, setGeoData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);

  const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '4ymFs6LvsUF6t0HAQ95O';

  const getTileUrl = () => {
    if (mapStyle === 'maptiler-satellite') return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`;
    if (mapStyle === 'maptiler-dark') return `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${maptilerKey}`;
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      const data = await fetchGeoJSON(activeLayer);
      if (data) {
        setGeoData(data);
        const found = data.features.find(
          f => f.properties.block.toLowerCase() === selectedBlock.toLowerCase()
        ) || data.features[0];
        setSelectedFeature(found);
      }
      setLoading(false);
    };
    loadMapData();
  }, [activeLayer, selectedBlock]);

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedFeature(feature);
        changeLocation(feature.properties.district, feature.properties.block, feature.properties.id, feature.properties.panchayats?.[0]);
      },
      mouseover: (e) => { e.target.setStyle({ weight: 3, color: '#38bdf8', fillOpacity: 0.75 }); },
      mouseout: (e) => { e.target.setStyle({ weight: 1.5, color: feature.properties.riskColor || '#38bdf8', fillOpacity: 0.45 }); }
    });
  };

  const styleGeoJson = (feature) => {
    const isSelected = selectedFeature?.properties?.id === feature.properties.id;
    return {
      fillColor: feature.properties.riskColor || '#10b981',
      weight: isSelected ? 3.5 : 1.5,
      opacity: 0.9,
      color: isSelected ? '#ffffff' : feature.properties.riskColor || '#38bdf8',
      fillOpacity: isSelected ? 0.7 : 0.45,
      dashArray: isSelected ? '4' : null
    };
  };

  const mapCenter = selectedFeature
    ? [selectedFeature.properties.lat, selectedFeature.properties.lon]
    : [20.712, 86.784];

  const layerLabel = (layer) => {
    if (farmerLanguage === 'hi') return layer.labelHi;
    if (farmerLanguage === 'or') return layer.labelOr;
    return layer.label;
  };

  const sf = selectedFeature?.properties;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-6rem)]">

      {/* Sidebar */}
      <div className="w-full lg:w-[340px] flex-shrink-0 bg-slate-950 border-r border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-900/30">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white">{t.title}</h1>
            <p className="text-[10px] text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Filter className="h-3 w-3 text-cyan-400" /> {t.selectLayer}
          </label>
          <div className="grid grid-cols-1 gap-1">
            {LAYER_CONFIGS.map(layer => {
              const Icon = layer.icon;
              const sel = activeLayer === layer.id;
              const cm = { orange: 'border-orange-500 bg-orange-950/40 text-orange-300', emerald: 'border-emerald-500 bg-emerald-950/40 text-emerald-300', cyan: 'border-cyan-500 bg-cyan-950/40 text-cyan-300', amber: 'border-amber-500 bg-amber-950/40 text-amber-300', indigo: 'border-indigo-500 bg-indigo-950/40 text-indigo-300' };
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all text-left cursor-pointer ${
                    sel ? `${cm[layer.color]} shadow-md` : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{layerLabel(layer)}</span>
                  </div>
                  {sel && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* YOUR LOCATION - Cloud & Weather Info */}
        {sf && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700 p-4 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{t.inspecting}</span>
                <h2 className="text-sm font-extrabold text-white">{sf.block}</h2>
                <p className="text-[10px] text-slate-400">{sf.district}</p>
              </div>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border"
                style={{ backgroundColor: `${sf.riskColor}20`, color: sf.riskColor, borderColor: `${sf.riskColor}50` }}
              >
                {sf.riskLevel}
              </span>
            </div>

            {/* Cloud Status */}
            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-3xl">{getCloudEmoji(sf)}</span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">{t.cloud}</div>
                <div className="text-xs font-bold text-white">{getCloudLabel(sf, farmerLanguage)}</div>
              </div>
            </div>

            {/* Wind & Temp */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-base">💨</div>
                <div className="text-[9px] text-slate-400 font-bold">{t.wind}</div>
                <div className="text-[11px] font-black text-cyan-300 font-mono">18 km/h</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-base">🌡️</div>
                <div className="text-[9px] text-slate-400 font-bold">{t.temp}</div>
                <div className="text-[11px] font-black text-amber-300 font-mono">31°C</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <div className="text-base">🌧️</div>
                <div className="text-[9px] text-slate-400 font-bold">{t.rain}</div>
                <div className="text-[11px] font-black text-sky-300 font-mono">{sf.expected_rainfall_14d}mm</div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1">
                  <CloudRain className="h-2.5 w-2.5 text-emerald-400" /> {t.onset}
                </div>
                <div className="text-sm font-bold text-emerald-400">{sf.onset_prob}%</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1">
                  <SunMedium className="h-2.5 w-2.5 text-orange-400" /> {t.breakRisk}
                </div>
                <div className="text-sm font-bold text-orange-400">{sf.break_prob}%</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1">
                  <Droplets className="h-2.5 w-2.5 text-cyan-400" /> {t.heavyRain}
                </div>
                <div className="text-sm font-bold text-cyan-400">{sf.heavy_rain_prob}%</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1">
                  <BarChart3 className="h-2.5 w-2.5 text-sky-300" /> {t.expected}
                </div>
                <div className="text-sm font-bold text-sky-300">{sf.expected_rainfall_14d}mm</div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-300">
              <span className="font-bold text-amber-300">{t.agroImpact}: </span>
              {sf.risk_factor}
            </div>

            <button
              onClick={() => setActiveTab('command-center')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{t.viewDetail}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Climate Signals - Compact Panel */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{t.climate}</span>
          </div>
          <div className="space-y-1.5">
            {[
              { emoji: '🔥', label: 'ENSO', value: '+0.8°C', desc: t.ecos, color: '#f59e0b' },
              { emoji: '🌊', label: 'IOD', value: '-0.4', desc: t.iod, color: '#06b6d4' },
              { emoji: '🌀', label: 'MJO', value: 'Phase 4', desc: t.mjo, color: '#8b5cf6' },
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

        {/* Legend */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-2 text-[11px]">
          <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider flex items-center justify-between">
            <span>{t.legend}</span>
            <button onClick={() => setLegendOpen(!legendOpen)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
              <ChevronDown className={`h-3 w-3 transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {!legendOpen && (
            <div className="space-y-1.5">
              {[
                { color: '#10b981', label: t.favorLow },
                { color: '#f59e0b', label: t.watchMod },
                { color: '#f97316', label: t.high },
                { color: '#ef4444', label: t.vHigh },
                { color: '#06b6d4', label: t.heavyRisk },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-md flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Map */}
      <div className="flex-1 relative bg-slate-950">
        <MapContainer
          center={[20.712, 86.2]}
          zoom={8}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={false}
        >
          <MapRecenter center={mapCenter} />

          <TileLayer
            key={mapStyle}
            attribution='&copy; MapTiler &copy; OSM | MoES NCMRWF'
            url={getTileUrl()}
          />

          {geoData && (
            <GeoJSON
              key={`${activeLayer}-${selectedFeature?.properties?.id}`}
              data={geoData}
              style={styleGeoJson}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Block labels on all blocks */}
          {geoData?.features.map((feat) => {
            const isSel = selectedFeature?.properties?.id === feat.properties.id;
            return (
              <Marker
                key={`label-${feat.properties.id}`}
                position={[feat.properties.lat, feat.properties.lon]}
                icon={createBlockLabel(feat.properties.block, isSel)}
                eventHandlers={{
                  click: () => {
                    setSelectedFeature(feat);
                    changeLocation(feat.properties.district, feat.properties.block, feat.properties.id, feat.properties.panchayats?.[0]);
                  }
                }}
              />
            );
          })}

          {/* Cloud icon ONLY at selected block */}
          {sf && (
            <Marker
              position={[sf.lat, sf.lon]}
              icon={createLocationCloudIcon(getCloudEmoji(sf), true, sf.block)}
              eventHandlers={{
                click: () => {
                  if (selectedFeature) {
                    changeLocation(sf.district, sf.block, sf.id, sf.panchayats?.[0]);
                  }
                }
              }}
            >
              <Popup>
                <div className="p-1.5 space-y-1 text-[11px]" style={{ fontFamily: 'sans-serif' }}>
                  <div className="font-bold text-sm" style={{ color: '#0e7490' }}>{sf.block}</div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>{sf.district}</div>
                  <div className="text-lg text-center py-1">{getCloudEmoji(sf)}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontFamily: 'monospace', fontSize: '10px' }}>
                    <div>Onset: <strong style={{ color: '#10b981' }}>{sf.onset_prob}%</strong></div>
                    <div>Break: <strong style={{ color: '#f97316' }}>{sf.break_prob}%</strong></div>
                    <div>Heavy: <strong style={{ color: '#06b6d4' }}>{sf.heavy_rain_prob}%</strong></div>
                    <div>Rain: <strong>{sf.expected_rainfall_14d}mm</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Wind arrow ONLY at selected block */}
          {sf && (
            <Marker
              position={[sf.lat + 0.02, sf.lon + 0.025]}
              icon={createWindArrow(210, 18)}
            >
              <Tooltip direction="top" offset={[0, -12]} className="weather-tooltip">
                <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: '#38bdf8' }}>
                  💨 18 km/h SW | 🌡 31°C
                </span>
              </Tooltip>
            </Marker>
          )}
        </MapContainer>

        {/* Top-right controls */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
          <div className="bg-slate-900/92 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2">
            <Eye className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
              {LAYER_CONFIGS.find(l => l.id === activeLayer)?.label || activeLayer}
            </span>
          </div>
          <div className="bg-slate-900/92 backdrop-blur-md border border-slate-700 p-1.5 rounded-xl shadow-2xl flex gap-1">
            {[
              { id: 'maptiler-dark', label: '🗺️ Dark' },
              { id: 'maptiler-satellite', label: '🛰️ Sat' },
              { id: 'carto-dark', label: '🌃 Carto' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setMapStyle(s.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapStyle === s.id ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-[600] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
              <span className="text-sm font-bold text-slate-300">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskMapPage;
