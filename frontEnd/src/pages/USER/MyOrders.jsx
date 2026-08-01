import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Loader2, Calendar, Package, MapPin, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';

export const MyOrders = () => {
    // Read auth state out of Redux
    const isAuthenticated = useSelector((state) => state.auth.isLogin);

    // Component tracking states
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // URL parsing helper matrix to match dynamic asset locations seamlessly
    const getSingleImageUrl = (imgStr) => {
        if (!imgStr) return 'https://placehold.co/150?text=No+Image';
        if (imgStr.startsWith('http')) return imgStr;
        return `http://localhost:5000/${imgStr.replace(/\\/g, '/')}`;
    };

    // Helper function to render clean visual tailwind styling for transaction status states
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'APPROVED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'PENDING':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'SHIPPED':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PROCESSING':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-rose-50 text-rose-700 border-rose-200';
        }
    };

    // FETCH ORDER HISTORY REGISTRY
    const fetchUserOrders = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            setErrorMsg('');

            // Fetch user orders from the backend endpoint
            const response = await axios.get('http://localhost:5000/api/v1/my-orders', {
                withCredentials: true
            });

            if (response.data && Array.isArray(response.data.orders)) {
                setOrders(response.data.orders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Failed to fetch user order index logs:", err);
            setErrorMsg(err.response?.data?.message || "Could not retrieve your purchasing transaction histories.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchUserOrders();
    }, [fetchUserOrders]);

    // Guard Clause: User is not logged in
    if (!isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                    You need to be logged in to view your complete historical purchase transaction details.
                </p>
                <Link to="/auth/login" className="inline-block mt-6 bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm">
                    Sign In Now
                </Link>
            </div>
        );
    }

    // Loading indicator for active dashboard rendering fetches
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-24 gap-3">
                <Loader2 className="w-9 h-9 text-green-600 animate-spin" />
                <p className="text-xs text-gray-400 font-medium tracking-wide">Retrieving order logs mapping indexes...</p>
            </div>
        );
    }

    // Guard Clause: No orders found inside profiles
    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">No Orders Placed Yet</h2>
                <p className="text-gray-500 mt-2">Looks like you haven't processed any active checkout checkouts parameters yet.</p>
                {errorMsg && <p className="text-xs text-rose-600 font-semibold mt-2">{errorMsg}</p>}
                <Link to="/" className="inline-flex items-center gap-2 mt-6 text-green-600 font-semibold hover:text-green-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Discover Premium Gadgets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to store shopping
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">My Purchase Orders</h1>
            </div>

            {/* Main Order Cards Grid Block List mapping iterations */}
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden transition-all hover:shadow-md">

                        {/* Top Order Meta Summary Stripe */}
                        <div className="bg-gray-50/70 border-b border-gray-100 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-gray-500">
                            <div>
                                <p className="uppercase text-[10px] tracking-wider text-gray-400 font-bold mb-1">Order Identifier</p>
                                <span className="font-mono text-gray-800 font-bold">{order._id}</span>
                            </div>
                            <div>
                                <p className="uppercase text-[10px] tracking-wider text-gray-400 font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-500" /> Purchase Date</p>
                                <span className="text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div>
                                <p className="uppercase text-[10px] tracking-wider text-gray-400 font-bold mb-1">Total Bill Invoice</p>
                                <span className="text-base font-black text-gray-950">{formatPrice(order.totalPrice || 0)}</span>
                            </div>
                            <div className="text-right sm:text-left self-center sm:self-auto">
                                <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-extrabold rounded-md tracking-wider uppercase shadow-2xs ${getStatusColor(order.status)}`}>
                                    {order.status || 'PENDING'}
                                </span>
                            </div>
                        </div>

                        {/* Middle Container Section — Address Summary & Item row details */}
                        <div className="p-4 sm:p-6 space-y-6">

                            {/* Shipping location address row */}
                            <div className="flex gap-2.5 text-xs text-gray-500 bg-slate-50/50 p-3 rounded-xl border border-gray-100 items-start">
                                <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-gray-700 uppercase text-[9px] tracking-widest mb-0.5">Shipping Destination</p>
                                    <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
                                </div>
                            </div>

                            {/* Items iteration rows layout */}
                            <div className="divide-y divide-gray-100">
                                {order.items?.map((item, index) => (
                                    <div key={item._id || index} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                                <img
                                                    src={getSingleImageUrl(item.image || (item.productId && item.productId.images?.[0]))}
                                                    alt={item.name}
                                                    className="object-contain w-full h-full"
                                                    onError={(e) => { e.target.src = "https://placehold.co/150?text=No+Image"; }}
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-gray-950 line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-400 font-medium">Quantity units purchased: <span className="font-bold text-gray-600">{item.quantity}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline justify-between sm:justify-start sm:text-right gap-2 border-t border-dashed border-gray-100 pt-2 sm:pt-0 sm:border-none">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider sm:hidden">Item Value</span>
                                            <span className="text-sm font-extrabold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Bottom operational status tracker stripe banner details */}
                        <div className="bg-slate-50/40 px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Payment Terms: <span className="text-gray-700 font-bold uppercase">COD</span></span>
                            <span className="flex items-center gap-1">Payment Status: <span className="text-gray-700 font-bold">{order.paymentStatus || 'PENDING'}</span></span>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
