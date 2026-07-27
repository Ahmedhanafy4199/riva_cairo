import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Truck, Banknote, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CheckoutModal = ({ onClose }) => {
  const { cart, cartSubtotal, placeOrder } = useShop();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    paymentMethod: 'Cash on Delivery'
  });

  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState('');

  const shippingFee = cartSubtotal >= 200 ? 0 : 15;
  const totalAmount = cartSubtotal + shippingFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError('Please fill in all required shipping details.');
      return;
    }

    const order = placeOrder(form);
    if (order) {
      setConfirmedOrder(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-brand text-xl font-bold text-slate-100">Checkout & Delivery</h2>
              <p className="text-xs text-slate-400">Complete your order details below</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Order Confirmation Screen */
          <div className="p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs text-emerald-400 font-semibold tracking-widest uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                Order Confirmed
              </span>
              <h3 className="font-serif-brand text-2xl font-bold text-slate-100 mt-3">
                Thank You, {confirmedOrder.customerName}!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Order Reference Code: <span className="font-mono text-amber-400 font-bold">{confirmedOrder.id}</span>
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-left space-y-3 text-xs">
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Shipping Address</span>
                <span className="text-slate-200 font-medium">{confirmedOrder.address}, {confirmedOrder.city}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Contact Phone</span>
                <span className="text-slate-200 font-mono">{confirmedOrder.phone}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Payment Method</span>
                <span className="text-amber-400 font-semibold">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 pt-1">
                <span>Total Paid / Due</span>
                <span className="text-amber-400 font-serif-brand text-lg">${confirmedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              We have received your order and our artisan fulfillment team is preparing your package.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Back to Storefront
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-4 h-4" />
                1. Shipping Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    // placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    // placeholder="e.g. +1 555 0192"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  // placeholder="Apartment, suite, unit, street address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    // placeholder="e.g. Cairo"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    // placeholder="name@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                 2. Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.paymentMethod === 'Cash on Delivery'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={form.paymentMethod === 'Cash on Delivery'}
                    onChange={() => setForm({ ...form, paymentMethod: 'Cash on Delivery' })}
                    className="hidden"
                  />
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs">Cash on Delivery</span>
                </label>

                {/* <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.paymentMethod === 'Credit Card'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Credit Card"
                    checked={form.paymentMethod === 'Credit Card'}
                    onChange={() => setForm({ ...form, paymentMethod: 'Credit Card' })}
                    className="hidden"
                  />
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Credit Card</span>
                </label> */}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items ({cart.length})</span>
                <span className="font-mono text-slate-200">{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span className="text-emerald-400">{shippingFee === 0 ? 'FREE' : '$15.00'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
                <span>Order Total</span>
                <span className="text-amber-400 font-serif-brand text-lg">{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20"
            >
              Place Order ({totalAmount.toFixed(2)})
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
