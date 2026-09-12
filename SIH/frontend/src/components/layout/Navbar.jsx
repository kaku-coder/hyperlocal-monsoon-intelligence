import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CloudRain, 
  MapPin, 
  Sprout, 
  ShieldCheck, 
  Bell, 
  ChevronRight,
  Activity,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

export const Navbar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    farmerLanguage, 
    setFarmerLanguage,
    user,
    isLoggedIn,
    logoutUserSession,
    selectedState,
    districts,
    selectedDistrict,
    setSelectedDistrict,
    blocks,
    selectedBlock,
    panchayatsList = ['Dangarpatna', 'Katana', 'Meghapur'],
    selectedPanchayat,
    setSelectedPanchayat,
    changeLocation
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleDistrictChange = async (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    localStorage.setItem('moes_selected_district', newDistrict);
    const newBlocks = await fetchBlocks(newDistrict);
    if (newBlocks && newBlocks.length > 0) {
      changeLocation(newDistrict, newBlocks[0].block, newBlocks[0].id, newBlocks[0].panchayats?.[0]);
    }
  };

  const handleBlockChange = (e) => {
    const bname = e.target.value;
    const found = blocks.find(b => b.block === bname);
    if (found) {
      changeLocation(found.district, found.block, found.id, found.panchayats?.[0]);
    }
  };

  const handlePanchayatChange = (e) => {
    setSelectedPanchayat(e.target.value);
  };

  const currentBlockObj = blocks.find(b => b.block === selectedBlock);
  const activePanchayats = currentBlockObj?.panchayats || panchayatsList;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: MoES / NCMRWF Brand Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <CloudRain className="h-6 w-6 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  MoES <span className="text-sky-400">•</span> NCMRWF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
                Hyperlocal Monsoon Onset & Break Intelligence System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Hyperlocal Location Cascader */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs shadow-inner">
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-semibold text-slate-300">{selectedState}</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
          </div>

          {/* District Dropdown */}
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="bg-slate-800/80 hover:bg-slate-800 text-sky-300 font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
          >
            {districts.map(d => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d}
              </option>
            ))}
          </select>

          <ChevronRight className="h-3 w-3 text-slate-600" />

          {/* Block Dropdown */}
          <select
            value={selectedBlock}
            onChange={handleBlockChange}
            className="bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-bold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {blocks.map(b => (
              <option key={b.id} value={b.block} className="bg-slate-900 text-white">
                {b.block}
              </option>
            ))}
          </select>

          <ChevronRight className="h-3 w-3 text-slate-600" />

          {/* Panchayat Dropdown */}
          <select
            value={selectedPanchayat}
            onChange={handlePanchayatChange}
            className="bg-slate-800/80 hover:bg-slate-800 text-emerald-300 font-medium rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            {activePanchayats.map(p => (
              <option key={p} value={p} className="bg-slate-900 text-white">
                GP: {p}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Mode Switcher, Language & Auth Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Toggle between Officer Command Center and Farmer Mode */}
          {activeTab === 'farmer-mode' ? (
            <button
              onClick={() => setActiveTab('command-center')}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Officer Command Center</span>
              <span className="sm:hidden">Officer Mode</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('farmer-mode')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Sprout className="h-3.5 w-3.5 text-amber-200" />
              <span>🌾 Farmer Mode</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFarmerLanguage('en')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                farmerLanguage === 'en' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setFarmerLanguage('hi')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                farmerLanguage === 'hi' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setFarmerLanguage('or')}
              className={`px-2 py-1 rounded font-medium font-odia transition-colors ${
                farmerLanguage === 'or' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>

          {/* Alerts Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Active Meteorological Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* Auth State Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold transition-all cursor-pointer shadow-md"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.name || user.phoneNumber}</span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-2 text-xs z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-slate-800 space-y-0.5">
                    <div className="font-bold text-white text-sm">{user.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">+91 {user.phoneNumber}</div>
                    <div className="text-[10px] text-amber-300 font-semibold mt-1">
                      📍 {user.block || selectedBlock} ({user.pincode || '754212'})
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logoutUserSession();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/60 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>

    </header>
  );
};

export default Navbar;
