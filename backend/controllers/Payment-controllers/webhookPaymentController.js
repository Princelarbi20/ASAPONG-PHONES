import crypto from 'node:crypto';
import { Orders } from '../../modules/orderSchema.js';

export const webhookPaymentController = async (req, res) => {
  try {
    const signature = req.get('x-paystack-signature');
    const rawBody = req.body;

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Paystack signature.' });
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(rawBody))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ success: false, message: 'Invalid Paystack signature.' });
    }

    const event = rawBody?.event;
    const data = rawBody?.data;

    if (!event || !data?.reference) {
      return res.status(400).json({ success: false, message: 'Incomplete webhook payload.' });
    }

    if (!['charge.success', 'transaction.success'].includes(event)) {
      return res.status(202).json({ success: true, message: 'Webhook event ignored.' });
    }

    const order = await Orders.findOne({ transactionReference: data.reference });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this reference.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, message: 'Webhook already processed.' });
    }

    order.paymentStatus = 'PAID';
    order.paymentProvider = 'PAYSTACK';
    order.paymentVerifiedAt = new Date();
    order.verifiedByBackend = true;
    order.paymentResponse = rawBody;
    await order.save();

    return res.status(200).json({ success: true, message: 'Webhook processed.' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing failed.' });
  }
};
