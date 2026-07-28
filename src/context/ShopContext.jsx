import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Products state (persisted in LocalStorage)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('riva_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Cart state (persisted in LocalStorage)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('riva_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders state (persisted in LocalStorage)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('riva_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-9821',
        customerName: 'Sarah Jenkins',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Terrace, Suite 4B',
        items: [
          { title: 'Monaco Tuscan Leather Weekender Bag', price: 349, quantity: 1 }
        ],
        totalAmount: 349,
        paymentMethod: 'Cash on Delivery',
        status: 'Delivered',
        date: '2026-07-20'
      },
      {
        id: 'ORD-9822',
        customerName: 'Marcus Aurelius',
        phone: '+1 (555) 987-6543',
        address: '12 Luxury Drive, Beverly Hills',
        items: [
          { title: 'Royal Bifold RFID Leather Wallet', price: 85, quantity: 2 },
          { title: 'Tuscan Full-Grain Leather Dress Belt', price: 75, quantity: 1 }
        ],
        totalAmount: 245,
        paymentMethod: 'Credit Card',
        status: 'Processing',
        date: '2026-07-22'
      }
    ];
  });

  // Admin Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('riva_admin_logged_in') === 'true';
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const getProductSoldCount = (productId, productTitle) => {
    return orders
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, order) => {
        const item = order.items.find(
          (i) => i.id === productId || i.title === productTitle
        );
        return sum + (item ? item.quantity : 0);
      }, 0);
  };

  const deliveredSalesRevenue = orders
    .filter((o) => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;

  // Sync products to local storage
  useEffect(() => {
    localStorage.setItem('riva_products', JSON.stringify(products));
  }, [products]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('riva_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync orders to local storage
  useEffect(() => {
    localStorage.setItem('riva_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync admin auth status
  useEffect(() => {
    localStorage.setItem('riva_admin_logged_in', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Show Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Cart Handlers
 const addToCart = (product, quantity = 1) => {
  setCart(prevCart => {
    const existingIndex = prevCart.findIndex(
      item => item.id === product.id
    );

    if (existingIndex > -1) {
      return prevCart.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + quantity
            }
          : item
      );
    }

    return [
      ...prevCart,
      {
        ...product,
        quantity
      }
    ];
  });

  showToast(`Added "${product.title}" to cart!`, 'success');
};

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    showToast('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Admin Handlers
  const loginAdmin = (pin) => {
    if (pin === '1234' || pin === 'admin') {
      setIsAdminLoggedIn(true);
      setIsAdminModalOpen(false);
      showToast('Welcome Admin! Access Granted.', 'success');
      return true;
    } else {
      showToast('Incorrect Passcode. Access Denied.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    showToast('Admin logged out successfully.', 'info');
  };

  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: `custom-${Date.now()}`,
      price: parseFloat(newProduct.price),
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : parseFloat(newProduct.price) * 1.2,
      rating: 5.0,
      reviewsCount: 1,
      featured: newProduct.featured || false,
      stock: parseInt(newProduct.stock || 10, 10),
      purchaseSource: newProduct.purchaseSource || ''
    };
    setProducts(prev => [productWithId, ...prev]);
    showToast(`Product "${newProduct.title}" added to inventory!`, 'success');
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    showToast(`Product updated successfully!`, 'success');
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted from inventory.', 'info');
  };

  const resetProductsToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('riva_products');
    showToast('Product catalog reset to default.', 'info');
  };

  // Place Order Handler
  const placeOrder = (customerDetails) => {
    if (cart.length === 0) return null;

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address,
      city: customerDetails.city || '',
      items: cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      totalAmount,
      paymentMethod: customerDetails.paymentMethod || 'Cash on Delivery',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    showToast(`Order ${newOrder.id} placed successfully! Thank you.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Order status updated to "${status}"`, 'success');
  };

  // Cart total items count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      orders,
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      isCartOpen,
      setIsCartOpen,
      isAdminModalOpen,
      setIsAdminModalOpen,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin,
      getProductSoldCount,
      deliveredSalesRevenue,
      deliveredOrdersCount,
      toast,
      showToast,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      addProduct,
      updateProduct,
      deleteProduct,
      resetProductsToDefault,
      placeOrder,
      updateOrderStatus,
      cartItemCount,
      cartSubtotal
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
