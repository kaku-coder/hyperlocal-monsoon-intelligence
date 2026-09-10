import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";


const PORT = process.env.PORT || 5005;

// Connect Database
connectDatabase();

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌧️  MoES / NCMRWF Monsoon Intel Backend API Running`);
  console.log(`📡  Listening on port http://localhost:${PORT}`);
  console.log(`🌐  FastAPI ML Service URL: http://localhost:8000`);
  console.log(`=======================================================`);
});

