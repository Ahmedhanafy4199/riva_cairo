import React from 'react';
import { Crown, Mail, Phone, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer = ({ onSelectCategory, onAdminClick }) => {
  const { setActiveCategory } = useShop();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <span className="font-serif-brand text-2xl font-bold tracking-widest text-white">
                RIVA <span className="text-amber-400 font-light">CAIRO</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed font-light max-w-sm">
              Handcrafting premium full-grain leather Bags, Wallets, Jackets, and Belts. Designed in Cairo & Florence for timeless distinction.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-300">
              <a href="#" aria-label="Instagram" className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:text-amber-400 hover:border-amber-500/40 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:text-amber-400 hover:border-amber-500/40 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Departments */}
          <div className="space-y-3">
            <h4 className="font-serif-brand text-sm font-bold text-slate-100 uppercase tracking-wider">
              Departments
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => { setActiveCategory('Bags'); onSelectCategory('Category'); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Handcrafted Bags
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveCategory('Wallet'); onSelectCategory('Category'); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Leather Wallets
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveCategory('Jacket'); onSelectCategory('Category'); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Lambskin Jackets
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveCategory('Belt'); onSelectCategory('Category'); }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Artisan Belts
                </button>
              </li>
            </ul>
          </div>

          {/* Store Links */}
          <div className="space-y-3">
            <h4 className="font-serif-brand text-sm font-bold text-slate-100 uppercase tracking-wider">
              Store Access
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onSelectCategory('Home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home Page
                </button>
              </li>
              <li>
                <button 
                  onClick={onAdminClick}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
              <li><span className="text-slate-500">Shipping & Returns</span></li>
              <li><span className="text-slate-500">Lifetime Warranty</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-serif-brand text-sm font-bold text-slate-100 uppercase tracking-wider">
              Join VIP Atelier
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Subscribe for exclusive limited edition releases and private showcase invites.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 RIVA CAIRO Atelier. All rights reserved. Premium Leather Goods.
          </div>

          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
