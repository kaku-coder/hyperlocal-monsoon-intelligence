import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CloudRain, 
  Map, 
  Sprout, 
  Smartphone, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Activity,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const LandingPage = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-gov-card to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Ministry of Earth Sciences (MoES) • NCMRWF</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Hyperlocal Monsoon <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Intelligence</span> & Decision Support
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            AI-powered block-level monsoon onset & break prediction and crop decision support for climate-resilient agriculture across Indian farming blocks.
          </p>

          {/* Key Capabilities Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {[
              "7–30 Day Probabilistic Outlook",
              "Block-Level Risk Mapping",
              "Climate Signal Integration (ENSO/IOD)",
              "Crop-Specific Sowing Advisories",
              "Multi-Lingual Farmer SMS/WhatsApp",
              "Explainable AI (SHAP Contributions)"
            ].map((pill, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>{pill}</span>
              </div>
            ))}
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('command-center')}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 transition-all cursor-pointer group"
            >
              <span>Open Command Center</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('farmer-mode')}
              className="flex items-center gap-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-6 py-3.5 text-sm font-bold text-emerald-300 hover:bg-emerald-600/30 transition-all cursor-pointer"
            >
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span>Explore Farmer Mode (Monsoon Saathi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-400" />
              <span>End-to-End Intelligence Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400">
              From global atmospheric teleconnections to block-level risk and localized farmer advisories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {[
            {
              step: "01",
              title: "Global Climate",
              desc: "ENSO (+0.8), IOD (-0.4), MJO Phase 4 oceanic-atmospheric indices.",
              icon: Radio,
              color: "text-blue-400",
              bg: "bg-blue-950/40 border-blue-800/50"
            },
            {
              step: "02",
              title: "Regional Weather",
              desc: "Gridded numerical NWP data, IMD rainfall, satellite soil moisture.",
              icon: CloudRain,
              color: "text-sky-400",
              bg: "bg-sky-950/40 border-sky-800/50"
            },
            {
              step: "03",
              title: "AI ML Engine",
              desc: "FastAPI ML ensemble models probabilistic onset & break spells.",
              icon: Zap,
              color: "text-indigo-400",
              bg: "bg-indigo-950/40 border-indigo-800/50"
            },
            {
              step: "04",
              title: "Hyperlocal Risk",
              desc: "GIS block polygons calibrated with risk levels (Rajkanika: 68% Break).",
              icon: Map,
              color: "text-amber-400",
              bg: "bg-amber-950/40 border-amber-800/50"
            },
            {
              step: "05",
              title: "Farmer Advisory",
              desc: "Crop-specific guidance in Odia, Hindi, English via SMS & WhatsApp.",
              icon: Sprout,
              color: "text-emerald-400",
              bg: "bg-emerald-950/40 border-emerald-800/50"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-2xl border p-5 ${item.bg} flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-500 tracking-wider">
                    STEP {item.step}
                  </span>
                  <div className={`p-2 rounded-xl bg-slate-900/80 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div 
          onClick={() => setActiveTab('risk-map')}
          className="group rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-sky-500/50 transition-all cursor-pointer space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
              GIS Block Risk Mapping
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Explore interactive spatial layers for Onset, Break Spells, Heavy Rain, Soil Moisture, and Rainfall Anomaly across Odisha blocks.
            </p>
          </div>
          <div className="text-xs font-semibold text-sky-400 flex items-center gap-1">
            <span>Launch GIS Map</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('advisories')}
          className="group rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-emerald-500/50 transition-all cursor-pointer space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Crop Advisory Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Automated agronomic decision rules for Rice, Maize, Groundnut, Pulses, and Vegetables explaining exactly why each advice was triggered.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <span>Generate Advisory</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('explainability')}
          className="group rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-indigo-500/50 transition-all cursor-pointer space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              Explainable AI (Why this Prediction?)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Transparent feature attribution breaking down how temperature anomaly, rainfall deficit, soil moisture, and ENSO signals drive risk scores.
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
            <span>View Feature Importance</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

      </div>

    </div>
  );
};

export default LandingPage;
