import React, { useState } from "react";
import {
  ShoppingBag,
  Wallet,
  Shirt,
  Award,
  Sparkles,
  SlidersHorizontal,
  Search,
  Grid,
  ListFilter,
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { ProductCard } from "../components/ProductCard";

export const ProductsPage = ({ onEditProduct }) => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  } = useShop();

  const [sortBy, setSortBy] = useState("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categoryMeta = {
    All: {
      title: "Complete Leather Collection",
      description:
        "Explore our full artisan leather range including handcrafted Bags, Wallets, Jackets, and Belts.",
      icon: Sparkles,
    },
    Bags: {
      title: "Handcrafted Leather Bags",
      description:
        "Full-grain Tuscan weekender bags, executive briefcases, daily satchels, and sleek backpacks.",
      icon: ShoppingBag,
    },
    Wallet: {
      title: "Wallets & Cardholders",
      description:
        "Slim RFID bifold wallets, long zip continentals, and minimalist money clips.",
      icon: Wallet,
    },
    Jacket: {
      title: "Leather Jackets & Apparel",
      description:
        "Hand-tailored lambskin biker jackets, suede bombers, and shearling flight coats.",
      icon: Shirt,
    },
    Belt: {
      title: "Artisan Full-Grain Belts",
      description:
        "Reversible 35mm dress belts and hand-braided casual leather belts.",
      icon: Award,
    },
  };

  const currentMeta = categoryMeta[activeCategory] || categoryMeta.All;
  const MetaIcon = currentMeta.icon;

  // Filter products by Category & Search
  let filtered = products.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
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
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Category Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <MetaIcon className="w-4 h-4" />
            <span>Category: {activeCategory}</span>
          </div>

          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-slate-100">
            {currentMeta.title}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
            {currentMeta.description}
          </p>
        </div>
      </div>

      {/* Categories Bar & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {["All", "Bags", "Wallet", "Jacket", "Belt"].map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950"
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
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
              className="flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-medium transition-all min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />

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
              <div className="absolute right-0 top-full mt-2 w-[220px] z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors ${
                      sortBy === option.value
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{option.label}</span>

                    {sortBy === option.value && (
                      <span className="text-amber-400 text-sm">✓</span>
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
        <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif-brand text-xl font-bold text-slate-300">
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
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
