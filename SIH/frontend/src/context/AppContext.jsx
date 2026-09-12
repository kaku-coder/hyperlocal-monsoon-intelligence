import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDistricts, fetchBlocks, fetchPanchayats, fetchForecast, fetchMeApi, logoutUserApi, getLocalFallbackBlocks, subscribeWeatherAlertsSSE } from '../services/api';

import locationSocket from '../utils/socketService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState('command-center');
  const [farmerLanguage, setFarmerLanguage] = useState('en'); // 'en', 'hi', 'or'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    const isNewDistrict = d && d.toLowerCase() !== (selectedDistrict || '').toLowerCase();

    // Use fresh block pool if district changed to avoid matching against stale blocks
    const pool = (isNewDistrict || !blocks || blocks.length === 0)
      ? getLocalFallbackBlocks(d)
      : blocks;
    
    if (isNewDistrict) {
      setBlocks(pool);
    }

    let b = block;
    let id = locId;
    let p = panchayat;

    const match = pool.find(x => x.block.toLowerCase() === (b || '').toLowerCase()) || pool[0];
    if (match) {
      b = match.block;
      if (!id) id = match.id;
      const gps = match.panchayats || [];
      if (!p || (gps.length > 0 && !gps.includes(p))) {
        p = gps[0] || p;
      }
    }

    setSelectedDistrict(d);
    localStorage.setItem('moes_selected_district', d);
    if (b) {
      setSelectedBlock(b);
      localStorage.setItem('moes_selected_block', b);
    }
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

  // Centralized Persistent Notification Engine
  const getSavedNotifications = () => {
    try {
      const saved = localStorage.getItem('moes_notifications_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'notif-1',
        title: 'Heavy Rain Warning (Mahakalapada)',
        message: 'High probability of convective squalls (>65mm) in delta tracts within 12h.',
        time: '15 mins ago',
        unread: true,
        type: 'HEAVY_RAIN'
      },
      {
        id: 'notif-2',
        title: 'High Dry-Spell Alert (Rajkanika)',
        message: 'Rainfall deficit (-24%) combined with El Niño. Delayed sowing recommended.',
        time: '25 mins ago',
        unread: true,
        type: 'DRY_SPELL'
      },
      {
        id: 'notif-3',
        title: 'SMS Alert Gateway Active',
        message: 'Logged in successfully. Real-time weather alerts enabled via SMS.',
        time: '1 hour ago',
        unread: true,
        type: 'INFO'
      }
    ];
  };

  const [notificationsList, setNotificationsList] = useState(getSavedNotifications);

  // Audio chime trigger helper
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const addNotification = (item) => {
    const newNotif = {
      id: item.id || `notif-${Date.now()}`,
      title: item.title || 'MoES Weather Alert',
      message: item.message || '',
      time: item.time || 'Just now',
      unread: true,
      type: item.type || 'INFO'
    };

    playNotificationSound();

    setNotificationsList(prev => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('moes_notifications_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Native Browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.ico'
          });
        } catch (e) {}
      } else if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const removeNotification = (id) => {
    setNotificationsList(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem('moes_notifications_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotificationsList([]);
    try {
      localStorage.removeItem('moes_notifications_history');
    } catch {}
  };

  const markAllNotificationsRead = () => {
    setNotificationsList(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      try {
        localStorage.setItem('moes_notifications_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          return await Notification.requestPermission();
        } catch (e) {}
      }
      return Notification.permission;
    }
    return 'unsupported';
  };

  const triggerTestNotification = () => {
    addNotification({
      id: `notif-${Date.now()}`,
      title: `🚨 Test Alert: ${selectedDistrict} Station`,
      message: `Real-time heavy monsoon warning test broadcast triggered successfully at ${new Date().toLocaleTimeString()}.`,
      time: 'Just now',
      type: 'HEAVY_RAIN'
    });
  };

  const unreadNotificationCount = notificationsList.filter(n => n.unread).length;

  // Live SSE Weather Alert Subscription in AppContext
  useEffect(() => {
    const unsub = subscribeWeatherAlertsSSE((payload) => {
      addNotification({
        id: `notif-${Date.now()}`,
        title: `🚨 ${payload.district || 'MoES'} Weather Broadcast`,
        message: payload.message_en || 'Moderate to heavy monsoon showers expected within 12h.',
        time: 'Just now',
        type: payload.severity || 'HEAVY_RAIN'
      });
    });
    return unsub;
  }, []);

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
        setMapLocation,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        notificationsList,
        addNotification,
        removeNotification,
        clearAllNotifications,
        markAllNotificationsRead,
        requestNotificationPermission,
        triggerTestNotification,
        unreadNotificationCount
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

/** AppContext - Global State & Sync Engine for Odisha Monsoon Platform */
