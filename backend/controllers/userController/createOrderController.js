import mongoose from 'mongoose';
import { Product } from '../../modules/productSchema.js';
import { Orders } from '../../modules/orderSchema.js';

const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

export const createOrderController = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress || !['address', 'city', 'state', 'country', 'postalCode'].every((field) => shippingAddress[field])) {
      return res.status(400).json({ success: false, message: 'A complete shipping address is required.' });
    }
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Authentication required to place an order.' });

    const RegisterModel = mongoose.models.Users || mongoose.model('Users');
    let orderId;
    await session.withTransaction(async () => {
      const user = await RegisterModel.findById(req.user.id).session(session).populate('cart.productId');
      if (!user) fail(404, 'User account not found.');
      if (!user.cart?.length) fail(400, 'Your cart is empty.');

      const items = [];
      let totalPrice = 0;
      for (const item of user.cart) {
        const product = item.productId;
        if (!product) fail(404, 'A product in your cart no longer exists.');
        if (!Number.isInteger(item.quantity) || item.quantity < 1) fail(400, 'Cart contains an invalid quantity.');

        // The condition makes the decrement atomic: concurrent purchases cannot
        // drive stock below zero.
        const stockResult = await Product.updateOne(
          { _id: product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );
        if (stockResult.modifiedCount !== 1) fail(409, `${product.name} no longer has enough stock.`);

        items.push({ productId: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.images?.[0] || '' });
        totalPrice += product.price * item.quantity;
      }

      const [order] = await Orders.create([{
        user: req.user.id,
        items,
        totalPrice,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode
        }
      }], { session });
      orderId = order._id;
      await RegisterModel.findByIdAndUpdate(req.user.id, { $set: { cart: [] } }, { session });
    });

    const order = await Orders.findById(orderId)
      .populate('user', 'userName email')
      .populate('items.productId', 'name price images description brand category stock specifications');
    return res.status(201).json({ success: true, message: 'Order completed successfully.', order });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
