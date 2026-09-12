/**
 * Weather Alert Scheduler: periodically runs the ML nowcast sweep across all
 * Odisha blocks so rain-within-12h and heavy-rain events reach farmers via SMS
 * and get pushed live to dashboards over SSE.
 */

import { runWeatherAlertSweep } from "../services/weatherAlertService.js";

const SWEEP_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes
const INITIAL_DELAY_MS = 20 * 1000; // wait for DB + ML service to be ready

let timer = null;
let running = false;

const startWeatherAlertScheduler = () => {
  console.log(`⏰ Weather alert scheduler armed — sweeping every ${SWEEP_INTERVAL_MS / 60000} minutes.`);

  setTimeout(async () => {
    await runSweepSafe();
    timer = setInterval(runSweepSafe, SWEEP_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
};

const runSweepSafe = async () => {
  if (running) return; // avoid overlapping sweeps when a sweep is slow
  running = true;
  try {
    await runWeatherAlertSweep();
  } catch (err) {
    console.error("Scheduler sweep crashed:", err.message);
  } finally {
    running = false;
  }
};

const stopWeatherAlertScheduler = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

export {
  startWeatherAlertScheduler,
  stopWeatherAlertScheduler
};