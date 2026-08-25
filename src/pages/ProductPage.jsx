import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LuArrowLeft,
  LuShoppingBag,
  LuShieldCheck,
  LuTruck,
  LuRotateCcw,
  LuPlus,
  LuMinus,
  LuChevronLeft,
  LuChevronRight,
  LuSparkles,
} from 'react-icons/lu';
import { useShop, matchCategory } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const ProductPage = ({ onEditProduct }) => {
  const { products, addToCart, getProductStock, showToast } = useShop();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4 px-4">
        <h2 className="font-serif-brand text-2xl font-bold text-slate-300">
          Product not found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const activeImage = images[activeImageIndex] || images[0];

  const relatedProducts = products
    .filter((p) => p.id !== product.id && matchCategory(p.category, product.category))
    .slice(0, 4);

  const stock = getProductStock ? getProductStock(product) : (product.stock ?? 99);
  const isOutOfStock = stock <= 0;

  const handleIncrement = () => {
    if (quantity >= stock) {
      if (typeof showToast === 'function') {
        showToast(`عفواً، المتاح في المخزون هو ${stock} قطع فقط!`, 'error');
      }
      return;
    }
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fadeIn pb-12 sm:pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-amber-400 transition-colors group cursor-pointer"
      >
        <LuArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Collection</span>
      </button>

      {/* Product Details Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Gallery Section */}
          <div className="relative bg-slate-950 flex flex-col min-h-70 sm:min-h-95 md:min-h-110">
            <div className="relative flex-1 overflow-hidden min-h-65 sm:min-h-85 max-h-125">
              <img
                key={activeImage}
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-opacity duration-300 min-h-65 sm:min-h-85"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase bg-slate-950/80 text-amber-400 border border-amber-500/30 z-10 backdrop-blur-sm">
                {product.category}
              </span>

              {images.length > 1 && (
                <>
                  <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-mono bg-slate-950/80 text-slate-300 border border-slate-700 z-10">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-lg cursor-pointer"
                    aria-label="Previous image"
                  >
                    <LuChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-lg cursor-pointer"
                    aria-label="Next image"
                  >
                    <LuChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-950/80 border-t border-slate-800/70 overflow-x-auto scrollbar-none">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-amber-500 ring-2 ring-amber-500/25 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                {isOutOfStock ? (
                  <span className="text-[11px] sm:text-xs text-red-400 bg-red-950/80 border border-red-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    غير متوفر — Out of Stock
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    In Stock 
                  </span>
                )}
              </div>

              <h1 className="font-serif-brand text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 mb-4 sm:mb-5">
                <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-serif-brand">
                  {product.price?.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm sm:text-base text-slate-500 line-through">
                    {product.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed mb-5 border-t border-b border-slate-800 py-3.5 sm:py-4">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center border border-slate-700 bg-slate-950 rounded-xl p-0.5 sm:p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <LuMinus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-10 sm:w-12 text-center text-slate-100 font-bold font-mono text-sm sm:text-base">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      disabled={isOutOfStock || quantity >= stock}
                      title={isOutOfStock ? 'Out of Stock' : quantity >= stock ? 'Stock limit reached' : 'Increase quantity'}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <LuPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Total:{' '}
                    <span className="text-amber-400 font-semibold font-mono">
                      {(product.price * quantity).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons & Value Props */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base shadow-xl transition-all duration-300 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500'
                }`}
              >
                <LuShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{isOutOfStock ? 'غير متوفر' : 'Add to Shopping Cart'}</span>
              </button>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-slate-400">
                <div className="flex flex-row min-[420px]:flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <LuTruck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-white">Express Shipping</span>
                </div>
                <div className="flex flex-row min-[420px]:flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <LuShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-white">Authentic Leather</span>
                </div>
                <div className="flex flex-row min-[420px]:flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <LuRotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-white">15-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-5 sm:space-y-6 pt-4 border-t border-slate-900">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                <LuSparkles className="w-3.5 h-3.5 shrink-0" />
                You May Also Like
              </span>
              <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                Related {product.category}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} onEdit={onEditProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
