import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LuShoppingBag,
  LuEye,
  LuTrash2,
  LuPencil,
} from "react-icons/lu";
import { useShop } from "../context/ShopContext";

export const ProductCard = ({ product, onEdit }) => {
  const { addToCart, isAdminLoggedIn, deleteProduct, getProductStock } =
    useShop();
  const navigate = useNavigate();

  const stock = getProductStock
    ? getProductStock(product)
    : (product.stock ?? 99);
  const isOutOfStock = stock <= 0;

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800/80 rounded-xl sm:rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950 cursor-pointer"
         title="Quick View"
         onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Category Tag */}
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold tracking-wider uppercase bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30">
          {product.category}
        </span>

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-red-600/90 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider border border-red-500/50 shadow-lg backdrop-blur-sm">
            Out of Stock
          </span>
        )}

        {/* Hover Quick Actions (Desktop / Hover) */}
        {!isOutOfStock && (
          <div className="hidden sm:flex absolute inset-0 items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] bg-slate-950/40">
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className="p-3 rounded-full bg-slate-900/90 text-slate-200 hover:text-amber-400 hover:bg-slate-900 border border-slate-700/80 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
              title="Quick View"
              aria-label="Quick View"
            >
              <LuEye className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="p-3 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 cursor-pointer"
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <LuShoppingBag className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Admin Badges & Actions */}
        {isAdminLoggedIn && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 z-10 bg-slate-950/95 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-amber-500/40 backdrop-blur-md">
            <span className="text-[9px] sm:text-[10px] text-amber-300 font-serif-brand pl-1 truncate">
              Admin
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-amber-400 hover:bg-slate-700 cursor-pointer"
                  title="Edit Product"
                >
                  <LuPencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
              <button
                onClick={() => deleteProduct(product.id)}
                className="p-1 sm:p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                title="Delete Product"
              >
                <LuTrash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5 flex flex-col grow justify-between bg-slate-900/40">
        <div>
          {/* Title */}
          <h3
            onClick={() => navigate(`/product/${product.id}`)}
            className="font-serif-brand font-semibold text-slate-100 text-xs sm:text-base line-clamp-1 group-hover:text-amber-400 cursor-pointer transition-colors"
          >
            {product.title}
          </h3>

          {/* Description preview */}
          <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 mt-0.5 sm:mt-1 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-800/80 flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <div className="text-sm sm:text-base md:text-lg font-bold text-amber-400 font-serif-brand truncate">
              {product.price?.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-slate-500 line-through -mt-0.5 sm:-mt-1 truncate">
                {product.originalPrice?.toFixed(2)}
              </div>
            )}
          </div>

          {isOutOfStock ? (
            <span className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-900 text-red-400 text-[10px] sm:text-xs font-semibold border border-red-900/60 cursor-not-allowed select-none shrink-0 w-full min-[380px]:w-auto">
              <LuShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="truncate">غير متوفر — Out of Stock</span>
            </span>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 text-[10px] sm:text-xs font-semibold border border-slate-700 hover:border-amber-400 transition-all duration-200 group/btn shadow-md cursor-pointer shrink-0 w-full min-[380px]:w-auto"
            >
              <LuShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:scale-110 transition-transform" />
              <span className="truncate">Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
