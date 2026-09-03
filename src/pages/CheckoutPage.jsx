import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuArrowLeft,
  LuCircleCheck,
  LuShieldCheck,
  LuCreditCard,
  LuTruck,
  LuBanknote,
  LuShoppingBag,
} from 'react-icons/lu';
import { useShop } from '../context/ShopContext';

export const CheckoutPage = () => {
  const { cart, cartSubtotal, placeOrder } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    paymentMethod: 'Cash on Delivery',
  });

  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState('');

  const shippingFee = cartSubtotal >= 3000 ? 0 : 50;
  const totalAmount = cartSubtotal + shippingFee;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError('Please fill in all required shipping details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeOrder(form);
      if (order) {
        setConfirmedOrder(order);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

      }
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="py-16 sm:py-20 text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
          <LuShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h2 className="font-serif-brand text-xl sm:text-2xl font-semibold text-slate-300">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Add some products before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/category/All')}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn pb-12 sm:pb-16">
      {/* {!confirmedOrder && (
        <button
          onClick={() => navigate('/category/All')}
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-amber-400 transition-colors group cursor-pointer"
        >
          <LuArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Cart</span>
        </button>
      )} */}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 pt-14 sm:p-6 sm:pt-16  flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <LuShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-brand  sm:text-xl font-semibold text-slate-100">Checkout & Delivery</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Complete your order details below</p>
          </div>
        </div>

        {confirmedOrder ? (
          <div className="p-5 sm:p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <LuCircleCheck className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <span className="text-[11px] sm:text-xs text-emerald-400 font-semibold tracking-widest uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                Order Confirmed
              </span>
              <h2 className="font-serif-brand text-xl sm:text-2xl font-semibold text-slate-100 mt-3">
                Thank You, {confirmedOrder.customerName}!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Order Reference Code:{' '}
                <span className="font-serif-brand text-amber-400 font-semibold">{confirmedOrder.id}</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-left space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:justify-between text-slate-400 border-b border-slate-800 pb-2 gap-1">
                <span>Shipping Address</span>
                <span className="text-slate-200 font-medium text-right sm:text-left">
                  {confirmedOrder.address}, {confirmedOrder.city}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Contact Phone</span>
                <span className="text-slate-200 font-serif-brand">{confirmedOrder.phone}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Payment Method</span>
                <span className="text-amber-400 font-semibold">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-100 pt-1">
                <span>Total Paid / Due</span>
                <span className="text-amber-400 font-serif-brand ">
                  {confirmedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              We have received your order. Redirecting you to home page...
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Cart Items Preview */}
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Order Items ({cart.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 font-serif-brand shrink-0">
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <LuTruck className="w-4 h-4 shrink-0" />
                1. Shipping Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01123456789"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Building, street, apartment details"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City / Governorate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cairo, Giza, Alexandria"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="Optional email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <LuCreditCard className="w-4 h-4 shrink-0" />
                2. Payment Method
              </h3>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.paymentMethod === 'Cash on Delivery'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={form.paymentMethod === 'Cash on Delivery'}
                  onChange={() => setForm({ ...form, paymentMethod: 'Cash on Delivery' })}
                  className="hidden"
                />
                <LuBanknote className="w-4 h-4 shrink-0" />
                <span className="text-xs">Cash on Delivery (الدفع عند الاستلام)</span>
              </label>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items ({cart.length})</span>
                <span className="font-serif-brand text-slate-200">{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span className="text-emerald-400">{shippingFee === 0 ? 'FREE' : '50.00'}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Order Total</span>
                <span className="text-amber-400 font-serif-brand ">{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Place Order ({totalAmount.toFixed(2)})</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
