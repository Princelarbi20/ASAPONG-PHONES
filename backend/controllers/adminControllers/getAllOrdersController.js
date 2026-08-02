import { Orders } from "../../modules/orderSchema.js";

export const getAllOrdersController = async (req,res,next) => {
  try {
    const orders = await Orders.find()
      .populate("user", "userName email phone")
      .sort({ createdAt: -1 });

    const sanitizedOrders = orders.map((order) => ({
      ...order.toObject(),
      _id: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber: order.invoiceNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      transactionReference: order.transactionReference,
      transactionId: order.transactionId,
      amountPaid: order.amountPaid,
      totalPrice: order.totalPrice,
      currency: order.currency,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      deliveryNotes: order.deliveryNotes,
      paymentResponse: order.paymentResponse,
      paymentVerifiedAt: order.paymentVerifiedAt,
      itemCount: order.items?.length || 0,
      user: order.user ? {
        _id: order.user._id,
        userName: order.user.userName,
        email: order.user.email,
        phone: order.user.phone,
      } : null,
    }));

    res.status(200).json({
      success: true,
      totalOrders: sanitizedOrders.length,
      orders: sanitizedOrders,
    });
  } catch (err) {
    next(err);
  }
};