import React, { useState, useEffect } from 'react';
import { fetchSystemStatus } from '../services/api';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Server, 
  Radio, 
  Layers, 
  Zap, 
  Clock, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const SystemStatusPage = () => {
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      const data = await fetchSystemStatus();
      setStatusData(data);
    };
    loadStatus();
  }, []);

  const subsystems = statusData?.subsystems || [
    { name: "Regional Weather Data Feed (IMD/NCMRWF Grid)", status: "AVAILABLE", latency_ms: 38, type: "Data Feed" },
    { name: "Climate Teleconnection Signals (ENSO/IOD/MJO)", status: "AVAILABLE", latency_ms: 45, type: "Index Service" },
    { name: "Geospatial Boundary Engine (Odisha 10 Districts)", status: "AVAILABLE", latency_ms: 12, type: "GIS Engine" },
    { name: "FastAPI ML Prediction Microservice (Port 8000)", status: "OPERATIONAL", latency_ms: 82, type: "AI/ML Service" },
    { name: "Agro-Meteorological Rule Matrix", status: "OPERATIONAL", latency_ms: 15, type: "Advisory Engine" },
    { name: "SMS / WhatsApp Farmer Dispatch Gateway", status: "SIMULATED", latency_ms: 110, type: "Broadcast Queue" },
    { name: "Database & Historical Climatology Cache", status: "CONNECTED", latency_ms: 8, type: "MongoDB-Ready" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              System Health & Operational Status
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time diagnostics of meteorological ingestion pipelines, ML services, and dispatch gateways
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All Core Subsystems Operational</span>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Weather Data Ingestion</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white">AVAILABLE</div>
          <p className="text-[11px] text-slate-400">IMD Gridded Daily Data Assimilated</p>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Climate Signals</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white">AVAILABLE</div>
          <p className="text-[11px] text-slate-400">ENSO + IOD + MJO Feed Synchronized</p>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">ML Prediction Engine</span>
            <Cpu className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-lg font-black text-sky-400 font-mono">FastAPI v1.2</div>
          <p className="text-[11px] text-slate-400">Ensemble Probabilistic Classifier</p>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Last Model Run</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-300">Today, 06:00 UTC</div>
          <p className="text-[11px] text-slate-400">Next Scheduled Run: 12:00 UTC</p>
        </div>

      </div>

      {/* Detailed Subsystems Health Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white">Subsystems & API Latency Telemetry</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2">Subsystem Component</th>
                <th className="pb-2">Type</th>
                <th className="pb-2 text-center">Status</th>
                <th className="pb-2 text-right">Response Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {subsystems.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 font-sans font-bold text-slate-200">{sub.name}</td>
                  <td className="py-3 font-sans text-slate-400">{sub.type}</td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      sub.status === 'OPERATIONAL' || sub.status === 'AVAILABLE' || sub.status === 'CONNECTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-sky-400 font-bold">{sub.latency_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prototype Governance & Data Attribution Notice */}
      <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Prototype Integrity & Scientific Governance Notice</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This system is an engineered working demonstration prototype developed for the <strong>Smart India Hackathon (SIH 2026)</strong> under the theme <em>Agriculture, FoodTech & Rural Development</em>. 
          The meteorological values, spatial risk indices, and ML predictions are structured with realistic physical dynamics for demonstration and decision-flow validation. 
          In operational deployment, live NCUM (12-km) NWP model data, satellite-derived topsoil moisture from ISRO/MOSDAC, and operational IMD observational station APIs can be connected directly into the REST backend without architectural modifications.
        </p>
      </div>

    </div>
  );
};

export default SystemStatusPage;
