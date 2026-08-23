import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "requested",
        "confirmed",
        "on_the_way",
        "in_progress",
        "completed",
        "cancelled",
        "closed",
      ],
      default: "requested",
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    timeSlot: {
      type: String,
      default: "Immediate / Asap",
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: true,
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
    notes: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      required: true,
    },
    surgeMultiplier: {
      type: Number,
      default: 1.0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    coopFee: {
      type: Number,
      default: 0,
    },
    workerEarnings: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "cod_pending", "cod_collected"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "none"],
      default: "none",
    },
    chatMessages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderName: { type: String, default: "User" },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    customerRated: {
      type: Boolean,
      default: false,
    },
    workerRated: {
      type: Boolean,
      default: false,
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    invoiceUrl: {
      type: String,
      default: "",
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ location: "2dsphere" });

export const Booking = mongoose.model("Booking", bookingSchema);
