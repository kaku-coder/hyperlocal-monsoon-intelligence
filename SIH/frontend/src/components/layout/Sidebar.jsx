import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Map,
  CalendarDays,
  Radio,
  Sprout,
  Smartphone,
  BellRing,
  History,
  HelpCircle,
  Activity,
  Home
} from 'lucide-react';

const navigationItems = [
  { id: 'landing', label: 'Landing & Concept', icon: Home, badge: null },
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
  { id: 'risk-map', label: 'Risk Map', icon: Map, badge: 'Live' },
  { id: 'forecast', label: '7–30 Day Forecast', icon: CalendarDays, badge: null },
  { id: 'climate-signals', label: 'Climate Signals', icon: Radio, badge: 'ENSO' },
  { id: 'advisories', label: 'Crop Advisory Engine', icon: Sprout, badge: 'AI' },
  { id: 'farmer-mode', label: 'Farmer Mode (Saathi)', icon: Smartphone, badge: 'Mobile' },
  { id: 'notifications', label: 'Notification Center', icon: BellRing, badge: 'SMS' },
  { id: 'historical', label: 'Historical Analysis', icon: History, badge: '5-Yr' },
  { id: 'explainability', label: 'Explainable AI (XAI)', icon: HelpCircle, badge: 'SHAP' },
  { id: 'system-status', label: 'System Health', icon: Activity, badge: 'OK' }
];

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950/70 p-3 justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Intelligence Modules
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-sky-500/30 text-sky-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Officer Status Card */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-300">NCMRWF Forecast Cycle</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Run 06Z • Ensemble 45-km downscaled to 4-km Block Grid
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
