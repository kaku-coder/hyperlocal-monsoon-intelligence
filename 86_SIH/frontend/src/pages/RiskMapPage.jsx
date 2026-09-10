import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { fetchGeoJSON, fetchClimateSignals } from '../services/api';
import {
  Layers, MapPin, Eye, AlertTriangle, Droplets, SunMedium, CloudRain,
  ArrowRight, Info, Maximize2, Filter, Wind, Thermometer, Cloud,
  Navigation, Zap, BarChart3, Activity, Globe, ChevronDown, X, RefreshCw
} from 'lucide-react';

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 8.5, { animate: true });
  }, [center, map]);
  return null;
}

function createWeatherIcon(emoji, size = 32) {
  return L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));text-align:center;animation:float 3s ease-in-out infinite;">${emoji}</div>`,
    className: 'weather-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createWindArrow(degrees, speed, size = 36) {
  const color = speed > 25 ? '#ef4444' : speed > 15 ? '#f59e0b' : '#38bdf8';
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;transform:rotate(${degrees}deg);filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4));">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    </div>`,
    className: 'wind-arrow-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createClimateIcon(emoji, label, value, color) {
  return L.divIcon({
    html: `<div style="background:rgba(15,23,42,0.92);border:1.5px solid ${color};border-radius:12px;padding:4px 8px;display:flex;align-items:center;gap:4px;white-space:nowrap;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.4);">
      <span style="font-size:16px;">${emoji}</span>
      <div style="display:flex;flex-direction:column;line-height:1.1;">
        <span style="font-size:8px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>
        <span style="font-size:11px;color:${color};font-weight:900;font-family:monospace;">${value}</span>
      </div>
    </div>`,
    className: 'climate-info-marker',
    iconSize: [120, 36],
    iconAnchor: [60, 18],
  });
}

const LAYER_CONFIGS = [
  { id: 'break_risk', label: 'Break / Dry Spell', labelHi: 'विराम / शुष्क काल', labelOr: 'ବିରାମ / ଶୁଷ୍କ', icon: SunMedium, color: 'orange' },
  { id: 'onset_risk', label: 'Monsoon Onset', labelHi: 'मानसून आरंभ', labelOr: 'ମୌସୁମୀ ଆରମ୍ଭ', icon: CloudRain, color: 'emerald' },
  { id: 'heavy_rain', label: 'Heavy Rainfall', labelHi: 'भारी वर्षा', labelOr: 'ପ୍ରବଳ ବର୍ଷା', icon: Droplets, color: 'cyan' },
  { id: 'rainfall_anomaly', label: 'Rain Anomaly', labelHi: 'वर्षा विसंगति', labelOr: 'ବର୍ଷା ବିଚ୍ୟାସ', icon: AlertTriangle, color: 'amber' },
  { id: 'soil_moisture', label: 'Soil Moisture', labelHi: 'मिट्टी नमी', labelOr: 'ମାଟି ଆର୍ଦ୍ରତା', icon: Layers, color: 'indigo' },
];

const WIND_STATIONS = [
  { lat: 21.49, lon: 86.95, direction: 210, speed: 18, temp: 31, label: 'Balasore' },
  { lat: 20.27, lon: 85.83, direction: 195, speed: 14, temp: 33, label: 'Cuttack' },
  { lat: 19.76, lon: 85.82, direction: 230, speed: 22, temp: 30, label: 'Puri Coast' },
  { lat: 18.75, lon: 84.02, direction: 240, speed: 28, temp: 29, label: 'Ganjam' },
  { lat: 20.93, lon: 85.10, direction: 200, speed: 12, temp: 32, label: 'Dhenkanal' },
  { lat: 21.27, lon: 84.40, direction: 180, speed: 16, temp: 31, label: 'Sambalpur' },
  { lat: 22.25, lon: 84.84, direction: 190, speed: 10, temp: 34, label: 'Sundargarh' },
  { lat: 20.47, lon: 85.88, direction: 220, speed: 20, temp: 30, label: 'Jatni' },
];

const CLIMATE_MARKERS = [
  { lat: 21.0, lon: 83.5, emoji: '🌊', label: 'IOD', value: '-0.4', color: '#06b6d4' },
  { lat: 22.5, lon: 87.0, emoji: '🔥', label: 'ENSO', value: '+0.8', color: '#f59e0b' },
  { lat: 19.5, lon: 87.5, emoji: '🌀', label: 'MJO', value: 'Ph 4', color: '#8b5cf6' },
  { lat: 20.0, lon: 83.0, emoji: '🌡️', label: 'SST', value: '30.2°C', color: '#ef4444' },
];

const RAIN_CLOUDS = [
  { lat: 21.8, lon: 87.2, intensity: 'high', emoji: '⛈️' },
  { lat: 20.5, lon: 85.5, intensity: 'moderate', emoji: '🌧️' },
  { lat: 19.8, lon: 86.2, intensity: 'low', emoji: '🌦️' },
  { lat: 21.0, lon: 84.5, intensity: 'moderate', emoji: '🌧️' },
  { lat: 22.0, lon: 85.8, intensity: 'low', emoji: '⛅' },
];

export const RiskMapPage = () => {
  const { selectedDistrict, selectedBlock, changeLocation, setActiveTab, selectedLocationId, farmerLanguage } = useApp();

  const t = useMemo(() => {
    const lang = farmerLanguage || 'en';
    return {
      title: lang === 'hi' ? 'अतिस्थानीय GIS जोखिम मानचित्र' : lang === 'or' ? 'ଅତିସ୍ଥାନୀୟ GIS ବିପଦ ମାନଚିତ୍ର' : 'Hyperlocal GIS Risk Map',
      subtitle: lang === 'hi' ? 'ओडिशा ब्लॉक-स्तरीय भौगोलिक कृषि-जलवायु जोखिम' : lang === 'or' ? 'ଓଡ଼ିଶା ବ୍ଲକ୍ ସ୍ତରୀୟ ଭୌଗୋଳିକ କୃଷି-ଜଳବାୟୁ ବିପଦ' : 'Odisha Block-Level Geospatial Agro-Climate Risk Layers',
      selectLayer: lang === 'hi' ? 'जोखिम परत चुनें:' : lang === 'or' ? 'ବିପଦ ସ୍ତର ବାଛନ୍ତୁ:' : 'Select Risk Layer:',
      inspecting: lang === 'hi' ? 'निरीक्षण ब्लॉक' : lang === 'or' ? 'ନିରୀକ୍ଷଣ ବ୍ଲକ୍' : 'Inspecting Block',
      viewDetail: lang === 'hi' ? 'विस्तृत पूर्वानुमान देखें' : lang === 'or' ? 'ବିସ୍ତୃତ ପୂର୍ବାନୁମାନ ଦେଖନ୍ତୁ' : 'View Detailed Prediction',
      legend: lang === 'hi' ? 'परत वर्गीकरण' : lang === 'or' ? 'ସ୍ତର ଶ୍ରେଣୀବିଭାଗ' : 'Layer Classification Legend',
      wind: lang === 'hi' ? 'हवा' : lang === 'or' ? 'ପବନ' : 'Wind',
      temp: lang === 'hi' ? 'तापमान' : lang === 'or' ? 'ତାପମାନ' : 'Temp',
      rain: lang === 'hi' ? 'वर्षा' : lang === 'or' ? 'ବର୍ଷା' : 'Rain',
      climate: lang === 'hi' ? 'जलवायु संकेत' : lang === 'or' ? 'ଜଳବାୟୁ ସଙ୍କେତ' : 'Climate Signals',
      onset: lang === 'hi' ? 'आरंभ संभावना' : lang === 'or' ? 'ଆରମ୍ଭ ସମ୍ଭାବନା' : 'Onset Prob',
      breakRisk: lang === 'hi' ? 'विराम जोखिम' : lang === 'or' ? 'ବିରାମ ବିପଦ' : 'Break Risk',
      heavyRain: lang === 'hi' ? 'भारी वर्षा' : lang === 'or' ? 'ପ୍ରବଳ ବର୍ଷା' : 'Heavy Rain',
      expected: lang === 'hi' ? 'अनुमानित' : lang === 'or' ? 'ଆଶା' : 'Expected',
      agroImpact: lang === 'hi' ? 'कृषि प्रभाव' : lang === 'or' ? 'କୃଷି ପ୍ରଭାବ' : 'Agro-Impact',
      favorLow: lang === 'hi' ? 'अनुकूल / कम जोखिम' : lang === 'or' ? 'ଅନୁକୂଳ / କମ୍ ବିପଦ' : 'Favorable / Low Risk',
      watchMod: lang === 'hi' ? 'निगरानी / मध्यम' : lang === 'or' ? 'ନଜର / ମଧ୍ୟମ' : 'Watch / Moderate',
      high: lang === 'hi' ? 'उच्च जोखिम' : lang === 'or' ? 'ଉଚ୍ଚ ବିପଦ' : 'High Risk',
      vHigh: lang === 'hi' ? 'अत्यधिक शुष्क काल' : lang === 'or' ? 'ଅତ୍ୟଧିକ ଶୁଷ୍କ' : 'Very High Dry Spell',
      heavyRisk: lang === 'hi' ? 'भारी वर्षा जोखिम' : lang === 'or' ? 'ପ୍ରବଳ ବର୍ଷା ବିପଦ' : 'Heavy Rainfall Risk',
    };
  }, [farmerLanguage]);

  const [activeLayer, setActiveLayer] = useState('break_risk');
  const [mapStyle, setMapStyle] = useState('maptiler-dark');
  const [geoData, setGeoData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showClimate, setShowClimate] = useState(true);
  const [showWind, setShowWind] = useState(true);
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-6rem)]">

      {/* Sidebar */}
      <div className="w-full lg:w-[380px] flex-shrink-0 bg-slate-950 border-r border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-4">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-900/30">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-tight">{t.title}</h1>
              <p className="text-[10px] text-slate-400">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Live Weather Toggle Strip */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl p-1.5">
          {[
            { key: 'weather', label: '🌦️', active: showWeather, toggle: () => setShowWeather(!showWeather) },
            { key: 'wind', label: '💨', active: showWind, toggle: () => setShowWind(!showWind) },
            { key: 'climate', label: '🌍', active: showClimate, toggle: () => setShowClimate(!showClimate) },
          ].map(item => (
            <button
              key={item.key}
              onClick={item.toggle}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                item.active
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-sm">{item.label}</span>
              <span className="hidden sm:inline">{item.key === 'weather' ? 'Rain' : item.key === 'wind' ? 'Wind' : 'Climate'}</span>
            </button>
          ))}
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
              const colorMap = { orange: 'border-orange-500 bg-orange-950/40 text-orange-300', emerald: 'border-emerald-500 bg-emerald-950/40 text-emerald-300', cyan: 'border-cyan-500 bg-cyan-950/40 text-cyan-300', amber: 'border-amber-500 bg-amber-950/40 text-amber-300', indigo: 'border-indigo-500 bg-indigo-950/40 text-indigo-300' };
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all text-left cursor-pointer ${
                    sel ? `${colorMap[layer.color]} shadow-md` : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{layerLabel(layer)}</span>
                  </div>
                  {sel && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Block Card */}
        {selectedFeature && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700 p-4 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{t.inspecting}</span>
                <h2 className="text-sm font-extrabold text-white">{selectedFeature.properties.block} Block</h2>
                <p className="text-[10px] text-slate-400">{selectedFeature.properties.district} District</p>
              </div>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border"
                style={{ backgroundColor: `${selectedFeature.properties.riskColor}20`, color: selectedFeature.properties.riskColor, borderColor: `${selectedFeature.properties.riskColor}50` }}
              >
                {selectedFeature.properties.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1"><CloudRain className="h-2.5 w-2.5 text-emerald-400" /> {t.onset}</div>
                <div className="text-sm font-bold text-emerald-400">{selectedFeature.properties.onset_prob}%</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1"><SunMedium className="h-2.5 w-2.5 text-orange-400" /> {t.breakRisk}</div>
                <div className="text-sm font-bold text-orange-400">{selectedFeature.properties.break_prob}%</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1"><Droplets className="h-2.5 w-2.5 text-cyan-400" /> {t.heavyRain}</div>
                <div className="text-sm font-bold text-cyan-400">{selectedFeature.properties.heavy_rain_prob}%</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[9px] font-sans text-slate-400 flex items-center gap-1"><BarChart3 className="h-2.5 w-2.5 text-sky-300" /> {t.expected} (14d)</div>
                <div className="text-sm font-bold text-sky-300">{selectedFeature.properties.expected_rainfall_14d} mm</div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-300">
              <span className="font-bold text-amber-300">{t.agroImpact}: </span>
              {selectedFeature.properties.risk_factor}
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

        {/* Legend */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-2 text-[11px]">
          <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider flex items-center justify-between">
            <span>{t.legend}</span>
            <button onClick={() => setLegendOpen(!legendOpen)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
              <ChevronDown className={`h-3 w-3 transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className={`space-y-1.5 ${legendOpen ? 'hidden' : ''}`}>
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
        </div>

      </div>

      {/* Map Area */}
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

          {geoData?.features.map((feat) => {
            const isSelected = selectedFeature?.properties?.id === feat.properties.id;

            // Compute weather logo based on active layer & conditions
            const breakProb = feat.properties.break_prob || 0;
            const heavyProb = feat.properties.heavy_rain_prob || 0;

            let symbol = '🌧️'; // Rain default
            if (activeLayer === 'heavy_rain' || heavyProb > 60) {
              symbol = '🌧️';
            } else if (activeLayer === 'break_risk' || breakProb > 60) {
              symbol = '☀️';
            } else if (activeLayer === 'rainfall_anomaly') {
              symbol = '🌬️';
            } else if (activeLayer === 'soil_moisture') {
              symbol = '❄️';
            } else if (activeLayer === 'onset_risk') {
              symbol = '🌦️';
            }

            const color = feat.properties.riskColor || '#38bdf8';
            const size = isSelected ? 34 : 26;
            const fontSize = isSelected ? 17 : 13;

            const iconHtml = `
              <div style="
                background: ${color};
                border: 2px solid #ffffff;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: ${size}px;
                height: ${size}px;
                box-shadow: 0 0 12px ${color}, 0 2px 8px rgba(0,0,0,0.6);
                font-size: ${fontSize}px;
                cursor: pointer;
                line-height: 1;
                transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                transition: transform 0.2s ease;
              ">
                ${symbol}
              </div>
            `;

            const customMarkerIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-weather-marker-badge',
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2]
            });

            return (
              <Marker
                key={feat.properties.id}
                position={[feat.properties.lat, feat.properties.lon]}
                icon={customMarkerIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedFeature(feat);
                    changeLocation(feat.properties.district, feat.properties.block, feat.properties.id, feat.properties.panchayats?.[0]);
                  }
                }}
              >
                <Popup>
                  <div className="p-1.5 space-y-1 text-[11px]" style={{ fontFamily: 'sans-serif' }}>
                    <div className="font-bold text-sm" style={{ color: '#0e7490' }}>{feat.properties.block} Block</div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>{feat.properties.district}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', paddingTop: '4px', fontFamily: 'monospace', fontSize: '10px' }}>
                      <div>Onset: <strong style={{ color: '#10b981' }}>{feat.properties.onset_prob}%</strong></div>
                      <div>Break: <strong style={{ color: '#f97316' }}>{feat.properties.break_prob}%</strong></div>
                      <div>Heavy: <strong style={{ color: '#06b6d4' }}>{feat.properties.heavy_rain_prob}%</strong></div>
                      <div>Rain: <strong>{feat.properties.expected_rainfall_14d}mm</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Rain Cloud Overlays */}
          {showWeather && RAIN_CLOUDS.map((rc, i) => (
            <Marker
              key={`rain-${i}`}
              position={[rc.lat, rc.lon]}
              icon={createWeatherIcon(rc.emoji, rc.intensity === 'high' ? 38 : rc.intensity === 'moderate' ? 30 : 24)}
            >
              <Tooltip direction="top" offset={[0, -16]} className="weather-tooltip">
                <span style={{ fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700 }}>
                  {rc.intensity === 'high' ? '⛈ Heavy' : rc.intensity === 'moderate' ? '🌧 Moderate' : '🌦 Light'}
                </span>
              </Tooltip>
            </Marker>
          ))}

          {/* Wind Direction Arrows */}
          {showWind && WIND_STATIONS.map((ws, i) => (
            <Marker
              key={`wind-${i}`}
              position={[ws.lat, ws.lon]}
              icon={createWindArrow(ws.direction, ws.speed, ws.speed > 20 ? 40 : 32)}
            >
              <Tooltip direction="top" offset={[0, -18]} className="weather-tooltip">
                <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: ws.speed > 25 ? '#ef4444' : ws.speed > 15 ? '#f59e0b' : '#38bdf8' }}>
                  💨 {ws.speed} km/h {ws.direction}° | 🌡 {ws.temp}°C
                </span>
              </Tooltip>
            </Marker>
          ))}

          {/* Climate Signal Badges */}
          {showClimate && CLIMATE_MARKERS.map((cm, i) => (
            <Marker
              key={`climate-${i}`}
              position={[cm.lat, cm.lon]}
              icon={createClimateIcon(cm.emoji, cm.label, cm.value, cm.color)}
            >
              <Tooltip direction="top" offset={[0, -20]} className="weather-tooltip">
                <span style={{ fontFamily: 'sans-serif', fontSize: '10px', fontWeight: 700, color: cm.color }}>
                  {cm.emoji} {cm.label}: {cm.value}
                </span>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Top-right Map Controls */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
          {/* Active Layer Badge */}
          <div className="bg-slate-900/92 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
              {LAYER_CONFIGS.find(l => l.id === activeLayer)?.label || activeLayer}
            </span>
          </div>

          {/* Tile Style Selector */}
          <div className="bg-slate-900/92 backdrop-blur-md border border-slate-700 p-1.5 rounded-xl shadow-2xl flex gap-1">
            {[
              { id: 'maptiler-dark', label: '🗺️ Dark' },
              { id: 'maptiler-satellite', label: '🛰️ Sat' },
              { id: 'carto-dark', label: '🌃 Carto' },
            ].map(style => (
              <button
                key={style.id}
                onClick={() => setMapStyle(style.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapStyle === style.id ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom-left Weather Summary Overlay */}
        <div className="absolute bottom-3 left-3 z-[500] bg-slate-900/92 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-2.5 shadow-2xl max-w-[260px]">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">Live Weather Overlay</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg">💨</div>
              <div className="text-[9px] text-slate-400 font-bold">{t.wind}</div>
              <div className="text-[11px] font-black text-cyan-300 font-mono">
                {WIND_STATIONS[0]?.speed || 18} km/h
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg">🌡️</div>
              <div className="text-[9px] text-slate-400 font-bold">{t.temp}</div>
              <div className="text-[11px] font-black text-amber-300 font-mono">
                {WIND_STATIONS[0]?.temp || 31}°C
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg">🌧️</div>
              <div className="text-[9px] text-slate-400 font-bold">{t.rain}</div>
              <div className="text-[11px] font-black text-sky-300 font-mono">
                {selectedFeature?.properties?.expected_rainfall_14d || 54}mm
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-right Climate Strip */}
        {showClimate && (
          <div className="absolute bottom-3 right-3 z-[500] bg-slate-900/92 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-2 shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe className="h-3 w-3 text-violet-400" />
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">{t.climate}</span>
            </div>
            <div className="flex items-center gap-2">
              {CLIMATE_MARKERS.map((cm, i) => (
                <div key={i} className="flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="text-xs">{cm.emoji}</span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[8px] text-slate-500 font-bold">{cm.label}</span>
                    <span className="text-[10px] font-black font-mono" style={{ color: cm.color }}>{cm.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[600] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
              <span className="text-sm font-bold text-slate-300">Loading GIS Layer...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskMapPage;
