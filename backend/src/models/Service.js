import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
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
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    durationEstimateMinutes: {
      type: Number,
      default: 60,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    iconName: {
      type: String,
      default: "Wrench",
    },
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);
