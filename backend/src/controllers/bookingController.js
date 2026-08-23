import { Booking } from "../models/Booking.js";
import { Worker } from "../models/Worker.js";
import { Service } from "../models/Service.js";
import { Cooperative } from "../models/Cooperative.js";
import { Federation } from "../models/Federation.js";
import { Notification } from "../models/Notification.js";
import {
  emitBookingStatusUpdate,
  broadcastEmergencyBooking,
} from "../services/socketService.js";

// Haversine formula calculation helper in Kilometers
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// 1. Find Nearby Available Verified Workers (Strictly Verified Only)
export const findNearbyWorkers = async (req, res) => {
  try {
    const { category, lat, lng, radiusKm = 15 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Location coordinates (lat, lng) are required" });
    }

    const cLat = parseFloat(lat);
    const cLng = parseFloat(lng);
    const maxRadius = parseFloat(radiusKm);

    // STRICT: Only certified workers approved by Cooperative Admin
    const query = {
      isVerified: true,
      isOnline: true,
      isAway: false,
    };

    if (category) {
      query.skills = category;
    }

    const workers = await Worker.find(query)
      .populate("userId", "fullName phone avatarUrl address")
      .populate("cooperativeId", "name city state");

    // Filter workers within radius and attach calculated distance
    const matchedWorkers = workers
      .map((w) => {
        const wLng = w.location?.coordinates?.[0] || 77.2090;
        const wLat = w.location?.coordinates?.[1] || 28.6139;
        const distanceKm = calculateDistanceKm(cLat, cLng, wLat, wLng);
        const effectiveRadius = w.serviceRadiusKm || maxRadius;

        return {
          worker: w,
          distanceKm,
          isWithinRadius: distanceKm <= effectiveRadius,
        };
      })
      .filter((item) => item.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      count: matchedWorkers.length,
      workers: matchedWorkers.map((item) => ({
        ...item.worker.toObject(),
        distanceKm: item.distanceKm,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create Standard or Auto-Assigned Booking (Verified Workers Only)
export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      workerId,
      scheduledAt,
      timeSlot,
      address,
      lat,
      lng,
      notes,
      isEmergency = false,
    } = req.body;

    const service = await Service.findById(serviceId).populate("cooperativeId");
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check if worker is verified
    let targetWorker = null;
    if (workerId) {
      targetWorker = await Worker.findById(workerId).populate("userId");
      if (!targetWorker || !targetWorker.isVerified) {
        return res.status(400).json({
          success: false,
          message: "This worker is currently undergoing cooperative KYC verification and cannot accept bookings yet.",
        });
      }
    } else {
      // Auto-assign nearest verified online worker
      const cLat = lat ? parseFloat(lat) : 28.6139;
      const cLng = lng ? parseFloat(lng) : 77.2090;

      const onlineWorkers = await Worker.find({
        skills: service.category,
        isVerified: true,
        isOnline: true,
        isAway: false,
      }).populate("userId");

      const sortedWorkers = onlineWorkers
        .map((w) => {
          const wLng = w.location?.coordinates?.[0] || 77.2090;
          const wLat = w.location?.coordinates?.[1] || 28.6139;
          const distanceKm = calculateDistanceKm(cLat, cLng, wLat, wLng);
          return { worker: w, distanceKm };
        })
        .filter((item) => item.distanceKm <= (item.worker.serviceRadiusKm || 25))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      targetWorker = sortedWorkers[0]?.worker || null;
    }

    const cooperative = service.cooperativeId || (await Cooperative.findOne());
    const federation = await Federation.findOne();

    const surgeMultiplier = isEmergency ? cooperative?.surgeMultiplier || 1.25 : 1.0;
    const basePrice = service.basePrice;
    const totalAmount = Math.round(basePrice * surgeMultiplier);

    const platformFeePercent = federation?.platformFeePercent || 5;
    const coopFeePercent = cooperative?.commissionRate || 5;

    const platformFee = Math.round((totalAmount * platformFeePercent) / 100);
    const coopFee = Math.round((totalAmount * coopFeePercent) / 100);
    const workerEarnings = totalAmount - platformFee - coopFee;

    const booking = await Booking.create({
      customerId: req.user._id,
      workerId: targetWorker?._id || null,
      serviceId: service._id,
      cooperativeId: cooperative._id,
      status: targetWorker ? "confirmed" : "requested",
      scheduledAt: scheduledAt || new Date(),
      timeSlot: timeSlot || "Morning (09:00 - 12:00)",
      isEmergency,
      address,
      location: {
        type: "Point",
        coordinates: [lng ? parseFloat(lng) : 77.2090, lat ? parseFloat(lat) : 28.6139],
      },
      notes,
      basePrice,
      surgeMultiplier,
      totalAmount,
      platformFee,
      coopFee,
      workerEarnings,
      paymentStatus: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    // Send in-app notification to the assigned worker
    if (targetWorker && targetWorker.userId) {
      const workerUserId = targetWorker.userId._id || targetWorker.userId;
      await Notification.create({
        userId: workerUserId,
        title: "⚡ New Job Booking Received",
        message: `Customer ${req.user.fullName || "User"} booked ${service.name} at ${address}. Expected earning: ₹${workerEarnings}.`,
        type: "booking",
        link: "/worker/dashboard#active-job-section",
      });
    }

    // Send notification to customer
    await Notification.create({
      userId: req.user._id,
      title: "🎉 Service Booking Confirmed",
      message: `Your booking for ${service.name} is confirmed. Pro ${targetWorker?.userId?.fullName || 'Certified Worker'} will arrive at your address.`,
      type: "booking",
      link: `/customer/bookings/${booking._id}`,
    });

    emitBookingStatusUpdate(
      populatedBooking,
      targetWorker
        ? `Service request confirmed and assigned to certified pro ${targetWorker.userId?.fullName}.`
        : "Service request received. Locating nearest certified worker..."
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create Emergency "Need Now" Broadcast Request (Verified Workers Only)
export const createEmergencyBroadcast = async (req, res) => {
  try {
    const { serviceId, address, lat, lng, notes } = req.body;

    const service = await Service.findById(serviceId).populate("cooperativeId");
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const cooperative = service.cooperativeId || (await Cooperative.findOne());
    const federation = await Federation.findOne();

    const surgeMultiplier = cooperative?.surgeMultiplier || 1.25;
    const basePrice = service.basePrice;
    const totalAmount = Math.round(basePrice * surgeMultiplier);

    const platformFeePercent = federation?.platformFeePercent || 5;
    const coopFeePercent = cooperative?.commissionRate || 5;

    const platformFee = Math.round((totalAmount * platformFeePercent) / 100);
    const coopFee = Math.round((totalAmount * coopFeePercent) / 100);
    const workerEarnings = totalAmount - platformFee - coopFee;

    const cLat = lat ? parseFloat(lat) : 28.6139;
    const cLng = lng ? parseFloat(lng) : 77.2090;

    // Find ONLY verified, online workers
    const eligibleWorkers = await Worker.find({
      isVerified: true,
      skills: service.category,
      isOnline: true,
      isAway: false,
    }).populate("userId");

    const nearbyWorkers = eligibleWorkers
      .map((w) => {
        const wLng = w.location?.coordinates?.[0] || 77.2090;
        const wLat = w.location?.coordinates?.[1] || 28.6139;
        const distanceKm = calculateDistanceKm(cLat, cLng, wLat, wLng);
        return { worker: w, distanceKm };
      })
      .filter((item) => item.distanceKm <= (item.worker.serviceRadiusKm || 30))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Auto-assign nearest verified worker for instant confirmation
    const closestWorker = nearbyWorkers[0]?.worker || null;

    const booking = await Booking.create({
      customerId: req.user._id,
      workerId: closestWorker?._id || null,
      serviceId: service._id,
      cooperativeId: cooperative._id,
      status: closestWorker ? "confirmed" : "requested",
      scheduledAt: new Date(),
      timeSlot: "Immediate (Need Now)",
      isEmergency: true,
      address: address || "Emergency Location",
      location: {
        type: "Point",
        coordinates: [cLng, cLat],
      },
      notes,
      basePrice,
      surgeMultiplier,
      totalAmount,
      platformFee,
      coopFee,
      workerEarnings,
      paymentStatus: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    const workerUserIds = nearbyWorkers.map((w) => w.worker.userId?._id?.toString()).filter(Boolean);

    // Broadcast via Socket.io in real-time to verified workers
    broadcastEmergencyBooking(workerUserIds, populatedBooking);
    emitBookingStatusUpdate(
      populatedBooking,
      closestWorker
        ? `Emergency request confirmed! Nearest certified pro ${closestWorker.userId?.fullName} assigned.`
        : "Emergency alert broadcasted to all nearby certified workers."
    );

    res.status(201).json({
      success: true,
      message: closestWorker
        ? `Emergency request confirmed and assigned to ${closestWorker.userId?.fullName}!`
        : `Emergency request broadcasted to ${nearbyWorkers.length} active workers nearby.`,
      booking: populatedBooking,
      workersNotified: nearbyWorkers.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Worker Accepts Booking (For Broadcast or Pending Requests)
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
      return res.status(403).json({ success: false, message: "Only registered workers can accept jobs" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.workerId && booking.workerId.toString() !== worker._id.toString()) {
      return res.status(400).json({ success: false, message: "This booking has already been claimed by another worker." });
    }

    booking.workerId = worker._id;
    booking.status = "confirmed";
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    emitBookingStatusUpdate(updatedBooking, `Worker ${req.user.fullName} accepted your service request.`);

    res.status(200).json({
      success: true,
      message: "Job accepted successfully!",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Booking Status (Progression Lifecycle)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["requested", "confirmed", "on_the_way", "in_progress", "completed", "cancelled", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    if (status === "in_progress" && !booking.startedAt) {
      booking.startedAt = new Date();
    }
    if (status === "completed" && !booking.completedAt) {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    emitBookingStatusUpdate(updatedBooking, `Booking status changed to ${status.replace(/_/g, " ").toUpperCase()}`);

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get My Bookings (Customer / Worker / Coop Admin)
export const getMyBookings = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};

    if (req.user.role === "customer") {
      query.customerId = req.user._id;
    } else if (req.user.role === "worker") {
      const worker = await Worker.findOne({ userId: req.user._id });
      if (!worker) return res.status(200).json({ success: true, bookings: [] });
      query.$or = [{ workerId: worker._id }, { status: "requested", isEmergency: true }];
    } else if (req.user.role === "coop_admin") {
      const coop = await Cooperative.findOne({ adminUserId: req.user._id });
      if (coop) query.cooperativeId = coop._id;
    }

    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get Single Booking Details
export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Cancel Booking by Customer or Admin (Anytime before completion)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "Cancelled by user" } = req.body;

    const booking = await Booking.findById(id)
      .populate("customerId", "fullName phone email avatarUrl")
      .populate({
        path: "workerId",
        populate: { path: "userId", select: "fullName phone avatarUrl" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (["completed", "closed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Completed service bookings cannot be cancelled." });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();

    emitBookingStatusUpdate(booking, `Booking was cancelled. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: "Booking has been cancelled successfully.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Worker Cancels/Declines Job (Auto-transfers Emergency to next nearest worker)
export const workerCancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "Worker unavailable" } = req.body;

    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json({ success: false, message: "Worker not found" });
    }

    const booking = await Booking.findById(id)
      .populate("customerId")
      .populate("serviceId")
      .populate("cooperativeId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (["completed", "closed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel a completed service." });
    }

    // If Emergency: Transfer immediately to next nearest available worker
    if (booking.isEmergency) {
      const cLng = booking.location?.coordinates?.[0] || 77.2090;
      const cLat = booking.location?.coordinates?.[1] || 28.6139;

      const otherWorkers = await Worker.find({
        _id: { $ne: worker._id },
        skills: booking.serviceId?.category,
        isOnline: true,
        isAway: false,
      }).populate("userId");

      const sortedNextWorkers = otherWorkers
        .map((w) => {
          const wLng = w.location?.coordinates?.[0] || 77.2090;
          const wLat = w.location?.coordinates?.[1] || 28.6139;
          const distanceKm = calculateDistanceKm(cLat, cLng, wLat, wLng);
          return { worker: w, distanceKm };
        })
        .filter((item) => item.distanceKm <= (item.worker.serviceRadiusKm || 35))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      const nextWorker = sortedNextWorkers[0]?.worker || null;

      if (nextWorker) {
        booking.workerId = nextWorker._id;
        booking.status = "confirmed";
        await booking.save();

        const updatedBooking = await Booking.findById(id)
          .populate("customerId", "fullName phone email avatarUrl")
          .populate({
            path: "workerId",
            populate: { path: "userId", select: "fullName phone avatarUrl" },
          })
          .populate("serviceId")
          .populate("cooperativeId");

        emitBookingStatusUpdate(
          updatedBooking,
          `Emergency booking automatically transferred to next nearest certified pro: ${nextWorker.userId?.fullName}`
        );

        return res.status(200).json({
          success: true,
          message: `Job declined. Emergency request automatically transferred to next nearest worker (${nextWorker.userId?.fullName}).`,
          booking: updatedBooking,
          transferredTo: nextWorker.userId?.fullName,
        });
      } else {
        // No other worker found, open to broadcast
        booking.workerId = null;
        booking.status = "requested";
        await booking.save();

        const updatedBooking = await Booking.findById(id)
          .populate("customerId", "fullName phone email avatarUrl")
          .populate("serviceId")
          .populate("cooperativeId");

        emitBookingStatusUpdate(
          updatedBooking,
          "Worker was unavailable. System is broadcasting emergency request to wider network..."
        );

        return res.status(200).json({
          success: true,
          message: "Job declined. Request broadcasted to wider network.",
          booking: updatedBooking,
        });
      }
    } else {
      // Normal Request: unassign worker
      booking.workerId = null;
      booking.status = "requested";
      await booking.save();

      const updatedBooking = await Booking.findById(id)
        .populate("customerId", "fullName phone email avatarUrl")
        .populate("serviceId")
        .populate("cooperativeId");

      emitBookingStatusUpdate(
        updatedBooking,
        `Worker declined the job (${reason}). Reassigning new worker...`
      );

      return res.status(200).json({
        success: true,
        message: "You have cancelled/declined this assignment.",
        booking: updatedBooking,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Get In-App Chat History for Booking
export const getBookingChat = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).select("chatMessages customerId workerId");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      messages: booking.chatMessages || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Post In-App Chat Message (REST Fallback)
export const postBookingChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const newMsg = {
      senderId: req.user._id,
      senderName: req.user.fullName,
      message: message.trim(),
      timestamp: new Date(),
    };

    booking.chatMessages.push(newMsg);
    await booking.save();

    res.status(201).json({
      success: true,
      message: newMsg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
