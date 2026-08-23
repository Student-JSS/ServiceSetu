import mongoose from "mongoose";

const federationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    state: {
      type: String,
      default: "National",
    },
    platformFeePercent: {
      type: Number,
      default: 5.0, // 5% cooperative federation platform fee
    },
  },
  { timestamps: true }
);

export const Federation = mongoose.model("Federation", federationSchema);
