import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import {
  uploadImageToStorage,
} from "../lib/migration";
import { notifyOwnerOfNewOrder } from "../services/notificationService";

const ShopContext = createContext();

// ----------------------------------------------------
// CATEGORY NORMALIZATION & MATCHING HELPERS
// ----------------------------------------------------
export const normalizeCategory = (cat) => {
  if (!cat) return "all";
  const c = String(cat).trim().toLowerCase();
  if (c === "all" || c === "home") return "all";
  if (c.startsWith("bag")) return "bags";
  if (c.startsWith("wallet")) return "wallets";
  if (c.startsWith("jacket")) return "jackets";
  if (c.startsWith("belt")) return "belts";
  return c;
};

export const matchCategory = (productCategory, selectedCategory) => {
  const normSelected = normalizeCategory(selectedCategory);
  if (normSelected === "all") return true;
  return normalizeCategory(productCategory) === normSelected;
};

export const ShopProvider = ({ children }) => {
  // Products state (stored in Supabase PostgreSQL)
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Orders state (stored in Supabase PostgreSQL)
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Unread Orders Notification State
  const [hasUnreadOrders, setHasUnreadOrders] = useState(() => {
    const saved = localStorage.getItem("riva_unread_orders");
    return saved ? JSON.parse(saved) : false;
  });

  const markOrdersAsSeen = useCallback(() => {
    setHasUnreadOrders(false);
    localStorage.setItem("riva_last_seen_orders_time", new Date().toISOString());
    localStorage.setItem("riva_unread_orders", JSON.stringify(false));
  }, []);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Cart state (persisted in LocalStorage for guest/user UI)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("riva_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Helper to fetch user profile role from Supabase DB
  const checkAdminRole = useCallback(async (userId) => {
    if (!userId) return false;
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile role:", error);
        return false;
      }

      return profile?.role === "admin";
    } catch (err) {
      console.error("Failed to check admin role:", err);
      return false;
    }
  }, []);

  // Sync Supabase Auth session & handle auth state changes
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        setIsAuthLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user) {
          const adminStatus = await checkAdminRole(currentSession.user.id);
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAdmin(adminStatus);
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Error initializing auth session:", err);
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      if (newSession?.user) {
        const adminStatus = await checkAdminRole(newSession.user.id);
        if (mounted) {
          setSession(newSession);
          setUser(newSession.user);
          setIsAdmin(adminStatus);
        }
      } else {
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      }
      if (mounted) {
        setIsAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [checkAdminRole]);

  // ----------------------------------------------------
  // SUPABASE DATA FETCHING
  // ----------------------------------------------------
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const { data: dbProducts, error: prodError } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images (*)
        `,
        )
        .order("created_at", { ascending: false });

      if (prodError) {
        console.error("Error fetching products from Supabase:", prodError);
        showToast("Failed to load products from database.", "error");
        return;
      }

      if (dbProducts) {
        const formatted = dbProducts.map((p) => {
          const sortedImages = (p.product_images || []).sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
          );

          const coverImageObj =
            sortedImages.find((img) => img.is_cover) || sortedImages[0];

          const imageUrls = sortedImages.map((img) => img.image_url);

          const purchasedQty = parseInt(p.purchased_qty || 0, 10);
          const sold = p.sold !== undefined && p.sold !== null ? parseInt(p.sold, 10) : 0;
          const qtyStock = p.qty_stock !== undefined && p.qty_stock !== null 
            ? parseInt(p.qty_stock, 10) 
            : Math.max(0, purchasedQty - sold);

          return {
            id: p.id,
            title: p.title,
            category: p.category,
            barcode: p.barcode || "",
            price: parseFloat(p.price),
            originalPrice: p.original_price
              ? parseFloat(p.original_price)
              : parseFloat(p.price) * 1.2,
            purchasedQty,
            sold,
            qtyStock,
            stock: qtyStock,
            featured: Boolean(p.featured),
            description: p.description || "",
            rating: p.rating ? parseFloat(p.rating) : 5.0,
            reviewsCount: p.reviews_count ? parseInt(p.reviews_count, 10) : 1,
            image: coverImageObj ? coverImageObj.image_url : "",
            images: imageUrls,
          };
        });

        setProducts(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      showToast("Failed to connect to Supabase server.", "error");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const { data: dbOrders, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (*)
        `,
        )
        .order("created_at", { ascending: false });

      if (orderError) {
        // Expected for non-admin users due to RLS restriction
        console.log("Orders fetch info (RLS protected):", orderError.message);
        setOrders([]);
        return;
      }

      if (dbOrders) {
        const formatted = dbOrders.map((o) => ({
          id: o.id,
          customerName: o.customer_name,
          phone: o.phone,
          address: o.address,
          city: o.city || "",
          totalAmount: parseFloat(o.total_amount),
          paymentMethod: o.payment_method || "Cash on Delivery",
          status: o.status || "Pending",
          createdAt: o.created_at,
          date: new Date(o.created_at).toISOString().split("T")[0],
          items: (o.order_items || []).map((item) => ({
            id: item.product_id || item.id,
            title: item.title,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
            category: item.category || "",
          })),
        }));

        setOrders(formatted);

        // Check if there are unread pending orders in Supabase DB
        const lastSeenTime = localStorage.getItem("riva_last_seen_orders_time");
        const pendingOrders = formatted.filter((o) => o.status === "Pending");

        if (pendingOrders.length > 0) {
          if (!lastSeenTime) {
            setHasUnreadOrders(true);
          } else {
            const hasNewer = pendingOrders.some(
              (o) => new Date(o.createdAt || o.date) > new Date(lastSeenTime)
            );
            setHasUnreadOrders(hasNewer);
          }
        } else {
          setHasUnreadOrders(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      await fetchProducts();
    };
    initData();
  }, [fetchProducts]);

  // Re-fetch orders when admin status changes to true
  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [isAdmin, fetchOrders]);

  // Realtime subscription for incoming orders from any client/device
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("public:orders_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("🔔 New order received in real-time:", payload);
          setHasUnreadOrders(true);
          fetchOrders();
          showToast("🔔 New Client Order Received!", "info");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchOrders]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem("riva_cart", JSON.stringify(cart));
  }, [cart]);

// (normalizeCategory and matchCategory are defined at module level below ShopContext)

  // ----------------------------------------------------
  // INVENTORY & METRICS CALCULATIONS
  // ----------------------------------------------------
  const getProductSoldCount = (productId, productTitle) => {
    return orders
      .filter((o) => ["Pending", "Processing", "Delivered"].includes(o.status))
      .reduce((total, order) => {
        const item = (order.items || []).find(
          (i) => i.id === productId || i.title === productTitle,
        );
        return total + (item ? item.quantity || 0 : 0);
      }, 0);
  };

  const getProductStock = (product) => {
    if (!product) return 0;
    const purchased = parseInt(
      product.purchasedQty ?? product.purchased_qty ?? product.stock ?? 0,
      10,
    );
    const sold = getProductSoldCount(product.id, product.title);
    return Math.max(0, purchased - sold);
  };

  const deliveredSalesRevenue = (orders || [])
    .filter((o) => o && o.status === "Delivered")
    .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const deliveredOrdersCount = (orders || []).filter(
    (o) => o && o.status === "Delivered",
  ).length;

  // ----------------------------------------------------
  // CART ACTIONS
  // ----------------------------------------------------
  const addToCart = (product, quantity = 1) => {
    const availableStock = getProductStock(product);
    if (availableStock <= 0) {
      showToast(`عفواً، منتج "${product.title}" غير متوفر بالمخزون حالياً (Out of Stock)!`, "error");
      return false;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    const requestedTotal = currentCartQty + quantity;

    if (requestedTotal > availableStock) {
      const remainingCanAdd = Math.max(0, availableStock - currentCartQty);
      if (remainingCanAdd > 0) {
        showToast(
          `عفواً، المتاح في المخزون هو ${availableStock} قطع فقط! يمكنك إضافة ${remainingCanAdd} قطعة فقط.`,
          "error"
        );
      } else {
        showToast(
          `عفواً، لقد أضفت المتاح في المخزون بالكامل (${availableStock} قطع) إلى السلة!`,
          "error"
        );
      }
      return false;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prevCart, { ...product, quantity }];
    });
    showToast(`تمت إضافة ${product.title} إلى السلة.`, "success");
    return true;
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    showToast("Item removed from bag.", "info");
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product) {
      const availableStock = getProductStock(product);
      if (quantity > availableStock) {
        showToast(
          `عفواً، الكمية المتاحة في المخزون من هذا المنتج هي ${availableStock} قطع فقط!`,
          "error"
        );
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity: availableStock } : item
          )
        );
        return;
      }
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // ----------------------------------------------------
  // ADMIN AUTH HANDLERS (SUPABASE AUTH)
  // ----------------------------------------------------
  const loginAdmin = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, message: "Please enter both email and password." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("Supabase Auth login error:", error);
        return {
          success: false,
          message: error.message || "Invalid credentials. Please check your email and password.",
        };
      }

      if (!data?.user) {
        return { success: false, message: "Authentication failed. No session created." };
      }

      // Verify explicit Admin role in public.profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile || profile.role !== "admin") {
        // Revoke non-admin session immediately
        await supabase.auth.signOut();
        setIsAdmin(false);
        setUser(null);
        setSession(null);
        return {
          success: false,
          message: "Access Denied: Your account does not have Store Owner (Admin) privileges.",
        };
      }

      setIsAdmin(true);
      setUser(data.user);
      setSession(data.session);
      setIsAdminModalOpen(false);
      showToast("Welcome Admin! Access Granted.", "success");
      await fetchOrders();
      return { success: true };
    } catch (err) {
      console.error("Error in loginAdmin:", err);
      return {
        success: false,
        message: "An unexpected error occurred during login. Please try again.",
      };
    }
  };

  const logoutAdmin = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setIsAdmin(false);
      setUser(null);
      setSession(null);
      setOrders([]);
      showToast("Admin logged out successfully.", "info");
    }
  };

  // PRODUCT MANAGEMENT (SUPABASE)
  const addProduct = async (newProduct) => {
    try {
      // console.log("Adding product:", newProduct);

      // 0. Pre-check: barcode uniqueness (if barcode is provided)
      const barcodeToCheck = newProduct.barcode?.trim();
      if (barcodeToCheck) {
        const { data: existingBarcode, error: barcodeCheckError } = await supabase
          .from("products")
          .select("id, title")
          .eq("barcode", barcodeToCheck)
          .maybeSingle();

        if (!barcodeCheckError && existingBarcode) {
          const msg = `Barcode "${barcodeToCheck}" is already used by "${existingBarcode.title}". Please use a different barcode.`;
          showToast(msg, "error");
          return null;
        }
      }

      const purchasedQty = parseInt(newProduct.purchasedQty || 0, 10);
      const productData = {
        title: newProduct.title,
        category: newProduct.category,
        barcode: barcodeToCheck || null,
        price: parseFloat(newProduct.price),
        original_price: newProduct.originalPrice
          ? parseFloat(newProduct.originalPrice)
          : parseFloat(newProduct.price) * 1.2,
        purchased_qty: purchasedQty,
        featured: newProduct.featured || false,
        description: newProduct.description || "",
        rating: 5.0,
        reviews_count: 1,
      };

      // console.log("Sending to Supabase:", productData);

      // 1. Create product record
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase INSERT ERROR", error);
        // Handle unique constraint violation from DB side as well
        if (error.code === "23505" && error.message?.includes("barcode")) {
          showToast(`This barcode is already registered. Please use a unique barcode.`, "error");
        } else {
          showToast(error?.message || "Failed to create product", "error");
        }
        return null;
      }

      // console.log("✅ Product created:", data);

      // 2. Prepare images — resolve File objects to upload, keep URLs as-is
      const rawImages = (newProduct.images || []).length > 0
        ? newProduct.images
        : newProduct.image
          ? [newProduct.image]
          : [];

      // 3. Upload File objects → get public URLs
      const resolvedUrls = [];
      for (let i = 0; i < rawImages.length; i++) {
        const imgItem = rawImages[i];
        let finalUrl = null;

        if (imgItem instanceof File) {
          // Upload to Supabase Storage
          finalUrl = await uploadImageToStorage(imgItem, `product-${data.id}-${i}`);
        } else if (typeof imgItem === "string" && imgItem.startsWith("data:image")) {
          // base64 fallback
          finalUrl = await uploadImageToStorage(imgItem, `product-${data.id}-${i}`);
        } else if (typeof imgItem === "string" && imgItem.startsWith("http")) {
          // Already a URL, use as-is
          finalUrl = imgItem;
        }

        if (finalUrl) {
          resolvedUrls.push({ original: imgItem, url: finalUrl });
        } else {
          console.warn(`⚠️ Could not resolve image at index ${i}:`, imgItem);
        }
      }

      // 4. Determine cover image URL
      const coverOriginal = newProduct.image || rawImages[0];
      const coverResolved = resolvedUrls.find(r => r.original === coverOriginal)?.url
        || resolvedUrls[0]?.url
        || "";

      // 5. Insert into product_images
      if (resolvedUrls.length > 0) {
        const imageRows = resolvedUrls.map(({ url }, index) => ({
          product_id: data.id,
          image_url: url,
          is_cover: url === coverResolved || index === 0,
          sort_order: index,
        }));

        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (imageError) {
          console.error("❌ Failed to save product images:", imageError);
          // Rollback product if images fail
          await supabase.from("products").delete().eq("id", data.id);
          showToast("Failed to save product images. Product was rolled back.", "error");
          return null;
        }
      }

      const allResolvedUrls = resolvedUrls.map(r => r.url);

      // 6. Build formatted product for React state
      const formattedProduct = {
        id: data.id,
        title: data.title,
        category: data.category,
        barcode: data.barcode || "",
        price: parseFloat(data.price),
        originalPrice: data.original_price
          ? parseFloat(data.original_price)
          : parseFloat(data.price) * 1.2,
        purchasedQty: parseInt(data.purchased_qty || 0, 10),
        featured: Boolean(data.featured),
        description: data.description || "",
        rating: data.rating ? parseFloat(data.rating) : 5.0,
        reviewsCount: data.reviews_count ? parseInt(data.reviews_count, 10) : 1,
        image: coverResolved,
        images: allResolvedUrls,
      };

      // 7. Update React state immediately
      setProducts((prevProducts) => [formattedProduct, ...prevProducts]);

      showToast(`Product "${newProduct.title}" added to inventory!`, "success");
      return formattedProduct;
    } catch (error) {
      console.error("❌ Failed to create product in Supabase", error);
      showToast(error?.message || "Failed to create product", "error");
      return null;
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const barcodeToCheck = updatedProduct.barcode?.trim();

      // 0. Pre-check: barcode uniqueness (skip for this product itself)
      if (barcodeToCheck) {
        const { data: existingBarcode, error: barcodeCheckError } = await supabase
          .from("products")
          .select("id, title")
          .eq("barcode", barcodeToCheck)
          .neq("id", updatedProduct.id)
          .maybeSingle();

        if (!barcodeCheckError && existingBarcode) {
          const msg = `Barcode "${barcodeToCheck}" is already used by "${existingBarcode.title}". Please use a different barcode.`;
          showToast(msg, "error");
          return false;
        }
      }

      const purchasedQty = parseInt(updatedProduct.purchasedQty || 0, 10);
      // 1. Update products table row
      const { error: prodError } = await supabase
        .from("products")
        .update({
          title: updatedProduct.title.trim(),
          category: updatedProduct.category,
          barcode: barcodeToCheck || null,
          price: parseFloat(updatedProduct.price),
          original_price: updatedProduct.originalPrice
            ? parseFloat(updatedProduct.originalPrice)
            : parseFloat(updatedProduct.price) * 1.2,
          purchased_qty: purchasedQty,
          featured: Boolean(updatedProduct.featured),
          description: updatedProduct.description.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedProduct.id);

      if (prodError) {
        console.error("Failed to update product in Supabase:", prodError);
        if (prodError.code === "23505" && prodError.message?.includes("barcode")) {
          showToast(`This barcode is already registered. Please use a unique barcode.`, "error");
        } else {
          showToast("Failed to update product.", "error");
        }
        return false;
      }

      // 2. Delete old product_images DB records
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", updatedProduct.id);

      const rawImages =
        Array.isArray(updatedProduct.images) && updatedProduct.images.length > 0
          ? updatedProduct.images
          : updatedProduct.image
            ? [updatedProduct.image]
            : [];

      const coverOriginal = updatedProduct.image || rawImages[0];

      // 3. Upload File objects & resolve all to URLs
      const resolvedUrls = [];
      for (let i = 0; i < rawImages.length; i++) {
        const imgItem = rawImages[i];
        let finalUrl = null;

        if (imgItem instanceof File) {
          finalUrl = await uploadImageToStorage(imgItem, `product-${updatedProduct.id}-${i}`);
        } else if (typeof imgItem === "string" && imgItem.startsWith("data:image")) {
          finalUrl = await uploadImageToStorage(imgItem, `product-${updatedProduct.id}-${i}`);
        } else if (typeof imgItem === "string" && imgItem.startsWith("http")) {
          finalUrl = imgItem;
        }

        if (finalUrl) {
          resolvedUrls.push({ original: imgItem, url: finalUrl });
        } else {
          console.warn(`⚠️ Could not resolve image at index ${i} during update:`, imgItem);
        }
      }

      // 4. Insert resolved images into product_images
      if (resolvedUrls.length > 0) {
        const coverResolved = resolvedUrls.find(r => r.original === coverOriginal)?.url
          || resolvedUrls[0]?.url;

        const imageRows = resolvedUrls.map(({ url }, index) => ({
          product_id: updatedProduct.id,
          image_url: url,
          is_cover: url === coverResolved || index === 0,
          sort_order: index,
        }));

        const { error: imgInsertError } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (imgInsertError) {
          console.error("❌ Failed to insert updated images:", imgInsertError);
          showToast("Product updated but images failed to save.", "error");
        }
      }

      await fetchProducts();
      showToast("Product updated successfully!", "success");
      return true;
    } catch (err) {
      console.error("Error in updateProduct:", err);
      showToast("Error updating product.", "error");
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      // 1. Fetch images to delete from Storage if they belong to Supabase bucket
      const { data: dbImages } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);

      if (dbImages && dbImages.length > 0) {
        const pathsToDelete = dbImages
          .map((img) => {
            const url = img.image_url;
            if (
              url &&
              url.includes("/storage/v1/object/public/product-images/")
            ) {
              return url.split("/storage/v1/object/public/product-images/")[1];
            }
            return null;
          })
          .filter(Boolean);

        if (pathsToDelete.length > 0) {
          await supabase.storage.from("product-images").remove(pathsToDelete);
        }
      }

      // 2. Delete product record (CASCADE deletes product_images DB rows)
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Failed to delete product from Supabase:", error);
        showToast("Failed to delete product.", "error");
        return false;
      }

      await fetchProducts();
      showToast("Product deleted from inventory.", "info");
      return true;
    } catch (err) {
      console.error("Error in deleteProduct:", err);
      showToast("Error deleting product.", "error");
      return false;
    }
  };

  // ----------------------------------------------------
  // ORDER MANAGEMENT (SUPABASE AUTHORITATIVE RPC)
  // ----------------------------------------------------
  const placeOrder = async (customerDetails) => {
    if (cart.length === 0) return null;

    try {
      // Map cart items into minimal schema: ONLY product_id and quantity
      const itemsPayload = cart.map((item) => ({
        product_id: item.id,
        quantity: parseInt(item.quantity, 10) || 1,
      }));

      // Invoke PostgreSQL SECURITY DEFINER RPC create_order
      const { data: orderResult, error: rpcError } = await supabase.rpc(
        "create_order",
        {
          p_customer_name: customerDetails.name,
          p_phone: customerDetails.phone,
          p_address: customerDetails.address,
          p_city: customerDetails.city || "",
          p_payment_method: customerDetails.paymentMethod || "Cash on Delivery",
          p_items: itemsPayload,
        }
      );

      if (rpcError) {
        console.error("❌ RPC Order placement error:", rpcError);
        showToast(rpcError.message || "Failed to place order. Please try again.", "error");
        return null;
      }

      if (
        !orderResult?.success ||
        !orderResult.order_id ||
        orderResult.total_amount === undefined ||
        !orderResult.status
      ) {
        showToast("Unexpected error creating order. Please contact support.", "error");
        return null;
      }

      // Construct authoritative confirmed order structure from server response
      const verifiedTotal = parseFloat(orderResult.total_amount);
      const confirmedOrder = {
        id: orderResult.order_id,
        customerName: orderResult.customer_name,
        customer_name: orderResult.customer_name,
        phone: orderResult.phone,
        address: orderResult.address,
        city: orderResult.city || "",
        totalAmount: verifiedTotal,
        total_amount: verifiedTotal,
        subtotal: parseFloat(orderResult.subtotal),
        shipping: parseFloat(orderResult.shipping),
        paymentMethod: orderResult.payment_method || "Cash on Delivery",
        status: orderResult.status || "Pending",
        createdAt: orderResult.created_at || new Date().toISOString(),
        date: new Date(orderResult.created_at || Date.now()).toISOString().split("T")[0],
        items: [...cart],
      };

      // Set unread orders notification flag
      setHasUnreadOrders(true);
      localStorage.setItem("riva_unread_orders", JSON.stringify(true));

      // Trigger store owner email notification with authoritative server total
      await notifyOwnerOfNewOrder(confirmedOrder, cart);

      // Re-fetch orders if admin is logged in
      if (isAdmin) {
        await fetchOrders();
      }
      await fetchProducts();

      clearCart();
      setIsCartOpen(false);
      showToast(`Order placed successfully! Thank you.`, "success");
      return confirmedOrder;
    } catch (err) {
      console.error("Error in placeOrder:", err);
      showToast("Error placing order. Please check your connection.", "error");
      return null;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) {
        console.error("Failed to update order status in Supabase:", error);
        showToast("Failed to update order status.", "error");
        return false;
      }

      await fetchOrders();
      await fetchProducts();
      showToast(`Order status updated to "${status}"`, "success");
      return true;
    } catch (err) {
      console.error("Error in updateOrderStatus:", err);
      showToast("Error updating order status.", "error");
      return false;
    }
  };

  // Cart total items count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <ShopContext.Provider
      value={{
        products,
        isLoadingProducts,
        cart,
        orders,
        isLoadingOrders,
        hasUnreadOrders,
        markOrdersAsSeen,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAdmin,
        isAdminLoggedIn: isAdmin,
        user,
        session,
        isAuthLoading,
        loginAdmin,
        logoutAdmin,
        getProductStock,
        matchCategory,
        normalizeCategory,
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
        placeOrder,
        updateOrderStatus,
        cartItemCount,
        cartSubtotal,
        fetchProducts,
        fetchOrders,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
