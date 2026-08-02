import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const getStatusBadge = (status = 'PENDING') => {
  const normalized = (status || 'PENDING').toUpperCase();
  if (['SHIPPED', 'DELIVERED', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY'].includes(normalized)) {
    return 'bg-emerald-50 text-emerald-700';
  }
  if (normalized === 'PENDING') {
    return 'bg-rose-50 text-rose-700';
  }
  return 'bg-amber-50 text-amber-700';
};

const getImageUrl = (src) => {
  if (!src) return 'https://placehold.co/120x120?text=No+Image';
  return src.startsWith('http') ? src : `http://localhost:5000/${src.replace(/\\/g, '/')}`;
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const response = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(response.data?.order || null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setErrorMsg(err.response?.data?.message || 'Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMsg || 'No order found.'}</span>
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to orders
        </button>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const customer = order.user || {};
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </button>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Order #{order.orderNumber || order._id?.slice(0, 8)}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{order.orderNumber || `Order ${order._id?.slice(0, 8)}`}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}>{order.status || 'PENDING'}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.paymentStatus || 'PENDING'}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p className="text-lg font-semibold text-slate-900">{customer.userName || 'Guest Client'}</p>
                <p>{customer.email || 'N/A'}</p>
                <p>{customer.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{shipping.address || 'N/A'}</p>
                <p>{shipping.city || ''}{shipping.city && shipping.state ? ', ' : ''}{shipping.state || ''}</p>
                <p>{shipping.country || ''}{shipping.country && shipping.postalCode ? ' - ' : ''}{shipping.postalCode || ''}</p>
                <p className="pt-2 text-slate-500">{order.deliveryNotes || 'No delivery notes.'}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Status</span><span className="font-semibold text-slate-900">{order.paymentStatus || 'PENDING'}</span></div>
                <div className="flex justify-between"><span>Method</span><span className="font-semibold text-slate-900">{order.paymentMethod || 'CASH_ON_DELIVERY'}</span></div>
                <div className="flex justify-between"><span>Provider</span><span className="font-semibold text-slate-900">{order.paymentProvider || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Reference</span><span className="font-semibold text-slate-900">{order.transactionReference || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Amount paid</span><span className="font-semibold text-slate-900">{formatPrice(order.amountPaid ?? order.totalPrice ?? 0)}</span></div>
                <div className="flex justify-between"><span>Currency</span><span className="font-semibold text-slate-900">{order.currency || 'GHS'}</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order details</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Invoice</span><span className="font-semibold text-slate-900">{order.invoiceNumber || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Created</span><span className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Updated</span><span className="font-semibold text-slate-900">{new Date(order.updatedAt).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Products</h3>
              <div className="mt-4 space-y-4">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">No items found.</p>
                ) : items.map((item, index) => (
                  <div key={index} className="flex gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                    <img src={getImageUrl(item.image || item.productId?.images?.[0])} alt={item.name || 'Product'} className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      <p className="text-sm text-slate-500">Unit price: {formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-900">{formatPrice((item.price || 0) * (item.quantity || 1))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
