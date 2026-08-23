import { Worker } from "../models/Worker.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { Cooperative } from "../models/Cooperative.js";
import { Grievance } from "../models/Grievance.js";
import { Notification } from "../models/Notification.js";
import { emitBookingStatusUpdate } from "../services/socketService.js";

// 1. Cooperative Admin Dashboard Stats
export const getCoopStats = async (req, res) => {
  try {
    const coop = await Cooperative.findOne({ adminUserId: req.user._id });
    const coopFilter = coop ? { cooperativeId: coop._id } : {};

    const totalWorkers = await Worker.countDocuments(coopFilter);
    const pendingVerifications = await Worker.countDocuments({ ...coopFilter, isVerified: false });
    const activeBookings = await Booking.countDocuments({
      ...coopFilter,
      status: { $in: ["requested", "confirmed", "on_the_way", "in_progress"] },
    });
    const completedBookings = await Booking.countDocuments({ ...coopFilter, status: { $in: ["completed", "closed"] } });

    const revenueResult = await Booking.aggregate([
      { $match: { ...coopFilter, status: { $in: ["completed", "closed"] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          coopWelfareEarnings: { $sum: "$coopFee" },
          workerPayouts: { $sum: "$workerEarnings" },
        },
      },
    ]);

    const stats = revenueResult[0] || { totalRevenue: 0, coopWelfareEarnings: 0, workerPayouts: 0 };
    const pendingGrievances = await Grievance.countDocuments({ ...coopFilter, status: "pending" });

    res.status(200).json({
      success: true,
      cooperative: coop,
      stats: {
        totalWorkers,
        pendingVerifications,
        activeBookings,
        completedBookings,
        pendingGrievances,
        ...stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Workers in Cooperative (with filters)
export const getCoopWorkers = async (req, res) => {
  try {
    const coop = await Cooperative.findOne({ adminUserId: req.user._id });
    const query = coop ? { cooperativeId: coop._id } : {};

    const { status, skill } = req.query;
    if (status === "verified") query.isVerified = true;
    if (status === "pending") query.isVerified = false;
    if (skill) query.skills = skill;

    const workers = await Worker.find(query)
      .populate("userId", "fullName phone email avatarUrl address")
      .sort({ isVerified: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Verify / Reject Worker KYC and Documents
export const verifyWorkerKYC = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { isVerified, verificationNotes, documentStatuses } = req.body;

    const worker = await Worker.findById(workerId).populate("userId");
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    if (typeof isVerified === "boolean") worker.isVerified = isVerified;
    if (verificationNotes) worker.verificationNotes = verificationNotes;

    // Update document statuses if specified
    if (documentStatuses && Array.isArray(documentStatuses)) {
      documentStatuses.forEach(({ docId, status }) => {
        const doc = worker.documents.id(docId);
        if (doc) doc.status = status;
      });
    }

    await worker.save();

    // Send notification to worker
    if (worker.userId?._id) {
      await Notification.create({
        userId: worker.userId._id,
        title: isVerified ? "🎉 Profile Verified!" : "⚠️ Verification Update",
        message: isVerified
          ? "Congratulations! Your cooperative worker profile is verified and active."
          : `KYC update from cooperative: ${verificationNotes || "Please review your documents."}`,
        type: "welfare",
      });
    }

    res.status(200).json({
      success: true,
      message: `Worker verification updated: ${isVerified ? "Verified" : "Pending/Rejected"}`,
      worker,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Manually Assign / Reassign Worker to Booking
export const manualAssignWorker = async (req, res) => {
  try {
    const { bookingId, workerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const worker = await Worker.findById(workerId).populate("userId");
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    booking.workerId = worker._id;
    booking.status = "confirmed";
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("customerId")
      .populate({ path: "workerId", populate: { path: "userId" } })
      .populate("serviceId");

    emitBookingStatusUpdate(updatedBooking, `Cooperative assigned worker ${worker.userId?.fullName || "Professional"}`);

    res.status(200).json({
      success: true,
      message: "Worker manually assigned successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Worker Insurance Status
export const updateWorkerInsurance = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { hasInsurance, policyNumber, provider, validUntil, sumInsured } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    worker.insuranceStatus = {
      hasInsurance: typeof hasInsurance === "boolean" ? hasInsurance : true,
      policyNumber: policyNumber || worker.insuranceStatus.policyNumber,
      provider: provider || worker.insuranceStatus.provider,
      validUntil: validUntil ? new Date(validUntil) : worker.insuranceStatus.validUntil,
      sumInsured: sumInsured ? parseFloat(sumInsured) : worker.insuranceStatus.sumInsured,
    };

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker insurance record updated",
      insuranceStatus: worker.insuranceStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Broadcast Message to All Workers in Cooperative
export const broadcastToWorkers = async (req, res) => {
  try {
    const { title, message } = req.body;
    const coop = await Cooperative.findOne({ adminUserId: req.user._id });
    const coopFilter = coop ? { cooperativeId: coop._id } : {};

    const workers = await Worker.find(coopFilter).populate("userId");
    const notifications = [];

    for (const w of workers) {
      if (w.userId?._id) {
        notifications.push({
          userId: w.userId._id,
          title: title || "Cooperative Announcement",
          message,
          type: "broadcast",
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: `Broadcast message sent to ${notifications.length} workers in your cooperative.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
