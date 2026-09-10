/**
 * Unified Controllers for Monsoon Intelligence API
 */

import { locations, getDistricts, getBlocksByDistrict, getLocationById, findLocation } from "../data/locations.js";
import { crops, generateCropAdvisory } from "../data/crops.js";
import climateSignals from "../data/climateSignals.js";
import historicalData from "../data/historical.js";
import { getOdishaGeoJSON } from "../data/geoJson.js";
import { officerAlerts, getAlerts, acknowledgeAlert } from "../data/alerts.js";
import { notificationLogs, getNotificationStats, sendSimulatedNotification } from "../data/notifications.js";
import { predictWithML, explainWithML } from "../services/mlService.js";


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
  res.json({ status: "success", district, blocks });
};

const getPanchayatsForBlock = (req, res) => {
  const { block } = req.params;
  const loc = locations.find(l => l.block.toLowerCase() === block.toLowerCase()) || locations[0];
  res.json({ status: "success", district: loc.district, block: loc.block, panchayats: loc.panchayats });
};

// 2. Forecast
const getForecastForLocation = (req, res) => {
  const { locationId } = req.params;
  const horizon = parseInt(req.query.horizon, 10) || 7;
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

  res.json({
    status: "success",
    location: {
      id: loc.id,
      state: loc.state,
      district: loc.district,
      block: loc.block,
      panchayats: loc.panchayats,
      lat: loc.coordinates.lat,
      lon: loc.coordinates.lon,
      elevation_m: loc.elevation_m,
      agro_zone: loc.agro_zone,
      soil_type: loc.soil_type
    },
    forecast_horizon_selected: horizon,
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

const postSendNotification = (req, res) => {
  const sent = sendSimulatedNotification(req.body);
  res.json({ status: "success", message: "Broadcast dispatched successfully", record: sent });
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
  getSystemStatus
};

