import React from "react";
import { Link } from "react-router-dom";
import { LuShoppingBag, LuEye, LuTrash2, LuPencil } from "react-icons/lu";
import { useShop } from "../context/ShopContext";

export const ProductCard = React.memo(({ product, onEdit }) => {
  const { addToCart, isAdminLoggedIn, deleteProduct, getProductStock } =
    useShop();

  const stock = getProductStock
    ? getProductStock(product)
    : (product.qtyStock ?? product.qty_stock ?? product.stock ?? 0);
  const isOutOfStock = stock <= 0;

  return (
    <div className="group flex flex-col h-full">
      {/* Image Card */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300"
      >
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full cursor-pointer"
          title={product.title}
        >
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" /> */}

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <span
            className={`absolute z-20 px-1.5 py-0.5 sm:px-3 rounded-full bg-[#3b59c8] text-amber-50 text-[9px] sm:text-sm font-medium pointer-events-none ${
              isAdminLoggedIn
                ? "bottom-10 left-2 sm:bottom-16 sm:left-2"
                : "bottom-2 left-2 sm:bottom-4 sm:left-2"
            }`}
          >
            Sale
          </span>
        )}

        {/* Sold Out Badge */}
        {isOutOfStock && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-red-600/90 text-[8px] sm:text-[10px] font-semibold tracking-wider border border-red-500/50 shadow-lg backdrop-blur-sm pointer-events-none">
            Sold Out
          </span>
        )}

        {/* Hover Quick Actions */}
        {!isOutOfStock && (
          <div className="hidden sm:flex absolute inset-0 items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] bg-slate-950/40 pointer-events-none">
            <Link
              to={`/product/${product.id}`}
              className="p-3 rounded-full bg-slate-900/90 text-slate-200 hover:text-amber-400 hover:bg-slate-900 border border-slate-700/80 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer pointer-events-auto"
              title="Quick View"
              aria-label="Quick View"
            >
              <LuEye className="w-5 h-5" />
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              className="p-3 rounded-full bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 shadow-lg shadow-amber-500/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 cursor-pointer pointer-events-auto"
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <LuShoppingBag className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Admin Actions */}
        {isAdminLoggedIn && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 z-10 bg-slate-950/95 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-amber-500/40 backdrop-blur-md pointer-events-auto">
            <span className="text-[9px] sm:text-[10px] text-amber-300 font-serif-brand pl-1 truncate">
              Admin
            </span>

            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(product);
                  }}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-amber-400 hover:bg-slate-700 cursor-pointer"
                  title="Edit Product"
                >
                  <LuPencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteProduct(product.id);
                }}
                className="p-1 sm:p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                title="Delete Product"
              >
                <LuTrash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content - Outside Image Card */}
      <div className="pt-3 px-1 flex flex-col grow">
        {/* Title */}
        <h3 className="font-serif-brand font-normal text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          <Link
            to={`/product/${product.id}`}
            className="hover:underline cursor-pointer block truncate"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price */}
        <div className="mt-2 flex flex-col items-start gap-1">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through font-mono">
              {product.originalPrice?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              EGP
            </span>
          )}

          <span className="text-sm sm:text-base  font-normal text-slate-900 dark:text-slate-100 font-serif-brand">
            {product.price?.toLocaleString("en-US")} EGP
          </span>
        </div>
      </div>
    </div>
  );
});
