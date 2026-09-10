import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDistricts, fetchBlocks, fetchForecast, fetchMeApi, logoutUserApi } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState('command-center');
  const [farmerLanguage, setFarmerLanguage] = useState('en'); // 'en', 'hi', 'or'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  // User Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('moes_jwt_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Location Hierarchy State (Default: Odisha -> Kendrapara -> Rajkanika)
  const [selectedState, setSelectedState] = useState('Odisha');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Kendrapara');
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('Rajkanika');
  const [selectedPanchayat, setSelectedPanchayat] = useState('Dangarpatna');
  const [selectedLocationId, setSelectedLocationId] = useState('od-kendrapara-rajkanika');

  // Forecast Horizon (7, 14, 21, 30 days)
  const [forecastHorizon, setForecastHorizon] = useState(7);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Selected Crop for Advisory (Default: Rice)
  const [selectedCrop, setSelectedCrop] = useState('rice');

  // Restore authenticated user on mount if token exists
  useEffect(() => {
    const restoreUser = async () => {
      const savedUser = localStorage.getItem('moes_user_data');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          if (parsed.district) setSelectedDistrict(parsed.district);
          if (parsed.block) setSelectedBlock(parsed.block);
        } catch (e) {}
      }

      if (token) {
        const res = await fetchMeApi(token);
        if (res && res.user) {
          setUser(res.user);
          localStorage.setItem('moes_user_data', JSON.stringify(res.user));
          if (res.user.district) setSelectedDistrict(res.user.district);
          if (res.user.block) setSelectedBlock(res.user.block);
        } else {
          // Token expired or invalid
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
    if (userData) localStorage.setItem('moes_user_data', JSON.stringify(userData));
  };

  // Logout session helper
  const logoutUserSession = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('moes_jwt_token');
    localStorage.removeItem('moes_user_data');
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
      
      if (blist.length > 0) {
        const found = blist.find(b => b.block.toLowerCase() === selectedBlock.toLowerCase());
        if (!found) {
          setSelectedBlock(blist[0].block);
          setSelectedLocationId(blist[0].id);
          if (blist[0].panchayats?.length > 0) {
            setSelectedPanchayat(blist[0].panchayats[0]);
          }
        }
      }
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
    setSelectedDistrict(district);
    setSelectedBlock(block);
    if (locId) setSelectedLocationId(locId);
    if (panchayat) setSelectedPanchayat(panchayat);
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
        isAuthModalOpen,
        setIsAuthModalOpen,
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
        setSelectedCrop
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
