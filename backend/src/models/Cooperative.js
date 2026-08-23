import mongoose from "mongoose";

const cooperativeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    federationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Federation",
      required: true,
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
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
    commissionRate: {
      type: Number,
      default: 5.0, // 5% cooperative retention for worker welfare & operations
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    surgeMultiplier: {
      type: Number,
      default: 1.25, // 25% surge for emergency "Need Now" bookings
    },
  },
  { timestamps: true }
);

cooperativeSchema.index({ location: "2dsphere" });

export const Cooperative = mongoose.model("Cooperative", cooperativeSchema);
