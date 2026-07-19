import React, { useEffect, useState } from "react";
import Title from "@/component/Title";
import axios from "axios";
import { formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/get-All-product"
      );

      // Handle API response structure
      const allProducts = Array.isArray(data) ? data : (data.products || []);
      
      // Filter products by the category prop (case-insensitive)
      const filteredProducts = allProducts.filter((product) => 
        product.category?.toLowerCase() === category?.toLowerCase()
      );
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Catalog API Fetch Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const getSingleImageUrl = (imgStr) => {
    if (!imgStr) return 'https://placehold.co/600x400?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr;
    return `http://localhost:5000/${imgStr.replace(/\\/g, '/')}`;
  };

  return (
    <div className="w-full bg-slate-50 px-4 md:px-8 py-12 font-sans">
      {/* Dynamic Header */}
      <div className="mb-8 border-b border-slate-200 pb-4">
        <Title 
          text1={category.toUpperCase()} 
          text2="COLLECTION" 
          className="justify-start text-left gap-2 tracking-tight text-2xl md:text-3xl" 
          text1className="text-slate-900 font-extrabold" 
          text2className="font-light text-rose-600 uppercase tracking-widest"
        />
        <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
          Showing {products.length} items in {category}
        </p>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-slate-100/80 border border-slate-200 rounded-2xl h-80 w-full animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((item) => {
            const itemId = item._id || item.id;
            const isItemSoldOut = item.stock <= 0;
            return (
              <div 
                key={itemId}
                onClick={() => navigate(`/product-details/${itemId}`)}
                className="bg-white border border-slate-100 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Image Box */}
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

                {/* Details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {item.brand || category}
                  </span>
                  <h3 className="text-xs md:text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-rose-600 transition-colors duration-200 leading-snug">
                    {item.name}
                  </h3>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm md:text-base font-bold text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-sm text-slate-400 font-medium italic bg-white border border-dashed border-slate-200 rounded-2xl">
          No products found in the {category} category.
        </div>
      )}
    </div>
  );
};

export default ProductList;