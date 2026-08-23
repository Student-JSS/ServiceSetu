import { Rating } from "../models/Rating.js";
import { Booking } from "../models/Booking.js";
import { Worker } from "../models/Worker.js";

// 1. Submit Rating (Customer to Worker OR Worker to Customer)
export const submitRating = async (req, res) => {
  try {
    const { bookingId, stars, review, role } = req.body;

    const booking = await Booking.findById(bookingId).populate("workerId");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let ratedTo;
    let isCustomerToWorker = role === "customer_to_worker" || req.user.role === "customer";

    if (isCustomerToWorker) {
      if (!booking.workerId) {
        return res.status(400).json({ success: false, message: "No worker assigned to this booking" });
      }
      ratedTo = booking.workerId.userId || booking.workerId;
      booking.customerRated = true;
    } else {
      ratedTo = booking.customerId;
      booking.workerRated = true;
    }

    const rating = await Rating.create({
      bookingId: booking._id,
      ratedBy: req.user._id,
      ratedTo,
      role: isCustomerToWorker ? "customer_to_worker" : "worker_to_customer",
      stars: Math.min(5, Math.max(1, parseInt(stars))),
      review: review || "",
    });

    await booking.save();

    // Recalculate average rating for worker
    if (isCustomerToWorker && booking.workerId) {
      const workerRatings = await Rating.find({
        ratedTo: ratedTo,
        role: "customer_to_worker",
      });

      const avg = workerRatings.reduce((sum, r) => sum + r.stars, 0) / workerRatings.length;
      await Worker.findByIdAndUpdate(booking.workerId._id || booking.workerId, {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: workerRatings.length,
      });
    }

    res.status(201).json({
      success: true,
      message: "Rating and feedback submitted successfully!",
      rating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Worker Ratings & Reviews
export const getWorkerRatings = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const ratings = await Rating.find({
      ratedTo: worker.userId,
      role: "customer_to_worker",
    })
      .populate("ratedBy", "fullName avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratingAvg: worker.ratingAvg,
      showPublicly: ratings.length >= 1, // Minimum bookings threshold
      ratings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Flag / Dispute Rating (Coop admin review)
export const flagRating = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findByIdAndUpdate(id, { isFlagged: true }, { new: true });

    res.status(200).json({
      success: true,
      message: "Rating flagged for cooperative admin review",
      rating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
