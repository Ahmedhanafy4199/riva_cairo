import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useDeferredValue,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LuSearch, LuX, LuLoader } from "react-icons/lu";
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Listen to ?search=open or ?modal=search from URL (for Open in New Tab support)
  useEffect(() => {
    const searchParam = searchParams.get("search");
    const modalParam = searchParams.get("modal");
    if (searchParam === "open" || modalParam === "search") {
      setIsSearchOpen(true);
    }
  }, [searchParams, setIsSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    if (searchParams.get("search") || searchParams.get("modal") === "search") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      if (newParams.get("modal") === "search") newParams.delete("modal");
      setSearchParams(newParams, { replace: true });
    }
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setDebouncedQuery("");
      setIsSearching(false);
    }
  }, [isSearchOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // 2-second debounce: only search when user stops typing for 2 seconds
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter products by search query (Title only, triggers after 2-second debounce)
  const trimmedQuery = debouncedQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return products.filter((p) =>
      p.title ? p.title.toLowerCase().includes(trimmedQuery) : false,
    );
  }, [products, trimmedQuery]);

  const handleClear = () => {
    if (query) {
      setQuery("");
      setDebouncedQuery("");
      setIsSearching(false);
      inputRef.current?.focus();
    } else {
      clearRecentlyViewed();
    }
  };

  // Determine items to display
  const displayItems = query.trim() ? searchResults : recentlyViewed;
  const mainFeaturedItem = displayItems[0];
  const remainingItems = displayItems.slice(1);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={closeSearch}
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
            setDebouncedQuery(query);
            setIsSearching(false);
            inputRef.current?.blur();
          }}
          className="flex items-center px-4 py-3 sm:py-3.5 gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {isSearching ? (
            <LuLoader className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
          ) : (
            <LuSearch className="w-5 h-5 text-slate-400 shrink-0" />
          )}

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
                setDebouncedQuery(query);
                setIsSearching(false);
                inputRef.current?.blur();
              }
            }}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />

          <button
            type="button"
            onClick={closeSearch}
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

          {/* Searching Loading State */}
          {isSearching && query.trim() ? (
            <div className="py-14 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />

              <span className="text-xs text-slate-400 font-light">
                Searching products...
              </span>
            </div>
          ) : (
            <>
              {/* Empty State */}
              {displayItems.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400">
                  {query
                    ? `No results found for "${query}"`
                    : "No recently viewed products"}
                </div>
              )}

              {/* Products */}
              {displayItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {displayItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      onClick={closeSearch}
                      className="group flex flex-col space-y-2 cursor-pointer min-w-0"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                        <img
                          src={item.image || item.images?.[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-serif-brand text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {item.title}
                        </h4>

                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {item.price?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          EGP
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
