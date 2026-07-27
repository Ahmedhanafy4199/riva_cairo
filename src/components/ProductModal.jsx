import React, { useState } from 'react';
import { X, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProductModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProduct) return null;

  // Build the images array — support multi-image products and legacy single-image products
  const images = (selectedProduct.images && selectedProduct.images.length > 0)
    ? selectedProduct.images
    : (selectedProduct.image ? [selectedProduct.image] : []);

  const activeImage = images[activeImageIndex] || images[0];

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    setQuantity(1);
    setActiveImageIndex(0);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setActiveImageIndex(0);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-slate-950/80 max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ── Gallery Column ── */}
          <div className="relative bg-slate-950 flex flex-col" style={{ minHeight: '360px' }}>

            {/* Main Image */}
            <div className="relative flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
              <img
                key={activeImage}
                src={activeImage}
                alt={selectedProduct.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ minHeight: '300px' }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              {/* Category tag */}
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-slate-950/80 text-amber-400 border border-amber-500/30 z-10">
                {selectedProduct.category}
              </span>

              {/* Image counter */}
              {images.length > 1 && (
                <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-950/80 text-slate-300 border border-slate-700 z-10">
                  {activeImageIndex + 1} / {images.length}
                </span>
              )}

              {/* Prev / Next Arrows — only shown when multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip — only when more than 1 image */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/80 border-t border-slate-800/70 overflow-x-auto scrollbar-none">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      idx === activeImageIndex
                        ? 'border-amber-500 ring-2 ring-amber-500/25 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details Column ── */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                {/* <div className="flex items-center gap-1.5 text-sm text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-semibold text-slate-100">{selectedProduct.rating || 5.0}</span>
                  <span className="text-slate-500">({selectedProduct.reviewsCount || 18} reviews)</span>
                </div> */}
                <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  In Stock ({selectedProduct.stock || 12})
                </span>
              </div>

              <h2 className="font-serif-brand text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                {selectedProduct.title}
              </h2>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-bold text-amber-400 font-serif-brand">
                  {selectedProduct.price?.toFixed(2)}
                </span>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="text-base text-slate-500 line-through">
                    {selectedProduct.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 font-light leading-relaxed mb-6 border-t border-b border-slate-800 py-4">
                {selectedProduct.description}
              </p>

              {/* Quantity Selector */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-700 bg-slate-950 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-slate-100 font-bold font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Total: <span className="text-amber-400 font-semibold">{(selectedProduct.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action & Value Props */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Shopping Cart</span>
              </button>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Express Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authentic Leather (جلد أصلي)</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>15-Day Returns</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
