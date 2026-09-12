import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://devilprakashdas_db_user:My5YTTFrsjb02GPV@sih.n754zwu.mongodb.net/Sih";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};
