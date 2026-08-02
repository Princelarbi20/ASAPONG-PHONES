import { Orders } from '../../modules/orderSchema.js';

const buildInvoiceText = (order) => {
  const lines = [
    'Asapong Invoice',
    `Invoice #: ${order.invoiceNumber || order._id}`,
    `Order #: ${order.orderNumber || order._id}`,
    `Customer: ${order.user?.userName || 'N/A'}`,
    `Email: ${order.user?.email || 'N/A'}`,
    `Phone: ${order.user?.phone || 'N/A'}`,
    'Items:'
  ];

  (order.items || []).forEach((item) => {
    const total = (item.price || 0) * (item.quantity || 0);
    lines.push(`${item.name} | Qty: ${item.quantity} | Price: ${Number(item.price || 0).toFixed(2)} | Total: ${total.toFixed(2)}`);
  });

  lines.push(`Payment Method: ${order.paymentMethod || 'N/A'}`);
  lines.push(`Payment Status: ${order.paymentStatus || 'N/A'}`);
  lines.push(`Transaction Reference: ${order.transactionReference || 'N/A'}`);
  lines.push(`Grand Total: ${Number(order.totalPrice || 0).toFixed(2)}`);

  return lines.join('\n');
};

export const downloadInvoiceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Orders.findById(id)
      .populate('user', 'userName email phone')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = order.user?._id?.toString() === req.user?.id?.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this invoice.' });
    }

    const invoiceText = buildInvoiceText(order);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.invoiceNumber || order._id}.txt`);
    return res.send(invoiceText);
  } catch (error) {
    next(error);
  }
};
