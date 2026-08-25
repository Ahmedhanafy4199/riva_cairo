import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuCrown,
  LuShieldCheck,
  LuArrowRight,
  LuTruck,
  LuMail,
  LuSparkles,
  LuCircleCheck,
  LuCircleAlert,
  LuCircleX,
  LuX,
  LuGlobe,
  LuDroplets,
  LuShirt,
  LuPackage,
  LuRefreshCw,
  LuCheck,
} from "react-icons/lu";
import { useShop } from "../context/ShopContext";
import { useTheme } from "../context/ThemeContext";
import { FaWhatsapp } from "react-icons/fa";
import logoImage from "../assets/logo.png";

export const Footer = () => {
  const { setActiveCategory, isAdminLoggedIn, setIsAdminModalOpen, showToast } =
    useShop();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Active modal state: 'care' | 'returns' | 'shipping' | 'currency' | null
  const [activeModal, setActiveModal] = useState(null);

  // Currency & Region state
  const [selectedRegion, setSelectedRegion] = useState({
    code: "EGP",
    symbol: "ج.م",
    name: "Egypt (مصر)",
    flag: "🇪🇬",
  });

  const availableRegions = [
    { code: "EGP", symbol: "ج.م", name: "Egypt (مصر)", flag: "🇪🇬" },
    {
      code: "SAR",
      symbol: "ر.س",
      name: "Saudi Arabia (المملكة العربية السعودية)",
      flag: "🇸🇦",
    },
    {
      code: "AED",
      symbol: "د.إ",
      name: "United Arab Emirates (الإمارات)",
      flag: "🇦🇪",
    },
    { code: "KWT", symbol: "د.ك", name: "Kuwait (الكويت)", flag: "🇰🇼" },
    {
      code: "USD",
      symbol: "$",
      name: "United States / International (USD)",
      flag: "🇺🇸",
    },
    { code: "EUR", symbol: "€", name: "European Union (EUR)", flag: "🇪🇺" },
  ];

  const handleSelectCategory = (catId) => {
    const targetCategory = catId === "Home" ? "All" : catId;
    setActiveCategory(targetCategory);
    navigate(catId === "Home" ? "/" : `/category/${targetCategory}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      navigate("/admin");
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText("riva.cairo@gmail.com");
    showToast("Email address riva.cairo@gmail.com copied to clipboard!", "info");
  };

  const careInstructionsList = [
    {
      icon: LuCircleX,
      text: "Don't wash it in a washing machine",
      ar: "عدم الغسيل في الغسالة الأوتوماتيك",
    },
    { icon: LuCircleX, text: "No ironing", ar: "عدم استخدام المكواة" },
    {
      icon: LuDroplets,
      text: "No excessive amount of water",
      ar: "تجنب التعرض للمياه بكثرة",
    },
    {
      icon: LuPackage,
      text: "Keep it in its dust bag while not using",
      ar: "احفظ المنتج داخل حقيبة القماش (Dust Bag) عند عدم الاستخدام",
    },
    {
      icon: LuCircleX,
      text: "No bleach",
      ar: "عدم استخدام المبيضات أو المواد الكيميائية",
    },
    {
      icon: LuShirt,
      text: "Send it to the dry clean",
      ar: "التنظيف الجاف فقط (Dry Clean)",
    },
    {
      icon: LuSparkles,
      text: "Clean it with a soft / microfiber - slightly wet towel",
      ar: "التنظيف بفوطة مايكروفايبر ناعمة ومبللة خفيفاً",
    },
  ];

  const returnPolicyList = [
    {
      icon: LuCircleAlert,
      text: "Packages are not allowed to be open",
      highlight: true,
      ar: "غير مسموح بفتح الشحنة قبل الاستلام والدفع",
    },
    {
      icon: LuMail,
      text: "If you want to exchange or refund your order please contact us on riva.cairo@gmail.com",
      ar: "لطلب الاستبدال أو الإرجاع يرجى التواصل عبر البريد الإلكتروني",
    },
    {
      icon: LuPackage,
      text: "There is no partial delivery either take the whole order or return all items",
      ar: "لا يوجد تسليم جزئي، إما استلام الطلب بالكامل أو إرجاعه بالكامل",
    },
    {
      icon: LuCircleX,
      text: "Sending more than one option to choose between them unfortunately is not an option",
      ar: "إرسال أكثر من مقاس أو موديل للاختيار بينهم غير متاح",
    },
    {
      icon: LuRefreshCw,
      text: "Refund / Exchange are done within Three days only after receiving the order",
      highlight: true,
      ar: "طلب الإرجاع أو الاستبدال يتم خلال 3 أيام فقط من استلام الطلب",
    },
    {
      icon: LuTruck,
      text: "Shipping fees should be paid in all cases",
      ar: "مصاريف الشحن تدفع في جميع الأحوال",
    },
    {
      icon: LuCircleAlert,
      text: "Deduction of Extra Delivery fees in case of Return / Exchange",
      ar: "خصم رسوم الشحن الإضافية عند الإرجاع أو الاستبدال",
    },
    {
      icon: LuCircleX,
      text: "Items on sale can't be exchanged or refunded",
      ar: "المنتجات المخفضة (Sale) غير قابلة للاستبدال أو الإرجاع",
    },
    {
      icon: LuCircleCheck,
      text: "Items should be in its original state and packaging",
      ar: "يجب أن تكون المنتجات بحالتها وأغلفتها الأصلية",
    },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-900 text-slate-400 text-xs selection:bg-amber-500 selection:text-slate-950">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand Col (4 Cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
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
                <Link
                  to="/"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className={`font-serif-brand text-xl sm:text-2xl font-bold tracking-widest transition-colors ${
                    theme === "light"
                      ? "text-slate-300 hover:text-amber-400"
                      : "text-white hover:text-amber-400"
                  }`}
                >
                  Riva
                  {/* <span className="text-amber-400 font-light"> CAIRO</span> */}
                </Link>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed font-light text-xs max-w-sm">
              Crafting timeless luxury leather goods, bespoke bags, jackets,
              wallets, and belts. Handcrafted with passion and meticulous
              attention to detail in Cairo.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/riva.cairo?igsi=MXF4aDY1dmh5NzFlMw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 hover:scale-105 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/riva.cairo?rdid=YHijmHLOpuJp6Tzf&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19LQXtB2Ne%2F#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 hover:scale-105 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://wa.me/201037650495"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:scale-105 transition-all"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Departments (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-brand text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleSelectCategory("Bags")}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  Handcrafted Bags
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSelectCategory("Wallets")}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0"></span>
                  Leather Wallets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSelectCategory("Jackets")}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0"></span>
                  Lambskin Jackets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSelectCategory("Belts")}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0"></span>
                  Artisan Belts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSelectCategory("Home")}
                  className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-medium pt-1"
                >
                  <span>Explore All Products</span>
                  <LuArrowRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-brand text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2">
              Customer Care & Policy
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => setActiveModal("care")}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:text-amber-400 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <LuSparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                      Care Instructions
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 uppercase font-semibold">
                    View
                  </span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveModal("returns")}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:text-amber-400 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <LuRefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                      Refund & Exchange Policy
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 uppercase font-semibold">
                    View
                  </span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveModal("shipping")}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:text-amber-400 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <LuTruck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                      Shipping & Delivery Times
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 uppercase font-semibold">
                    View
                  </span>
                </button>
              </li>

              <li className="pt-1">
                <button
                  onClick={handleAdminClick}
                  className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
                >
                  <LuShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Store Administration Access</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Email Subscription & Currency (3 Cols) */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="font-serif-brand text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2">
              Country / Region & Currency
            </h4>

            {/* Region / Currency Selector */}
            <div>
              <button
                onClick={() => setActiveModal("currency")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition-all text-xs font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">
                    {selectedRegion.flag}
                  </span>
                  <span className="font-mono font-semibold text-amber-400 shrink-0">
                    {selectedRegion.code}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300 truncate">
                    {selectedRegion.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0 ml-1">
                  Change
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-light">
          <div className="flex items-center gap-2">
            <span>© 2026,</span>
            <Link
              to="/"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="text-slate-200 font-bold hover:text-amber-400 transition-colors"
            >
              RIVA CAIRO
            </Link>
            <span>• All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS */}
      {/* ======================================================== */}

      {/* Care Instructions Modal */}
      {activeModal === "care" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl space-y-5 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <LuSparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-white">
                  Care Instructions
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  تعليمات العناية والاعتناء بمنتجات RIVA CAIRO
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed font-light">
              "Each item is crafted with love and care so please read the
              following instructions to ensure it stays in its best condition:"
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {careInstructionsList.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-200 font-medium">
                        {item.text}
                      </p>
                      <p className="text-[11px] text-slate-400 font-light">
                        {item.ar}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
              <span className="text-slate-500 text-[11px] truncate">
                RIVA CAIRO Leather Guarantee
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Close & Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return & Exchange Policy Modal */}
      {activeModal === "returns" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl space-y-5 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <LuRefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-white">
                  Return & Refund Policy
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  سياسة الإرجاع والاستبدال الشاملة
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {returnPolicyList.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border transition-colors ${
                      item.highlight
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-950/60 border-slate-800/80"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${item.highlight ? "text-amber-400" : "text-slate-400"}`}
                    />
                    <div className="space-y-0.5 flex-1">
                      <p
                        className={`text-xs font-medium ${item.highlight ? "text-amber-300 font-semibold" : "text-slate-200"}`}
                      >
                        {item.text}
                      </p>
                      <p className="text-[11px] text-slate-400 font-light">
                        {item.ar}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LuMail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs">
                  For inquiries:{" "}
                  <strong className="text-white">riva.cairo@gmail.com</strong>
                </span>
              </div>
              <button
                onClick={copyEmailToClipboard}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer self-stretch sm:self-auto text-center"
              >
                Copy Email
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping & Delivery Modal */}
      {activeModal === "shipping" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl space-y-5 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <LuTruck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-white">
                  Shipping & Delivery
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  مواعيد وتفاصيل الشحن والتوصيل
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <LuPackage className="w-4 h-4 shrink-0" />
                  <span>Delivery inside Cairo / Giza</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  2-4 business days (3-4 days max)
                </p>
                <p className="text-[11px] text-slate-400">
                  التوصيل داخل القاهرة والجيزة يستغرق من 2 إلى 4 أيام عمل.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <LuGlobe className="w-4 h-4 shrink-0" />
                  <span>Delivery to Other Governorates</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  5-6 business days
                </p>
                <p className="text-[11px] text-slate-400">
                  التوصيل لباقي المحافظات يستغرق من 5 إلى 6 أيام عمل.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                <p className="font-semibold mb-1">
                  🚚 Cash on Delivery Available
                </p>
                <p className="text-[11px] text-emerald-400/80">
                  You pay upon receiving your package safely at your doorstep.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency & Region Selector Modal */}
      {activeModal === "currency" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <LuGlobe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-white">
                  Select Region & Currency
                </h3>
                <p className="text-xs text-slate-400">
                  Choose your preferred country and currency
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {availableRegions.map((region) => {
                const isSelected = selectedRegion.code === region.code;
                return (
                  <button
                    key={region.code}
                    onClick={() => {
                      setSelectedRegion(region);
                      setActiveModal(null);
                      showToast(
                        `Currency updated to ${region.code} (${region.symbol})`,
                        "success",
                      );
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{region.flag}</span>
                      <div className="text-left">
                        <div className="text-xs font-semibold">
                          {region.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {region.code} • {region.symbol}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <LuCheck className="w-4 h-4 text-amber-400 font-bold shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
