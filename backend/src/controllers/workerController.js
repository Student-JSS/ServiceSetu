import { Worker } from "../models/Worker.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// 1. Get Current Worker Profile & Real-Time Cumulative Earnings
export const getMyProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id })
      .populate("userId", "fullName phone email avatarUrl address")
      .populate("cooperativeId", "name city state commissionRate codEnabled surgeMultiplier");

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    // STRICT: Only count jobs where payment has been settled by customer!
    const paidFilter = {
      workerId: worker._id,
      paymentStatus: { $in: ["paid", "cod_collected"] },
    };

    const completedJobs = await Booking.countDocuments(paidFilter);

    const earningsResult = await Booking.aggregate([
      { $match: paidFilter },
      { $group: { _id: null, totalEarned: { $sum: "$workerEarnings" } } },
    ]);

    const totalEarned = earningsResult[0]?.totalEarned || 0;

    res.status(200).json({
      success: true,
      worker,
      stats: {
        completedJobs,
        totalEarned,
        ratingAvg: worker.ratingAvg,
        ratingCount: worker.ratingCount,
        isVerified: worker.isVerified,
        isOnline: worker.isOnline,
        isAway: worker.isAway,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Toggle Worker Availability (Online/Offline/Away)
export const toggleAvailability = async (req, res) => {
  try {
    const { isOnline, isAway } = req.body;
    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    if (typeof isOnline === "boolean") worker.isOnline = isOnline;
    if (typeof isAway === "boolean") worker.isAway = isAway;

    await worker.save();

    res.status(200).json({
      success: true,
      message: `Worker status updated: ${worker.isAway ? "Away" : worker.isOnline ? "Online & Ready" : "Offline"}`,
      isOnline: worker.isOnline,
      isAway: worker.isAway,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Worker GPS Location
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Latitude and Longitude required" });
    }

    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      {
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
      },
      { new: true }
    );

    // Also update User model location
    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    });

    res.status(200).json({
      success: true,
      message: "Worker GPS location updated successfully",
      coordinates: worker?.location?.coordinates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Weekly Availability Schedule
export const updateSchedule = async (req, res) => {
  try {
    const { weeklySchedule } = req.body;
    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    worker.weeklySchedule = weeklySchedule;
    await worker.save();

    res.status(200).json({
      success: true,
      message: "Weekly schedule updated successfully",
      weeklySchedule: worker.weeklySchedule,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Bank & Welfare Details
export const updateWelfareAndBank = async (req, res) => {
  try {
    const { bankDetails, emergencyContact, healthStatusNote } = req.body;
    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    if (bankDetails) worker.bankDetails = { ...worker.bankDetails, ...bankDetails };
    if (emergencyContact) worker.emergencyContact = { ...worker.emergencyContact, ...emergencyContact };
    if (healthStatusNote !== undefined) worker.healthStatusNote = healthStatusNote;

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker welfare & banking information updated successfully",
      bankDetails: worker.bankDetails,
      emergencyContact: worker.emergencyContact,
      insuranceStatus: worker.insuranceStatus,
      healthStatusNote: worker.healthStatusNote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Worker Earnings Ledger & Monthly Breakdown
export const getEarningsHistory = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    const bookings = await Booking.find({
      workerId: worker._id,
      status: "completed",
    })
      .populate("serviceId", "name category")
      .populate("customerId", "fullName phone")
      .sort({ completedAt: -1, createdAt: -1 });

    const totalEarned = bookings.reduce((sum, b) => sum + (b.workerEarnings || 0), 0);

    // Monthly breakdown aggregation
    const monthlyStats = await Booking.aggregate([
      { $match: { workerId: worker._id, status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" },
          },
          earnings: { $sum: "$workerEarnings" },
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.status(200).json({
      success: true,
      totalEarned,
      jobCount: bookings.length,
      bookings,
      monthlyStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Upload Worker Documents
export const uploadDocuments = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    const { docType = "id_proof", title = "Verification Document" } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No document file uploaded" });
    }

    const newDoc = {
      title,
      docType,
      fileUrl: `/uploads/${req.file.filename}`,
      status: "pending",
      uploadedAt: new Date(),
    };

    worker.documents.push(newDoc);
    await worker.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully. Awaiting cooperative review.",
      documents: worker.documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
