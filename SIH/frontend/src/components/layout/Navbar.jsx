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
  LogIn,
  Search
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
    blocks,
    selectedBlock,
    selectedPanchayat,
    setSelectedPanchayat,
    changeLocation,
    loadingForecast
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    // changeLocation resolves first block + first GP + locationId automatically
    // and triggers real-time forecast fetch + localStorage persist + socket broadcast
    changeLocation(newDistrict, null, null, null);
  };

  const handleBlockChange = (e) => {
    const bname = e.target.value;
    const found = (blocks || []).find(b => b.block === bname);
    if (found) {
      changeLocation(found.district || selectedDistrict, found.block, found.id, found.panchayats?.[0]);
    } else {
      changeLocation(selectedDistrict, bname, null, null);
    }
  };

  const handlePanchayatChange = (e) => {
    const gp = e.target.value;
    // GP change also re-fetches real-time forecast (via AppContext effect) + stores + broadcasts
    setSelectedPanchayat(gp);
  };

  const currentBlockObj = (blocks || []).find(b => b.block === selectedBlock);
  const basePanchayats = currentBlockObj?.panchayats || [];
  // Always show ALL GPs of selected block; keep selected on top if stale
  const activePanchayats = selectedPanchayat && basePanchayats.length > 0 && !basePanchayats.includes(selectedPanchayat)
    ? [selectedPanchayat, ...basePanchayats]
    : basePanchayats;

  const districtCount = districts?.length || 0;
  const blockCount = blocks?.length || 0;
  const gpCount = activePanchayats?.length || 0;

  const [navSearch, setNavSearch] = useState('');
  const [navSearching, setNavSearching] = useState(false);

  const handleNavSearch = async (e) => {
    e?.preventDefault();
    const query = navSearch.trim();
    if (!query) return;

    setNavSearching(true);
    try {
      let districtName = '';
      let blockName = '';
      let locationName = query;
      const isPincode = /^\d{6}$/.test(query);

      if (isPincode) {
        try {
          const pinRes = await fetch(`https://api.postalpincode.in/pincode/${query}`);
          const pinData = await pinRes.json();
          if (pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length) {
            const mainPo = pinData[0].PostOffice[0];
            districtName = mainPo.District;
            blockName = mainPo.Block || mainPo.Name;
            locationName = mainPo.Name;
          }
        } catch (e) {}
      } else {
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}+Odisha+India&format=json&limit=1`);
          const nomData = await nomRes.json();
          if (nomData && nomData.length) {
            const disp = nomData[0].display_name || '';
            const parts = disp.split(',').map(s => s.trim());
            for (const pt of parts) {
              if (districts?.includes(pt)) {
                districtName = pt;
                break;
              }
            }
          }
        } catch (e) {}
      }

      changeLocation(districtName || selectedDistrict, blockName || selectedBlock, null, locationName);
      setNavSearch('');
    } catch (err) {
      console.warn("Nav search error", err);
    }
    setNavSearching(false);
  };

  const renderLocationSelects = (isMobile = false) => (
    <div className={`items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs shadow-inner min-w-0 shrink ${isMobile ? 'flex flex-wrap' : 'hidden xl:flex'}`}>
      <div className="flex items-center gap-1 text-slate-400 shrink-0">
        <MapPin className="h-3.5 w-3.5 text-sky-400" />
        <span className="font-semibold text-slate-300">{selectedState}</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
      </div>

      {/* District Dropdown — shows ALL districts */}
      <select
        value={selectedDistrict || ''}
        onChange={handleDistrictChange}
        title={`${districtCount} districts available`}
        className="bg-slate-800/80 hover:bg-slate-800 text-sky-300 font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer max-w-[130px] shrink"
      >
        {districtCount === 0 && <option value="">Loading…</option>}
        {(districts || []).map(d => (
          <option key={d} value={d} className="bg-slate-900 text-white">
            {d}
          </option>
        ))}
      </select>

      <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />

      {/* Block Dropdown — shows ALL blocks of selected district */}
      <select
        value={selectedBlock || ''}
        onChange={handleBlockChange}
        title={`${blockCount} blocks in ${selectedDistrict}`}
        className="bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-bold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[140px] shrink"
      >
        {blockCount === 0 && <option value="">No blocks</option>}
        {(blocks || []).map(b => (
          <option key={b.id || b.block} value={b.block} className="bg-slate-900 text-white">
            {b.block} ({b.panchayats?.length || 0} GPs)
          </option>
        ))}
      </select>

      <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />

      {/* Panchayat / GP Dropdown — shows ALL GPs of selected block */}
      <select
        value={selectedPanchayat || ''}
        onChange={handlePanchayatChange}
        title={`${gpCount} GPs in ${selectedBlock}`}
        className="bg-slate-800/80 hover:bg-slate-800 text-emerald-300 font-medium rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[130px] shrink"
      >
        {gpCount === 0 && <option value="">No GPs</option>}
        {activePanchayats.map(p => (
          <option key={p} value={p} className="bg-slate-900 text-white">
            GP: {p}
          </option>
        ))}
      </select>

      {/* Place / GP / Pincode Universal Search Input */}
      <form onSubmit={handleNavSearch} className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1 shrink-0">
        <Search className="h-3 w-3 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={navSearch}
          onChange={(e) => setNavSearch(e.target.value)}
          placeholder="Search Place / GP / PIN..."
          className="w-24 sm:w-32 bg-transparent text-[11px] text-white placeholder-slate-400 focus:outline-none font-medium"
        />
        <button type="submit" disabled={navSearching} className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer">
          {navSearching ? '...' : 'Go'}
        </button>
      </form>

      {loadingForecast && <span className="text-[10px] text-cyan-400 animate-pulse ml-1 shrink-0">● live</span>}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2 min-w-0 w-full">
        
        {/* Left: MoES / NCMRWF Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
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
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  MoES <span className="text-sky-400">•</span> NCMRWF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] sm:max-w-none">
                Hyperlocal Monsoon Onset & Break Intelligence System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Hyperlocal Location Cascader (desktop) */}
        {renderLocationSelects(false)}

        {/* Right: Mode Switcher, Language & Auth Button (ALWAYS VISIBLE & UNCLIPPED) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          
          {/* Toggle between Officer Command Center and Farmer Mode */}
          {activeTab === 'farmer-mode' ? (
            <button
              onClick={() => setActiveTab('command-center')}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Officer Command Center</span>
              <span className="sm:hidden">Officer Mode</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('farmer-mode')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <Sprout className="h-3.5 w-3.5 text-amber-200" />
              <span>🌾 Farmer Mode</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs shrink-0">
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
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer shrink-0"
            title="Active Meteorological Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* Auth State Button */}
          {isLoggedIn ? (
            <div className="relative shrink-0">
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
                    <div className="text-[10px] text-emerald-300 font-medium">
                      {selectedDistrict} → {selectedBlock} → GP: {selectedPanchayat}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
            >
              <LogIn className="h-3.5 w-3.5 text-white" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile location bar — visible below header on small/medium screens */}
      <div className="xl:hidden px-3 pb-2 overflow-x-auto">
        {renderLocationSelects(true)}
      </div>

    </header>
  );
};

export default Navbar;
/** Navbar Component - Hyperlocal Location Cascader & Mode Switcher */
