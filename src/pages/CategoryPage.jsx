import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, Search } from 'lucide-react';

const categoryMeta = {
  All: {
    title: 'Complete Leather Collection',
    description:
      'Explore our full artisan leather range including handcrafted Bags, Wallets, Jackets, and Belts.',
  },
  Bags: {
    title: 'Handcrafted Leather Bags',
    description:
      'Full-grain Tuscan weekender bags, executive briefcases, daily satchels, and sleek backpacks.',
  },
  Wallet: {
    title: 'Wallets & Cardholders',
    description:
      'Slim RFID bifold wallets, long zip continentals, and minimalist money clips.',
  },
  Jacket: {
    title: 'Leather Jackets & Apparel',
    description:
      'Hand-tailored lambskin biker jackets, suede bombers, and shearling flight coats.',
  },
  Belt: {
    title: 'Artisan Full-Grain Belts',
    description:
      'Reversible 35mm dress belts and hand-braided casual leather belts.',
  },
};

export const CategoryPage = ({ onEditProduct }) => {
  const { categoryName } = useParams();
  const {
    products,
    setActiveCategory,
    activeCategory,
    searchQuery,
    setSearchQuery,
  } = useShop();

  useEffect(() => {
    const category = categoryName || 'All';
    setActiveCategory(category);
  }, [categoryName, setActiveCategory]);

  const currentMeta = categoryMeta[activeCategory] || categoryMeta.All;

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
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

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {['All', 'Bags', 'Wallet', 'Jacket', 'Belt'].map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === 'All'
                ? products.length
                : products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0 w-full lg:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search in this category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full lg:w-72 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-serif-brand text-xl font-bold text-slate-300">No items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any products matching "{searchQuery}" in category "{activeCategory}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
