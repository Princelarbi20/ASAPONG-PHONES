import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Loader2, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { authAction } from '../../redux/store';

export const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read login state from Redux
  const isAuthenticated = useSelector((state) => state.auth.isLogin);

  // Core component states
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Shipping Address Form State
  const [addressData, setAddressData] = useState({
    address: '',
    city: '',
    state: '',
    country: 'Ghana',
    postalCode: ''
  });

  // URL parsing helper matrix to match dynamic asset locations seamlessly
  const getSingleImageUrl = (imgStr) => {
    if (!imgStr) return 'https://placehold.co/150?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr;
    return `http://localhost:5000/${imgStr.replace(/\\/g, '/')}`;
  };

  // FETCH ACTIVE USER CART REGISTRY PROFILE FOR PREVIEW SUMMARY
  const fetchCartSnapshot = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingCart(true);
      const response = await axios.get('http://localhost:5000/api/v1/cart', {
        withCredentials: true
      });

      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart);
      } else if (response.data && Array.isArray(response.data.items)) {
        setCartItems(response.data.items);
      } else if (Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Failed to compile user checkout items summary snapshot:", err);
      toast.error("Could not verify your checkout basket items.");
    } finally {
      setLoadingCart(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCartSnapshot();
  }, [fetchCartSnapshot]);

  // Pricing Engine Calculations Matrix
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  // Form Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  // HANDLER: PLACE THE FINAL ORDER
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Guard Clause: Block empty checkouts
    if (cartItems.length === 0) {
      toast.error("Your shopping cart is empty!");
      return;
    }

    const orderToastId = toast.loading("Processing transaction authorization logs...");
    try {
      setSubmittingOrder(true);

      // Hits your exact single unified order controller path endpoint mapping cleanly
      const response = await axios.post('http://localhost:5000/api/v1/create-order',
        { shippingAddress: addressData },
        { withCredentials: true }
      );

      if (response.data.success) {
        dispatch(authAction.setCart([]));
        setCartItems([]);
        toast.success("Order transaction authorization completed successfully!", { id: orderToastId });
        // Redirect directly to home/dashboard viewport layout cleanly
        navigate('/');
      }
    } catch (err) {
      console.error("Checkout submission failed:", err);
      toast.error(err.response?.data?.message || "Could not complete your purchase transaction.", { id: orderToastId });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Guard Clause: User is not logged in
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          You need to be logged in to your account to process order parameters checking out workflow sheets.
        </p>
        <Link to="/auth/login" className="inline-block mt-6 bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm">
          Sign In Now
        </Link>
      </div>
    );
  }

  // Loading indicator for basic data verification checks
  if (loadingCart) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-3">
        <Loader2 className="w-9 h-9 text-green-600 animate-spin" />
        <p className="text-xs text-gray-400 font-medium tracking-wide">Syncing checkout matrix validation configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart basket
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">Checkout Verification</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* SHIPPING FORM FIELDS LAYOUT (Left 7 columns) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-950">Shipping Details</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
              <input
                type="text"
                name="address"
                required
                value={addressData.address}
                onChange={handleInputChange}
                placeholder="House number, apartment suite, street line details..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:outline-none focus:ring-green-300 bg-gray-50/30 text-gray-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={addressData.city}
                  onChange={handleInputChange}
                  placeholder="Accra, Kumasi, etc."
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:outline-none focus:ring-green-300 bg-gray-50/30 text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State / Region</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={addressData.state}
                  onChange={handleInputChange}
                  placeholder="Greater Accra, Ashanti..."
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:outline-none focus:ring-green-300 bg-gray-50/30 text-gray-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={addressData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-gray-200 text-gray-500 font-bold cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Postal Code / GPS Code</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={addressData.postalCode}
                  onChange={handleInputChange}
                  placeholder="00233 or Digital Address"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:outline-none focus:ring-green-300 bg-gray-50/30 text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-gray-100 pt-6 pb-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-950">Payment Terms</h2>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-700 font-semibold">Cash On Delivery (COD)</span>
            <span className="text-xs bg-green-100 text-green-800 font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">Default Option</span>
          </div>

          <button
            type="submit"
            disabled={submittingOrder || cartItems.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-lg shadow-md transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
          >
            {submittingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authorizing purchase profile...
              </>
            ) : (
              "Confirm & Authorize Order"
            )}
          </button>
        </form>

        {/* ORDER SNAPSHOT BREAKDOWN SUMMARY (Right 5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-950 border-b border-gray-100 pb-3">Purchase Invoice Summary</h2>

            {/* Scrollable short item display list row elements */}
            <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100 pr-1 select-none">
              {cartItems.map((item) => {
                const product = item.productId || {};
                return (
                  <div key={product._id || item._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-12 h-12 bg-white rounded-md border border-gray-100 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      <img
                        // FIXED: Wrapped the source parameter inside the layout asset helper function cleanly
                        src={getSingleImageUrl(product.images?.[0] || product.image)}
                        alt={product.name || "Snapshot preview"}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{product.name || "Catalog Asset"}</h4>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 shrink-0">
                      {formatPrice((product.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-gray-900">
                  {shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-950">Total Billing amount</span>
              <span className="text-2xl font-black text-green-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
