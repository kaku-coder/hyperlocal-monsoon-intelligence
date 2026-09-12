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
    { id: "od-balasore-remuna", district: "Balasore", block: "Remuna", panchayats: ["Remuna", "Gopalpur", "Kalyani", "Patripada", "Nisamani", "Mandarpur", "Sujanpur", "Padmapur"] }
  ],
  'Bhadrak': [
    { id: "od-bhadrak-sadar", district: "Bhadrak", block: "Bhadrak Sadar", panchayats: ["Arnapal", "Kharida", "Randia", "Banta", "Gelpur", "Baudpur", "Asura", "Nalanga"] },
    { id: "od-bhadrak-chandbali", district: "Bhadrak", block: "Chandbali", panchayats: ["Motto", "Kandagaradi", "Aradi", "Bansada", "Dhamra", "Panchapada", "Karanjamal", "Orasahi"] },
    { id: "od-bhadrak-dhamnagar", district: "Bhadrak", block: "Dhamnagar", panchayats: ["Dhamnagar", "Dobal", "Jahangir", "Asurali", "Kothar", "Khaparapada", "Chudamani"] }
  ],
  'Cuttack': [
    { id: "od-cuttack-sadar", district: "Cuttack", block: "Cuttack Sadar", panchayats: ["Jobra", "Choudwar", "Bidyadharpur", "42 Mouza", "Kandarpur", "Bentakar", "Gopalpur", "Telengapada"] },
    { id: "od-cuttack-barang", district: "Cuttack", block: "Barang", panchayats: ["Barang", "Nandankanan", "Trisulia", "Belgachhia", "Ramdaspur", "Harianta"] },
    { id: "od-cuttack-banki", district: "Cuttack", block: "Banki", panchayats: ["Banki", "Charchika", "Kalapathar", "Subarnapur", "Pathapur", "Nuagan", "Rathipur"] }
  ],
  'Khordha': [
    { id: "od-khordha-bhubaneswar", district: "Khordha", block: "Bhubaneswar", panchayats: ["Patia", "Mencheswar", "Baramunda", "Tamando", "Dhauli", "Chandaka", "Khandagiri", "Sundarpada", "Pahala", "Raghunathpur", "Bhuasuni", "Kalinga Nagar"] },
    { id: "od-khordha-jatani", district: "Khordha", block: "Jatani", panchayats: ["Kantabad", "Khurdha Road", "Kudiary", "Padanpur", "Jatani Town", "Bachharat", "Harirajpur"] },
    { id: "od-khordha-sadar", district: "Khordha", block: "Khordha Sadar", panchayats: ["Kaipadar", "Gurujanga", "Orkal", "Tangiapada", "Malipada", "Bajpur", "Jankia"] }
  ],
  'Puri': [
    { id: "od-puri-sadar", district: "Puri", block: "Puri Sadar", panchayats: ["Baliguali", "Chhaitana", "Gopinathpur", "Samanga", "Chandanpur", "Biraharekrushnapur", "Satasankha", "Malatipatpur"] },
    { id: "od-puri-nimapada", district: "Puri", block: "Nimapada", panchayats: ["Alipingal", "Denuan", "Gopabandhu", "Terundia", "Nimapada Town", "Antuar", "Nagar", "Bhagabanpur"] }
  ],
  'Kendrapara': [
    { id: "od-kendrapara-rajkanika", district: "Kendrapara", block: "Rajkanika", panchayats: ["Dangarpatna", "Katana", "Barunadiha", "Meghapur", "Baghabuda", "Tarasahi", "Jaynagar", "Nanpur", "Jagulaipada"] },
    { id: "od-kendrapara-aul", district: "Kendrapara", block: "Aul", panchayats: ["Demal", "Govindpur", "Batipada", "Keredagarh", "Sanmangala", "Sansar"] },
    { id: "od-kendrapara-mahakalapada", district: "Kendrapara", block: "Mahakalapada", panchayats: ["Ramnagar", "Jambu", "Batighar", "Kharinasi", "Barada", "Marshaghai"] }
  ],
  'Ganjam': [
    { id: "od-ganjam-berhampur", district: "Ganjam", block: "Berhampur", panchayats: ["Ankushpur", "Lathi", "Nimakhandi", "Golanthara", "Haladiapadar", "Kukudakhandi", "Brahmapur Town", "Bhakuri"] },
    { id: "od-ganjam-chatrapur", district: "Ganjam", block: "Chatrapur", panchayats: ["Chatrapur", "Agastinuagaon", "Aryapalli", "Bipulingi", "Ganjam Town", "Kanamana", "Chamaakhandi"] }
  ],
  'Mayurbhanj': [
    { id: "od-mayurbhanj-baripada", district: "Mayurbhanj", block: "Baripada", panchayats: ["Pundal", "Sankhabhanga", "Manitri", "Badasahi", "Lalazar", "Deuli", "Bhaunri", "Takatpur"] }
  ],
  'Jajpur': [
    { id: "od-jajpur-sadar", district: "Jajpur", block: "Jajpur Sadar", panchayats: ["Bari", "Binjharpur", "Dharmasala", "Sukinda", "Kalinganagar", "Vyasanagar", "Korei", "Rasulpur"] }
  ]
};

export const getLocalFallbackBlocks = (district) => {
  if (!district) return LOCAL_ODISHA_DB['Khordha'];
  const key = Object.keys(LOCAL_ODISHA_DB).find(k => k.toLowerCase() === district.toLowerCase());
  if (key) return LOCAL_ODISHA_DB[key];
  
  return [
    { id: `od-${district.toLowerCase()}-sadar`, district: district, block: `${district} Sadar`, panchayats: [`${district} Town`, "Gopinathpur", "Nuagaon", "Ramchandrapur"] },
    { id: `od-${district.toLowerCase()}-north`, district: district, block: `${district} North`, panchayats: ["Alipingal", "Kotasahi", "Haripur", "Sugo"] }
  ];
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

export const fetchForecast = async (locationId, horizon = 7) => {
  try {
    const res = await fetch(`${API_BASE_URL}/forecast/${encodeURIComponent(locationId)}?horizon=${horizon}`);
    if (res.ok) {
      return await res.json();
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
