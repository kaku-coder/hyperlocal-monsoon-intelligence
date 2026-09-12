import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDistricts, fetchBlocks, fetchPanchayats, fetchForecast, fetchMeApi, logoutUserApi, getLocalFallbackBlocks } from '../services/api';

import locationSocket from '../utils/socketService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState('command-center');
  const [farmerLanguage, setFarmerLanguage] = useState('en'); // 'en', 'hi', 'or'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  // User Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('moes_jwt_token') || null);

  const getSavedUser = () => {
    try {
      const u = localStorage.getItem('moes_user_data');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  };
  const savedUser = getSavedUser();

  // Location Hierarchy State (Persisted in localStorage & synced with logged-in user)
  const [selectedState, setSelectedState] = useState('Odisha');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    return localStorage.getItem('moes_selected_district') || savedUser?.district || 'Khordha';
  });
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(() => {
    return localStorage.getItem('moes_selected_block') || savedUser?.block || 'Bhubaneswar';
  });
  const [selectedPanchayat, setSelectedPanchayatState] = useState(() => {
    return localStorage.getItem('moes_selected_panchayat') || 'Patia';
  });
  const [selectedLocationId, setSelectedLocationId] = useState(() => {
    return localStorage.getItem('moes_selected_locationId') || 'od-khordha-bhubaneswar';
  });

  // Persist full real-time location object for all pages
  const persistLocation = (district, block, panchayat, locId) => {
    try {
      localStorage.setItem('moes_selected_location', JSON.stringify({ district, block, panchayat, locationId: locId, at: Date.now() }));
    } catch {}
  };

  const setSelectedPanchayat = (p) => {
    setSelectedPanchayatState(p);
    localStorage.setItem('moes_selected_panchayat', p);
    persistLocation(selectedDistrict, selectedBlock, p, selectedLocationId);
    locationSocket.changeLocation({ district: selectedDistrict, block: selectedBlock, panchayat: p, locationId: selectedLocationId });
  };

  // Forecast Horizon (7, 14, 21, 30 days)
  const [forecastHorizon, setForecastHorizon] = useState(7);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Selected Crop for Advisory (Default: Rice)
  const [selectedCrop, setSelectedCrop] = useState('rice');

  // Map Location State (persisted in localStorage)
  const getSavedMapLocation = () => {
    try {
      const saved = localStorage.getItem('moes_map_location');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };
  const [mapLocation, setMapLocationState] = useState(getSavedMapLocation);

  const setMapLocation = (loc) => {
    setMapLocationState(loc);
    if (loc) {
      localStorage.setItem('moes_map_location', JSON.stringify(loc));
    } else {
      localStorage.removeItem('moes_map_location');
    }
  };

  // Restore authenticated user on mount if token exists
  useEffect(() => {
    const restoreUser = async () => {
      const savedUser = localStorage.getItem('moes_user_data');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        } catch (e) {}
      }

      if (token) {
        const res = await fetchMeApi(token);
        if (res && res.user) {
          setUser(res.user);
          localStorage.setItem('moes_user_data', JSON.stringify(res.user));
        } else {
          logoutUserSession();
        }
      }
    };
    restoreUser();
  }, []);

  // Login session helper
  const loginUserSession = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) localStorage.setItem('moes_jwt_token', authToken);
    if (userData) {
      localStorage.setItem('moes_user_data', JSON.stringify(userData));
      if (userData.district) {
        setSelectedDistrict(userData.district);
        localStorage.setItem('moes_selected_district', userData.district);
      }
      if (userData.block) {
        setSelectedBlock(userData.block);
        localStorage.setItem('moes_selected_block', userData.block);
      }
      if (userData.pincode) {
        localStorage.setItem('moes_user_pincode', userData.pincode);
      }
    }
  };

  // Logout session helper
  const logoutUserSession = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('moes_jwt_token');
    localStorage.removeItem('moes_user_data');
    localStorage.removeItem('moes_selected_district');
    localStorage.removeItem('moes_selected_block');
    localStorage.removeItem('moes_selected_panchayat');
    await logoutUserApi();
  };

  // Load districts on mount
  useEffect(() => {
    const loadDistricts = async () => {
      const list = await fetchDistricts();
      setDistricts(list);
    };
    loadDistricts();
  }, []);

  // Load blocks whenever district changes — always show ALL blocks for district
  useEffect(() => {
    const loadBlocks = async () => {
      if (!selectedDistrict) return;
      const blist = await fetchBlocks(selectedDistrict);
      setBlocks(blist || []);
      if (blist && blist.length > 0) {
        const current = blist.find(b => b.block.toLowerCase() === selectedBlock?.toLowerCase());
        if (!current) {
          const firstB = blist[0];
          setSelectedBlock(firstB.block);
          localStorage.setItem('moes_selected_block', firstB.block);
          const firstGP = firstB.panchayats?.[0] || '';
          if (firstGP) {
            setSelectedPanchayatState(firstGP);
            localStorage.setItem('moes_selected_panchayat', firstGP);
          }
          if (firstB.id) {
            setSelectedLocationId(firstB.id);
            localStorage.setItem('moes_selected_locationId', firstB.id);
          }
          persistLocation(selectedDistrict, firstB.block, firstGP, firstB.id);
          locationSocket.changeLocation({ district: selectedDistrict, block: firstB.block, panchayat: firstGP, locationId: firstB.id });
        } else {
          // district same but ensure locationId + panchayat are valid for current block
          if (current.id && current.id !== selectedLocationId) {
            setSelectedLocationId(current.id);
            localStorage.setItem('moes_selected_locationId', current.id);
          }
          const gps = current.panchayats || [];
          if (gps.length > 0 && !gps.includes(selectedPanchayat)) {
            setSelectedPanchayatState(gps[0]);
            localStorage.setItem('moes_selected_panchayat', gps[0]);
            persistLocation(selectedDistrict, current.block, gps[0], current.id);
          }
        }
      }
    };
    loadBlocks();
  }, [selectedDistrict]);

  // Sync locationId whenever block changes (same district)
  useEffect(() => {
    if (!blocks || blocks.length === 0 || !selectedBlock) return;
    const found = blocks.find(b => b.block.toLowerCase() === selectedBlock.toLowerCase());
    if (found) {
      if (found.id && found.id !== selectedLocationId) {
        setSelectedLocationId(found.id);
        localStorage.setItem('moes_selected_locationId', found.id);
      }
      const gps = found.panchayats || [];
      if (gps.length > 0 && selectedPanchayat && !gps.includes(selectedPanchayat)) {
        setSelectedPanchayatState(gps[0]);
        localStorage.setItem('moes_selected_panchayat', gps[0]);
      }
      persistLocation(selectedDistrict, found.block, gps.includes(selectedPanchayat) ? selectedPanchayat : gps[0], found.id);
    }
  }, [selectedBlock, blocks]);

  // Load forecast whenever location / GP / horizon changes — real-time fetch + store
  useEffect(() => {
    const loadForecast = async () => {
      if (!selectedLocationId) return;
      setLoadingForecast(true);
      const data = await fetchForecast(selectedLocationId, forecastHorizon, selectedPanchayat);
      if (data) {
        setForecastData(data);
      }
      setLoadingForecast(false);
    };
    loadForecast();
  }, [selectedLocationId, selectedPanchayat, forecastHorizon]);

  // Handler to select location cleanly — resolves id from blocks, stores everything
  const changeLocation = (district, block, locId, panchayat) => {
    const d = district || selectedDistrict;
    let b = block || selectedBlock;
    let id = locId || selectedLocationId;
    let p = panchayat || selectedPanchayat;

    // resolve id + gp from known blocks if not supplied
    const pool = blocks && blocks.length > 0 ? blocks : getLocalFallbackBlocks(d);
    const match = pool.find(x => x.block.toLowerCase() === (b || '').toLowerCase());
    if (match) {
      b = match.block;
      if (!locId) id = match.id;
      const gps = match.panchayats || [];
      if (!panchayat || !gps.includes(panchayat)) {
        p = gps[0] || p;
      }
    }

    setSelectedDistrict(d);
    localStorage.setItem('moes_selected_district', d);
    setSelectedBlock(b);
    localStorage.setItem('moes_selected_block', b);
    if (id) {
      setSelectedLocationId(id);
      localStorage.setItem('moes_selected_locationId', id);
    }
    if (p) {
      setSelectedPanchayatState(p);
      localStorage.setItem('moes_selected_panchayat', p);
    }
    persistLocation(d, b, p, id);
    locationSocket.changeLocation({ district: d, block: b, panchayat: p, locationId: id });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        farmerLanguage,
        setFarmerLanguage,
        theme,
        toggleTheme,
        user,
        token,
        isLoggedIn: !!user,
        loginUserSession,
        logoutUserSession,
        selectedState,
        districts,
        selectedDistrict,
        setSelectedDistrict,
        blocks,
        selectedBlock,
        setSelectedBlock,
        selectedPanchayat,
        setSelectedPanchayat,
        selectedLocationId,
        setSelectedLocationId,
        changeLocation,
        forecastHorizon,
        setForecastHorizon,
        forecastData,
        loadingForecast,
        selectedCrop,
        setSelectedCrop,
        mapLocation,
        setMapLocation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
