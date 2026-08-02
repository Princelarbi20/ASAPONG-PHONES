import { Orders } from "../../modules/orderSchema.js";

export const updateOrderStatusController =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, note = '' } = req.body;

      const allowedStatuses = [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid order status.' });
      }

      const order = await Orders.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.status = status;
      order.updatedBy = req.user?.id || null;
      order.statusHistory.push({
        status,
        changedBy: req.user?.id || null,
        changedAt: new Date(),
        note,
      });

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order status updated",
        order: {
          _id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          paymentProvider: order.paymentProvider,
          transactionReference: order.transactionReference,
          amountPaid: order.amountPaid,
          invoiceNumber: order.invoiceNumber,
          orderNumber: order.orderNumber,
          updatedAt: order.updatedAt,
          statusHistory: order.statusHistory,
        },
      });
    } catch (err) {
      next(err);
    }
  };