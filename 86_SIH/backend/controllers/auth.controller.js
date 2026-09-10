import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Helper to generate JWT Token
const generateToken = (id, phoneNumber, role) => {
  return jwt.sign(
    { id, phoneNumber, role },
    process.env.JWT_SECRET || "super_secret_moes_monsoon_key_2026",
    { expiresIn: "30d" }
  );
};

// Cookie Options for HTTP-Only Auth Cookie
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// 1. Register User
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      password,
      pincode,
      district = "Kendrapara",
      block = "Rajkanika",
      panchayat = "Dangarpatna",
      role = "FARMER",
      language = "en",
      primaryCrop = "rice"
    } = req.body;

    // Validation
    if (!name || !phoneNumber || !password || !pincode) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required fields: name, phoneNumber, password, pincode."
      });
    }

    // Phone Number Regex (10 digits Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid phone number format. Must be a 10-digit Indian mobile number."
      });
    }

    // Pincode Regex (6 digits)
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pincode)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Pincode format. Must be a 6-digit number."
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this phone number is already registered."
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      phoneNumber,
      password: hashedPassword,
      pincode,
      district,
      block,
      panchayat,
      role,
      language,
      primaryCrop
    });

    // Generate Token
    const token = generateToken(user._id, user.phoneNumber, user.role);

    // Set HTTP-Only Cookie
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      status: "success",
      message: "User registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        pincode: user.pincode,
        district: user.district,
        block: user.block,
        panchayat: user.panchayat,
        role: user.role,
        language: user.language,
        primaryCrop: user.primaryCrop
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Registration failed."
    });
  }
};

// 2. Login User
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide both phone number and password."
      });
    }

    // Find User
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid phone number or password."
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid phone number or password."
      });
    }

    // Generate Token
    const token = generateToken(user._id, user.phoneNumber, user.role);

    // Set HTTP-Only Cookie
    res.cookie("token", token, cookieOptions);

    res.json({
      status: "success",
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        pincode: user.pincode,
        district: user.district,
        block: user.block,
        panchayat: user.panchayat,
        role: user.role,
        language: user.language,
        primaryCrop: user.primaryCrop
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Login failed."
    });
  }
};

// 3. Logout User
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  res.json({
    status: "success",
    message: "Logged out successfully!"
  });
};

// 4. Get Authenticated Profile
export const getMe = async (req, res) => {
  try {
    res.json({
      status: "success",
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch profile."
    });
  }
};

// 5. Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, pincode, district, block, panchayat, language, primaryCrop } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (name) user.name = name;
    if (pincode) user.pincode = pincode;
    if (district) user.district = district;
    if (block) user.block = block;
    if (panchayat) user.panchayat = panchayat;
    if (language) user.language = language;
    if (primaryCrop) user.primaryCrop = primaryCrop;

    await user.save();

    res.json({
      status: "success",
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        pincode: user.pincode,
        district: user.district,
        block: user.block,
        panchayat: user.panchayat,
        role: user.role,
        language: user.language,
        primaryCrop: user.primaryCrop
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Profile update failed."
    });
  }
};
