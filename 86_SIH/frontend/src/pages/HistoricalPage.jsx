import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchHistorical } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { History, Calendar, TrendingDown, TrendingUp, AlertCircle, MapPin } from 'lucide-react';

export const HistoricalPage = () => {
  const { selectedLocationId, selectedBlock, selectedDistrict } = useApp();
  const [histData, setHistData] = useState(null);

  useEffect(() => {
    const loadHist = async () => {
      const data = await fetchHistorical(selectedLocationId);
      setHistData(data);
    };
    loadHist();
  }, [selectedLocationId]);

  const yearlyRecords = histData?.yearly_records || [
    { year: 2021, seasonal_rainfall_mm: 1069.5, rainfall_anomaly_percent: -7.0, onset_date: "June 12", longest_dry_spell_days: 8, monsoon_type: "Near Normal with Late Break" },
    { year: 2022, seasonal_rainfall_mm: 1196.0, rainfall_anomaly_percent: 4.0, onset_date: "June 08", longest_dry_spell_days: 5, monsoon_type: "Timely & Favorable" },
    { year: 2023, seasonal_rainfall_mm: 1012.0, rainfall_anomaly_percent: -12.0, onset_date: "June 18", longest_dry_spell_days: 14, monsoon_type: "El Niño Influenced Deficit" },
    { year: 2024, seasonal_rainfall_mm: 1242.0, rainfall_anomaly_percent: 8.0, onset_date: "June 09", longest_dry_spell_days: 6, monsoon_type: "La Niña Modulated Surplus" },
    { year: 2025, seasonal_rainfall_mm: 1092.5, rainfall_anomaly_percent: -5.0, onset_date: "June 14", longest_dry_spell_days: 9, monsoon_type: "Neutral ENSO" },
    { year: 2026, seasonal_rainfall_mm: 943.0, rainfall_anomaly_percent: -18.0, onset_date: "June 19", longest_dry_spell_days: 16, monsoon_type: "Active Dry Spell (Prototype)" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Historical Monsoon Climatology (2021–2026)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span>Retrospective analysis and analog matching for {selectedBlock} Block ({selectedDistrict})</span>
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          Baseline IMD Normal: <strong className="text-sky-300">1,150 mm</strong>
        </div>
      </div>

      {/* Historical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Year vs Rainfall Anomaly */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-400" />
              <span>Rainfall Anomaly (% Departure from Normal)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Positive values indicate excess monsoon; negative values indicate drought/deficit stress
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="rainfall_anomaly_percent" name="Anomaly %">
                  {yearlyRecords.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rainfall_anomaly_percent >= 0 ? '#10b981' : '#f97316'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Longest Dry Spell Duration (Days) */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-400" />
              <span>Longest Intra-Seasonal Dry Spell (Days)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Consecutive rainless days during critical Kharif vegetative window
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="d" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="longest_dry_spell_days" 
                  name="Dry Spell Duration (Days)" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Historical Records Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white">5-Year Historical Climatology Archive (Odisha Zone 11)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold bg-slate-950/60">
                <th className="p-3">Year</th>
                <th className="p-3 text-center">Seasonal Rainfall</th>
                <th className="p-3 text-center">Departure</th>
                <th className="p-3 text-center">Onset Date</th>
                <th className="p-3 text-center">Longest Dry Spell</th>
                <th className="p-3 text-right">Monsoon Regime Character</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {yearlyRecords.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-sans font-bold text-white">{row.year}</td>
                  <td className="p-3 text-center text-sky-300 font-bold">{row.seasonal_rainfall_mm} mm</td>
                  <td className={`p-3 text-center font-bold ${row.rainfall_anomaly_percent >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {row.rainfall_anomaly_percent > 0 ? `+${row.rainfall_anomaly_percent}` : row.rainfall_anomaly_percent}%
                  </td>
                  <td className="p-3 text-center font-sans text-slate-200">{row.onset_date}</td>
                  <td className="p-3 text-center font-bold text-rose-400">{row.longest_dry_spell_days} days</td>
                  <td className="p-3 text-right font-sans text-slate-300">{row.monsoon_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default HistoricalPage;
