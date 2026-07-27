import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateCartQuantity, 
    cartSubtotal,
    clearCart
  } = useShop();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 200;
  const shippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div 
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fadeIn"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-brand text-lg font-bold text-slate-100">Your Shopping Bag</h2>
                  <p className="text-xs text-slate-400">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="bg-slate-900/80 px-6 py-3 border-b border-slate-800/60">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">
                  {remainingForFreeShipping > 0 ? (
                    <>Add <span className="text-amber-400 font-bold">${remainingForFreeShipping.toFixed(2)}</span> for Free Shipping</>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      🎉 You unlocked Free Express Shipping!
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="font-serif-brand text-lg font-bold text-slate-300 mb-1">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-6">
                    Explore our Tuscany handcrafted leather collection and find your perfect bag, wallet, or jacket.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex gap-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-20 h-20 rounded-xl object-cover bg-slate-950 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center border border-slate-800 bg-slate-950 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-amber-400 font-serif-brand">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-800/80 bg-slate-900/60 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-200 font-mono">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Shipping</span>
                    <span className="text-emerald-400 font-medium">
                      {remainingForFreeShipping === 0 ? 'FREE' : '$15.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
                    <span>Total Amount</span>
                    <span className="text-amber-400 font-serif-brand text-xl">
                      ${(cartSubtotal + (remainingForFreeShipping === 0 ? 0 : 15)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-300"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    Clear Shopping Bag
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}
    </>
  );
};
