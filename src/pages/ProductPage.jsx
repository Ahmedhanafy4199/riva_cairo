import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { supabase } from "../lib/supabase";
import { ProductCard } from "../components/ProductCard";

export const ProductPage = ({ onEditProduct }) => {
  const {
    products,
    isLoadingProducts,
    addToCart,
    getProductStock,
    showToast,
    addRecentlyViewed,
  } = useShop();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [directProduct, setDirectProduct] = useState(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  // Accordion open/close state (Default CLOSED as requested)
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Sticky add to cart bar visibility state
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyButtonsRef = useRef(null);

  // Slide animation direction for OwlCarousel-style transitions
  const [slideDirection, setSlideDirection] = useState(null); // 'next' | 'prev' | null

  // Touch Swipe Gesture State & References
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(null);
  const minSwipeDistance = 40;

  // Find product from global context
  const cachedProduct = useMemo(() => {
    if (!products || products.length === 0 || !productId) return null;
    return (
      products.find(
        (p) =>
          String(p.id).trim().toLowerCase() ===
          String(productId).trim().toLowerCase(),
      ) || null
    );
  }, [products, productId]);

  // Fetch product directly from Supabase if not present in context products cache
  useEffect(() => {
    if (cachedProduct) {
      setDirectProduct(cachedProduct);
      return;
    }

    if (isLoadingProducts) return;

    let isMounted = true;
    const fetchSingleProduct = async () => {
      if (!productId) return;
      try {
        setIsDirectLoading(true);
        const { data: p, error } = await supabase
          .from("products")
          .select("*, product_images (*)")
          .eq("id", productId)
          .maybeSingle();

        if (!error && p && isMounted) {
          const sortedImages = (p.product_images || []).sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
          );

          const coverImageObj =
            sortedImages.find((img) => img.is_cover) || sortedImages[0];
          const imageUrls = sortedImages.map((img) => img.image_url);

          const purchasedQty = parseInt(p.purchased_qty || 0, 10);
          const sold = parseInt(p.sold || 0, 10);
          const qtyStock = parseInt(
            p.qty_stock !== undefined && p.qty_stock !== null ? p.qty_stock : 0,
            10,
          );

          setDirectProduct({
            id: p.id,
            title: p.title,
            category: p.category,
            barcode: p.barcode || "",
            price: parseFloat(p.price),
            originalPrice: p.original_price
              ? parseFloat(p.original_price)
              : parseFloat(p.price) * 1.2,
            purchasedQty,
            sold,
            qtyStock,
            stock: qtyStock,
            featured: Boolean(p.featured),
            description: p.description || "",
            rating: p.rating ? parseFloat(p.rating) : 5.0,
            reviewsCount: p.reviews_count ? parseInt(p.reviews_count, 10) : 1,
            image: coverImageObj ? coverImageObj.image_url : "",
            images: imageUrls,
          });
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        if (isMounted) {
          setIsDirectLoading(false);
        }
      }
    };

    fetchSingleProduct();

    return () => {
      isMounted = false;
    };
  }, [cachedProduct, productId, isLoadingProducts]);

  const product = cachedProduct || directProduct;

  // Reset indices on route/product change
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
  }, [productId]);

  // Add product to recently viewed list on mount / change & scroll to top
  useEffect(() => {
    if (product && typeof addRecentlyViewed === "function") {
      addRecentlyViewed(product);
    }
    window.scrollTo(0, 0);
  }, [product, addRecentlyViewed]);

  // Scroll listener for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (buyButtonsRef.current) {
        const rect = buyButtonsRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const images = useMemo(() => {
    if (!product) return [];
    const rawImages =
      product.images && product.images.length > 0
        ? [...product.images]
        : product.image
          ? [product.image]
          : [];

    if (product.image && rawImages.length > 1) {
      const coverIdx = rawImages.indexOf(product.image);
      if (coverIdx > 0) {
        rawImages.splice(coverIdx, 1);
        rawImages.unshift(product.image);
      }
    }
    return rawImages;
  }, [product]);

  const activeImage = images[activeImageIndex] || images[0] || product?.image || "";

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    return products
      .filter(
        (p) =>
          p &&
          String(p.id).trim() !== String(product.id).trim() &&
          matchCategory(p.category, product.category),
      )
      .slice(0, 4);
  }, [product, products]);

  const stock = useMemo(() => {
    if (!product) return 0;
    return getProductStock
      ? getProductStock(product)
      : (product.qtyStock ?? product.qty_stock ?? product.stock ?? 0);
  }, [product, getProductStock]);

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
    if (isOutOfStock || !product) return;
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleBuyItNow = () => {
    if (isOutOfStock || !product) return;
    const success = addToCart(product, quantity);
    if (success !== false) {
      navigate("/checkout");
    }
  };

  const handlePrev = () => {
    setSlideDirection("prev");
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSlideDirection("next");
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - touchStartX.current;
    setTouchDeltaX(delta);
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current) return;
    const threshold = minSwipeDistance;

    if (touchDeltaX < -threshold && images.length > 1) {
      setSlideDirection("next");
      setActiveImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    } else if (touchDeltaX > threshold && images.length > 1) {
      setSlideDirection("prev");
      setActiveImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    }

    setTouchDeltaX(0);
    setIsSwiping(false);
    touchStartX.current = null;
  };

  if (isLoadingProducts || (isDirectLoading && !product)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs tracking-wider">Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4 px-4 min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="font-serif-brand text-2xl font-semibold text-slate-700 dark:text-slate-300">
          Product not found
        </h2>
        <Link
          to="/category/All"
          className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-medium text-xs hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors cursor-pointer inline-block"
        >
          Go Back
        </Link>
      </div>
    );
  }

  // Description text formatting helper
  // const renderDescriptionContent = () => {
  //   const rawDesc = product.description || "";
  //   const lines = rawDesc.split("\n").map((l) => l.trim()).filter(Boolean);

  //   const mainText =
  //     lines.find(
  //       (l) =>
  //         !l.toLowerCase().includes("dimention") &&
  //         !l.toLowerCase().includes("dimension") &&
  //         !l.toLowerCase().includes("material:") &&
  //         !l.toLowerCase().includes("color:")
  //     ) ||
  //     "Our iconic shoulder bag — a timeless statement piece designed to elevate your everyday look with effortless elegance and a modern silhouette.";

  //   const dimLine = lines.find(
  //     (l) =>
  //       l.toLowerCase().includes("dimention") ||
  //       l.toLowerCase().includes("dimension")
  //   );
  //   const matLine = lines.find((l) => l.toLowerCase().includes("material:"));
  //   const colLine = lines.find((l) => l.toLowerCase().includes("color:"));

  //   return (
  //     <div className="space-y-4 text-left">
  //       <p className="font-semibold text-slate-800 leading-relaxed text-sm sm:text-base">
  //         {mainText}
  //       </p>

  //       <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside">
  //         <li>
  //           <strong>Dimensions:</strong>{" "}
  //           {dimLine
  //             ? dimLine.replace(/dimentions?:?\s*/i, "")
  //             : "15 Height / 40 Width / 9 depth"}
  //         </li>
  //         <li>
  //           <strong>Material:</strong>{" "}
  //           {matLine
  //             ? matLine.replace(/material:\s*/i, "")
  //             : "Premium PU Leather"}
  //         </li>
  //         <li>
  //           <strong>Color:</strong>{" "}
  //           {colLine
  //             ? colLine.replace(/color:\s*/i, "")
  //             : product.title.includes("-")
  //               ? product.title.split("-").pop().trim()
  //               : "Black"}
  //         </li>
  //       </ul>
  //     </div>
  //   );
  // };

  return (
    <div className="w-full min-h-screen animate-fadeIn pb-16">
      {/* Preload ALL product images invisibly so gallery navigation is instant */}
      <div aria-hidden="true" className="hidden">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            fetchPriority={i === 0 ? "high" : "low"}
          />
        ))}
      </div>

      {/* Full-width Product Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen items-start">
        {/* Left Column: Media Gallery (Full Bleed to Left Edge) */}
        <div className="lg:col-span-6 w-full lg:sticky lg:top-0">
          <div
            className="relative w-full aspect-4/5 lg:aspect-auto lg:h-screen bg-[#f4f4f4] dark:bg-slate-900 overflow-hidden select-none touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Animated Image — key forces remount triggering CSS animation */}
            <img
              key={activeImageIndex}
              src={activeImage}
              alt={product.title}
              onAnimationEnd={() => setSlideDirection(null)}
              style={{
                transform: isSwiping
                  ? `translateX(${touchDeltaX}px)`
                  : undefined,
                transition: isSwiping ? "none" : undefined,
              }}
              className={`w-full h-full object-cover object-center pointer-events-none select-none block ${
                !isSwiping && slideDirection === "next"
                  ? "animate-owl-next"
                  : !isSwiping && slideDirection === "prev"
                    ? "animate-owl-prev"
                    : ""
              }`}
            />

            {/* Image Counter Pill Badge (e.g. 1 / 8) */}
            {images.length > 0 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full bg-slate-950/60  text-xs sm:text-sm font-medium backdrop-blur-md shadow-md tracking-wider">
                {activeImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Desktop Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-slate-950/80 hover:bg-white dark:hover:bg-slate-950 text-slate-900 dark:text-white shadow-md backdrop-blur-sm transition-all cursor-pointer z-20"
                  aria-label="Previous image"
                >
                  <LuChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-slate-950/80 hover:bg-white dark:hover:bg-slate-950 text-slate-900 dark:text-white shadow-md backdrop-blur-sm transition-all cursor-pointer z-20"
                  aria-label="Next image"
                >
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="lg:col-span-6 w-full px-6 sm:px-12 lg:px-20 pt-10 lg:pt-28 pb-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center min-h-screen flex flex-col justify-start">
          <div className="max-w-xl mx-auto w-full">
            {/* Title */}
            <h4 className="font-serif-brand font-normal text-3xl sm:text-4xl text-slate-900 dark:text-slate-100  tracking-tight mb-3 text-center">
              {product.title}
            </h4>

            {/* Price */}
            <div className="flex items-center justify-center gap-3 text-xl sm:text-2xl font-serif-brand text-slate-900 dark:text-amber-400 tracking-wide mb-1">
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-base  text-slate-400 dark:text-slate-500 line-through">
                    {" "}
                    {product.originalPrice?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                    EGP
                  </span>
                )}
              <span className="">
                {" "}
                {product.price?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
                EGP
              </span>
            </div>

            {/* Shipping subtext */}
            <div className="text-xs text-slate-400 dark:text-slate-400 font-light mb-6 text-center">
              Shipping calculated at checkout.
            </div>

            {/* Horizontal Separator Line */}
            {/* <div className="border-b border-slate-900 dark:border-slate-800 mb-6" /> */}

            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-full px-3 py-1 bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer p-1"
                  aria-label="Decrease quantity"
                >
                  <LuMinus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={isOutOfStock || quantity >= stock}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer p-1"
                  aria-label="Increase quantity"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons Container */}
            <div ref={buyButtonsRef} className="space-y-3 mb-8">
              {/* ADD TO CART Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-full border border-slate-900 dark:border-slate-700 text-slate-950 dark:text-white bg-[#e9e9e9] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs ${
                  isOutOfStock
                    ? "opacity-40 cursor-not-allowed hover:bg-[#e9e9e9] dark:hover:bg-slate-800"
                    : ""
                }`}
              >
                <LuShoppingBag className="w-4 h-4 text-slate-950 dark:text-white" />
                <span>{isOutOfStock ? "SOLD OUT" : "ADD TO CART"}</span>
              </button>

              {/* BUY IT NOW Button */}
              <button
                onClick={handleBuyItNow}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-full 
                bg-black dark:bg-amber-500 
                hover:bg-neutral-800 dark:hover:bg-amber-400
                text-white dark:text-slate-950 
                font-semibold text-xs sm:text-sm tracking-widest uppercase 
                flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isOutOfStock
                    ? "opacity-40 cursor-not-allowed hover:bg-black dark:hover:bg-amber-500"
                    : ""
                }`}
              >
                <span>BUY IT NOW</span>
              </button>
            </div>

            {/* Collapsible Accordions */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 text-left">
              {/* DESCRIPTION Accordion */}
              <div className="py-4">
                <button
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold uppercase tracking-widest text-slate-950 dark:text-slate-100 cursor-pointer"
                >
                  <span>Description</span>
                  {isDescOpen ? (
                    <LuChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <LuChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </button>

                {isDescOpen && (
                  <div
                    className="mt-4 animate-fadeIn text-sm  leading-relaxed rich-description"
                    dangerouslySetInnerHTML={{
                      __html: product.description || "",
                    }}
                  />
                )}
              </div>

              {/* SHIPPING & RETURNS Accordion */}
              <div className="py-4">
                <button
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold uppercase tracking-widest text-slate-950 dark:text-slate-100 cursor-pointer"
                >
                  <span>Shipping & Returns</span>
                  {isShippingOpen ? (
                    <LuChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <LuChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </button>

                {isShippingOpen && (
                  <div className="mt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed space-y-3 animate-fadeIn text-left">
                    <ul className="list-disc list-inside space-y-1.5">
                      <li>
                        Delivery inside{" "}
                        <strong>Cairo / Giza takes 3-4 days</strong>
                      </li>
                      <li>
                        Delivery to{" "}
                        <strong>Governorates takes 5-6 working days</strong>
                      </li>
                    </ul>
                    <p className="text-slate-500 dark:text-slate-400 pt-1">
                      Feel free to check your bag upon delivery before
                      confirming receipt of your order.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products ("You May Also Like") */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-slate-200 dark:border-slate-800 space-y-8 text-center px-4 sm:px-8 lg:px-10 2xl:px-16 w-full">
          <h2 className="font-serif-brand text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100 tracking-tight">
            You May Also Like
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
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

      {/* Sticky Add to Cart Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 py-3 transition-all duration-300 transform ${
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-full px-2 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          {/* Left: Thumbnail & Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-serif-brand text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                {product.title}
              </h4>
              <div className="text-xs sm:text-sm font-mono text-slate-900 dark:text-amber-400 font-semibold">
                LE{" "}
                {product.price?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          {/* Right: Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500  font-semibold text-xs sm:text-sm  tracking-wider shrink-0 transition-colors cursor-pointer"
          >
            <LuShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
