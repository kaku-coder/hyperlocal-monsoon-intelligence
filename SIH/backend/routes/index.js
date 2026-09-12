import express from "express";
import * as controllers from "../controllers/index.js";
import authRoutes from "./auth.routes.js";
import soilRoutes from "./soil.routes.js";

const router = express.Router();

// Authentication Routes
router.use("/auth", authRoutes);

// AI Soil Health Scanner Routes
router.use("/soil", soilRoutes);


// Locations
router.get("/locations", controllers.getAllLocations);
router.get("/location/auto-ip", controllers.getAutoLocationByIP);
router.get("/districts", controllers.getDistrictsList);
router.get("/blocks/:district", controllers.getBlocksForDistrict);
router.get("/panchayats/:block", controllers.getPanchayatsForBlock);

// Forecast & Predictions
router.get("/forecast/:locationId", controllers.getForecastForLocation);
router.post("/predict", controllers.postPredict);
router.post("/explain", controllers.postExplain);

// Climate Signals
router.get("/climate-signals", controllers.getClimateSignals);

// Crops & Agro-Advisories
router.get("/crops", controllers.getCropsList);
router.post("/advisory", controllers.postGenerateAdvisory);

// Historical Analysis
router.get("/historical/:locationId", controllers.getHistoricalData);

// GIS GeoJSON Layers
router.get("/geojson", controllers.getGeoJSONLayer);

// Alerts
router.get("/alerts", controllers.getAlertsFeed);
router.post("/alerts/acknowledge", controllers.postAcknowledgeAlert);

// Notifications & Broadcasts
router.get("/notifications/stats", controllers.getNotificationStatsHandler);
router.post("/notifications/send", controllers.postSendNotification);
router.post("/notifications/compose", controllers.postComposeBroadcast);

// System Status
router.get("/system-status", controllers.getSystemStatus);

export default router;

