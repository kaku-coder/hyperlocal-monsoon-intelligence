/**
 * Weather Alert Controllers: SSE live broadcast stream + on-demand nowcast check.
 */

import { alertEventBus, WEATHER_BROADCAST_EVENT } from "../services/eventBus.js";
import { handleFarmerCheck, runWeatherAlertSweep, evaluateLocationAndDispatch } from "../services/weatherAlertService.js";
import { findLocation } from "../data/locations.js";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  "Connection": "keep-alive",
  "X-Accel-Buffering": "no"
};

/**
 * GET /api/weather/alerts/stream
 * Live Server-Sent Events stream. Emits:
 *   - "weather-broadcast" events when the ML nowcast fires on any block
 *   - a periodic "heartbeat" so proxies keep the connection alive
 */
const streamWeatherAlerts = (req, res) => {
  res.writeHead(200, SSE_HEADERS);
  res.write(`event: connected\ndata: ${JSON.stringify({ status: "live", message: "Weather broadcast stream connected." })}\n\n`);

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onBroadcast = (payload) => sendEvent(WEATHER_BROADCAST_EVENT, payload);
  alertEventBus.on(WEATHER_BROADCAST_EVENT, onBroadcast);

  const heartbeat = setInterval(() => {
    sendEvent("heartbeat", { timestamp: new Date().toISOString() });
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    alertEventBus.removeListener(WEATHER_BROADCAST_EVENT, onBroadcast);
    res.end();
  });
};

/**
 * POST /api/weather/alerts/check
 * On-demand real-time check for a block. Optionally sends a REAL SMS to the
 * supplied farmer mobile number (rain within 12h → notify farmer instantly).
 */
const postCheckWeatherAlert = async (req, res) => {
  const { district_name, block_name, phone_number } = req.body || {};

  if (!district_name || !block_name) {
    return res.status(400).json({
      status: "error",
      message: "district_name and block_name (and optionally phone_number) are required."
    });
  }

  try {
    const result = await handleFarmerCheck({ district_name, block_name, phone_number });
    res.json(result);
  } catch (err) {
    console.error("Weather check error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * POST /api/weather/alerts/trigger
 * Admin/manual broadcast: force-evaluate a block and dispatch SMS + SSE now
 * (bypasses the dedup window when force: true).
 */
const postTriggerBroadcast = async (req, res) => {
  const { district_name, block_name, force } = req.body || {};
  const loc = findLocation(district_name || "Kendrapara", block_name || "Rajkanika");

  if (force) {
    const { evaluateLocationAndDispatch } = await import("../services/weatherAlertService.js");
    const outcome = await evaluateLocationAndDispatch(loc);
    return res.json({
      status: "success",
      alerted: outcome.alerted,
      severity: outcome.severity,
      broadcast: outcome.broadcast || null
    });
  }

  const outcome = await evaluateLocationAndDispatch(loc);
  res.json({
    status: "success",
    alerted: outcome.alerted,
    severity: outcome.severity,
    broadcast: outcome.broadcast || null
  });
};

/**
 * POST /api/weather/alerts/sweep
 * Manually trigger a full trained ML sweep across all blocks.
 */
const postRunSweep = async (req, res) => {
  const result = await runWeatherAlertSweep();
  res.json(result);
};

export {
  streamWeatherAlerts,
  postCheckWeatherAlert,
  postTriggerBroadcast,
  postRunSweep
};