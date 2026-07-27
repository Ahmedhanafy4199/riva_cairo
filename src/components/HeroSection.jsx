import React from 'react';
import { 
  ShoppingBag, 
  Wallet, 
  Shirt, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Gem 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HeroSection = ({ onSelectCategory }) => {
  const { products } = useShop();

  const categoryHighlights = [
    {
      id: 'Bags',
      title: 'Leather Bags',
      subtitle: 'Weekenders, Totes & Satchels',
      count: products.filter(p => p.category === 'Bags').length,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      icon: ShoppingBag
    },
    {
      id: 'Wallet',
      title: 'Wallets & Clips',
      subtitle: 'RFID Bifolds & Long Wallets',
      count: products.filter(p => p.category === 'Wallet').length,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      icon: Wallet
    },
    {
      id: 'Jacket',
      title: 'Leather Jackets',
      subtitle: 'Bikers, Bombers & Shearlings',
      count: products.filter(p => p.category === 'Jacket').length,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      icon: Shirt
    },
    {
      id: 'Belt',
      title: 'Artisan Belts',
      subtitle: 'Full-Grain Dress & Casual Belts',
      count: products.filter(p => p.category === 'Belt').length,
      image: 'https://images.unsplash.com/photo-1624222247344-550fb8ec5522?auto=format&fit=crop&w=800&q=80',
      icon: Award
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* Main Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80"
            alt="Riva Cairo Atelier"
            className="w-full h-full object-cover object-center opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-3xl px-6 py-16 sm:px-12 sm:py-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Tuscan Leather Heritage</span>
          </div>

          <h1 className="font-serif-brand text-4xl sm:text-6xl font-extrabold text-slate-100 leading-[1.1] tracking-tight">
            Crafted for Those Who Value <span className="gold-gradient-text">Perfection</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-xl">
            Discover our luxury collection of handcrafted Italian full-grain leather <strong className="text-amber-400 font-normal">Bags, Wallets, Jackets</strong> and <strong className="text-amber-400 font-normal">Belts</strong>. Unmatched durability meets timeless sophistication.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onSelectCategory('All')}
              className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform active:scale-98"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectCategory('Bags')}
              className="px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-sm font-semibold transition-all backdrop-blur-md"
            >
              View Bags Collection
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-slate-900/60 border-t border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-2">
            <Gem className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">100% Full-Grain Leather</h4>
              <p className="text-[10px] text-slate-400">Vegetable tanned in Florence</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Lifetime Craftsmanship Warranty</h4>
              <p className="text-[10px] text-slate-400">Guaranteed for generations</p>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-2">
            <Truck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">Worldwide Express Delivery</h4>
              <p className="text-[10px] text-slate-400">Tracked shipping to your door</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Curated Catalog</span>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Explore Our Signature Departments
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryHighlights.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative h-72 rounded-3xl overflow-hidden border border-slate-800/80 cursor-pointer shadow-lg hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 backdrop-blur-md">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {cat.count} Items
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif-brand text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-light mt-1">
                      {cat.subtitle}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mt-3 group-hover:translate-x-1 transition-transform">
                      <span>Shop {cat.id}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
