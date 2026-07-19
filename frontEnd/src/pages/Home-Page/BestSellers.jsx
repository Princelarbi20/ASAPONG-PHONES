import React, { useEffect, useState, useRef } from "react";
import Title from "@/component/Title";
import axios from "axios";
import { formatPrice } from '@/lib/utils';

// Premium luxury-breathe keyframe for a smooth, continuous title effect
const animationStyle = `
  @keyframes luxury-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  .animate-luxury-breathe {
    animation: luxury-breathe 4s ease-in-out infinite;
  }
  /* Custom scroll hiding fallback */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const BestSellers = ({ from, end }) => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/get-All-product"
      );

      let allProducts = [];
      if (data && Array.isArray(data.products)) {
        allProducts = data.products;
      } else if (Array.isArray(data)) {
        allProducts = data;
      }

      // Filter to return ONLY phone products
      const phoneProducts = allProducts.filter((product) => {
        const category = product.category?.toLowerCase() || "";
        const subcategory = product.subcategory?.toLowerCase() || "";
        return category.includes("phone") || subcategory.includes("phone");
      });

      // Apply pagination/slice parameters to the filtered phone list
      setNewArrivals(phoneProducts.slice(from, end));
    } catch (error) {
      console.log("Catalog API Fetch Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [from, end]);

  // Automated Infinite Swapping Loop every 3 seconds (pauses when user hovers mouse over slider)
  useEffect(() => {
    if (loading || newArrivals.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      handleScroll("next");
    }, 3000);

    return () => clearInterval(interval);
  }, [loading, newArrivals, isHovered]);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Determine target dimensions dynamically based on card widths
    const cardWidth = container.firstChild?.offsetWidth || 240;
    const gap = 24; // Equivalent to gap-6
    const scrollAmount = cardWidth + gap;

    if (direction === "next") {
      // Loop back smoothly to the beginning if end of line reached
      if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      // Loop to the end if reverse clicked at index zero
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  const getSingleImageUrl = (imgStr) => {
    if (!imgStr) return 'https://placehold.co/600x400?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr;
    return `http://localhost:5000/${imgStr.replace(/\\/g, '/')}`;
  };

  return (
    <div className="w-full bg-slate-50 px-4 md:px-8 py-12 space-y-8 font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animationStyle }} />

      {/* Header Block */}
      <div className="flex flex-col items-start justify-center w-full border-b border-slate-200 pb-4 origin-left will-change-transform animate-luxury-breathe">
        <Title 
          text1="TRENDING" 
          text2="PHONES" 
          className="justify-start text-left gap-2 tracking-tight text-2xl md:text-3xl" 
          text1className="text-slate-900 font-extrabold" 
          text2className="font-light text-rose-600 uppercase tracking-widest"
        />
        <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
          Our current top-performing customer favorites
        </p>
      </div>

      {/* Main Display Wrap: Flanked by Direction Icons */}
      <div className="flex items-center gap-2 md:gap-4 w-full relative">
        
        {/* Reverse (Previous) Button */}
        {!loading && newArrivals.length > 0 && (
          <button
            onClick={() => handleScroll("prev")}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-md active:scale-95 transition-all duration-200 cursor-pointer z-10 flex-shrink-0"
            aria-label="Previous items"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Product Carousel Grid Frame */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex overflow-x-auto no-scrollbar w-full gap-6 pb-4">
              {[...Array(3)].map((_, index) => (
                <div 
                  key={index} 
                  className="bg-slate-100/80 border border-slate-200 rounded-2xl h-80 w-48 sm:w-60 lg:w-[calc(33.333%-16px)] flex-shrink-0 animate-pulse" 
                />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div 
              ref={scrollContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex overflow-x-auto no-scrollbar w-full gap-6 pb-4 snap-x snap-mandatory scroll-smooth"
            >
              {newArrivals.map((product) => {
                const itemId = product._id || product.id;
                const isItemSoldOut = product.stock <= 0;

                return (
                  <div
                    key={itemId}
                    className="w-48 sm:w-60 lg:w-[calc(33.333%-16px)] bg-white border border-slate-100 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex-shrink-0 snap-start relative overflow-hidden"
                  >
                    {/* Image Box */}
                    <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-3 relative overflow-hidden mb-3">
                      <img
                        src={getSingleImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition duration-500"
                      />
                      {isItemSoldOut && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text Context */}
                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                          {product.brand || "Phone"}
                        </span>
                        <h3 className="text-xs md:text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-rose-600 transition-colors duration-200 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      {/* Pricing Details */}
                      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                        <span className="text-sm md:text-base font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-100">
                          Hot
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-sm text-slate-400 font-medium italic w-full border border-dashed border-slate-200 rounded-2xl bg-white">
              No trending phones found at this time.
            </div>
          )}
        </div>

        {/* Next Button */}
        {!loading && newArrivals.length > 0 && (
          <button
            onClick={() => handleScroll("next")}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-md active:scale-95 transition-all duration-200 cursor-pointer z-10 flex-shrink-0"
            aria-label="Next items"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
};

export default BestSellers;