import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle, ArrowUpDown, Eye, ShoppingCart, Heart, SlidersHorizontal, Tag, X } from 'lucide-react';
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
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isSoldOut ? 'opacity-40' : 'group-hover/image:scale-105'}`}
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
  const { globalSearchQuery } = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [sortOrder, setSortOrder] = useState('newest'); 

  // Mobile Drawer Toggle State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sidebar Filtering UI States
  const [minPriceInput, setMinPriceInput] = useState('0');
  const [maxPriceInput, setMaxPriceInput] = useState('200000');
  const [activeMinPrice, setActiveMinPrice] = useState(0);
  const [activeMaxPrice, setActiveMaxPrice] = useState(200000);
  const [isDiscountedOnly, setIsDiscountedOnly] = useState(false);
  const [activeShowroom, setActiveShowroom] = useState('Explore our Products');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/v1/get-All-product', {
        headers: { Authorization: `Bearer ${token}` }
      });

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
  }, [categoryName]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApplyPriceFilter = () => {
    setActiveMinPrice(Number(minPriceInput) || 0);
    setActiveMaxPrice(Number(maxPriceInput) || 200000);
    setIsMobileFilterOpen(false); // Auto close mobile view overlay after action triggers
  };

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
      const prodCategory = product.category || '';
      if (prodCategory.toLowerCase() !== categoryName?.toLowerCase()) return false;

      if (globalSearchQuery && globalSearchQuery.trim() !== '') {
        const query = globalSearchQuery.toLowerCase();
        const prodName = product.name || '';
        const prodBrand = product.brand || '';
        if (!prodName.toLowerCase().includes(query) && !prodBrand.toLowerCase().includes(query)) return false;
      }

      const currentPrice = product.price || 0;
      if (currentPrice < activeMinPrice || currentPrice > activeMaxPrice) return false;

      if (isDiscountedOnly && !product.oldPrice) return false;

      if (activeShowroom !== 'Explore our Products') {
        if (activeShowroom === 'Deals of the week' && !product.isDealOfTheWeek) return false;
        if (activeShowroom === 'Speed Shopping' && !product.isSpeedShopping) return false;
        if (activeShowroom === 'Best selling' && !product.isBestSelling) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const brandA = a.brand || '';
      const brandB = b.brand || '';
      
      if (sortOrder === 'asc') return brandA.localeCompare(brandB);
      if (sortOrder === 'desc') return brandB.localeCompare(brandA);
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      
      return 0; 
    });

  // Reusable inner markup component structure for the dynamic filter controls sheet
  const RenderFilterContent = () => (
    <>
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-800" />
          <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">Filters</h2>
        </div>
        {/* Mobile close toggle cross display */}
        <button 
          onClick={() => setIsMobileFilterOpen(false)} 
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Price Range</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Min</label>
            <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50/50">
              <span className="text-xs text-gray-400 font-medium mr-1">₵</span>
              <input
                type="number"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent focus:outline-none text-gray-700"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Max</label>
            <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50/50">
              <span className="text-xs text-gray-400 font-medium mr-1">₵</span>
              <input
                type="number"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent focus:outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyPriceFilter}
          className="w-full py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200"
        >
          Apply Price Filter
        </button>

        <div className="flex justify-between items-center bg-rose-50/50 border border-rose-100/70 rounded-lg p-2.5 text-[11px]">
          <span className="text-rose-800 font-medium">Active:</span>
          <span className="font-bold text-rose-900">₵{activeMinPrice} – ₵{activeMaxPrice}</span>
        </div>
      </div>

      {/* Toggle Discount Switch */}
      <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 rounded-lg text-rose-800">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-gray-700">Discounted Only</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDiscountedOnly}
            onChange={(e) => {
              setIsDiscountedOnly(e.target.checked);
              if(window.innerWidth < 1024) setIsMobileFilterOpen(false);
            }}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-800"></div>
        </label>
      </div>

      {/* Showrooms */}
      <div className="space-y-3 shrink-0 pb-6">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Showrooms</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Deals of the week', 'Speed Shopping', 'Explore our Products', 'Best selling'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveShowroom(tag);
                if(window.innerWidth < 1024) setIsMobileFilterOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                activeShowroom === tag
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 font-sans antialiased text-gray-900 bg-white h-[calc(100vh-80px)] flex flex-col overflow-hidden relative">
      
      {/* 🚀 1. MOBILE DEVICE TOP CONTROLS STRIP (Sticky bar visible on small devices only) */}
      <div className="lg:hidden shrink-0 sticky top-0 z-40 flex items-center gap-3 bg-white pb-4 border-b border-gray-100">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-sm font-semibold tracking-wide shadow-xs transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>
        </button>
        
        <div className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 px-3 py-2.5 rounded-lg shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-xs font-bold text-gray-700 focus:outline-none bg-transparent cursor-pointer pl-0.5 w-full text-center"
          >
            <option value="newest">Sort By: Newest</option>
            <option value="asc">Brand (A-Z)</option>
            <option value="desc">Brand (Z-A)</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 🚀 2. MOBILE FILTER DRAWER MODULE (Slides cleanly from the left edge) */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-visibility duration-300 ${
          isMobileFilterOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Dark Background Overlay Sheet Mask */}
        <div 
          onClick={() => setIsMobileFilterOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isMobileFilterOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Slide-out Menu Panel Drawer Sheet Container */}
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-white p-5 flex flex-col space-y-5 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
            isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <RenderFilterContent />
        </div>
      </div>

      {/* Main Framework Grid Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0 mt-3 lg:mt-0">
        
        {/* ======================= DESKTOP PERMANENT INLINE SIDEBAR ======================= */}
        <div className="hidden lg:flex lg:col-span-1 h-full overflow-y-auto flex-col space-y-5 border border-gray-100 rounded-xl p-5 bg-white shadow-xs" style={{ scrollbarWidth: 'thin' }}>
          <RenderFilterContent />
        </div>

        {/* ======================= MAIN GRID GALLERY DISPLAY AREA ======================= */}
        <div className="lg:col-span-3 h-full flex flex-col min-h-0 space-y-4">
          
          {/* Top Counter Header controls panel - Hidden on Mobile viewports because metrics live in the top bar */}
          <div className="hidden lg:flex shrink-0 justify-between items-center bg-gray-50/40 border border-gray-100 rounded-xl p-3 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-800">1–{filteredCategoryProducts.length}</span> of {products.length}
              </span>
              <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                Filtered
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs font-bold text-gray-700 focus:outline-none bg-transparent cursor-pointer pl-0.5"
              >
                <option value="newest">Newest First</option>
                <option value="asc">Brand (A-Z)</option>
                <option value="desc">Brand (Z-A)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Dynamic Catch Error Messages Banner */}
          {errorMsg && (
            <div className="shrink-0 flex items-center gap-2 rounded-xl bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Product Gallery Flow Container Grid */}
          <div className="flex-1 overflow-y-auto pr-1 pb-16" style={{ scrollbarWidth: 'thin' }}>
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 text-rose-800 animate-spin" />
              </div>
            ) : filteredCategoryProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center text-gray-400 text-xs font-medium">
                No items found matching the current global layout filtration matrix values parameters inside this segment.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {filteredCategoryProducts.map((product) => {
                  const id = product._id || product.id;
                  const isSoldOut = product.stock <= 0;

                  return (
                    <Link
                      key={id}
                      className="text-gray-700 cursor-pointer flex flex-col group border border-gray-200/70 rounded-xl p-3.5 bg-white hover:shadow-md hover:border-gray-300/80 transition-all duration-300 relative"
                      to={`/product-details/${id}`}
                    >
                      {/* Media Image Shield Viewport */}
                      <div className="overflow-hidden bg-white rounded-lg aspect-square relative flex items-center justify-center group/image">
                        <ProductImageSlider
                          images={product.images}
                          isSoldOut={isSoldOut}
                          altText={product.name}
                          productId={id}
                        />

                        {/* Floating Action Menu Overlay */}
                        {!isSoldOut && (
                          <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20 rounded-lg">
                            <div className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-rose-800 hover:scale-110 transition duration-200">
                              <Eye className="w-4 h-4" />
                            </div>
                            <button
                              onClick={(e) => handleAddToCart(e, id)}
                              className="p-2 bg-rose-800 rounded-full shadow-md text-white hover:bg-rose-900 hover:scale-110 transition duration-200 cursor-pointer"
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

                        {/* Out of Stock Indicator */}
                        {isSoldOut && (
                          <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase z-10">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Details Meta Layout Container */}
                      <div className="flex flex-col text-left mt-4 space-y-1">
                        <h3 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-rose-800 transition-colors duration-150 min-h-[2.25rem]">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-xs sm:text-sm font-extrabold text-red-600">
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-[11px] text-gray-400 line-through font-medium">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
