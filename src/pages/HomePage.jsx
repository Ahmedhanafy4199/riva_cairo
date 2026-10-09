import React, { useRef, useState } from "react";
import {
  LuArrowRight,
  LuSparkles,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import { useShop, matchCategory } from "../context/ShopContext";
import { HeroSection } from "../components/HeroSection";
import { ProductCard } from "../components/ProductCard";

const MAX_MOBILE_PAGINATION_PRODUCTS = 9;

const ProductCollectionRow = ({
  title,
  subtitle,
  badgeText,
  items,
  maxDesktopCount = 4,
  onSelectCategory,
  onEditProduct,
  categoryKey,
  totalCategoryCount,
}) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);

  // Sort items by most sold first (best-selling), then by reviews/rating
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const soldA = parseInt(a.sold ?? a.soldQty ?? 0, 10);
      const soldB = parseInt(b.sold ?? b.soldQty ?? 0, 10);
      if (soldB !== soldA) return soldB - soldA;
      const revA = parseInt(a.reviewsCount ?? 0, 10);
      const revB = parseInt(b.reviewsCount ?? 0, 10);
      return revB - revA;
    });
  }, [items]);

  // Display only up to 9 most-sold products in mobile pagination
  const displayProducts = React.useMemo(() => {
    return sortedItems.slice(0, MAX_MOBILE_PAGINATION_PRODUCTS);
  }, [sortedItems]);

  const totalItems = displayProducts.length;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const firstChild = scrollRef.current.firstElementChild;
    const itemWidth = firstChild ? firstChild.clientWidth : 150;
    const gap = 12;
    const idx = Math.round(scrollLeft / (itemWidth + gap)) + 1;
    setCurrentIndex(Math.min(Math.max(1, idx), totalItems));
  };

  const handlePrev = () => {
    if (!scrollRef.current) return;
    const firstChild = scrollRef.current.firstElementChild;
    const itemWidth = firstChild ? firstChild.clientWidth : 150;
    const gap = 12;
    scrollRef.current.scrollBy({
      left: -(itemWidth + gap),
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    const firstChild = scrollRef.current.firstElementChild;
    const itemWidth = firstChild ? firstChild.clientWidth : 150;
    const gap = 12;
    scrollRef.current.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
  };

  return (
    <section className="space-y-3.5 sm:space-y-6 pt-4 border-t border-slate-200 dark:border-slate-900 first-of-type:border-t-0 first-of-type:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-4 gap-2 sm:gap-3">
        <div>
          {/* {badgeText && (
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <LuSparkles className="w-3.5 h-3.5 shrink-0" />
              {badgeText}
            </span>
          )} */}
          <h2
            className="font-serif-brand text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Top Action */}
        {/* <button
          onClick={() => onSelectCategory(categoryKey)}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>
            View All {categoryKey !== "All" ? categoryKey : ""} (
            {totalCategoryCount || totalItems})
          </span>
          <LuArrowRight className="w-3.5 h-3.5" />
        </button> */}
      </div>

      {/* Product List: Horizontal on mobile, Grid on desktop */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-3 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-6 sm:overflow-visible no-scrollbar snap-x snap-mandatory scroll-smooth scroll-pl-3 sm:scroll-pl-0"
      >
        {displayProducts.map((product, idx) => (
          <div
            key={product.id}
            className={`w-[calc((100vw-44px)/2.4)] min-w-[130px] max-w-[180px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start ${
              idx >= maxDesktopCount ? "sm:hidden" : ""
            }`}
          >
            <ProductCard product={product} onEdit={onEditProduct} />
          </div>
        ))}
      </div>

      {/* Mobile Pagination: < 1/9 > */}
      {totalItems > 1 && (
        <div className="flex sm:hidden items-center justify-center gap-3 pt-1 text-xs select-none">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 1}
            className={`p-1.5 transition-colors ${
              currentIndex <= 1
                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30"
                : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
            }`}
            aria-label="Previous product"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs tracking-widest text-slate-600 dark:text-slate-300 min-w-8 text-center">
            {currentIndex}/{totalItems}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex >= totalItems}
            className={`p-1.5 transition-colors ${
              currentIndex >= totalItems
                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30"
                : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
            }`}
            aria-label="Next product"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom View All Button */}
      <div className="flex justify-center pt-1.5 sm:pt-2">
        <Link
          to={categoryKey === "All" ? "/category/All" : `/category/${categoryKey}`}
          onClick={() => onSelectCategory && onSelectCategory(categoryKey)}
          className="w-full max-w-[190px] py-2.5 px-6 border border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 text-xs font-medium uppercase tracking-wider hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all cursor-pointer text-center block"
        >
          View all
        </Link>
      </div>
    </section>
  );
};

export const HomePage = ({ onEditProduct }) => {
  const { products, setActiveCategory } = useShop();

  const handleSelectCategory = (catId) => {
    const category = catId === "Home" ? "All" : catId;
    setActiveCategory(category);
  };

  const departmentCategories = ["Bags", "Wallets", "Jackets", "Belts"];
  const MAX_FEATURED_HOME_PRODUCTS = 5;
  const MAX_CATEGORY_HOME_PRODUCTS = 5;

  return (
    <div className="w-full px-3 sm:px-6 lg:px-10 2xl:px-16 space-y-10 sm:space-y-16 animate-fadeIn pt-5 sm:pt-8 pb-12 sm:pb-16">
      <HeroSection onSelectCategory={handleSelectCategory} />

      {/* Featured Products Section */}
      <ProductCollectionRow
        badgeText="Handcrafted Selection"
        title="Explore All Products"
        items={products}
        maxDesktopCount={MAX_FEATURED_HOME_PRODUCTS}
        onSelectCategory={handleSelectCategory}
        onEditProduct={onEditProduct}
        categoryKey="All"
        totalCategoryCount={products.length}
      />

      {/* Category Collections Sections */}
      {departmentCategories.map((catName) => {
        const catProducts = products.filter((p) =>
          matchCategory(p.category, catName),
        );
        if (catProducts.length === 0) return null;

        return (
          <ProductCollectionRow
            key={catName}
            title={`${catName} Collection`}
            // subtitle={`Explore our top artisan ${catName.toLowerCase()} designs`}
            items={catProducts}
            maxDesktopCount={MAX_CATEGORY_HOME_PRODUCTS}
            onSelectCategory={handleSelectCategory}
            onEditProduct={onEditProduct}
            categoryKey={catName}
            totalCategoryCount={catProducts.length}
          />
        );
      })}
    </div>
  );
};
