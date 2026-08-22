import React from 'react';
import { LuCircleCheck, LuCircleAlert, LuInfo } from 'react-icons/lu';
import { useShop } from '../context/ShopContext';

export const Toast = () => {
  const { toast } = useShop();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex justify-center sm:justify-end pointer-events-none transition-all duration-300">
      <div className={`pointer-events-auto flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-md border max-w-sm sm:max-w-md w-full sm:w-auto animate-fadeIn ${
        isSuccess 
          ? 'bg-slate-900/95 text-amber-400 border-amber-500/40 shadow-amber-500/10' 
          : isError 
            ? 'bg-red-950/95 text-red-300 border-red-500/40 shadow-red-500/10' 
            : 'bg-slate-900/95 text-slate-200 border-slate-700 shadow-slate-900/50'
      }`}>
        {isSuccess && <LuCircleCheck className="w-5 h-5 text-amber-400 shrink-0" />}
        {isError && <LuCircleAlert className="w-5 h-5 text-red-400 shrink-0" />}
        {!isSuccess && !isError && <LuInfo className="w-5 h-5 text-blue-400 shrink-0" />}
        
        <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
      </div>
    </div>
  );
};
