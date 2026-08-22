import React from "react";
import {
  LuShoppingBag,
  LuWallet,
  LuShirt,
  LuAward,
  LuSparkles,
  LuArrowRight,
  LuShieldCheck,
  LuTruck,
  LuGem,
} from "react-icons/lu";
import bagImage from "../assets/bag.jpg";
import walletImage from "../assets/wallet.jpg";
import jacketImage from "../assets/jacket.avif";
import beltImage from "../assets/belt.jpg";
import heroCoverImage from "../assets/banner.jpg";
import { useShop, matchCategory } from "../context/ShopContext";

export const HeroSection = ({ onSelectCategory }) => {
  const { products } = useShop();

  const categoryHighlights = [
    {
      id: "Bags",
      title: "Leather Bags",
      subtitle: "Weekenders, Totes & Satchels",
      count: products.filter((p) => matchCategory(p.category, "Bags")).length,
      image: bagImage,
      icon: LuShoppingBag,
    },
    {
      id: "Wallets",
      title: "Wallets",
      subtitle: "RFID Bifolds & Long Wallets",
      count: products.filter((p) => matchCategory(p.category, "Wallets"))
        .length,
      image: walletImage,
      icon: LuWallet,
    },
    {
      id: "Jackets",
      title: "Leather Jackets",
      subtitle: "Bikers, Bombers & Shearlings",
      count: products.filter((p) => matchCategory(p.category, "Jackets"))
        .length,
      image: jacketImage,
      icon: LuShirt,
    },
    {
      id: "Belts",
      title: "Belts",
      subtitle: "Full-Grain Dress & Casual Belts",
      count: products.filter((p) => matchCategory(p.category, "Belts")).length,
      image: beltImage,
      icon: LuAward,
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-8 sm:pb-12">
      {/* Main Hero Banner */}
      <section className="space-y-6">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950">
          <img
            src={heroCoverImage}
            alt="Riva Cairo Handcrafted Leather Collection"
            className="w-full h-auto block"
          />

          {/* Shop All Products Button */}
          <div className="absolute top-1/2 left-3 sm:left-6 md:left-10 -translate-y-1/2 px-2">
            <button
              onClick={() => onSelectCategory("All")}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 hover:text-amber-500 hover:border-amber-500/40 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap">
              <span>Shop All Products</span>
              <LuArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase">
              Curated Catalog
            </span>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Explore Our Signature Departments
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoryHighlights.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative h-64 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 cursor-pointer shadow-lg hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 backdrop-blur-md">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-300 border border-amber-500/30">
                      {cat.count} Items
                    </span>
                  </div>

                  <div>
                    {/* <h3 className="font-serif-brand text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {cat.title}
                    </h3> */}
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mt-2.5 group-hover:translate-x-1 transition-transform">
                      <span>Shop {cat.id}</span>
                      <LuArrowRight className="w-3.5 h-3.5" />
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
