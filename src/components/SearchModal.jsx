import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuX } from "react-icons/lu";
import { useShop } from "../context/ShopContext";

export const SearchModal = () => {
  const {
    products,
    isSearchOpen,
    setIsSearchOpen,
    recentlyViewed,
    clearRecentlyViewed,
  } = useShop();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Filter products by search query
  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = trimmedQuery
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmedQuery) ||
          p.category.toLowerCase().includes(trimmedQuery) ||
          (p.description && p.description.toLowerCase().includes(trimmedQuery))
      )
    : [];

  const handleProductClick = (productId) => {
    setIsSearchOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleClear = () => {
    if (query) {
      setQuery("");
      inputRef.current?.focus();
    } else {
      clearRecentlyViewed();
    }
  };

  // Determine items to display
  const displayItems = query ? searchResults : recentlyViewed;
  const mainFeaturedItem = displayItems[0];
  const remainingItems = displayItems.slice(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Bar */}
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
          className="flex items-center px-4 py-3 sm:py-3.5 gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <LuSearch className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                inputRef.current?.blur();
              }
            }}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <LuX className="w-5 h-5" />
          </button>
        </form>

        {/* Content Section */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-light text-slate-500 dark:text-slate-400">
              {query ? "Products" : "Recently viewed"}
            </span>
            <button
              onClick={handleClear}
              className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              CLEAR
            </button>
          </div>

          {/* Empty State */}
          {displayItems.length === 0 && (
            <div className="py-10 text-center text-xs text-slate-400">
              {query ? `No results found for "${query}"` : "No recently viewed products"}
            </div>
          )}

          {/* Featured First Item (matching Image 2 layout) */}
          {mainFeaturedItem && (
            <div className="space-y-4">
              <div
                onClick={() => handleProductClick(mainFeaturedItem.id)}
                className="group flex flex-col space-y-2 cursor-pointer max-w-xs"
              >
                <div className="w-36 h-40 sm:w-44 sm:h-48 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                  <img
                    src={mainFeaturedItem.image || (mainFeaturedItem.images && mainFeaturedItem.images[0])}
                    alt={mainFeaturedItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-serif-brand text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {mainFeaturedItem.title}
                  </h4>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    LE {mainFeaturedItem.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize pt-0.5">
                    {mainFeaturedItem.category || "Products"}
                  </div>
                </div>
              </div>

              {/* Grid of Remaining Items */}
              {remainingItems.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  {remainingItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item.id)}
                      className="group cursor-pointer space-y-1"
                    >
                      <div className="aspect-square rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                        <img
                          src={item.image || (item.images && item.images[0])}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
