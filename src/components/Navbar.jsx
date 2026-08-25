import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LuShoppingBag,
  LuSearch,
  LuShieldCheck,
  LuLock,
  LuMenu,
  LuX,
  LuSparkles,
  LuWallet,
  LuShirt,
  LuAward,
  LuCrown,
  LuMoon,
  LuSun,
} from "react-icons/lu";
import { useShop } from "../context/ShopContext";
import { useTheme } from "../context/ThemeContext";
import logoImage from "../assets/logo.png";

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
    hasUnreadOrders,
  } = useShop();

  const showRedDot = Boolean(isAdminLoggedIn && hasUnreadOrders);

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navCategories = [
    { id: "Home", label: "Home", icon: LuSparkles },
    { id: "Bags", label: "Bags", icon: LuShoppingBag },
    { id: "Wallets", label: "Wallets", icon: LuWallet },
    { id: "Jackets", label: "Jackets", icon: LuShirt },
    { id: "Belts", label: "Belts", icon: LuAward },
  ];

  const handleCategoryClick = (catId) => {
    if (catId === "Home") {
      setActiveCategory("All");
      navigate("/");
    } else {
      setActiveCategory(catId);
      navigate(`/category/${catId}`);
    }
    setMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (location.pathname === "/admin") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else if (isAdminLoggedIn) {
      navigate("/admin");
    } else {
      setIsAdminModalOpen(true);
    }

    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Logo */}
            <div
              onClick={() => {
                handleCategoryClick("Home");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-[#D99A1A] p-0.5 shadow-lg shadow-[#D99A1A]/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <div className="w-full h-full rounded-[10px] overflow-hidden">
                  <img
                    src={logoImage}
                    alt="RIVA CAIRO"
                    className="w-full h-full object-contain rounded-[10px] block"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-serif-brand text-lg sm:text-2xl font-bold tracking-wider sm:tracking-widest transition-colors ${
                    theme === "light"
                      ? "text-slate-300 group-hover:text-amber-400"
                      : "text-white group-hover:text-amber-400"
                  }`}
                >
                  RIVA
                  {/* <span className="text-amber-400 font-light">CAIRO</span> */}
                </span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <nav
              aria-label="Desktop Navigation"
              className="hidden md:flex items-center space-x-1 lg:space-x-2"
            >
              {navCategories.map((item) => {
                const Icon = item.icon;
                const isActive =
                  (location.pathname === "/" && item.id === "Home") ||
                  (location.pathname.startsWith("/category/") &&
                    activeCategory === item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleCategoryClick(item.id)}
                    className={`flex items-center gap-2 px-3 lg:px-3.5 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions & Utilities */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Input (Desktop) */}
              <div className="hidden lg:relative lg:flex items-center">
                <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search leather goods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 xl:w-56 bg-slate-900/80 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-200 group cursor-pointer shrink-0"
                aria-label="Shopping Cart"
              >
                <LuShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 sm:min-w-5 sm:h-5 px-1 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-md animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <LuMoon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <LuSun className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Admin Dashboard Access */}
              <button
                onClick={handleAdminClick}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shrink-0 ${
                  location.pathname === "/admin"
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                    : isAdminLoggedIn
                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
                      : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-amber-400"
                }`}
                title={
                  showRedDot
                    ? `New client order(s) placed!`
                    : isAdminLoggedIn
                      ? "Access Admin Dashboard"
                      : "Admin Login"
                }
              >
                {/* Red Order Notification Dot */}
                {showRedDot && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-950"></span>
                  </span>
                )}

                {isAdminLoggedIn ? (
                  <>
                    <LuShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </>
                ) : (
                  <>
                    <LuLock className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile navigation"
                className="relative p-2 md:hidden rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                {showRedDot && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-slate-950"></span>
                  </span>
                )}

                {mobileMenuOpen ? (
                  <LuX className="w-5 h-5" />
                ) : (
                  <LuMenu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden pb-3 pt-0.5">
            <div className="relative flex items-center">
              <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
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
      </header>

      {/* ── Mobile Nav Drawer — slides in from the right as a fixed overlay ── */}

      {/* Backdrop */}
      <div
        data-testid="mobile-backdrop"
        className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen ? "" : undefined}
        data-testid="mobile-nav-drawer"
        className={`fixed top-0 right-0 h-full w-full z-50 bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/50 shrink-0">
          <span className="font-serif-brand text-base font-bold text-slate-100 tracking-widest">
            MENU
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            tabIndex={mobileMenuOpen ? 0 : -1}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav
          aria-label="Mobile Navigation"
          className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        >
          {navCategories.map((item) => {
            const Icon = item.icon;
            const isActive =
              (location.pathname === "/" && item.id === "Home") ||
              (location.pathname.startsWith("/category/") &&
                activeCategory === item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
                tabIndex={mobileMenuOpen ? 0 : -1}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Button */}
        <div className="px-4 py-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleAdminClick}
            tabIndex={mobileMenuOpen ? 0 : -1}
            className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-sm cursor-pointer"
          >
            {showRedDot && (
              <span className="absolute top-2.5 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-950"></span>
              </span>
            )}
            <LuLock className="w-4 h-4" />
            <span>
              {isAdminLoggedIn
                ? "Go to Admin Dashboard"
                : "Owner / Admin Login"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
