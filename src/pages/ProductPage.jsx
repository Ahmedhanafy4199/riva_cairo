import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const ProductPage = ({ onEditProduct }) => {
  const { products, addToCart } = useShop();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif-brand text-2xl font-bold text-slate-300">
          Product not found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
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
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
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
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Collection</span>
      </button>

      {/* Product Details */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery */}
          <div className="relative bg-slate-950 flex flex-col" style={{ minHeight: '360px' }}>
            <div className="relative flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
              <img
                key={activeImage}
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ minHeight: '300px' }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-slate-950/80 text-amber-400 border border-amber-500/30 z-10">
                {product.category}
              </span>

              {images.length > 1 && (
                <>
                  <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-950/80 text-slate-300 border border-slate-700 z-10">
                    {activeImageIndex + 1} / {images.length}
                  </span>
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
                    <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  In Stock ({product.stock || 12})
                </span>
              </div>

              <h1 className="font-serif-brand text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-bold text-amber-400 font-serif-brand">
                  ${product.price?.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-slate-500 line-through">
                    ${product.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 font-light leading-relaxed mb-6 border-t border-b border-slate-800 py-4">
                {product.description}
              </p>

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
                    <span className="w-12 text-center text-slate-100 font-bold font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Total:{' '}
                    <span className="text-amber-400 font-semibold">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

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
                  <span className="text-xs font-medium text-white">Express Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-white">Authentic Leather (جلد أصلي)</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-white">15-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-slate-900">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                You May Also Like
              </span>
              <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                Related {product.category}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} onEdit={onEditProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
