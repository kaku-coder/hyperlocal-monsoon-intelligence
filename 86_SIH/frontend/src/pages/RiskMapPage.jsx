import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useApp } from '../context/AppContext';
import { fetchGeoJSON } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  Layers, 
  MapPin, 
  Eye, 
  AlertTriangle, 
  Droplets, 
  SunMedium, 
  CloudRain, 
  ArrowRight,
  Info,
  Maximize2,
  Filter
} from 'lucide-react';

// Subcomponent to smoothly pan map when selected block changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 8.5, { animate: true });
    }
  }, [center, map]);
  return null;
}

export const RiskMapPage = () => {
  const { 
    selectedDistrict, 
    selectedBlock, 
    changeLocation, 
    setActiveTab,
    selectedLocationId
  } = useApp();

  const [activeLayer, setActiveLayer] = useState('break_risk');
  const [mapStyle, setMapStyle] = useState('maptiler-dark');
  const [geoData, setGeoData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '4ymFs6LvsUF6t0HAQ95O';

  const getTileUrl = () => {
    if (mapStyle === 'maptiler-satellite') {
      return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`;
    }
    if (mapStyle === 'maptiler-dark') {
      return `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${maptilerKey}`;
    }
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      const data = await fetchGeoJSON(activeLayer);
      if (data) {
        setGeoData(data);
        // Find default or currently selected feature
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
        changeLocation(
          feature.properties.district,
          feature.properties.block,
          feature.properties.id,
          feature.properties.panchayats?.[0]
        );
      },
      mouseover: (e) => {
        e.target.setStyle({
          weight: 3,
          color: '#38bdf8',
          fillOpacity: 0.75
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          weight: 1.5,
          color: feature.properties.riskColor || '#38bdf8',
          fillOpacity: 0.45
        });
      }
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-6rem)]">
      
      {/* Map Control & Inspection Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0 bg-slate-950 border-r border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-5">
        
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              Hyperlocal GIS Risk Map
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Odisha Block-Level Geospatial Agro-Climate Risk Layers
          </p>
        </div>

        {/* Layer Selector Tabs */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-sky-400" /> Select Risk Layer:
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'break_risk', label: 'Break / Dry Spell Risk', icon: SunMedium, activeColor: 'border-orange-500 bg-orange-950/40 text-orange-300' },
              { id: 'onset_risk', label: 'Monsoon Onset Progression', icon: CloudRain, activeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
              { id: 'heavy_rain', label: 'Heavy Rainfall Risk (>65mm)', icon: Droplets, activeColor: 'border-cyan-500 bg-cyan-950/40 text-cyan-300' },
              { id: 'rainfall_anomaly', label: 'Rainfall Anomaly (% Departure)', icon: AlertTriangle, activeColor: 'border-amber-500 bg-amber-950/40 text-amber-300' },
              { id: 'soil_moisture', label: 'Topsoil Moisture Deficit', icon: Layers, activeColor: 'border-indigo-500 bg-indigo-950/40 text-indigo-300' }
            ].map(layer => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                    isSelected
                      ? `${layer.activeColor} shadow-md`
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{layer.label}</span>
                  </div>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Block Inspection Card */}
        {selectedFeature && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 p-4 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Inspecting Block
                </span>
                <h2 className="text-base font-extrabold text-white">
                  {selectedFeature.properties.block} Block
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedFeature.properties.district} District • {selectedFeature.properties.panchayats_count} GPs
                </p>
              </div>
              <span 
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border"
                style={{ 
                  backgroundColor: `${selectedFeature.properties.riskColor}25`,
                  color: selectedFeature.properties.riskColor,
                  borderColor: `${selectedFeature.properties.riskColor}50`
                }}
              >
                {selectedFeature.properties.riskLevel}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-sans text-slate-400">Onset Prob</div>
                <div className="text-base font-bold text-emerald-400">
                  {selectedFeature.properties.onset_prob}%
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-sans text-slate-400">Break Risk</div>
                <div className="text-base font-bold text-orange-400">
                  {selectedFeature.properties.break_prob}%
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-sans text-slate-400">Heavy Rain</div>
                <div className="text-base font-bold text-cyan-400">
                  {selectedFeature.properties.heavy_rain_prob}%
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-sans text-slate-400">Expected (14d)</div>
                <div className="text-base font-bold text-sky-300">
                  {selectedFeature.properties.expected_rainfall_14d} mm
                </div>
              </div>
            </div>

            {/* Key Risk Factor */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
              <span className="font-semibold text-amber-300">Agro-Impact: </span>
              {selectedFeature.properties.risk_factor}
            </div>

            {/* Detailed CTA Button */}
            <button
              onClick={() => setActiveTab('command-center')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>View Detailed Prediction</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 space-y-2 text-xs">
          <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
            Layer Classification Legend
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#10b981]" />
              <span className="text-slate-300">Green: Favorable / Low Risk (&lt;30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#f59e0b]" />
              <span className="text-slate-300">Yellow: Watch / Moderate Risk (31–60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#f97316]" />
              <span className="text-slate-300">Orange: High Risk (61–80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#ef4444]" />
              <span className="text-slate-300">Red: Very High Dry Spell Risk (81–100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-[#06b6d4]" />
              <span className="text-slate-300">Cyan: Heavy Rainfall Risk (&gt;65mm)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Interactive Leaflet GIS Map Canvas */}
      <div className="flex-1 relative bg-slate-950">
        <MapContainer
          center={[20.712, 86.2]}
          zoom={8}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <MapRecenter center={mapCenter} />
          
          {/* MapTiler / CartoDB GIS Tiles */}
          <TileLayer
            key={mapStyle}
            attribution='&copy; MapTiler &copy; OpenStreetMap contributors | MoES NCMRWF'
            url={getTileUrl()}
          />

          {/* Render GeoJSON Polygons with Dynamic Risk Colors */}
          {geoData && (
            <GeoJSON
              key={`${activeLayer}-${selectedFeature?.properties?.id}`}
              data={geoData}
              style={styleGeoJson}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Circle Marker Anchors on Block Centroids */}
          {geoData?.features.map((feat) => {
            const isSelected = selectedFeature?.properties?.id === feat.properties.id;
            return (
              <CircleMarker
                key={feat.properties.id}
                center={[feat.properties.lat, feat.properties.lon]}
                radius={isSelected ? 8 : 5}
                pathOptions={{
                  fillColor: feat.properties.riskColor,
                  fillOpacity: 1,
                  color: '#ffffff',
                  weight: isSelected ? 2.5 : 1
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedFeature(feat);
                    changeLocation(
                      feat.properties.district,
                      feat.properties.block,
                      feat.properties.id,
                      feat.properties.panchayats?.[0]
                    );
                  }
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-slate-100 text-xs">
                    <div className="font-bold text-sky-400 text-sm">
                      {feat.properties.block} Block
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {feat.properties.district} District
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div>Onset: <strong className="text-emerald-400">{feat.properties.onset_prob}%</strong></div>
                      <div>Break: <strong className="text-orange-400">{feat.properties.break_prob}%</strong></div>
                      <div>Heavy: <strong className="text-cyan-400">{feat.properties.heavy_rain_prob}%</strong></div>
                      <div>Rain: <strong>{feat.properties.expected_rainfall_14d}mm</strong></div>
                    </div>
                    <div className="pt-1 text-[10px] text-amber-300">
                      Confidence: {feat.properties.confidence}%
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Map Style Selector Overlay Badge */}
        <div className="absolute top-4 right-4 z-[500] bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl text-xs shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              GIS Layer: {activeLayer.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setMapStyle('maptiler-dark')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'maptiler-dark'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ MapTiler Dark
            </button>
            <button
              onClick={() => setMapStyle('maptiler-satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'maptiler-satellite'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛰️ Satellite Hybrid
            </button>
            <button
              onClick={() => setMapStyle('carto-dark')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapStyle === 'carto-dark'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌃 CartoDB
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RiskMapPage;
