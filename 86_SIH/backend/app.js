import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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