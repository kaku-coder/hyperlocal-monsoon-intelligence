import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import weatherAlertsRoutes from "./routes/weatherAlerts.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan("dev"));


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    system: "Hyperlocal Monsoon Decision Support System (MoES / NCMRWF)",
    timestamp: new Date().toISOString()
  });
});

// API Routes mounting
app.use("/api", routes);

// Real-Time Weather Alert Streams (SSE) + on-demand nowcast checks
app.use("/api/weather/alerts", weatherAlertsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    is_prototype: true
  });
});

export default app;