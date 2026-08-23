import { Payment } from "../models/Payment.js";
import { Booking } from "../models/Booking.js";
import { generateInvoicePDF } from "../services/invoiceService.js";
import { emitBookingStatusUpdate } from "../services/socketService.js";
import path from "path";
import fs from "fs";

// 1. Create Payment Order (Razorpay / Mock checkout)
export const createOrder = async (req, res) => {
  try {
    const { bookingId, method = "upi" } = req.body;
    const booking = await Booking.findById(bookingId).populate("serviceId").populate("customerId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: req.user._id,
      workerId: booking.workerId,
      cooperativeId: booking.cooperativeId,
      razorpayOrderId: orderId,
      amount: booking.totalAmount,
      method,
      status: "created",
    });

    res.status(200).json({
      success: true,
      order: {
        id: orderId,
        amount: booking.totalAmount,
        currency: "INR",
        bookingId: booking._id,
        serviceName: booking.serviceId?.name,
        customerName: booking.customerId?.fullName,
        customerPhone: booking.customerId?.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify Payment & Finalize Invoice
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayPaymentId, razorpayOrderId, method = "upi" } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("customerId")
      .populate({
        path: "workerId",
        populate: { path: "userId" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: booking.customerId?._id || req.user._id,
      workerId: booking.workerId?._id,
      cooperativeId: booking.cooperativeId?._id,
      razorpayOrderId: razorpayOrderId || `rzp_ord_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}_mock`,
      amount: booking.totalAmount,
      method,
      status: "success",
    });

    // Generate Invoice PDF
    const { invoiceNumber, relativeUrl } = await generateInvoicePDF(booking, payment);

    booking.paymentStatus = "paid";
    booking.paymentMethod = "razorpay";
    booking.invoiceNumber = invoiceNumber;
    booking.invoiceUrl = relativeUrl;
    if (booking.status === "completed") {
      booking.status = "closed";
    }
    await booking.save();

    payment.invoiceNumber = invoiceNumber;
    await payment.save();

    emitBookingStatusUpdate(booking, "Payment received successfully. Invoice generated.");

    res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      payment,
      invoiceUrl: relativeUrl,
      invoiceNumber,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Choose Cash on Delivery (COD)
export const selectCOD = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("customerId")
      .populate({
        path: "workerId",
        populate: { path: "userId" },
      })
      .populate("serviceId")
      .populate("cooperativeId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const { invoiceNumber, relativeUrl } = await generateInvoicePDF(booking, { method: "cod" });

    booking.paymentStatus = "cod_pending";
    booking.paymentMethod = "cod";
    booking.invoiceNumber = invoiceNumber;
    booking.invoiceUrl = relativeUrl;
    await booking.save();

    emitBookingStatusUpdate(booking, "Payment mode set to Cash on Delivery");

    res.status(200).json({
      success: true,
      message: "Cash on delivery selected. You can pay cash upon service completion.",
      booking,
      invoiceUrl: relativeUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Mark COD Cash as Collected by Worker
export const markCODCollected = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "cod_collected";
    if (booking.status === "completed") {
      booking.status = "closed";
    }
    await booking.save();

    emitBookingStatusUpdate(booking, "Cash payment collected by worker. Booking closed.");

    res.status(200).json({
      success: true,
      message: "Cash collected recorded.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
