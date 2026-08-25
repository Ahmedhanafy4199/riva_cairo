import React, { useState } from "react";
import {
  LuShoppingBag,
  LuWallet,
  LuShirt,
  LuAward,
  LuSparkles,
  LuSlidersHorizontal,
  LuSearch,
} from "react-icons/lu";
import { useShop, normalizeCategory } from "../context/ShopContext";
import { ProductCard } from "../components/ProductCard";

export const ProductsPage = ({ onEditProduct }) => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    matchCategory,
  } = useShop();

  const [sortBy, setSortBy] = useState("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categoryMeta = {
    All: {
      title: "Complete Leather Collection",
      description:
        "Explore our full artisan leather range including handcrafted Bags, Wallets, Jackets, and Belts.",
      icon: LuSparkles,
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

  const currentMeta = categoryMeta[activeCategory] || categoryMeta.All;
  const MetaIcon = currentMeta.icon;

  // Filter products by Category & Search
  let filtered = products.filter((p) => {
    const matchesCategory = matchCategory(p.category, activeCategory);
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  if (sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-az") {
    filtered.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, {
        sensitivity: "base",
      }),
    );
  } else if (sortBy === "name-za") {
    filtered.sort((a, b) =>
      b.title.localeCompare(a.title, undefined, {
        sensitivity: "base",
      }),
    );
  } else {
    // Featured / default
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 sm:pb-16">
      {/* Category Banner Header */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-linear-to-r from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-10 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            <MetaIcon className="w-4 h-4 shrink-0" />
            <span>Category: {activeCategory}</span>
          </div>

          <h1 className="font-serif-brand text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            {currentMeta.title}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
            {currentMeta.description}
          </p>
        </div>
      </div>

      {/* Categories Bar & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {["All", "Bags", "Wallets", "Jackets", "Belts"].map((cat) => {
            const isActive = normalizeCategory(activeCategory) === normalizeCategory(cat);
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => matchCategory(p.category, cat)).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 sm:w-56 md:w-64">
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search in this view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full sm:w-auto flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-medium transition-all min-w-40 sm:min-w-45 justify-between cursor-pointer"
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
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/40 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
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
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <span className="text-amber-400 text-sm font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 sm:py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <LuShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="font-serif-brand text-lg sm:text-xl font-bold text-slate-300">
            No items found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any products matching "{searchQuery}" in category "
            {activeCategory}".
          </p>
          <button
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
