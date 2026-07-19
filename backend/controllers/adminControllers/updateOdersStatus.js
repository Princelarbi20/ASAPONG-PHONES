import { Orders } from "../../modules/orderSchema.js";

export const updateOrderStatusController =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Orders.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.status = status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order status updated",
        order,
      });
    } catch (err) {
      next(err);
    }
  };