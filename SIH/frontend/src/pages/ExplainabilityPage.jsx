import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchExplainability } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  HelpCircle, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Info,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const ExplainabilityPage = () => {
  const { selectedBlock, selectedDistrict, forecastData } = useApp();
  const [explainData, setExplainData] = useState(null);

  useEffect(() => {
    const loadExplanation = async () => {
      const payload = {
        district_name: selectedDistrict,
        block_name: selectedBlock,
        rainfall_anomaly: -24.0,
        temperature: 34.2,
        soil_moisture: 'Low',
        enso: 0.8,
        iod: -0.4,
        mjo_phase: 4
      };
      const data = await fetchExplainability(payload);
      setExplainData(data);
    };
    loadExplanation();
  }, [selectedBlock, selectedDistrict]);

  const contributions = explainData?.feature_contributions || [
    { label: "Recent Rainfall Deficit", contribution_percent: 21.0, description: "Negative rainfall departure (-24%) indicates weak early monsoon convective buildup." },
    { label: "Temperature Anomaly", contribution_percent: 18.0, description: "Surface temp elevated at 34.2°C (+2.8°C above normal), accelerating soil water depletion." },
    { label: "Low Soil Moisture", contribution_percent: 14.0, description: "Topsoil volumetric water content is categorized as 'Low' (22% VWC)." },
    { label: "ENSO (Nino 3.4) Signal", contribution_percent: 11.0, description: "Positive ENSO anomaly (+0.8°C) suppresses tropical Walker circulation over eastern India." },
    { label: "Historical Analog Pattern", contribution_percent: 10.0, description: "Climatological analog matching shows 4 out of 5 similar years experienced 7+ day dry spells." },
    { label: "MJO Phase Modulation", contribution_percent: 8.0, description: "MJO in Phase 4 provides intermittent showers buffering macro subsidence." }
  ];

  const sortedContributions = [...contributions].sort((a, b) => b.contribution_percent - a.contribution_percent);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Explainable AI (XAI) • Why This Prediction?
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span>Feature Contribution Decomposition for {selectedBlock} Block ({selectedDistrict})</span>
          </p>
        </div>
        <div className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-700/60 self-start sm:self-auto flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" /> SHAP Feature Attribution
        </div>
      </div>

      {/* Primary Target Probability Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-950/70 via-slate-900 to-slate-900 border border-orange-500/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
            Target Predicted Risk Metric
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Overall Break / Dry Spell Risk: <span className="text-orange-400 font-mono">68%</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {explainData?.explanation_summary || 
              `The primary factor driving elevated dry-spell risk in ${selectedBlock} is the cumulative rainfall deficit (+21% contribution), reinforced by elevated temperature (+18%) and ENSO teleconnections.`}
          </p>
        </div>

        <div className="flex-shrink-0 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Base Climatology</span>
          <div className="text-xl font-bold text-slate-300 font-mono">25%</div>
          <span className="text-[10px] text-orange-400 font-semibold font-mono">+43% ML Delta</span>
        </div>
      </div>

      {/* Horizontal Feature Contribution Waterfall Chart */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span>Feature Contribution Breakdown (SHAP Values)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Percentage share of atmospheric, hydrological, and oceanic drivers elevating the risk score
          </p>
        </div>

        <div className="h-72 w-full overflow-x-auto min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={320}>
            <BarChart
              layout="vertical"
              data={sortedContributions}
              margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 30]} unit="%" />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="#cbd5e1" 
                fontSize={11} 
                width={120}
                tick={{ fill: '#e2e8f0', fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val) => [`+${val}% contribution`, 'Feature Weight']}
              />
              <Bar dataKey="contribution_percent" radius={[0, 6, 6, 0]}>
                {sortedContributions.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#f97316' : index === 1 ? '#ea580c' : index === 2 ? '#eab308' : '#38bdf8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Contribution Explanations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedContributions.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-mono text-sky-300">
                  {idx + 1}
                </span>
                {item.label}
              </span>
              <span className="text-xs font-mono font-extrabold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
                +{item.contribution_percent}%
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-7">
              {item.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ExplainabilityPage;
