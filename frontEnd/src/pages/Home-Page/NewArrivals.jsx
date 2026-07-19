
import React, { useEffect, useState } from 'react'
import Title from '@/component/Title'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(
        "http://localhost:5000/api/v1/get-All-product",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      let allProduct = [];
      if (response.data && Array.isArray(response.data.products)) {
        allProduct = response.data.products;
      } else if (Array.isArray(response.data)) {
        allProduct = response.data;
      }
      
      const filteredNewArrivals = allProduct.filter(product => product.newArrival === true)
      setNewArrivals(filteredNewArrivals)
      
    } catch (error) {
      console.error("Catalog API Fetch Failure:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [])

  const getSingleImageUrl = (imgStr) => {
    if (!imgStr) return 'https://placehold.co/600x400?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr;
    return `http://localhost:5000/${imgStr.replace(/\\/g, '/')}`;
  };

  return (
    <div className="w-full bg-slate-50   md:px-8  space-y-8 font-sans">
      
      {/* Premium Typography Heading Block with Infinite Smooth Scale Loop */}
      <div className="flex flex-col items-start justify-center w-full border-b border-slate-200 pb-4 animate-[pulse_3s_ease-in-out_infinite]">
        <Title 
          text1="NEW" 
          text2="ARRIVALS" 
          className="justify-start text-left gap-2 tracking-tight text-2xl md:text-3xl" 
          text1className="text-slate-900 font-extrabold" 
          text2className="font-light text-rose-600 uppercase tracking-widest"
        />
        <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
          Explore our latest curated additions
        </p>
      </div>

      {/* Product Display Layout Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-slate-100/80 border border-slate-200 rounded-2xl h-72 animate-pulse w-full" />
          ))}
        </div>
      ) : newArrivals.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((item) => {
            const itemId = item._id || item.id;
            const isItemSoldOut = item.stock <= 0;
            return (
              <div 
                key={itemId}
                onClick={() => {
                  navigate(`/product-details/${itemId}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white border border-slate-100 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Image Showcase Box */}
                <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-3 relative overflow-hidden mb-4">
                  <img 
                    src={getSingleImageUrl(item.images?.[0])} 
                    alt={item.name} 
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

                {/* Info & Text Parameters */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      {item.brand || "Brand"}
                    </span>
                    <h3 className="text-xs md:text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-rose-600 transition-colors duration-200 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Pricing Details Line */}
                  <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <span className="text-sm md:text-base font-bold text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[9px] text-rose-600 bg-rose-50 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-rose-100">
                      New
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-sm text-slate-400 font-medium italic">
          No items are currently tagged as new arrivals.
        </div>
      )}
    </div>
  )
}

export default NewArrivals;