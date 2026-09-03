import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuX, LuShoppingBag, LuPlus, LuMinus, LuTrash2, LuArrowRight } from 'react-icons/lu';
import { useShop } from '../context/ShopContext';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    clearCart,
    getProductStock,
  } = useShop();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 3000;
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

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <div className="w-screen max-w-full sm:max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <LuShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-brand text-base  font-semibold text-slate-100">Your Shopping Bag</h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/80 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800/60">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">
                  {remainingForFreeShipping > 0 ? (
                    <>Add <span className="text-amber-400 font-semibold">{remainingForFreeShipping.toFixed(2)}</span> for Free Shipping</>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      🎉 You unlocked Free Express Shipping!
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
                    <LuShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="font-serif-brand text-base  font-semibold text-slate-300 mb-1">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-6">
                    Explore our Tuscany handcrafted leather collection and find your perfect bag, wallet, or jacket.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-amber-500 text-slate-950 text-xs font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const availableStock = getProductStock
                    ? getProductStock(item)
                    : (item.qtyStock ?? item.qty_stock ?? item.stock ?? 0);
                  const isOutOfStock = availableStock <= 0;
                  const isAtStockLimit = item.quantity >= availableStock;

                  return (
                    <div 
                      key={item.id}
                      className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-950 shrink-0"
                      />

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-500 hover:text-red-400 p-1 cursor-pointer shrink-0"
                              title="Remove"
                              aria-label="Remove item"
                            >
                              <LuTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-end justify-between mt-2">
                          <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-0.5">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-slate-400 hover:text-white cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <LuMinus className="w-3 h-3" />
                            </button>
                            <span 
                              data-testid="cart-item-qty"
                              className="w-6 text-center text-xs font-serif-brand font-semibold text-slate-200"
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              disabled={isOutOfStock || isAtStockLimit}
                              className={`p-1 rounded transition-colors ${
                                isAtStockLimit
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'text-slate-400 hover:text-white cursor-pointer'
                              }`}
                              aria-label="Increase quantity"
                              title={isOutOfStock ? 'Sold Out' : isAtStockLimit ? 'Stock limit reached' : 'Increase quantity'}
                            >
                              <LuPlus className="w-3 h-3" />
                            </button>
                            {isOutOfStock && (
                              <span className="ml-1 text-[9px] font-semibold text-red-400 whitespace-nowrap">
                                Sold Out
                              </span>
                            )}
                          </div>

                          <span className="text-sm font-semibold text-amber-400 font-serif-brand font-serif-brand">
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 space-y-3 sm:space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-200 font-serif-brand">{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Shipping</span>
                    <span className="text-emerald-400 font-medium">
                      {remainingForFreeShipping === 0 ? 'FREE' : '50.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-slate-100 pt-2 border-t border-slate-800">
                    <span>Total Amount</span>
                    <span className="text-amber-400 font-serif-brand  sm:text-xl">
                      {(cartSubtotal + (remainingForFreeShipping === 0 ? 0 : 50)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <LuArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
                  >
                    Clear Shopping Bag
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};
