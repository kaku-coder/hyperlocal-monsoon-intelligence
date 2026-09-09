const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5005;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Base health check
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

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌧️  MoES / NCMRWF Monsoon Intel Backend API Running`);
  console.log(`📡  Listening on port http://localhost:${PORT}`);
  console.log(`🌐  FastAPI ML Service URL: http://localhost:8000`);
  console.log(`=======================================================`);
});
