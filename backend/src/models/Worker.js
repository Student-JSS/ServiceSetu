import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        enum: [
          "electrician",
          "plumber",
          "carpenter",
          "painter",
          "cleaner",
          "caregiver",
          "driver",
          "gardener",
          "technician",
          "domestic helper",
        ],
      },
    ],
    experienceYears: {
      type: Number,
      default: 1,
    },
    serviceRadiusKm: {
      type: Number,
      default: 15, // 15 km coverage radius
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationNotes: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    isAway: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139],
      },
    },
    documents: [
      {
        title: { type: String, required: true },
        docType: {
          type: String,
          enum: ["id_proof", "skill_certificate", "photo", "other"],
          default: "id_proof",
        },
        fileUrl: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    languages: {
      type: [String],
      default: ["English", "Hindi"],
    },
    ratingAvg: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    weeklySchedule: {
      monday: { active: { type: Boolean, default: true }, slots: { type: [String], default: ["09:00-13:00", "14:00-18:00"] } },
      tuesday: { active: { type: Boolean, default: true }, slots: { type: [String], default: ["09:00-13:00", "14:00-18:00"] } },
      wednesday: { active: { type: Boolean, default: true }, slots: { type: [String], default: ["09:00-13:00", "14:00-18:00"] } },
      thursday: { active: { type: Boolean, default: true }, slots: { type: [String], default: ["09:00-13:00", "14:00-18:00"] } },
      friday: { active: { type: Boolean, default: true }, slots: { type: [String], default: ["09:00-13:00", "14:00-18:00"] } },
      saturday: { active: { type: Boolean, default: true }, slots: { type: [String], default: ["09:00-13:00", "14:00-18:00"] } },
      sunday: { active: { type: Boolean, default: false }, slots: { type: [String], default: ["10:00-14:00"] } },
    },
    bankDetails: {
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relationship: { type: String, default: "" },
    },
    insuranceStatus: {
      hasInsurance: { type: Boolean, default: false },
      policyNumber: { type: String, default: "" },
      provider: { type: String, default: "Labour Welfare Board Co-op Scheme" },
      validUntil: { type: Date },
      sumInsured: { type: Number, default: 200000 },
    },
    healthStatusNote: {
      type: String,
      default: "Good health, fit for skilled field duty",
    },
  },
  { timestamps: true }
);

workerSchema.index({ location: "2dsphere" });

export const Worker = mongoose.model("Worker", workerSchema);
