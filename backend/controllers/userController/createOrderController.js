import mongoose from 'mongoose';
import { Product } from '../../modules/productSchema.js';
import { Orders } from '../../modules/orderSchema.js';
import { sendEmail } from '../../utils/resend.js';
import { normalizeOrderPayload, normalizeTransactionReference } from '../../utils/orderPayload.js';
import { isAmountMatch, isPaystackSuccessfulStatus, isValidReference, normalizeCurrency } from '../../utils/paymentValidation.js';

const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const verifyPaystackTransaction = async (reference, expectedAmount, expectedCurrency) => {
  if (!isValidReference(reference)) {
    fail(400, 'Invalid payment reference.');
  }

  const response = await fetch(`${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.data) {
    fail(502, payload?.message || 'Payment verification failed at the gateway.');
  }

  const transaction = payload.data;
  const status = transaction?.status;
  const amount = Number(transaction?.amount || 0);
  const currency = normalizeCurrency(transaction?.currency);

  if (!isPaystackSuccessfulStatus(status)) {
    fail(402, 'Payment is not successful yet.');
  }

  if (!isAmountMatch(expectedAmount, amount / 100)) {
    fail(409, 'Payment amount mismatch.');
  }

  if (currency !== normalizeCurrency(expectedCurrency)) {
    fail(409, 'Payment currency mismatch.');
  }

  return {
    reference,
    transactionId: transaction?.id,
    amount: amount / 100,
    currency,
    gatewayResponse: transaction,
  };
};

export const createOrderController = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const normalizedPayload = normalizeOrderPayload(req.body || {});
    const { shippingAddress, paymentMethod, transactionReference, paymentMetadata } = normalizedPayload;

    if (!shippingAddress || !['address', 'city', 'state', 'country', 'postalCode'].every((field) => shippingAddress[field])) {
      return res.status(400).json({ success: false, message: 'A complete shipping address is required.', errorCode: 'INVALID_SHIPPING_ADDRESS' });
    }
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Authentication required to place an order.', errorCode: 'AUTH_REQUIRED' });

    const RegisterModel = mongoose.models.Users || mongoose.model('Users');
    let orderId;

    await session.withTransaction(async () => {
      const user = await RegisterModel.findById(req.user.id).session(session).populate('cart.productId');
      if (!user) fail(404, 'User account not found.');
      if (!user.cart?.length) fail(400, 'Your cart is empty.');

      const items = [];
      let subtotal = 0;
      const expectedCurrency = 'GHS';
      let paymentVerification = null;
      const normalizedTransactionReference = normalizeTransactionReference(transactionReference);

      for (const item of user.cart) {
        const product = item.productId;
        if (!product) fail(404, 'A product in your cart no longer exists.');
        if (!Number.isInteger(item.quantity) || item.quantity < 1) fail(400, 'Cart contains an invalid quantity.');

        const stockResult = await Product.updateOne(
          { _id: product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );
        if (stockResult.modifiedCount !== 1) fail(409, `${product.name} no longer has enough stock.`);

        items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images?.[0] || ''
        });
        subtotal += product.price * item.quantity;
      }

      const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 15;
      const totalPrice = subtotal + shippingFee;

      if (paymentMethod === 'PAYSTACK') {
        if (normalizedTransactionReference) {
          paymentVerification = await verifyPaystackTransaction(normalizedTransactionReference, totalPrice, expectedCurrency);

          const existingOrder = await Orders.findOne({ transactionReference: normalizedTransactionReference }).session(session);
          if (existingOrder) fail(409, 'A duplicate transaction reference was detected.');
        }
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const [order] = await Orders.create([{
        user: req.user.id,
        items,
        totalPrice,
        orderNumber,
        invoiceNumber,
        paymentMethod: paymentMethod === 'PAYSTACK' ? 'PAYSTACK' : 'CASH_ON_DELIVERY',
        paymentStatus: paymentMethod === 'PAYSTACK' && paymentVerification ? 'PAID' : 'PENDING',
        paymentProvider: paymentMethod === 'PAYSTACK' ? 'PAYSTACK' : null,
        transactionReference: normalizedTransactionReference || (paymentVerification?.reference ? paymentVerification.reference : undefined),
        transactionId: paymentVerification?.transactionId || null,
        currency: paymentVerification?.currency || expectedCurrency,
        amountPaid: paymentVerification?.amount || 0,
        paymentVerifiedAt: paymentVerification ? new Date() : null,
        paymentMetadata: paymentMetadata || null,
        paymentResponse: paymentVerification?.gatewayResponse || null,
        verifiedByBackend: Boolean(paymentVerification),
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

    try {
      const recipientEmail = order.user?.email || req.user.email;
      const customerName = order.user?.userName || 'Valued Customer';
      const formattedTotal = `$${order.totalPrice.toFixed(2)}`;

      const itemsHtml = order.items.map(item => {
        const imageUrl = item.image || process.env.CLOUDINARY_LOG || 'https://via.placeholder.com/60?text=Product';

        return `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; width: 60px; vertical-align: middle;">
              <img src="${imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; display: block;" />
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; color: #111827; vertical-align: middle;">
              <strong style="font-size: 14px; color: #111827;">${item.name}</strong><br />
              <span style="font-size: 12px; color: #6b7280;">Qty: ${item.quantity} &times; $${item.price.toFixed(2)}</span>
            </td>
            <td align="right" style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600; vertical-align: middle; font-size: 14px;">
              $${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        `;
      }).join('');

      await sendEmail({
        to: recipientEmail,
        subject: 'Order Confirmation – Thank You for Your Purchase!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 30px 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="background-color: transparent; padding: 24px 24px 12px 24px;">
                      <img src="${process.env.CLOUDINARY_LOG}" alt="Asapong Logo" style="max-height: 55px; width: auto; display: block; border: 0;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 28px 28px 28px;">
                      <h2 style="color: #111827; margin: 0 0 14px 0; font-size: 18px; font-weight: 700;">Hello ${customerName},</h2>
                      <p style="color: #4b5563; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">Thank you for shopping with <strong>Asapong</strong>!</p>
                      <p style="color: #4b5563; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">We're excited to let you know that we've successfully received your order. Our team is now processing it.</p>
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                        <span style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Order Reference</span><br />
                        <span style="color: #4f46e5; font-size: 16px; font-weight: 700;">#${order._id}</span>
                      </div>
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; font-size: 14px; margin-bottom: 20px;">
                        <tbody>${itemsHtml}<tr style="background-color: #f9fafb;"><td colspan="2" style="padding: 12px; font-weight: 700; color: #111827;">Total Amount Paid</td><td align="right" style="padding: 12px; font-weight: 800; color: #4f46e5; font-size: 16px;">${formattedTotal}</td></tr></tbody>
                      </table>
                      <p style="color: #4b5563; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">Thank you for choosing Asapong. We truly appreciate your trust and look forward to serving you again.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 14px; text-align: center; border-top: 1px solid #f3f4f6;">
                      <p style="color: #9ca3af; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Asapong Inc. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `
      });
    } catch (emailError) {
      console.error('Order confirmation email failed to send:', emailError);
    }

    return res.status(201).json({ success: true, message: 'Order completed successfully.', order });
  } catch (error) {
    console.error('Create order error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Unable to create order at this time.';
    return res.status(statusCode).json({ success: false, message, errorCode: 'ORDER_CREATION_FAILED' });
  } finally {
    await session.endSession();
  }
};