import { Notification } from "../models/Notification.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Worker } from "../models/Worker.js";
import { Cooperative } from "../models/Cooperative.js";

// In-memory OTP store for demo/development
const otpStore = new Map();

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "super_secret_cooperative_jwt_key_2026_!@#$%^",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// 1. Send OTP via SMS simulator
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Default mock OTP 123456 or random 6 digits
    const otp = process.env.NODE_ENV === "production" ? Math.floor(100000 + Math.random() * 900000).toString() : "123456";
    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    console.log(`📱 SMS OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phone}. (Use 123456 in demo mode)`,
      mockOtp: otp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify OTP & Mobile Login / Quick Registration
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, fullName, role = "customer", language = "en" } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const cached = otpStore.get(phone);
    if (!cached && otp !== "123456") {
      return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    }
    if (cached && cached.otp !== otp && otp !== "123456") {
      return res.status(400).json({ success: false, message: "Incorrect OTP entered" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        fullName: fullName || (role === "worker" ? "Co-op Worker" : "Customer User"),
        role,
        language,
        isPhoneVerified: true,
      });
    }

    const token = generateToken(user._id, user.role);

    // If user is worker, populate worker profile
    let workerProfile = null;
    if (user.role === "worker") {
      workerProfile = await Worker.findOne({ userId: user._id }).populate("cooperativeId");
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        language: user.language,
        avatarUrl: user.avatarUrl,
        workerProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin Login (Cooperative Admin & Federation Admin)
// 3. Universal Login (Email or Phone + Password for ALL roles: Customer, Worker, Coop Admin, Fed Admin)
export const universalLogin = async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginKey = (identifier || email || phone || "").trim();

    if (!loginKey || !password) {
      return res.status(400).json({ success: false, message: "Email/Phone and password are required" });
    }

    const user = await User.findOne({
      $or: [
        { email: loginKey.toLowerCase() },
        { phone: loginKey },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Account not found with this email or mobile number." });
    }

    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await user.comparePassword(password);
    }
    
    // Support universal demo passwords
    const validDemoPasswords = ["pass123", "worker123", "coop123", "admin123", "FedCoop@2026!Secured", "123456"];
    if (!isMatch && !validDemoPasswords.includes(password)) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const token = generateToken(user._id, user.role);

    let workerProfile = null;
    let cooperative = null;

    if (user.role === "worker") {
      workerProfile = await Worker.findOne({ userId: user._id }).populate("cooperativeId");
    } else if (user.role === "coop_admin") {
      cooperative = await Cooperative.findOne({ adminUserId: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        language: user.language,
        avatarUrl: user.avatarUrl,
        workerProfile,
        cooperative,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or credentials" });
    }

    if (user.role !== "coop_admin" && user.role !== "fed_admin") {
      return res.status(403).json({ success: false, message: "Access restricted to Administrators" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch && password !== "admin123" && password !== "coop123" && password !== "FedCoop@2026!Secured") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    let cooperative = null;
    if (user.role === "coop_admin") {
      cooperative = await Cooperative.findOne({ adminUserId: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        language: user.language,
        cooperative,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Worker Full Onboarding / Registration
export const registerWorker = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      aadhaarNumber,
      cooperativeId,
      skills,
      experienceYears,
      serviceRadiusKm,
      languages,
      address,
      lat,
      lng,
    } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        fullName,
        phone,
        role: "worker",
        address,
        location: {
          type: "Point",
          coordinates: [lng ? parseFloat(lng) : 77.2090, lat ? parseFloat(lat) : 28.6139],
        },
      });
    } else {
      user.fullName = fullName;
      user.role = "worker";
      user.address = address || user.address;
      await user.save();
    }

    // Process uploaded documents
    const documents = [];
    if (req.files) {
      if (req.files.idProof) {
        documents.push({
          title: "Aadhaar / ID Card",
          docType: "id_proof",
          fileUrl: `/uploads/${req.files.idProof[0].filename}`,
          status: "pending",
        });
      }
      if (req.files.skillCert) {
        documents.push({
          title: "Skill Qualification Certificate",
          docType: "skill_certificate",
          fileUrl: `/uploads/${req.files.skillCert[0].filename}`,
          status: "pending",
        });
      }
      if (req.files.photo) {
        user.avatarUrl = `/uploads/${req.files.photo[0].filename}`;
        await user.save();
      }
    }

    const parsedSkills = Array.isArray(skills) ? skills : typeof skills === "string" ? JSON.parse(skills || "[]") : [];
    const parsedLanguages = Array.isArray(languages) ? languages : typeof languages === "string" ? JSON.parse(languages || "[]") : ["English", "Hindi"];

    // Find default cooperative if not provided
    let targetCoopId = cooperativeId;
    if (!targetCoopId) {
      const defaultCoop = await Cooperative.findOne();
      targetCoopId = defaultCoop?._id;
    }

    let worker = await Worker.findOne({ userId: user._id });
    if (!worker) {
      worker = await Worker.create({
        userId: user._id,
        cooperativeId: targetCoopId,
        aadhaarNumber,
        skills: parsedSkills.length ? parsedSkills : ["electrician"],
        experienceYears: experienceYears ? parseInt(experienceYears) : 2,
        serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : 15,
        languages: parsedLanguages,
        documents,
        location: {
          type: "Point",
          coordinates: [lng ? parseFloat(lng) : 77.2090, lat ? parseFloat(lat) : 28.6139],
        },
        isVerified: false,
      });
    } else {
      worker.cooperativeId = targetCoopId || worker.cooperativeId;
      worker.aadhaarNumber = aadhaarNumber || worker.aadhaarNumber;
      worker.skills = parsedSkills.length ? parsedSkills : worker.skills;
      worker.experienceYears = experienceYears ? parseInt(experienceYears) : worker.experienceYears;
      if (documents.length) {
        worker.documents.push(...documents);
      }
      await worker.save();
    }

    const token = generateToken(user._id, "worker");

    res.status(201).json({
      success: true,
      message: "Worker registered successfully. Pending cooperative KYC verification.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: "worker",
        avatarUrl: user.avatarUrl,
        workerProfile: worker,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Current User (Me)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let workerProfile = null;
    let cooperative = null;

    if (user.role === "worker") {
      workerProfile = await Worker.findOne({ userId: user._id }).populate("cooperativeId");
    } else if (user.role === "coop_admin") {
      cooperative = await Cooperative.findOne({ adminUserId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        language: user.language,
        avatarUrl: user.avatarUrl,
        address: user.address,
        location: user.location,
        workerProfile,
        cooperative,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Update Language Setting
export const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!["en", "hi"].includes(language)) {
      return res.status(400).json({ success: false, message: "Supported languages: en, hi" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Language updated to ${language}`,
      language: user.language,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Update User / Worker Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, address, avatarUrl, skills, serviceRadiusKm, experienceYears } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();

    let workerProfile = null;
    if (user.role === "worker") {
      workerProfile = await Worker.findOne({ userId: user._id });
      if (workerProfile) {
        if (skills && Array.isArray(skills)) workerProfile.skills = skills;
        if (serviceRadiusKm) workerProfile.serviceRadiusKm = Number(serviceRadiusKm);
        if (experienceYears) workerProfile.experienceYears = Number(experienceYears);
        await workerProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile details updated successfully!",
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        language: user.language,
        avatarUrl: user.avatarUrl,
        address: user.address,
        workerProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 5. Get List of All Active Cooperative Societies under the Federation
export const getPublicCooperatives = async (req, res) => {
  try {
    const cooperatives = await Cooperative.find().select("name city state address location commissionRate surgeMultiplier");
    res.status(200).json({
      success: true,
      count: cooperatives.length,
      cooperatives,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 6. Customer Registration (Instant access, no verification required)
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, password, address, city, pincode, lat, lng, language = "en" } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ success: false, message: "Full name, mobile number, and password are required." });
    }

    const checkPhone = phone.trim();
    const checkEmail = email ? email.toLowerCase().trim() : null;

    let existingUser = await User.findOne({
      $or: [
        { phone: checkPhone },
        ...(checkEmail ? [{ email: checkEmail }] : []),
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this mobile number or email already exists. Please sign in.",
      });
    }

    const fullAddress = address
      ? `${address}${city ? ', ' + city : ''}${pincode ? ' - ' + pincode : ''}`
      : "New Delhi";

    const user = await User.create({
      fullName: fullName.trim(),
      phone: checkPhone,
      email: checkEmail || undefined,
      passwordHash: password,
      role: "customer",
      language,
      address: fullAddress,
      isPhoneVerified: true,
      location: {
        type: "Point",
        coordinates: [lng ? parseFloat(lng) : 77.2090, lat ? parseFloat(lat) : 28.6139],
      },
    });

    const token = generateToken(user._id, "customer");

    // Welcoming Notification
    await Notification.create({
      userId: user._id,
      title: "👋 Welcome to ServiceSetu!",
      message: "Your customer account is active. You can now book certified workers directly with zero aggregator commission.",
      type: "system",
      link: "/customer/services",
    });

    res.status(201).json({
      success: true,
      message: "Customer account created successfully!",
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: "customer",
        language: user.language,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
