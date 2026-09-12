/**
 * Unified Controllers for Monsoon Intelligence API
 */

import { locations, getDistricts, getBlocksByDistrict, getPanchayatsByBlock, getAllPanchayatsByDistrict, getLocationById, findLocation } from "../data/locations.js";
import { crops, generateCropAdvisory } from "../data/crops.js";
import climateSignals from "../data/climateSignals.js";
import historicalData from "../data/historical.js";
import { getOdishaGeoJSON } from "../data/geoJson.js";
import { officerAlerts, getAlerts, acknowledgeAlert } from "../data/alerts.js";
import { notificationLogs, getNotificationStats } from "../data/notifications.js";
import { predictWithML, explainWithML } from "../services/mlService.js";
import { composeAIBroadcast, dispatchAIBroadcast } from "../services/broadcastService.js";


// 1. Locations
const getAllLocations = (req, res) => {
  res.json({ status: "success", count: locations.length, data: locations });
};

const getDistrictsList = (req, res) => {
  res.json({ status: "success", districts: getDistricts() });
};

const getBlocksForDistrict = (req, res) => {
  const { district } = req.params;
  const blocks = getBlocksByDistrict(district);
  res.json({ status: "success", district, count: blocks.length, blocks });
};

const getPanchayatsForBlock = (req, res) => {
  const { block } = req.params;
  const { district } = req.query;
  const norm = (s) => (s || "").toString().trim().toLowerCase();
  let loc = null;
  if (district) {
    loc = locations.find(l => norm(l.block) === norm(block) && norm(l.district) === norm(district));
  }
  if (!loc) {
    loc = locations.find(l => norm(l.block) === norm(block)) || locations[0];
  }
  res.json({ status: "success", district: loc.district, block: loc.block, locationId: loc.id, count: (loc.panchayats || []).length, panchayats: loc.panchayats });
};

// 2. Forecast
const getForecastForLocation = (req, res) => {
  const { locationId } = req.params;
  const horizon = parseInt(req.query.horizon, 10) || 7;
  const selectedPanchayat = req.query.panchayat || req.query.gp || null;
  const loc = getLocationById(locationId);

  const m = loc.metrics;
  const expectedRain = horizon === 7 ? m.expected_rainfall_7d :
                       horizon === 14 ? m.expected_rainfall_14d :
                       horizon === 21 ? m.expected_rainfall_21d :
                       m.expected_rainfall_30d;

  // Generate multi-period timeline table
  const timeline = [
    {
      period: "1–7 days",
      horizon_days: 7,
      onset: Math.round(m.onset_probability * 100),
      break: Math.min(100, Math.round(m.break_probability * 100 * 0.7)),
      heavy_rain: Math.round(m.heavy_rain_probability * 100),
      expected_rain: m.expected_rainfall_7d,
      rainfall_probability: 78,
      temperature_avg: m.temperature_c,
      status: "Initial Onset Transition"
    },
    {
      period: "8–14 days",
      horizon_days: 14,
      onset: Math.max(10, Math.round(m.onset_probability * 100 * 0.95)),
      break: Math.round(m.break_probability * 100),
      heavy_rain: Math.round(m.heavy_rain_probability * 100 * 0.9),
      expected_rain: Math.max(10, m.expected_rainfall_14d - m.expected_rainfall_7d),
      rainfall_probability: 44,
      temperature_avg: m.temperature_c + 0.8,
      status: "Probable Dry Break Spell Window"
    },
    {
      period: "15–21 days",
      horizon_days: 21,
      onset: Math.max(10, Math.round(m.onset_probability * 100 * 0.8)),
      break: Math.min(100, Math.round(m.break_probability * 100 * 1.1)),
      heavy_rain: Math.round(m.heavy_rain_probability * 100 * 0.8),
      expected_rain: Math.max(10, m.expected_rainfall_21d - m.expected_rainfall_14d),
      rainfall_probability: 38,
      temperature_avg: m.temperature_c + 1.2,
      status: "Extended Dry Interruption"
    },
    {
      period: "22–30 days",
      horizon_days: 30,
      onset: Math.max(10, Math.round(m.onset_probability * 100 * 0.7)),
      break: Math.round(m.break_probability * 100 * 0.9),
      heavy_rain: Math.round(m.heavy_rain_probability * 100 * 1.1),
      expected_rain: Math.max(15, m.expected_rainfall_30d - m.expected_rainfall_21d),
      rainfall_probability: 62,
      temperature_avg: m.temperature_c - 0.5,
      status: "Monsoon Recovery Wave"
    }
  ];

  // Generate real-time 7-day daily forecast strip starting from current date
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDate = new Date();
  const total7dRain = m.expected_rainfall_7d || 45;
  const breakProb = m.break_probability || 0.3;
  const heavyProb = m.heavy_rain_probability || 0.2;

  const daily_strip = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + idx);
    const dayName = idx === 0 ? "Today" : daysOfWeek[d.getDay()];

    let rain = 0;
    if (idx === 0) rain = Math.round(total7dRain * (heavyProb > 0.4 ? 0.35 : 0.28));
    else if (idx === 1) rain = Math.round(total7dRain * (breakProb > 0.6 ? 0.08 : 0.26));
    else if (idx === 2) rain = Math.round(total7dRain * (breakProb > 0.6 ? 0.04 : 0.22));
    else if (idx === 3) rain = Math.round(total7dRain * (breakProb > 0.6 ? 0.0 : 0.14));
    else if (idx === 4) rain = Math.round(total7dRain * 0.05);
    else rain = 0;

    let icon = "☀️";
    if (rain >= 15) icon = "🌧️";
    else if (rain >= 8) icon = "🌦️";
    else if (rain > 0) icon = "⛅";

    return {
      day: dayName,
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      rain_mm: rain,
      icon,
      probability: Math.min(95, Math.max(10, Math.round((rain / (total7dRain || 1)) * 180 + (1 - breakProb) * 30)))
    };
  });

  res.json({
    status: "success",
    location: {
      id: loc.id,
      state: loc.state,
      district: loc.district,
      block: loc.block,
      panchayats: loc.panchayats,
      selectedPanchayat: selectedPanchayat || loc.panchayats?.[0] || null,
      lat: loc.coordinates.lat,
      lon: loc.coordinates.lon,
      elevation_m: loc.elevation_m,
      agro_zone: loc.agro_zone,
      soil_type: loc.soil_type
    },
    forecast_horizon_selected: horizon,
    selectedPanchayat: selectedPanchayat || loc.panchayats?.[0] || null,
    metrics: {
      onset_probability: m.onset_probability,
      break_probability: m.break_probability,
      heavy_rain_probability: m.heavy_rain_probability,
      confidence: m.confidence,
      expected_rainfall_mm: expectedRain,
      soil_moisture_level: m.soil_moisture_level,
      soil_moisture_fraction: m.soil_moisture_fraction,
      temperature_c: m.temperature_c,
      temperature_anomaly: 2.8,
      humidity_percent: m.humidity_percent,
      rainfall_anomaly_percent: m.rainfall_anomaly_percent,
      dominant_risk: m.dominant_risk,
      risk_factor: m.risk_factor
    },
    timeline,
    daily_strip,
    generated_at: new Date().toISOString(),
    is_prototype: true
  });
};

// 3. Climate Signals
const getClimateSignals = (req, res) => {
  res.json({
    status: "success",
    data: climateSignals,
    source: "MoES / NCMRWF Coupled Assimilation Demo"
  });
};

// 4. ML Prediction & Explainability
const postPredict = async (req, res) => {
  const result = await predictWithML(req.body);
  res.json(result);
};

const postExplain = async (req, res) => {
  const result = await explainWithML(req.body);
  res.json(result);
};

// 5. Crops & Advisory
const getCropsList = (req, res) => {
  res.json({ status: "success", crops });
};

const postGenerateAdvisory = (req, res) => {
  const { cropId = "rice", locationId, district, block } = req.body;
  let loc = null;
  if (locationId) {
    loc = getLocationById(locationId);
  } else {
    loc = findLocation(district, block);
  }

  const advisory = generateCropAdvisory(cropId, loc.metrics, `${loc.block} (${loc.district})`);
  res.json({ status: "success", data: advisory });
};

// 6. Historical Data
const getHistoricalData = (req, res) => {
  const { locationId } = req.params;
  const loc = getLocationById(locationId);

  res.json({
    status: "success",
    location: {
      id: loc.id,
      district: loc.district,
      block: loc.block
    },
    baseline: historicalData.baseline,
    yearly_records: historicalData.yearly_records,
    block_comparisons: historicalData.block_comparisons,
    is_prototype: true
  });
};

// 7. GeoJSON Risk Map Layer
const getGeoJSONLayer = (req, res) => {
  const layer = req.query.layer || "break_risk";
  const geojson = getOdishaGeoJSON(layer);
  res.json(geojson);
};

// 8. Alerts
const getAlertsFeed = (req, res) => {
  res.json({ status: "success", alerts: getAlerts() });
};

const postAcknowledgeAlert = (req, res) => {
  const { alertId } = req.body;
  const updated = acknowledgeAlert(alertId);
  if (updated) {
    res.json({ status: "success", alert: updated });
  } else {
    res.status(404).json({ status: "error", message: "Alert not found" });
  }
};

// 9. Notifications
const getNotificationStatsHandler = (req, res) => {
  const stats = getNotificationStats();
  res.json({ status: "success", stats, logs: notificationLogs });
};

const postSendNotification = async (req, res) => {
  const {
    locationId,
    district,
    block,
    crop = "rice",
    urgency = "HIGH",
    channel = "SMS",
    phone_number = null,
    message_en = null,
    message_hi = null,
    message_or = null,
    auto_compose = true,
    force = false
  } = req.body || {};

  if (!district || !block) {
    return res.status(400).json({
      status: "error",
      message: "district and block are required to dispatch a broadcast."
    });
  }

  try {
    const result = await dispatchAIBroadcast({
      district,
      block,
      locationId,
      crop,
      urgency,
      channel,
      phone_number,
      message_en,
      message_hi,
      message_or,
      auto_compose,
      force
    });
    res.json(result);
  } catch (err) {
    console.error("AI Broadcast dispatch error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

const postComposeBroadcast = async (req, res) => {
  const { district, block, locationId, crop = "rice" } = req.body || {};

  if (!district && !block && !locationId) {
    return res.status(400).json({ status: "error", message: "Provide district/block or locationId." });
  }

  try {
    const content = await composeAIBroadcast({ district, block, locationId, crop });
    res.json({ status: "success", composed: true, ...content });
  } catch (err) {
    console.error("AI compose error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// 10. System Status
const getSystemStatus = (req, res) => {
  res.json({
    status: "operational",
    system_name: "Hyperlocal Monsoon Onset & Break Prediction System",
    organization: "Ministry of Earth Sciences (MoES) / NCMRWF",
    timestamp: new Date().toISOString(),
    last_model_run: "Today, 06:00 UTC (Run-06Z)",
    subsystems: [
      { name: "Regional Weather Data (IMD/NCMRWF Grid)", status: "AVAILABLE", latency_ms: 38, type: "Data Feed" },
      { name: "Climate Signals (ENSO/IOD/MJO)", status: "AVAILABLE", latency_ms: 45, type: "Teleconnection Index" },
      { name: "Geospatial Boundary Engine (Odisha Blocks)", status: "AVAILABLE", latency_ms: 12, type: "GIS Engine" },
      { name: "FastAPI ML Prediction Service", status: "OPERATIONAL", latency_ms: 82, type: "AI/ML Service (Port 8000)" },
      { name: "Agro-Meteorological Advisory Engine", status: "OPERATIONAL", latency_ms: 15, type: "Expert Rule Matrix" },
      { name: "SMS / WhatsApp Farmer Dispatch Gateway", status: "SIMULATED", latency_ms: 110, type: "Broadcast Service" },
      { name: "Database & Historical Climatology Cache", status: "CONNECTED", latency_ms: 8, type: "MongoDB-Compatible" }
    ],
    governance: {
      is_prototype: true,
      data_label: "Demo & Simulated Agro-Meteorological Data",
      notice: "This is a prototype system developed for the Smart India Hackathon. Forecasts are generated using calibrated demonstration models and are not scientifically certified for actual field operations."
    }
  });
};

// 11. IPStack Auto Location Detection
const getAutoLocationByIP = async (req, res) => {
  try {
    const apiKey = process.env.IPSTACK_API_KEY || "5dbfef5a312527f414672c83eb88deb3";
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'check';
    if (clientIp && clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    const targetIp = (clientIp === '::1' || clientIp === '127.0.0.1' || !clientIp) ? 'check' : clientIp;

    const response = await fetch(`http://api.ipstack.com/${targetIp}?access_key=${apiKey}`);
    const data = await response.json();

    if (data && data.ip) {
      return res.json({
        status: "success",
        provider: "IPStack",
        data: {
          ip: data.ip,
          country: data.country_name || "India",
          district: data.region_name || "Odisha",
          city: data.city || "Kendrapara",
          block: data.city || "Rajkanika",
          pincode: data.zip || "754212",
          latitude: data.latitude || 20.2961,
          longitude: data.longitude || 85.8245
        }
      });
    }

    res.json({
      status: "success",
      provider: "Default-Fallback",
      data: {
        country: "India",
        district: "Kendrapara",
        block: "Rajkanika",
        pincode: "754212",
        latitude: 20.2961,
        longitude: 85.8245
      }
    });
  } catch (err) {
    console.error("IPStack Location Error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export {
  getAllLocations,
  getDistrictsList,
  getBlocksForDistrict,
  getPanchayatsForBlock,
  getForecastForLocation,
  getClimateSignals,
  postPredict,
  postExplain,
  getCropsList,
  postGenerateAdvisory,
  getHistoricalData,
  getGeoJSONLayer,
  getAlertsFeed,
  postAcknowledgeAlert,
  getNotificationStatsHandler,
  postSendNotification,
  postComposeBroadcast,
  getSystemStatus,
  getAutoLocationByIP
};


/** Controller Registry - Unified Endpoints for Forecast, Alerts & Signals */
