/**
 * API Service Client for Frontend
 * Connects to Express Backend with automatic fallback if backend is momentarily unreachable.
 */

const API_BASE_URL = '/api';

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

export const fetchBlocks = async (district) => {
  try {
    const res = await fetch(`${API_BASE_URL}/blocks/${encodeURIComponent(district)}`);
    if (res.ok) {
      const data = await res.json();
      return data.blocks;
    }
  } catch (err) {
    console.warn("Using fallback blocks", err);
  }
  return [];
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
