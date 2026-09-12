/**
 * API Service Client for Frontend
 * Connects to Express Backend with automatic fallback if backend is momentarily unreachable.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// --- AUTH APIs ---
export const sendOtpApi = async (phoneNumber) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    return await res.json();
  } catch (err) {
    console.error("sendOtpApi error", err);
    return { status: "error", message: "Network error. Please try again." };
  }
};

export const verifyOtpApi = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error("verifyOtpApi error", err);
    return { status: "error", message: "Network error. Please try again." };
  }
};

export const registerUserApi = async (userData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  } catch (err) {
    console.error("registerUserApi error", err);
    return { status: "error", message: "Network error. Please try again." };
  }
};

export const loginUserApi = async (identifier, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: identifier, name: identifier, password })
    });
    return await res.json();
  } catch (err) {
    console.error("loginUserApi error", err);
    return { status: "error", message: "Network error. Please try again." };
  }
};

export const mobileLoginApi = async (phoneNumber) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/mobile-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    return await res.json();
  } catch (err) {
    console.error("mobileLoginApi error", err);
    return { status: "error", message: "Network error. Please try again." };
  }
};

export const fetchMeApi = async (token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("fetchMeApi error", err);
  }
  return null;
};

export const logoutUserApi = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
  } catch (err) {
    console.error("logoutUserApi error", err);
  }
};

export const fetchAutoLocationApi = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/location/auto-ip`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("IPStack auto-location fallback error", err);
  }
  return null;
};

export const fetchLocations = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/locations`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Using fallback locations", err);
  }
  return [];
};

export const fetchDistricts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/districts`);
    if (res.ok) {
      const data = await res.json();
      return data.districts;
    }
  } catch (err) {
    console.warn("Using fallback districts", err);
  }
  return [
    "Balasore", "Bhadrak", "Cuttack", "Ganjam", "Jagatsinghpur",
    "Jajpur", "Kendrapara", "Khordha", "Mayurbhanj", "Puri"
  ];
};

const LOCAL_ODISHA_DB = {
  'Balasore': [
    { id: "od-balasore-sadar", district: "Balasore", block: "Balasore Sadar", panchayats: ["Kuruda", "Haladipada", "Chhanpur", "Srikona", "Phulwar", "Rundia", "Remuna Ghati", "Kasipada"] },
    { id: "od-balasore-jaleswar", district: "Balasore", block: "Jaleswar", panchayats: ["Sugo", "Kotasahi", "Rayaramchandrapur", "Paschimbad", "Arakhpur", "Netua", "Paikasa", "Champavar", "Khalina", "Olada", "Laxmannath", "Jaleswar Town"] },
    { id: "od-balasore-baliapal", district: "Balasore", block: "Baliapal", panchayats: ["Baliapal", "Asti", "Badasimulia", "Badhapal", "Bishnupur", "Dalua", "Ghantiary", "Jamkunda", "Jharapimpal", "Panchurukhi", "Paschima Bad", "Rella"] },
    { id: "od-balasore-basta", district: "Balasore", block: "Basta", panchayats: ["Basta", "Darda", "Mukulisi", "Sadanandapur", "Mathani", "Baharda", "Nagra", "Brahmanagao"] },
    { id: "od-balasore-bhograi", district: "Balasore", block: "Bhograi", panchayats: ["Bhograi", "Chandanpur", "Kusha", "Talsari", "Batagram", "Dehurda", "Kamarda", "Sarasatia"] },
    { id: "od-balasore-remuna", district: "Balasore", block: "Remuna", panchayats: ["Remuna", "Gopalpur", "Kalyani", "Patripada", "Nisamani", "Mandarpur", "Sujanpur", "Padmapur"] },
    { id: "od-balasore-soro", district: "Balasore", block: "Soro", panchayats: ["Soro Town", "Anantapur", "Manjuri Road", "Mangalpur", "Sabira", "Oupada"] }
  ],
  'Bhadrak': [
    { id: "od-bhadrak-sadar", district: "Bhadrak", block: "Bhadrak Sadar", panchayats: ["Arnapal", "Kharida", "Randia", "Banta", "Gelpur", "Baudpur", "Asura", "Nalanga"] },
    { id: "od-bhadrak-chandbali", district: "Bhadrak", block: "Chandbali", panchayats: ["Motto", "Kandagaradi", "Aradi", "Bansada", "Dhamra", "Panchapada", "Karanjamal", "Orasahi"] },
    { id: "od-bhadrak-dhamnagar", district: "Bhadrak", block: "Dhamnagar", panchayats: ["Dhamnagar", "Dobal", "Jahangir", "Asurali", "Kothar", "Khaparapada", "Chudamani"] },
    { id: "od-bhadrak-basudevpur", district: "Bhadrak", block: "Basudevpur", panchayats: ["Basudevpur", "Eram", "Bideipur", "Chudamani", "Lunga", "Kumarpur"] }
  ],
  'Cuttack': [
    { id: "od-cuttack-sadar", district: "Cuttack", block: "Cuttack Sadar", panchayats: ["Telengapentha", "Kalyani Nagar", "Bandalo", "Bidyadharpur", "Chauliaganj", "Jobra", "Madhupatna", "Gopalpur"] },
    { id: "od-cuttack-athagarh", district: "Cuttack", block: "Athagarh", panchayats: ["Radhakishorepur", "Khuntuni", "Dorada", "Kandarapur", "Bentakar", "Gurudijhatia", "Athagarh Town"] },
    { id: "od-cuttack-salipur", district: "Cuttack", block: "Salipur", panchayats: ["Bhatapada", "Choudwar", "Kishorenagar", "Sisua", "Salipur Town", "Tangi-Choudwar", "Bahugram"] },
    { id: "od-cuttack-banki", district: "Cuttack", block: "Banki", panchayats: ["Banki", "Charchika", "Kalapathar", "Subarnapur", "Pathapur", "Nuagan", "Rathipur"] },
    { id: "od-cuttack-badamba", district: "Cuttack", block: "Badamba", panchayats: ["Badamba", "Maniabandha", "Bhattarika", "Sankhameri", "Gopinathpur", "Khandapada Road"] },
    { id: "od-cuttack-niali", district: "Cuttack", block: "Niali", panchayats: ["Niali", "Kasarda", "Jhabata", "Nuagaon", "Bilasuni", "Eranch"] }
  ],
  'Khordha': [
    { id: "od-khordha-bhubaneswar", district: "Khordha", block: "Bhubaneswar", panchayats: ["Patia", "Mancheswar", "Baramunda", "Tamando", "Dhauli", "Chandaka", "Khandagiri", "Sundarpada", "Pahala", "Raghunathpur", "Bhuasuni", "Kalinga Nagar", "Infocity"] },
    { id: "od-khordha-jatani", district: "Khordha", block: "Jatani", panchayats: ["Kantabad", "Khurdha Road", "Kudiary", "Padanpur", "Jatani Town", "Bachharat", "Harirajpur", "Retang"] },
    { id: "od-khordha-sadar", district: "Khordha", block: "Khordha Sadar", panchayats: ["Gurujanga", "Kaipadar", "Orkal", "Tangiapada", "Malipada", "Bajpur", "Jankia", "Nirakarpur", "Khordha Town"] },
    { id: "od-khordha-balianta", district: "Khordha", block: "Balianta", panchayats: ["Baluakati", "Benupur", "Jayadev", "Banamalipur", "Satyabhamapur", "Purushottampur", "Prataprudrapur"] },
    { id: "od-khordha-balipatna", district: "Khordha", block: "Balipatna", panchayats: ["Balipatna", "Bhapur", "Rajas", "Turintira", "Majhihara", "Pamana", "Bamanala"] },
    { id: "od-khordha-tangi", district: "Khordha", block: "Tangi", panchayats: ["Tangi", "Kuhudi", "Olasingha", "Bhushandpur", "Chandeswar", "Saranakul", "Kapasagaria"] },
    { id: "od-khordha-banpur", district: "Khordha", block: "Banpur", panchayats: ["Banpur", "Nachuni", "Gambharimunda", "Balugaon", "Niladriprasad", "Bishnupur", "Bhetanati"] },
    { id: "od-khordha-begunia", district: "Khordha", block: "Begunia", panchayats: ["Begunia", "Bolagarh", "Pichukuli", "Durgapur", "Kantabada", "Sagarguan", "Deuli"] },
    { id: "od-khordha-bolagarh", district: "Khordha", block: "Bolagarh", panchayats: ["Bolagarh", "Manikagoda", "Sanapadar", "Gopalpur", "Dhabaleswar", "Khadapada"] }
  ],
  'Puri': [
    { id: "od-puri-sadar", district: "Puri", block: "Puri Sadar", panchayats: ["Baliguali", "Chhaitana", "Gopinathpur", "Samanga", "Chandanpur", "Biraharekrushnapur", "Malatipatpur", "Satasankha"] },
    { id: "od-puri-nimapada", district: "Puri", block: "Nimapada", panchayats: ["Alipingal", "Denuan", "Gopabandhu", "Terundia", "Nimapada Town", "Antuar", "Nagar", "Bhagabanpur"] },
    { id: "od-puri-pipili", district: "Puri", block: "Pipili", panchayats: ["Pipili Town", "Teisipur", "Dhauli-Pipili", "Danamukundapur", "Govindpur", "Kausalaganga"] },
    { id: "od-puri-gop", district: "Puri", block: "Gop", panchayats: ["Gop", "Konark", "Ramachandi", "Nagaspur", "Sutamukhi", "Liakhia"] },
    { id: "od-puri-brahmagiri", district: "Puri", block: "Brahmagiri", panchayats: ["Brahmagiri", "Satapada", "Mirzapur", "Rebana Nuagaon", "Panasapada", "Alarnath"] }
  ],
  'Kendrapara': [
    { id: "od-kendrapara-rajkanika", district: "Kendrapara", block: "Rajkanika", panchayats: ["Dangarpatna", "Katana", "Barunadiha", "Meghapur", "Baghabuda", "Tarasahi", "Jaynagar", "Nanpur", "Jagulaipada"] },
    { id: "od-kendrapara-aul", district: "Kendrapara", block: "Aul", panchayats: ["Demal", "Govindpur", "Batipada", "Keredagarh", "Sanmangala", "Sansar"] },
    { id: "od-kendrapara-mahakalapada", district: "Kendrapara", block: "Mahakalapada", panchayats: ["Ramnagar", "Jambu", "Batighar", "Kharinasi", "Barada", "Marshaghai"] },
    { id: "od-kendrapara-pattamundai", district: "Kendrapara", block: "Pattamundai", panchayats: ["Andhara", "Bachharai", "Alapua", "Dosia", "Srirampur", "Damarpur"] },
    { id: "od-kendrapara-marshaghai", district: "Kendrapara", block: "Marshaghai", panchayats: ["Berhampur", "Karatutha", "Dumuka", "Manikunda", "Angulai"] },
    { id: "od-kendrapara-sadar", district: "Kendrapara", block: "Kendrapara Sadar", panchayats: ["Kendrapara Town", "Derabish", "Garadpur", "Kagaznagar", "Chagala", "Nial"] }
  ],
  'Jagatsinghpur': [
    { id: "od-jagatsinghpur-sadar", district: "Jagatsinghpur", block: "Jagatsinghpur Sadar", panchayats: ["Kaduapada", "Chatra", "Puran", "Alipingal", "Gorakhnath", "Punanga"] },
    { id: "od-jagatsinghpur-paradip", district: "Jagatsinghpur", block: "Paradip (Kujang)", panchayats: ["Bhutamundai", "Nuagarh", "Sandhakuda", "Bijaychandrapur", "Paradip Port", "Kujang Town"] },
    { id: "od-jagatsinghpur-tirtol", district: "Jagatsinghpur", block: "Tirtol", panchayats: ["Tirtol", "Tarapur", "Manijanga", "Sankheswar", "Sanara", "Kanakpur"] }
  ],
  'Ganjam': [
    { id: "od-ganjam-berhampur", district: "Ganjam", block: "Berhampur", panchayats: ["Ankushpur", "Lathi", "Nimakhandi", "Golanthara", "Haladiapadar", "Kukudakhandi", "Brahmapur Town", "Bhakuri"] },
    { id: "od-ganjam-chatrapur", district: "Ganjam", block: "Chatrapur", panchayats: ["Chatrapur", "Agastinuagaon", "Aryapalli", "Bipulingi", "Ganjam Town", "Kanamana", "Chamaakhandi"] },
    { id: "od-ganjam-hinjilicut", district: "Ganjam", block: "Hinjilicut", panchayats: ["Hinjilicut Town", "Pochilima", "Durbandha", "Sasan", "Ralaba", "Sikiri"] },
    { id: "od-ganjam-bhanjanagar", district: "Ganjam", block: "Bhanjanagar", panchayats: ["Bhanjanagar", "Belaguntha", "Mujagada", "Kullada", "Gallery", "Inamalu"] }
  ],
  'Mayurbhanj': [
    { id: "od-mayurbhanj-baripada", district: "Mayurbhanj", block: "Baripada", panchayats: ["Pundal", "Sankhabhanga", "Manitri", "Badasahi", "Lalazar", "Deuli", "Bhaunri", "Takatpur"] },
    { id: "od-mayurbhanj-rairangpur", district: "Mayurbhanj", block: "Rairangpur", panchayats: ["Rairangpur Town", "Bahalda", "Badampahar", "Gorumahisani", "Gidhighaty", "Tiring"] }
  ],
  'Jajpur': [
    { id: "od-jajpur-sadar", district: "Jajpur", block: "Jajpur Sadar", panchayats: ["Bari", "Binjharpur", "Dharmasala", "Sukinda", "Kalinganagar", "Vyasanagar", "Korei", "Rasulpur"] },
    { id: "od-jajpur-road", district: "Jajpur", block: "Vyasanagar (Jajpur Road)", panchayats: ["Jajpur Road Town", "Dhabalgiri", "Chorda", "Santhapur", "Kalinganagar Industrial Zone"] }
  ]
};

const normalizeDistrictKey = (district) => {
  if (!district) return 'Khordha';
  const d = district.toLowerCase().trim();
  if (d.includes('balasore') || d.includes('baleswar')) return 'Balasore';
  if (d.includes('khordha') || d.includes('khurda') || d.includes('khorda')) return 'Khordha';
  if (d.includes('bhadrak')) return 'Bhadrak';
  if (d.includes('cuttack')) return 'Cuttack';
  if (d.includes('puri')) return 'Puri';
  if (d.includes('kendrapara') || d.includes('kendrapada')) return 'Kendrapara';
  if (d.includes('jagatsinghpur') || d.includes('jagatsinghapur')) return 'Jagatsinghpur';
  if (d.includes('ganjam')) return 'Ganjam';
  if (d.includes('mayurbhanj')) return 'Mayurbhanj';
  if (d.includes('jajpur')) return 'Jajpur';
  if (d.includes('sambalpur')) return 'Sambalpur';
  // direct match fallback
  const keys = Object.keys(LOCAL_ODISHA_DB);
  const direct = keys.find(k => k.toLowerCase() === d);
  if (direct) return direct;
  return 'Khordha';
};

export const getLocalFallbackBlocks = (district) => {
  const normKey = normalizeDistrictKey(district);
  if (LOCAL_ODISHA_DB[normKey]) {
    return LOCAL_ODISHA_DB[normKey];
  }
  return LOCAL_ODISHA_DB['Balasore'];
};

export const fetchBlocks = async (district) => {
  if (!district) return getLocalFallbackBlocks('Khordha');
  try {
    const res = await fetch(`${API_BASE_URL}/blocks/${encodeURIComponent(district)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.blocks && data.blocks.length > 0) return data.blocks;
    }
  } catch (err) {
    console.warn("Using fallback blocks", err);
  }
  return getLocalFallbackBlocks(district);
};

export const fetchPanchayats = async (block, district) => {
  if (!block) return [];
  try {
    const q = district ? `?district=${encodeURIComponent(district)}` : '';
    const res = await fetch(`${API_BASE_URL}/panchayats/${encodeURIComponent(block)}${q}`);
    if (res.ok) {
      const data = await res.json();
      if (data.panchayats && data.panchayats.length > 0) return data.panchayats;
    }
  } catch (err) {
    console.warn("Using fallback panchayats", err);
  }
  // fallback from local DB
  for (const dKey of Object.keys(LOCAL_ODISHA_DB)) {
    const found = LOCAL_ODISHA_DB[dKey].find(b => b.block.toLowerCase() === block.toLowerCase());
    if (found) return found.panchayats;
  }
  return [];
};

export const fetchForecast = async (locationId, horizon = 7, panchayat = null) => {
  try {
    const pParam = panchayat ? `&panchayat=${encodeURIComponent(panchayat)}` : '';
    const res = await fetch(`${API_BASE_URL}/forecast/${encodeURIComponent(locationId)}?horizon=${horizon}${pParam}`);
    if (res.ok) {
      const data = await res.json();
      // persist last real-time fetch for offline + fast reload
      try {
        localStorage.setItem('moes_last_forecast', JSON.stringify({ locationId, horizon, panchayat, data, at: Date.now() }));
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn("Using fallback forecast", err);
  }
  return null;
};

export const fetchClimateSignals = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/climate-signals`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Using fallback climate signals", err);
  }
  return null;
};

export const fetchCrops = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/crops`);
    if (res.ok) {
      const data = await res.json();
      return data.crops;
    }
  } catch (err) {
    console.warn("Using fallback crops", err);
  }
  return [];
};

export const generateAdvisory = async (cropId, locationId, district, block) => {
  try {
    const res = await fetch(`${API_BASE_URL}/advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropId, locationId, district, block })
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Using fallback advisory", err);
  }
  return null;
};

export const fetchHistorical = async (locationId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/historical/${encodeURIComponent(locationId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback historical data", err);
  }
  return null;
};

export const fetchGeoJSON = async (layer = 'break_risk') => {
  try {
    const res = await fetch(`${API_BASE_URL}/geojson?layer=${layer}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback GeoJSON", err);
  }
  return null;
};

export const fetchAlerts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (res.ok) {
      const data = await res.json();
      return data.alerts;
    }
  } catch (err) {
    console.warn("Using fallback alerts", err);
  }
  return [];
};

export const acknowledgeAlertApi = async (alertId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const fetchNotificationStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/stats`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback notification stats", err);
  }
  return null;
};

export const sendNotificationApi = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const fetchSystemStatus = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/system-status`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback system status", err);
  }
  return null;
};

export const fetchExplainability = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback explainability", err);
  }
  return null;
};

// --- REAL-TIME WEATHER ALERTS (Nowcast → SMS → SSE Broadcast) ---

/**
 * On-demand ML nowcast check for a block (rain within 12 hours). Optionally
 * sends a real SMS to a farmer mobile number so they get the alert instantly.
 */
export const checkWeatherAlert = async ({ district, block, phoneNumber } = {}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/alerts/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_name: district,
        block_name: block,
        phone_number: phoneNumber || undefined
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("checkWeatherAlert failed", err);
  }
  return null;
};

/**
 * Trigger a broadcast for a specific block (admin). force bypasses the 2h dedup.
 */
export const triggerWeatherBroadcast = async ({ district, block, force = false } = {}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/weather/alerts/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district_name: district, block_name: block, force })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("triggerWeatherBroadcast failed", err);
  }
  return null;
};

/**
 * Register a live Server-Sent Events listener for real-time weather broadcasts.
 * Returns a cleanup function. The listener receives heavy-rain/rain broadcast
 * payloads pushed by the backend scheduler in real time.
 */
export const subscribeWeatherAlertsSSE = (onBroadcast, onError) => {
  const source = new EventSource(`${API_BASE_URL}/weather/alerts/stream`);

  source.addEventListener('weather-broadcast', (event) => {
    try {
      onBroadcast(JSON.parse(event.data));
    } catch (err) {
      console.warn('Bad SSE broadcast payload', err);
    }
  });

  source.onerror = () => {
    if (onError) onError(new Error('Weather alert SSE stream disconnected'));
  };

  return () => source.close();
};
