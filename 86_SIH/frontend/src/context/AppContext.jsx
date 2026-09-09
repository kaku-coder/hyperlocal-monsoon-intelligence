import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDistricts, fetchBlocks, fetchForecast } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState('command-center');
  const [farmerLanguage, setFarmerLanguage] = useState('en'); // 'en', 'hi', 'or'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

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
      
      // If current selected block is not in new block list, select first
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
