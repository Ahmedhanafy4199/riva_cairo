import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductsPage } from './pages/ProductsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ArrowRight, Sparkles, ShoppingBag, Wallet, Shirt, Award } from 'lucide-react';

const MainAppContent = () => {
  const [currentTab, setCurrentTab] = useState('Home'); // 'Home', 'Category', 'Admin'
  const { 
    products, 
    activeCategory, 
    setActiveCategory, 
    isAdminLoggedIn, 
    setIsAdminModalOpen,
    searchQuery,
    setSearchQuery 
  } = useShop();

  const handleSelectCategory = (catId) => {
    if (catId === 'Home') {
      setCurrentTab('Home');
      setActiveCategory('All');
    } else if (catId === 'All') {
      setCurrentTab('Category');
      setActiveCategory('All');
    } else {
      setCurrentTab('Category');
      setActiveCategory(catId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setCurrentTab('Admin');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleEditProductFromCard = (product) => {
    setCurrentTab('Admin');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Main Page Routing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: HOME PAGE */}
        {currentTab === 'Home' && (
          <div className="space-y-16 animate-fadeIn">
            
            {/* Hero Section */}
            <HeroSection onSelectCategory={handleSelectCategory} />

            {/* Featured Products Grid */}
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
                    onEdit={handleEditProductFromCard}
                  />
                ))}
              </div>
            </section>

            {/* Category Showcase Sections */}
            {['Bags', 'Wallet', 'Jacket', 'Belt'].map((catName) => {
              const catProducts = products.filter(p => p.category === catName);
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
                        onEdit={handleEditProductFromCard}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

          </div>
        )}

        {/* TAB 2: CATEGORY / PRODUCTS PAGE */}
        {currentTab === 'Category' && (
          <ProductsPage onEditProduct={handleEditProductFromCard} />
        )}

        {/* TAB 3: ADMIN DASHBOARD */}
        {currentTab === 'Admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard />
          ) : (
            <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
              <h2 className="font-serif-brand text-2xl font-bold text-slate-100">
                Restricted Admin Access
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You must enter the security passcode to access the Store Management Dashboard.
              </p>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg"
              >
                Enter Admin PIN Code (1234)
              </button>
            </div>
          )
        )}

      </main>

      {/* Global Modals & Overlays */}
      <CartDrawer />
      <ProductModal />
      <AdminLoginModal onLoginSuccess={() => setCurrentTab('Admin')} />
      <Toast />

      {/* Footer */}
      <Footer 
        onSelectCategory={handleSelectCategory}
        onAdminClick={handleAdminClick}
      />
    </div>
  );
};

export function App() {
  return (
    <ShopProvider>
      <MainAppContent />
    </ShopProvider>
  );
}

export default App;
