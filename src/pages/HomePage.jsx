import React from 'react';
import { LuArrowRight, LuSparkles } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useShop, matchCategory } from '../context/ShopContext';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';

export const HomePage = ({ onEditProduct }) => {
  const { products, setActiveCategory } = useShop();
  const navigate = useNavigate();

  const handleSelectCategory = (catId) => {
    const category = catId === 'Home' ? 'All' : catId;
    setActiveCategory(category);
    navigate(category === 'All' ? '/category/All' : `/category/${category}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const departmentCategories = ['Bags', 'Wallets', 'Jackets', 'Belts'];
  const MAX_FEATURED_HOME_PRODUCTS = 4;
  const MAX_CATEGORY_HOME_PRODUCTS = 4;

  return (
    <div className="space-y-10 sm:space-y-16 animate-fadeIn pb-12 sm:pb-16">
      <HeroSection onSelectCategory={handleSelectCategory} />

      {/* Featured Products Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800/80 pb-3 sm:pb-4 gap-2 sm:gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <LuSparkles className="w-3.5 h-3.5 shrink-0" />
              Handcrafted Selection
            </span>
            <h2 className="font-serif-brand text-xl sm:text-3xl font-bold text-slate-100 mt-1">
              Featured Luxury Products
            </h2>
          </div>

          <button
            onClick={() => handleSelectCategory('All')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All ({products.length})</span>
            <LuArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.slice(0, MAX_FEATURED_HOME_PRODUCTS).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
            />
          ))}
        </div>
      </section>

      {/* Category Collections Sections */}
      {departmentCategories.map((catName) => {
        const catProducts = products.filter((p) => matchCategory(p.category, catName));
        if (catProducts.length === 0) return null;

        return (
          <section key={catName} className="space-y-4 sm:space-y-6 pt-4 border-t border-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div>
                <h3 className="font-serif-brand text-lg sm:text-2xl font-bold text-slate-100">
                  {catName} Collection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explore our top artisan {catName.toLowerCase()} designs
                </p>
              </div>

              <button
                onClick={() => handleSelectCategory(catName)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 hover:text-amber-500 hover:border-amber-500/40 font-medium transition-colors cursor-pointer self-start sm:self-auto"
              >
                See All {catName} →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {catProducts.slice(0, MAX_CATEGORY_HOME_PRODUCTS).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={onEditProduct}
                />
              ))}
            </div>

            {catProducts.length > MAX_CATEGORY_HOME_PRODUCTS && (
              <div className="flex justify-center pt-1 sm:pt-2">
                <button
                  onClick={() => handleSelectCategory(catName)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
                >
                  <span>View All {catName} ({catProducts.length})</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        );
      })}

      {/* Explore All CTA Section */}
      <section className="mt-8 p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-linear-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 text-center space-y-4 shadow-xl">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center justify-center gap-1.5">
            <LuSparkles className="w-3.5 h-3.5 shrink-0" />
            Complete Artisan Catalog
          </span>
          <h3 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-100">
            Looking for More?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Discover our full range of handcrafted luxury leather goods.
          </p>
        </div>
        <button
          onClick={() => handleSelectCategory('All')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <span>View All Products ({products.length})</span>
          <LuArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
