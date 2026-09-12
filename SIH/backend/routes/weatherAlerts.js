import express from "express";
import {
  streamWeatherAlerts,
  postCheckWeatherAlert,
  postTriggerBroadcast,
  postRunSweep
} from "../controllers/weatherAlertController.js";

const router = express.Router();

// Live real-time broadcast stream (SSE)
router.get("/stream", streamWeatherAlerts);

// On-demand nowcast check (optionally SMS a farmer mobile number)
router.post("/check", postCheckWeatherAlert);

// Manual/forced broadcast for a block (bypasses dedup with force:true)
router.post("/trigger", postTriggerBroadcast);

// Full ML sweep across all Odisha blocks
router.post("/sweep", postRunSweep);

export default router;
/** Express SSE Router - Real-Time Heavy Rain Weather Broadcast Stream */
