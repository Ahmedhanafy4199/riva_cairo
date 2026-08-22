import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShop, normalizeCategory } from "../context/ShopContext";
import { ProductCard } from "../components/ProductCard";
import { LuSparkles, LuSearch } from "react-icons/lu";

const categoryMeta = {
  All: {
    title: "Complete Leather Collectionaaa",
    description:
      "Explore our full artisan leather range including handcrafted Bags, Wallets, Jackets, and Belts.",
  },
  Bags: {
    title: "Handcrafted Leather Bags",
    description:
      "Full-grain Tuscan weekender bags, executive briefcases, daily satchels, and sleek backpacks.",
  },
  Wallets: {
    title: "Wallets & Cardholders",
    description:
      "Slim RFID bifold wallets, long zip continentals, and minimalist money clips.",
  },
  Jackets: {
    title: "Leather Jackets & Apparel",
    description:
      "Hand-tailored lambskin biker jackets, suede bombers, and shearling flight coats.",
  },
  Belts: {
    title: "Artisan Full-Grain Belts",
    description:
      "Reversible 35mm dress belts and hand-braided casual leather belts.",
  },
};

export const CategoryPage = ({ onEditProduct }) => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const {
    products,
    setActiveCategory,
    activeCategory,
    searchQuery,
    setSearchQuery,
    matchCategory,
  } = useShop();

  useEffect(() => {
    const category = categoryName || "All";
    setActiveCategory(category);
  }, [categoryName, setActiveCategory]);

  const currentMeta = categoryMeta[activeCategory] || categoryMeta.All;

  const filteredProducts = products.filter((p) => {
    const matchesCategory = matchCategory(p.category, activeCategory);
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 sm:pb-16">
      {/* Category Banner */}
      <div
        className="
    relative rounded-2xl sm:rounded-3xl overflow-hidden
    border
    border-slate-200 dark:border-slate-800
    bg-linear-to-r
    from-slate-100 via-white to-slate-100
    dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
    p-6 sm:p-10 md:p-12
  "
      >
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div
            className="
        inline-flex items-center gap-2
        px-3 py-1
        rounded-full
        bg-amber-500/10
        border border-amber-500/30
        text-amber-600 dark:text-amber-400
        text-[11px] sm:text-xs
        font-semibold
        uppercase tracking-wider
      "
          >
            <LuSparkles className="w-3.5 h-3.5 shrink-0" />

            <span>Category: {activeCategory}</span>
          </div>

          <h2
            className="
        font-serif-brand
        text-2xl sm:text-3xl md:text-4xl
        font-bold
        text-slate-900 dark:text-slate-100
      "
          >
            {currentMeta.title}
          </h2>

          <p
            className="
        text-slate-600 dark:text-slate-300
        text-xs sm:text-sm
        font-light
        leading-relaxed
      "
          >
            {currentMeta.description}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "Bags", "Wallets", "Jackets", "Belts"].map((cat) => {
            const isActive = normalizeCategory(activeCategory) === normalizeCategory(cat);
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => matchCategory(p.category, cat)).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  navigate(cat === "All" ? "/category/All" : `/category/${cat}`);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 ${
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

        <div className="relative shrink-0 w-full sm:w-64 md:w-72">
          <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search in this category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Products Grid / Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 sm:py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800 px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <LuSparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="font-serif-brand text-lg sm:text-xl font-bold text-slate-300">
            No items found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any products matching "{searchQuery}" in category "
            {activeCategory}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
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
