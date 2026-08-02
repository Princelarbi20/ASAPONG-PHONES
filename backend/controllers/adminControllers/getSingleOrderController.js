import { Orders } from '../../modules/orderSchema.js';

export const getSingleOrderController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Orders.findById(id)
      .populate('user', 'userName email phone')
      .populate('statusHistory.changedBy', 'userName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      order: {
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
        currency: order.currency,
        paymentVerifiedAt: order.paymentVerifiedAt,
        paymentResponse: order.paymentResponse,
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
        deliveryNotes: order.deliveryNotes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items,
        user: order.user ? {
          _id: order.user._id,
          userName: order.user.userName,
          email: order.user.email,
          phone: order.user.phone,
        } : null,
        statusHistory: order.statusHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
