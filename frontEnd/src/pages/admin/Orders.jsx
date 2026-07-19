import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import UpdateOrder from './UpdateOrder';
import { formatPrice } from '@/lib/utils';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // GET ALL ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Retrieve your JWT token from localStorage
      const token = localStorage.getItem('token');

      // 2. Pass token inside the request configurations
      const response = await axios.get('http://localhost:5000/api/v1/get-all-orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 3. Destructure and evaluate response shapes cleanly
      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setErrorMsg(err.response?.data?.message || 'Access Denied: Unable to fetch order data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const changeStatusInState = (id, nextVal) => {
    setOrders(orders.map(o => (o._id || o.id) === id ? { ...o, status: nextVal } : o));
    if (selectedOrder && (selectedOrder._id || selectedOrder.id) === id) {
      setSelectedOrder({ ...selectedOrder, status: nextVal });
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => setSelectedOrder(null);

  const getImageUrl = (src) => {
    if (!src) return 'https://placehold.co/120x120?text=No+Image';
    return src.startsWith('http') ? src : `http://localhost:5000/${src.replace(/\\/g, '/')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Order Manifests</h2>

      {/* Error Alert Display */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No active client orders found.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const id = order._id || order.id;

                  // Defensive checks for ID values to prevent crashes on substring reads
                  const displayId = id ? `#${id.substring(0, 8)}` : '#N/A';
                  const customer = order.customerName || order.user?.userName || order.user?.name || 'Guest Client';
                  const amount = order.totalPrice ?? order.totalAmount ?? order.price ?? 0;

                  return (
                    <tr
                      key={id || Math.random()}
                      className="cursor-pointer hover:bg-gray-50/50"
                      onClick={() => handleSelectOrder(order)}
                    >
                      <td className="px-6 py-4 font-mono font-medium text-indigo-600">{displayId}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{customer}</td>
                      <td className="px-6 py-4">{formatPrice(amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'SHIPPED' || order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                          }`}>
                          {order.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <UpdateOrder
                          orderId={id}
                          currentStatus={order.status || 'PENDING'}
                          onStatusUpdated={changeStatusInState}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-6">
          <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)] border border-slate-200 sm:max-h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:py-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-slate-900">Order #{selectedOrder._id?.slice(0, 8) || selectedOrder.id?.slice(0, 8)}</h3>
                <p className="text-sm text-slate-500">Placed by {selectedOrder.user?.userName || selectedOrder.customerName || 'Guest Client'}</p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Close order details"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer</h4>
                  <p className="mt-4 text-lg font-semibold text-slate-900">{selectedOrder.user?.userName || selectedOrder.customerName || 'Guest Client'}</p>
                  <p className="text-sm text-slate-500">{selectedOrder.user?.email || selectedOrder.customerEmail || ''}</p>
                  <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">Status: <span className="font-semibold text-slate-900">{selectedOrder.status || 'PENDING'}</span></p>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping Address</h4>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p>{selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order Summary</h4>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span>{selectedOrder.items?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment status</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.paymentStatus || 'PENDING'}</span>
                    </div>
                    <div className="flex justify-between rounded-3xl border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.totalPrice ?? selectedOrder.totalAmount ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Items & Images</h4>
                  <div className="mt-4 space-y-4">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                        <img
                          src={getImageUrl(item.image || item.productId?.images?.[0])}
                          alt={item.name || item.productId?.name || 'Product image'}
                          className="h-24 w-full rounded-3xl object-cover sm:w-24"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                          <p className="text-sm text-slate-500">Unit price: {formatPrice(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Line total</p>
                          <p className="text-base font-semibold text-slate-900">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}