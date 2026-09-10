import express from "express";
import { registerUser, loginUser, logoutUser, getMe, updateProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected Routes (Requires JWT token or Cookie)
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);

export default router;

