import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Toast = () => {
  const { toast } = useShop();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all duration-300">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md border ${
        isSuccess 
          ? 'bg-slate-900/95 text-amber-400 border-amber-500/40 shadow-amber-500/10' 
          : isError 
            ? 'bg-red-950/95 text-red-300 border-red-500/40 shadow-red-500/10' 
            : 'bg-slate-900/95 text-slate-200 border-slate-700 shadow-slate-900/50'
      }`}>
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        
        <p className="text-sm font-medium pr-2">{toast.message}</p>
      </div>
    </div>
  );
};
