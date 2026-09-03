import React, { useState } from 'react';
import { LuX, LuLock, LuShieldAlert, LuKeyRound, LuMail, LuArrowRight, LuLoader } from 'react-icons/lu';
import { useShop } from '../context/ShopContext';

export const AdminLoginModal = () => {
  const { isAdminModalOpen, setIsAdminModalOpen, loginAdmin } = useShop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdminModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        setEmail('');
        setPassword('');
      } else {
        setError(result.message || 'Invalid Email or Password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-950">
        
        {/* Header */}
        <div className="p-5 sm:p-6 text-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 relative">
          <button
            onClick={() => {
              setError('');
              setIsAdminModalOpen(false);
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <LuX className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10 shrink-0">
            <LuLock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <h3 className="font-serif-brand  sm:text-xl font-semibold text-slate-100">
            Store Owner Authentication
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your Admin credentials to access the store dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
              <LuShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              <span>Admin Email Address</span>
            </label>
            <div className="relative flex items-center">
              <LuMail className="w-5 h-5 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                autoFocus
                placeholder="admin@rivacairo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              <span>Admin Password</span>
            </label>
            <div className="relative flex items-center">
              <LuKeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LuLoader className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Unlock Admin Panel</span>
                <LuArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
