import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDistricts, fetchBlocks, fetchForecast, fetchMeApi, logoutUserApi } from '../services/api';

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
    return localStorage.getItem('moes_selected_panchayat') || 'Dangarpatna';
  });
  const [selectedLocationId, setSelectedLocationId] = useState('od-khordha-bhubaneswar');

  const setSelectedPanchayat = (p) => {
    setSelectedPanchayatState(p);
    localStorage.setItem('moes_selected_panchayat', p);
    locationSocket.changeLocation({ district: selectedDistrict, block: selectedBlock, panchayat: p });
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

  // Load blocks whenever district changes
  useEffect(() => {
    const loadBlocks = async () => {
      if (!selectedDistrict) return;
      const blist = await fetchBlocks(selectedDistrict);
      setBlocks(blist);
    };
    loadBlocks();
  }, [selectedDistrict]);

  // Load forecast whenever location or horizon changes
  useEffect(() => {
    const loadForecast = async () => {
      setLoadingForecast(true);
      const data = await fetchForecast(selectedLocationId, forecastHorizon);
      if (data) {
        setForecastData(data);
      }
      setLoadingForecast(false);
    };
    loadForecast();
  }, [selectedLocationId, forecastHorizon]);

  // Handler to select a block cleanly
  const changeLocation = (district, block, locId, panchayat) => {
    const d = district || selectedDistrict;
    const b = block || selectedBlock;
    const p = panchayat || selectedPanchayat;

    if (district) {
      setSelectedDistrict(district);
      localStorage.setItem('moes_selected_district', district);
    }
    if (block) {
      setSelectedBlock(block);
      localStorage.setItem('moes_selected_block', block);
    }
    if (locId) setSelectedLocationId(locId);
    if (panchayat) {
      setSelectedPanchayatState(panchayat);
      localStorage.setItem('moes_selected_panchayat', panchayat);
    }

    locationSocket.changeLocation({ district: d, block: b, panchayat: p });
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
