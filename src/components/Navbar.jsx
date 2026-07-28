import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Lock, 
  Menu, 
  X, 
  Sparkles,
  Wallet,
  Shirt,
  Award,
  Crown,
  Moon,
  Sun
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const {
    cartItemCount,
    setIsCartOpen,
    isAdminLoggedIn,
    setIsAdminModalOpen,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
  } = useShop();

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navCategories = [
    { id: 'Home', label: 'Home', icon: Sparkles },
    { id: 'Bags', label: 'Bags', icon: ShoppingBag },
    { id: 'Wallet', label: 'Wallet', icon: Wallet },
    { id: 'Jacket', label: 'Jacket', icon: Shirt },
    { id: 'Belt', label: 'Belt', icon: Award },
  ];

  const handleCategoryClick = (catId) => {
    if (catId === 'Home') {
      setActiveCategory('All');
      navigate('/');
    } else {
      setActiveCategory(catId);
      navigate(`/category/${catId}`);
    }
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      navigate('/admin');
    } else {
      setIsAdminModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
      {/* Top Banner */}
      {/* <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/10 py-1.5 px-4 text-center text-xs tracking-wider text-amber-200/90 font-medium">
        ✨ COMPLIMENTARY EXPRESS WORLDWIDE SHIPPING ON ORDERS OVER $200 | USE CODE <span className="text-amber-400 font-bold">LUXURY2026</span>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleCategoryClick('Home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif-brand text-xl sm:text-2xl font-bold tracking-widest text-white group-hover:text-amber-400 transition-colors">
                RIVA <span className="text-amber-400 font-light">CAIRO</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-slate-400 uppercase -mt-1">
                Leather Atelier
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navCategories.map((item) => {
              const Icon = item.icon;
              const isActive = (location.pathname === '/' && item.id === 'Home') ||
                               (location.pathname.startsWith('/category/') && activeCategory === item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input (Desktop) */}
            <div className="hidden lg:relative lg:flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search leather goods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 xl:w-56 bg-slate-900/80 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-200 group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center shadow-md animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Admin Dashboard Access */}
            <button
              onClick={handleAdminClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                location.pathname === '/admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : isAdminLoggedIn
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-amber-400'
              }`}
              title={isAdminLoggedIn ? "Access Admin Dashboard" : "Admin Login"}
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 md:hidden rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3 pt-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search bags, wallets, jackets, belts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fadeIn">
          {navCategories.map((item) => {
            const Icon = item.icon;
            const isActive = (location.pathname === '/' && item.id === 'Home') ||
                             (location.pathname.startsWith('/category/') && activeCategory === item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-amber-400" />
                  <span>{item.label}</span>
                </div>
                <span className="text-xs text-slate-500">Explore</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>{isAdminLoggedIn ? 'Go to Admin Dashboard' : 'Owner / Admin Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
