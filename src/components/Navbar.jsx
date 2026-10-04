import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LuShoppingBag,
  LuSearch,
  LuMenu,
  LuX,
  LuSparkles,
  LuWallet,
  LuShirt,
  LuAward,
  LuCrown,
  LuMoon,
  LuSun,
  LuUser,
} from "react-icons/lu";
import { useShop } from "../context/ShopContext";
import { useTheme } from "../context/ThemeContext";
import logoImage from "../assets/logo.png";

export const Navbar = () => {
  const {
    cartItemCount,
    setIsCartOpen,
    setIsSearchOpen,
    isAdminLoggedIn,
    setIsAdminModalOpen,
    setActiveCategory,
    hasUnreadOrders,
  } = useShop();

  const showRedDot = Boolean(isAdminLoggedIn && hasUnreadOrders);

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navCategories = [
    { id: "Home", label: "Home", type: "nav", path: "/", icon: LuSparkles },
    { id: "Products", label: "Products", type: "nav", path: "/category/All", icon: LuShirt },
    { id: "Refund", label: "Refund/Exchange policy", type: "modal", modal: "returns", icon: LuAward },
    { id: "Shipping", label: "Shipping Policy", type: "modal", modal: "shipping", icon: LuWallet },
    { id: "Contact", label: "Contact us", type: "contact", icon: LuCrown },
  ];

  const handleCategoryClick = (item) => {
    if (item?.type === "modal") {
      window.dispatchEvent(new CustomEvent("open-footer-modal", { detail: item.modal }));
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800 shadow-md"
            : "bg-transparent text-slate-900 dark:text-slate-100 border-b border-transparent"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16">
          <div className="relative flex items-center justify-between h-16 sm:h-20">
            {/* Desktop Left: Navigation Links */}
            <nav
              aria-label="Desktop Navigation"
              className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs lg:text-sm font-normal"
            >
              {navCategories.map((item) => {
                const isActive =
                  (location.pathname === "/" && item.id === "Home") ||
                  (location.pathname.startsWith("/category/") && item.id === "Products");

                if (item.type === "nav") {
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setActiveCategory("All")}
                      className={`transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "text-slate-950 dark:text-white font-semibold border-b-2 border-slate-950 dark:border-white pb-0.5"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                if (item.type === "contact") {
                  return (
                    <a
                      key={item.id}
                      href="https://wa.me/201037650495"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {item.label}
                    </a>
                  );
                }

                if (item.type === "modal") {
                  return (
                    <Link
                      key={item.id}
                      to={`/?modal=${item.modal}`}
                      onClick={() => handleCategoryClick(item)}
                      className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleCategoryClick(item)}
                    className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Left: Menu & Search Next to Each Other */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile navigation"
                className="relative p-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-amber-400 cursor-pointer shrink-0 transition-colors"
              >
                {showRedDot && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                  </span>
                )}

                {mobileMenuOpen ? (
                  <LuX className="w-6 h-6" />
                ) : (
                  <LuMenu className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-amber-400 cursor-pointer shrink-0 transition-colors"
                aria-label="Search"
                title="Search products"
              >
                <LuSearch className="w-5 h-5" />
              </button>
            </div>

            {/* Center Column: Logo (Dead Center) */}
            <Link
              to="/"
              onClick={() => {
                setActiveCategory("All");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-[#D99A1A] p-0.5 shadow-md shadow-[#D99A1A]/10 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <div className="w-full h-full rounded-[9px] overflow-hidden">
                  <img
                    src={logoImage}
                    alt="RIVA CAIRO"
                    className="w-full h-full object-contain block"
                  />
                </div>
              </div>
              <span className="font-serif-brand  sm:text-2xl font-semibold tracking-wider sm:tracking-widest text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                RIVA
              </span>
            </Link>

            {/* Right Column: Actions & Utilities */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Desktop Search Trigger Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex p-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                aria-label="Search"
                title="Search products"
              >
                <LuSearch className="w-5 h-5" />
              </button>

              {/* Account / User Trigger Button */}
              {isAdminLoggedIn ? (
                <Link
                  to="/admin"
                  className="p-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0 relative block"
                  aria-label="Account"
                  title="Admin Panel"
                >
                  <LuUser className="w-5 h-5" />
                  {showRedDot && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="p-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0 relative block"
                  aria-label="Account"
                  title="Admin Login"
                >
                  <LuUser className="w-5 h-5" />
                </button>
              )}

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0 block"
                aria-label="Shopping Cart"
                title="Shopping Bag"
              >
                <LuShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-slate-900 dark:bg-amber-500 dark:text-slate-950 text-[10px] font-semibold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Desktop Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <LuMoon className="w-5 h-5" />
                ) : (
                  <LuSun className="w-5 h-5 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div
        data-testid="mobile-backdrop"
        className={`fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        data-testid="mobile-nav-drawer"
        className={`fixed inset-0 w-full h-full z-50 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
          <span className="font-serif-brand text-base font-semibold text-slate-950 dark:text-slate-100 tracking-widest">
            MENU
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            tabIndex={mobileMenuOpen ? 0 : -1}
            className="p-2 rounded-full text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav
          aria-label="Mobile Navigation"
          className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        >
          {navCategories.map((item) => {
            const Icon = item.icon;
            const isActive =
              (location.pathname === "/" && item.id === "Home") ||
              (location.pathname.startsWith("/category/") && item.id === "Products");

            if (item.type === "nav") {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setActiveCategory("All");
                    setMobileMenuOpen(false);
                  }}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold border border-slate-200 dark:border-slate-700"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 text-slate-950 dark:text-amber-400 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            if (item.type === "contact") {
              return (
                <a
                  key={item.id}
                  href="https://wa.me/201037650495"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
                >
                  <Icon className="w-5 h-5 text-slate-950 dark:text-amber-400 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            }

            if (item.type === "modal") {
              return (
                <Link
                  key={item.id}
                  to={`/?modal=${item.modal}`}
                  onClick={() => handleCategoryClick(item)}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
                >
                  <Icon className="w-5 h-5 text-slate-950 dark:text-amber-400 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item)}
                tabIndex={mobileMenuOpen ? 0 : -1}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold border border-slate-200 dark:border-slate-700"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 text-slate-950 dark:text-amber-400 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer Actions: Dark Mode Switch & Admin/Log In */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 space-y-2.5">
          {/* Light Mode / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            tabIndex={mobileMenuOpen ? 0 : -1}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {theme === "light" ? (
                <LuMoon className="w-4 h-4 text-slate-700" />
              ) : (
                <LuSun className="w-4 h-4 text-amber-400" />
              )}
              <span>{theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono font-semibold">
              {theme === "light" ? "LIGHT" : "DARK"}
            </span>
          </button>

          {/* Account Log In / Admin Button */}
          {isAdminLoggedIn ? (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="relative w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-medium text-xs sm:text-sm cursor-pointer shadow-sm hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors"
            >
              <LuUser className="w-4 h-4" />
              {showRedDot && (
                <span className="absolute top-2.5 right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                </span>
              )}
              <span>Go to Admin Dashboard</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setIsAdminModalOpen(true);
                setMobileMenuOpen(false);
              }}
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="relative w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-medium text-xs sm:text-sm cursor-pointer shadow-sm hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors"
            >
              <LuUser className="w-4 h-4" />
              <span>Log in</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
