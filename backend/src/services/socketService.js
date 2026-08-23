let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join personal user room
    socket.on("join_user", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      }
    });

    // Join specific booking room for chat & live tracking
    socket.on("join_booking", (bookingId) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
        console.log(`Socket ${socket.id} joined booking_${bookingId}`);
      }
    });

    // Handle in-app chat message between customer and assigned worker
    socket.on("send_message", async ({ bookingId, senderId, senderName, message }) => {
      const payload = {
        bookingId,
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to room
      io.to(`booking_${bookingId}`).emit("receive_message", payload);

      // Persist in MongoDB
      try {
        const { Booking } = await import("../models/Booking.js");
        await Booking.findByIdAndUpdate(bookingId, {
          $push: {
            chatMessages: {
              senderId,
              senderName,
              message,
              timestamp: new Date(),
            },
          },
        });
      } catch (err) {
        console.error("Failed to persist socket message:", err.message);
      }
    });

    // Handle worker live GPS coordinate push during "on the way"
    socket.on("worker_location_update", ({ bookingId, lat, lng }) => {
      io.to(`booking_${bookingId}`).emit("worker_location_changed", { lat, lng });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};

// Helper: push booking status update to booking room & user rooms
export const emitBookingStatusUpdate = (booking, message) => {
  if (!ioInstance) return;
  const payload = {
    bookingId: booking._id,
    status: booking.status,
    message: message || `Booking status changed to ${booking.status}`,
    booking,
    updatedAt: new Date().toISOString(),
  };

  ioInstance.to(`booking_${booking._id}`).emit("booking_status_updated", payload);
  if (booking.customerId) {
    ioInstance.to(`user_${booking.customerId}`).emit("booking_status_updated", payload);
  }
  if (booking.workerId) {
    const workerUserId = booking.workerId.userId || booking.workerId;
    ioInstance.to(`user_${workerUserId}`).emit("booking_status_updated", payload);
  }
};

// Helper: broadcast emergency request to online workers
export const broadcastEmergencyBooking = (workerUserIds, booking) => {
  if (!ioInstance) return;
  workerUserIds.forEach((uid) => {
    ioInstance.to(`user_${uid}`).emit("emergency_booking_request", {
      booking,
      message: "🚨 URGENT: New 'Need Now' Emergency Service Request nearby!",
      timestamp: new Date().toISOString(),
    });
  });
};
