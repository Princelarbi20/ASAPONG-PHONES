import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle, ArrowUpDown, Eye, ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Isolated Performance Image Slider Component with rigid single viewport bounds
function ProductImageSlider({ images, isSoldOut, altText, productId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = images ? images.length : 0;
  const hasMultipleImages = totalImages > 1;

  const getSingleImageUrl = (imgStr) => {
    if (!imgStr) return 'https://placehold.co/600x400?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr;
    return `http://localhost:5000/${imgStr.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    if (!hasMultipleImages || isSoldOut) return;

    const stringHash = productId ? productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const baseInterval = 5000;
    const staggeredDelayOffset = (stringHash % 8) * 500;
    const totalCalculatedTiming = baseInterval + staggeredDelayOffset;

    const slideTimer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }, totalCalculatedTiming);

    return () => clearInterval(slideTimer);
  }, [hasMultipleImages, totalImages, isSoldOut, productId]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
      <div
        className="flex h-full flex-row transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${totalImages > 0 ? totalImages * 100 : 100}%`
        }}
      >
        {totalImages > 0 ? (
          images.map((img, idx) => (
            <div
              key={idx}
              className="h-full w-full min-w-full shrink-0 flex items-center justify-center p-2"
              style={{ width: '100%', minWidth: '100%' }}
            >
              <img
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isSoldOut ? 'opacity-40' : 'group-hover/image:scale-105'
                  }`}
                src={getSingleImageUrl(img)}
                alt={`${altText} view ${idx + 1}`}
              />
            </div>
          ))
        ) : (
          <div className="w-full h-full min-w-full shrink-0 flex items-center justify-center p-2" style={{ width: '100%', minWidth: '100%' }}>
            <img
              className={`max-w-full max-h-full object-contain ${isSoldOut ? 'opacity-40' : ''}`}
              src={getSingleImageUrl(null)}
              alt={altText}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryGrid({ categoryName }) {
  // FIXED: Dynamic retrieval of global parameters trace straight from the layout context thread
  const { globalSearchQuery } = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [brandSortOrder, setBrandSortOrder] = useState('none');


  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/v1/get-All-product', {
        headers: { Authorization: `Bearer ${token}` }});

      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(`Error fetching catalog segment for ${categoryName}:`, err);
      setErrorMsg(err.response?.data?.message || 'Unable to access catalog collections at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryName]);

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Add item ${productId} to shopping cart`);
  };

  const handleAddToWishlist = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Add item ${productId} to user wishlist`);
  };

  const filteredCategoryProducts = products
    .filter(product => {
      // FIXED: Optional chaining and fallback defaults prevent toLowerCase runtime exceptions on unmapped rows
      const prodCategory = product.category || '';
      if (prodCategory.toLowerCase() !== categoryName?.toLowerCase()) return false;

      // FIXED: Hooks into global input instead of the missing local text box element field
      if (globalSearchQuery && globalSearchQuery.trim() !== '') {
        const query = globalSearchQuery.toLowerCase();
        const prodName = product.name || '';
        const prodBrand = product.brand || '';
        return prodName.toLowerCase().includes(query) || prodBrand.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      const brandA = a.brand || '';
      const brandB = b.brand || '';
      if (brandSortOrder === 'asc') return brandA.localeCompare(brandB);
      if (brandSortOrder === 'desc') return brandB.localeCompare(brandA);
      return 0;
    });

  return (
    <div className="space-y-6 p-6">

      {/* HEADER CONTROLS STRIP — Search Bar removed completely */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">{categoryName} Collection</h2>
          <p className="text-xs text-gray-400 mt-0.5">Explore premium catalog options within our {categoryName.toLowerCase()} segment</p>
        </div>

        {/* Brand Alphabetical Sort Selector pushed right */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-xs self-end md:self-auto shrink-0 md:ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Sort Brand:</span>
          <select
            value={brandSortOrder}
            onChange={(e) => setBrandSortOrder(e.target.value)}
            className="text-xs font-semibold text-gray-700 focus:outline-none bg-transparent cursor-pointer pl-1"
          >
            <option value="none">Featured Listing</option>
            <option value="asc">Brand (A-Z)</option>
            <option value="desc">Brand (Z-A)</option>
          </select>
        </div>
      </div>

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
      ) : filteredCategoryProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400 text-xs font-medium">
          No items found matching the current global search query matrix layout parameters inside this segment.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {filteredCategoryProducts.map((product) => {
            const id = product._id || product.id;
            const isSoldOut = product.stock <= 0;

            return (
              <Link
                key={id}
                className="text-gray-700 cursor-pointer flex flex-col group border border-gray-100 rounded-xl p-3 bg-white hover:shadow-md transition-shadow duration-300 relative"
                to={`/product-details/${id}`}
              >
                <div className="overflow-hidden bg-white rounded-lg aspect-square relative flex items-center justify-center group/image">
                  <ProductImageSlider
                    images={product.images}
                    isSoldOut={isSoldOut}
                    altText={product.name}
                    productId={id}
                  />

                  {!isSoldOut && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 z-20 rounded-lg">
                      <div className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-indigo-600 hover:scale-110 transition duration-200">
                        <Eye className="w-4 h-4" />
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, id)}
                        className="p-2 bg-indigo-600 rounded-full shadow-md text-white hover:bg-indigo-700 hover:scale-110 transition duration-200 cursor-pointer"
                        aria-label="Add product to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleAddToWishlist(e, id)}
                        className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-rose-500 hover:scale-110 transition duration-200 cursor-pointer"
                        aria-label="Add product to wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isSoldOut && (
                    <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase z-10">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="flex flex-col text-center mt-3">
                  <p className="pb-1 text-sm text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors font-medium min-h-10 leading-snug">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
