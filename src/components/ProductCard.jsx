import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Star, Trash2, Edit3, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProductCard = ({ product, onEdit }) => {
  const { addToCart, isAdminLoggedIn, deleteProduct } = useShop();
  const navigate = useNavigate();

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col">
      
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
          {product.category}
        </span>

        {/* Featured Tag */}
        {/* {product.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            LUXE
          </span>
        )} */}

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] bg-slate-950/40">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="p-3 rounded-full bg-slate-900/90 text-slate-200 hover:text-amber-400 hover:bg-slate-900 border border-slate-700/80 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => addToCart(product)}
            className="p-3 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
            title="Add to Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Badges & Actions */}
        {isAdminLoggedIn && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10 bg-slate-950/90 p-1.5 rounded-xl border border-amber-500/40 backdrop-blur-md">
            <span className="text-[10px] text-amber-300 font-mono pl-2">Admin Control</span>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-amber-400 hover:bg-slate-700"
                  title="Edit Product"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => deleteProduct(product.id)}
                className="p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col grow justify-between bg-slate-900/40">
        <div>
          {/* Rating */}
          {/* <div className="flex items-center gap-1.5 mb-2 text-xs text-amber-400">
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-semibold text-slate-200">{product.rating || 5.0}</span>
            <span className="text-slate-500 text-[11px]">({product.reviewsCount || 12})</span>
          </div> */}

          {/* Title */}
          <h3 
            onClick={() => navigate(`/product/${product.id}`)}
            className="font-sans font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-amber-400 cursor-pointer transition-colors"
          >
            {product.title}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-amber-400 font-serif-brand">
              {product.price?.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-slate-500 line-through -mt-1">
                {product.originalPrice?.toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 text-xs font-semibold border border-slate-700 hover:border-amber-400 transition-all duration-200 group/btn shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span>Add to Cartt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
