import mongoose from "mongoose";
import { Product } from "../../modules/productSchema.js";

export const getUserOrdersController = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication tracking vector payload signature missing."
      });
    }

    const rawUserId = req.user.id || req.user._id;

    // 🚀 DIAGNOSTIC LOGGER: Watch your server terminal console when you run the request
    console.log("==========================================");
    console.log("LOGGED IN USER DECODED PAYLOAD:", req.user);
    console.log("EXTRACTED ID STRING STAGE:", rawUserId);
    console.log("==========================================");

    if (!rawUserId) {
      return res.status(400).json({
        success: false,
        message: "Malformed user authorization parameter metrics."
      });
    }

    const searchObjectId = new mongoose.Types.ObjectId(String(rawUserId));
    const OrdersModel = mongoose.models.Orders || mongoose.model("Orders");

    // Query elements
    const userOrders = await OrdersModel.find({ user: searchObjectId })
      .populate({
        path: "items.productId",
        select: "name price images description brand category stock specifications"
      })
      .sort({ createdAt: -1 });

    // 🚀 DIAGNOSTIC LOGGER: Check how many items match in the DB collection row
    console.log(`FOUND ${userOrders.length} MATCHING ORDERS IN DB FOR THIS OBJECT_ID.`);
    console.log("==========================================");

    const sanitizedOrders = userOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber: order.invoiceNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      transactionReference: order.transactionReference,
      amountPaid: order.amountPaid,
      totalPrice: order.totalPrice,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
      deliveryNotes: order.deliveryNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
    }));

    res.status(200).json({
      success: true,
      count: sanitizedOrders.length,
      message: "User transaction history logs parsed and delivered successfully.",
      orders: sanitizedOrders
    });

  } catch (err) {
    next(err);
  }
};