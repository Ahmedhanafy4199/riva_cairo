import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LuShoppingBag,
  LuChevronDown,
  LuChevronUp,
  LuChevronLeft,
  LuChevronRight,
  LuMinus,
  LuPlus,
} from "react-icons/lu";
import { useShop, matchCategory } from "../context/ShopContext";
import { ProductCard } from "../components/ProductCard";

export const ProductPage = ({ onEditProduct }) => {
  const { products, addToCart, getProductStock, showToast, addRecentlyViewed } =
    useShop();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accordion open/close state
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const product = products.find((p) => p.id === productId);

  // Add product to recently viewed list on mount / change
  useEffect(() => {
    if (product && typeof addRecentlyViewed === "function") {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4 px-4">
        <h2 className="font-serif-brand text-2xl font-bold text-slate-700 dark:text-slate-300">
          Product not found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer"
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
    .filter(
      (p) => p.id !== product.id && matchCategory(p.category, product.category)
    )
    .slice(0, 4);

  const stock = getProductStock
    ? getProductStock(product)
    : product.stock ?? 99;
  const isOutOfStock = stock <= 0;

  const handleIncrement = () => {
    if (quantity >= stock) {
      if (typeof showToast === "function") {
        showToast(`عفواً، المتاح في المخزون هو ${stock} قطع فقط!`, "error");
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

  const handleBuyItNow = () => {
    if (isOutOfStock) return;
    const success = addToCart(product, quantity);
    if (success !== false) {
      navigate("/checkout");
    }
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn py-4 sm:py-8 px-2 sm:px-4">
      {/* Product Grid Layout (Image 1 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery (7 Columns on Large Screens) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full aspect-4/5 sm:aspect-1/1 lg:aspect-4/5 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              key={activeImage}
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-opacity duration-300"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 shadow-md hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <LuChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 shadow-md hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Selector */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`shrink-0 w-16 h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === activeImageIndex
                      ? "border-slate-900 dark:border-white ring-1 ring-slate-900/20"
                      : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
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

        {/* Right Column: Details & Actions (5 Columns on Large Screens - Matching Image 1) */}
        <div className="lg:col-span-5 flex flex-col justify-between pt-2">
          <div>
            {/* Title */}
            <h1 className="font-serif-brand font-normal text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 leading-snug tracking-tight mb-3">
              {product.title}
            </h1>

            {/* Price */}
            <div className="text-lg sm:text-xl font-normal font-serif-brand text-slate-900 dark:text-slate-100 tracking-wide">
              LE {product.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>

            {/* Shipping subtext */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1.5 mb-6">
              Shipping calculated at checkout.
            </div>

            {/* Horizontal Line */}
            <div className="border-b border-slate-300 dark:border-slate-800 mb-6" />

            {/* Quantity Selector (Optional Helper) */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-light uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-full px-3 py-1 bg-transparent">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <LuMinus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={isOutOfStock || quantity >= stock}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons (Matching Image 1: ADD TO CART outline & BUY IT NOW solid black) */}
            <div className="space-y-3">
              {/* ADD TO CART Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-full border border-slate-900 dark:border-slate-100 bg-transparent text-slate-900 dark:text-slate-100 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 font-medium text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-xs ${
                  isOutOfStock ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-900" : ""
                }`}
              >
                <LuShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}</span>
              </button>

              {/* BUY IT NOW Button */}
              <button
                onClick={handleBuyItNow}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-full bg-black dark:bg-white text-white dark:text-slate-950 font-medium text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 ${
                  isOutOfStock ? "opacity-40 cursor-not-allowed hover:bg-black" : ""
                }`}
              >
                <span>BUY IT NOW</span>
              </button>
            </div>

            {/* Horizontal Line */}
            <div className="border-b border-slate-300 dark:border-slate-800 my-8" />

            {/* Collapsible Accordions (Image 1 style: DESCRIPTION & SHIPPING & RETURNS) */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
              {/* DESCRIPTION Accordion */}
              <div className="py-4">
                <button
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <span>DESCRIPTION</span>
                  {isDescOpen ? (
                    <LuChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <LuChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {isDescOpen && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed animate-fadeIn">
                    {product.description ||
                      "Crafted from premium full-grain Italian leather, designed for elegance and daily functional use."}
                  </div>
                )}
              </div>

              {/* SHIPPING & RETURNS Accordion */}
              <div className="py-4">
                <button
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <span>SHIPPING & RETURNS</span>
                  {isShippingOpen ? (
                    <LuChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <LuChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {isShippingOpen && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed space-y-2 animate-fadeIn">
                    <p>
                      <strong>Shipping:</strong> Express delivery across Cairo & Giza within 2-4 business days. Delivery to other governorates takes 5-6 business days.
                    </p>
                    <p>
                      <strong>Returns:</strong> 15-day return and exchange policy. Items must be in their original unused condition and packaging.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="font-serif-brand text-xl sm:text-2xl font-normal text-slate-900 dark:text-slate-100">
            You May Also Like
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={related}
                onEdit={onEditProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
