import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LuShoppingBag,
  LuWallet,
  LuShirt,
  LuAward,
  LuSparkles,
  LuSlidersHorizontal,
  LuSearch,
  LuLayers,
  LuChevronLeft,
  LuChevronRight,
  LuLoader,
} from "react-icons/lu";
import { useShop, normalizeCategory } from "../context/ShopContext";
import { ProductCard } from "../components/ProductCard";

const categoryMeta = {
  All: {
    title: "Complete Leather Collection",
    description:
      "Explore our full artisan leather range including handcrafted Bags, Wallets, Jackets, and Belts.",
    icon: LuLayers,
  },
  Bags: {
    title: "Handcrafted Leather Bags",
    description:
      "Full-grain Tuscan weekender bags, executive briefcases, daily satchels, and sleek backpacks.",
    icon: LuShoppingBag,
  },
  Wallets: {
    title: "Wallets & Cardholders",
    description:
      "Slim RFID bifold wallets, long zip continentals, and minimalist money clips.",
    icon: LuWallet,
  },
  Jackets: {
    title: "Leather Jackets & Apparel",
    description:
      "Hand-tailored lambskin biker jackets, suede bombers, and shearling flight coats.",
    icon: LuShirt,
  },
  Belts: {
    title: "Artisan Full-Grain Belts",
    description:
      "Reversible 35mm dress belts and hand-braided casual leather belts.",
    icon: LuAward,
  },
};

export const CategoryPage = ({ onEditProduct }) => {
  const { categoryName } = useParams();
  const {
    products,
    isLoadingProducts,
    setActiveCategory,
    activeCategory,
    searchQuery,
    setSearchQuery,
    matchCategory,
  } = useShop();

  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery || "");
  const [isSearching, setIsSearching] = useState(false);

  const [sortBy, setSortBy] = useState("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const category = categoryName || "All";
    setActiveCategory(category);
  }, [categoryName, setActiveCategory]);

  // Keep local search in sync if context searchQuery changes externally
  useEffect(() => {
    setLocalSearch(searchQuery || "");
    setDebouncedSearch(searchQuery || "");
  }, [searchQuery]);

  // 2-second debounce: only search when user stops typing for 2 seconds
  useEffect(() => {
    if (!localSearch.trim()) {
      setDebouncedSearch("");
      setIsSearching(false);
      if (searchQuery !== "") {
        setSearchQuery("");
      }
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(localSearch);
      setSearchQuery(localSearch);
      setIsSearching(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, setSearchQuery]);

  const currentMeta = categoryMeta[activeCategory] || categoryMeta.All;
  const MetaIcon = currentMeta.icon || LuSparkles;

  // Filter products by Category & Search (Title only, triggers after 2-second debounce)
  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCategory = matchCategory(p.category, activeCategory);
      const matchesSearch =
        !term || (p.title && p.title.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });

    // Sort products
    if (sortBy === "price-low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "name-az") {
      list.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        })
      );
    } else if (sortBy === "name-za") {
      list.sort((a, b) =>
        (b.title || "").localeCompare(a.title || "", undefined, {
          sensitivity: "base",
        })
      );
    } else {
      // Featured / default
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [products, activeCategory, debouncedSearch, sortBy]);

  // Pagination Configuration
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever activeCategory, search, or sortBy changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, debouncedSearch, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-10 2xl:px-16 space-y-6 sm:space-y-8 animate-fadeIn pt-5 sm:pt-8 pb-12 sm:pb-16">
      {/* Category Banner */}
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-3 pt-10 sm:p-10 md:p-12"
      >
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div
            className="
              inline-flex items-center gap-2
              px-3 py-1 rounded-full
              bg-amber-500/10 border border-amber-500/30
              text-amber-600 dark:text-amber-400
              text-[11px] sm:text-xs font-semibold
              uppercase tracking-wider
            "
          >
            <MetaIcon className="w-4 h-4 shrink-0" />
            <span>Category: {activeCategory}</span>
          </div>

          <h3
            className="
              font-serif-brand
              text-2xl sm:text-3xl md:text-4xl
              font-semibold
              text-slate-900 dark:text-slate-100
            "
          >
            {currentMeta.title}
          </h3>

          <p
            className="
              text-slate-600 dark:text-slate-300
              text-xs sm:text-sm font-light
              leading-relaxed
            "
          >
            {currentMeta.description}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Category Pills */}
        <div data-testid="category-pills" className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {["All", "Bags", "Wallets", "Jackets", "Belts"].map((cat) => {
            const isActive = normalizeCategory(activeCategory) === normalizeCategory(cat);
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => matchCategory(p.category, cat)).length;
            return (
              <Link
                key={cat}
                to={cat === "All" ? "/category/All" : `/category/${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-serif-brand ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950 font-semibold"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sort & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 sm:w-56 md:w-64">
            {isSearching ? (
              <LuLoader className="w-4 h-4 text-amber-500 animate-spin absolute left-3 top-2.5 pointer-events-none" />
            ) : (
              <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            )}
            <input
              type="search"
              enterKeyHint="search"
              placeholder="Search in this view..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setDebouncedSearch(localSearch);
                  setSearchQuery(localSearch);
                  setIsSearching(false);
                  e.target.blur();
                }
              }}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full sm:w-auto flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all min-w-40 sm:min-w-45 justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LuSlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {sortBy === "featured" && "Featured"}
                  {sortBy === "name-az" && "Name: A → Z"}
                  {sortBy === "name-za" && "Name: Z → A"}
                  {sortBy === "price-low" && "Price: Low → High"}
                  {sortBy === "price-high" && "Price: High → Low"}
                </span>
              </div>

              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-950/40 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Sort Products
                  </span>
                </div>

                {[
                  { value: "featured", label: "Featured" },
                  { value: "name-az", label: "Name: A → Z" },
                  { value: "name-za", label: "Name: Z → A" },
                  { value: "price-low", label: "Price: Low → High" },
                  { value: "price-high", label: "Price: High → Low" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                      sortBy === option.value
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <span className="text-amber-500 dark:text-amber-400 text-sm font-semibold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid / Searching Spinner / Loading / Empty State */}
      {isSearching && localSearch.trim() ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800">
          <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-light tracking-wide">Searching collection...</span>
        </div>
      ) : isLoadingProducts ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-light tracking-wide">Loading collection...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 sm:py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800 px-4">
          {/* <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <LuSparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          </div> */}
          <h3 className="font-serif-brand  sm:text-xl font-semibold text-slate-300">
            No items found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any products matching "{searchQuery}" in category "
            {activeCategory}".
          </p>
          <Link
            to="/category/All"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors cursor-pointer inline-block"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={onEditProduct}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800">
              {/* <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {filteredProducts.length}
                </span>{" "}
                products
              </div> */}

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                      currentPage === 1
                        ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 cursor-pointer"
                    }`}
                    aria-label="Previous page"
                  >
                    <LuChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                      currentPage === totalPages
                        ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 cursor-pointer"
                    }`}
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <LuChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
