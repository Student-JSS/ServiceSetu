import { Grievance } from "../models/Grievance.js";
import { Worker } from "../models/Worker.js";
import { Cooperative } from "../models/Cooperative.js";

// 1. Worker Submits Grievance
export const createGrievance = async (req, res) => {
  try {
    const { category, message } = req.body;
    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
      return res.status(403).json({ success: false, message: "Only workers can raise grievances" });
    }

    const grievance = await Grievance.create({
      workerId: worker._id,
      cooperativeId: worker.cooperativeId,
      category,
      message,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Grievance submitted to cooperative welfare officer",
      grievance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Worker's Own Grievances
export const getMyGrievances = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(200).json({ success: true, grievances: [] });
    }

    const grievances = await Grievance.find({ workerId: worker._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      grievances,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin: Get All Grievances for Cooperative
export const getCoopGrievances = async (req, res) => {
  try {
    const coop = await Cooperative.findOne({ adminUserId: req.user._id });
    const query = coop ? { cooperativeId: coop._id } : {};

    const grievances = await Grievance.find(query)
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin: Resolve Grievance
export const resolveGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      {
        status: status || "resolved",
        adminResponse,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Grievance status updated",
      grievance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
