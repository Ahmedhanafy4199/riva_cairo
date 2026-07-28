import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
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

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      <HeroSection onSelectCategory={handleSelectCategory} />

      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Handcrafted Selection
            </span>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Featured Luxury Products
            </h2>
          </div>

          <button
            onClick={() => handleSelectCategory('All')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
            />
          ))}
        </div>
      </section>

      {['Bags', 'Wallet', 'Jacket', 'Belt'].map((catName) => {
        const catProducts = products.filter((p) => p.category === catName);
        if (catProducts.length === 0) return null;

        return (
          <section key={catName} className="space-y-6 pt-4 border-t border-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-slate-100">
                  {catName} Collection
                </h3>
                <p className="text-xs text-slate-400">
                  Explore our top artisan {catName.toLowerCase()} designs
                </p>
              </div>

              <button
                onClick={() => handleSelectCategory(catName)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 hover:text-white font-medium transition-colors"
              >
                See All {catName} →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={onEditProduct}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
