import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartDrawer } from './components/CartDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { useShop } from './context/ShopContext';
import { ScrollToTop } from './components/ScrollToTop';

const AdminRouteGuard = () => {
  const { isAdmin, isAuthLoading } = useShop();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs ">Verifying owner credentials...</span>
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />;
};

const MainAppContent = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-5 sm:pb-8">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin" element={<AdminRouteGuard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <CartDrawer />
      <SearchModal />
      <AdminLoginModal />
      <Toast />

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ShopProvider>
          <MainAppContent />
        </ShopProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
