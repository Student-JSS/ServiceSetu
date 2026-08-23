import { Federation } from "../models/Federation.js";
import { Cooperative } from "../models/Cooperative.js";
import { Worker } from "../models/Worker.js";
import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { PREDEFINED_CATEGORIES } from "./serviceController.js";

// 1. Federation High-Level Overview & Financials
export const getFederationOverview = async (req, res) => {
  try {
    const totalCooperatives = await Cooperative.countDocuments();
    const totalWorkers = await Worker.countDocuments();
    const verifiedWorkers = await Worker.countDocuments({ isVerified: true });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      status: { $in: ["requested", "confirmed", "on_the_way", "in_progress"] },
    });

    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ["completed", "closed"] } } },
      {
        $group: {
          _id: null,
          totalGMV: { $sum: "$totalAmount" },
          federationRevenue: { $sum: "$platformFee" },
          cooperativesRevenue: { $sum: "$coopFee" },
          workerDisbursements: { $sum: "$workerEarnings" },
        },
      },
    ]);

    const revenue = revenueResult[0] || {
      totalGMV: 0,
      federationRevenue: 0,
      cooperativesRevenue: 0,
      workerDisbursements: 0,
    };

    // Utilization Rate = Active/Completed Workers / Total Workers
    const busyWorkersCount = await Booking.distinct("workerId", {
      status: { $in: ["confirmed", "on_the_way", "in_progress"] },
    });
    const utilizationRate = totalWorkers > 0 ? Math.round((busyWorkersCount.length / totalWorkers) * 100) : 0;

    const cooperatives = await Cooperative.find().populate("adminUserId", "fullName email phone");
    const federation = await Federation.findOne();

    res.status(200).json({
      success: true,
      federation,
      metrics: {
        totalCooperatives,
        totalWorkers,
        verifiedWorkers,
        totalBookings,
        activeBookings,
        utilizationRate,
        ...revenue,
      },
      cooperatives,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Federation Platform Fee
export const updatePlatformFee = async (req, res) => {
  try {
    const { platformFeePercent } = req.body;
    let federation = await Federation.findOne();

    if (!federation) {
      federation = await Federation.create({
        name: "National Labour Cooperative Federation",
        platformFeePercent: parseFloat(platformFeePercent),
      });
    } else {
      federation.platformFeePercent = parseFloat(platformFeePercent);
      await federation.save();
    }

    res.status(200).json({
      success: true,
      message: `Federation platform fee updated to ${federation.platformFeePercent}%`,
      federation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Rule-Based Demand Forecasting (Simple, Powerful Aggregations)
export const getDemandForecasting = async (req, res) => {
  try {
    // Aggregation 1: Category Demand Volume
    const categoryDemand = await Booking.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $group: {
          _id: "$service.category",
          totalRequests: { $sum: 1 },
          completedJobs: {
            $sum: { $cond: [{ $in: ["$status", ["completed", "closed"]] }, 1, 0] },
          },
          totalRevenue: { $sum: "$totalAmount" },
          emergencyCount: {
            $sum: { $cond: ["$isEmergency", 1, 0] },
          },
        },
      },
      { $sort: { totalRequests: -1 } },
    ]);

    // Aggregation 2: Cooperative / Area distribution
    const areaDemand = await Booking.aggregate([
      {
        $lookup: {
          from: "cooperatives",
          localField: "cooperativeId",
          foreignField: "_id",
          as: "cooperative",
        },
      },
      { $unwind: "$cooperative" },
      {
        $group: {
          _id: {
            coopId: "$cooperative._id",
            name: "$cooperative.name",
            city: "$cooperative.city",
          },
          bookingCount: { $sum: 1 },
          grossVolume: { $sum: "$totalAmount" },
        },
      },
      { $sort: { bookingCount: -1 } },
    ]);

    // Alerts for High Demand + Low Worker Availability
    const allWorkers = await Worker.find({ isOnline: true, isAway: false });
    const alerts = [];

    PREDEFINED_CATEGORIES.forEach((cat) => {
      const catDemandItem = categoryDemand.find((c) => c._id === cat.id);
      const demandCount = catDemandItem ? catDemandItem.totalRequests : 0;
      const supplyCount = allWorkers.filter((w) => w.skills.includes(cat.id)).length;

      if (demandCount > 0 && supplyCount <= 1) {
        alerts.push({
          category: cat.name,
          categoryId: cat.id,
          demandCount,
          supplyCount,
          severity: supplyCount === 0 ? "critical" : "warning",
          message: `High demand for ${cat.name} (${demandCount} bookings) with only ${supplyCount} available worker(s). Recruitment needed.`,
        });
      }
    });

    res.status(200).json({
      success: true,
      categoryDemand,
      areaDemand,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Workforce Allocation Gap Analysis Matrix
export const getWorkforceAllocation = async (req, res) => {
  try {
    const cooperatives = await Cooperative.find();
    const workers = await Worker.find().populate("userId");
    const bookings = await Booking.find().populate("serviceId");

    const matrix = PREDEFINED_CATEGORIES.map((cat) => {
      const coopBreakdown = cooperatives.map((coop) => {
        const availableWorkers = workers.filter(
          (w) =>
            w.cooperativeId?.toString() === coop._id.toString() &&
            w.skills.includes(cat.id) &&
            w.isOnline &&
            !w.isAway
        ).length;

        const totalRegistered = workers.filter(
          (w) =>
            w.cooperativeId?.toString() === coop._id.toString() &&
            w.skills.includes(cat.id)
        ).length;

        const demand = bookings.filter(
          (b) =>
            b.cooperativeId?.toString() === coop._id.toString() &&
            b.serviceId?.category === cat.id
        ).length;

        const isDeficit = demand > 0 && availableWorkers === 0;

        return {
          cooperativeId: coop._id,
          cooperativeName: coop.name,
          city: coop.city,
          availableWorkers,
          totalRegistered,
          demand,
          isDeficit,
        };
      });

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        coopBreakdown,
      };
    });

    res.status(200).json({
      success: true,
      matrix,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Send Federation-Wide System Broadcast
export const broadcastFederation = async (req, res) => {
  try {
    const { title, message } = req.body;

    const allUsers = await User.find({ role: { $in: ["worker", "coop_admin"] } });
    const notifications = allUsers.map((u) => ({
      userId: u._id,
      title: title || "Federation Policy Announcement",
      message,
      type: "broadcast",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: `Federation broadcast dispatched to ${notifications.length} cooperative admins and workers.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
