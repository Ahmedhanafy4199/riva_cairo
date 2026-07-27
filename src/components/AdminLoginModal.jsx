import React, { useState } from 'react';
import { X, Lock, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AdminLoginModal = ({ onLoginSuccess }) => {
  const { isAdminModalOpen, setIsAdminModalOpen, loginAdmin } = useShop();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const success = loginAdmin(pin);
    if (success) {
      setPin('');
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError('Invalid Access Code. Default passcode is: 1234');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-slate-950">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-slate-950/60 relative">
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="font-serif-brand text-xl font-bold text-slate-100">
            Store Owner Authentication
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Restricted Admin Portal - Riva Cairo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span>Enter Security PIN / Password</span>
              <span className="text-[10px] text-amber-400/80 font-mono">Demo PIN: 1234</span>
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter PIN (e.g. 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Unlock Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            🔒 Only authorized personnel may manage inventory, pricing, and customer orders.
          </p>
        </form>

      </div>
    </div>
  );
};
