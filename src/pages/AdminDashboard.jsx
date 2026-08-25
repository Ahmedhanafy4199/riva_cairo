import React, { useState } from "react";
import {
  LuPlus as Plus,
  LuPencil as Edit3,
  LuTrash2 as Trash2,
  LuPackage as Package,
  LuShoppingBag as ShoppingBag,
  LuLogOut as LogOut,
  LuSearch as Search,
  LuFilter as Filter,
  LuSparkles as Sparkles,
  LuShieldCheck as ShieldCheck,
  LuChevronDown as ChevronDown,
  LuUpload as Upload,
  LuTrendingUp as TrendingUp,
  LuPhone,
  LuMapPin,
  LuBoxes,
} from "react-icons/lu";
import { useShop } from "../context/ShopContext";

export const AdminDashboard = () => {
  const {
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    user,
    logoutAdmin,
    updateOrderStatus,
    getProductSoldCount,
    deliveredSalesRevenue,
    deliveredOrdersCount,
    markOrdersAsSeen,
  } = useShop();

  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory', 'add', 'orders'

  React.useEffect(() => {
    if (activeTab === "orders") {
      markOrdersAsSeen();
    }
  }, [activeTab, markOrdersAsSeen]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [openStatusOrder, setOpenStatusOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [form, setForm] = useState({
    title: "",
    category: "Bags",
    barcode: "",
    price: "",
    originalPrice: "",
    purchasedQty: "0",
    image: "",
    images: [],
    description: "",
    featured: false,
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  const getProductInventory = (product) => {
    const purchasedQty = Number(product.purchasedQty || 0);
    const soldQty = Number(getProductSoldCount(product.id, product.title) || 0);
    const stock = Math.max(0, purchasedQty - soldQty);

    return {
      purchasedQty,
      soldQty,
      stock,
    };
  };

  const outOfStockCount = products.filter((product) => {
    const { stock } = getProductInventory(product);
    return stock <= 2;
  }).length;

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      filterCategory === "All" || p.category === filterCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddForm = () => {
    setEditingProduct(null);

    setForm({
      title: "",
      category: "Bags",
      barcode: "",
      price: "",
      originalPrice: "",
      purchasedQty: "0",
      image: "",
      images: [],
      description: "",
      featured: false,
    });

    setActiveTab("add");
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);

    setForm({
      title: product.title || "",
      category: product.category || "Bags",
      barcode: product.barcode || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      purchasedQty: (product.purchasedQty || 0).toString(),
      image: product.image || "",
      images: product.images || (product.image ? [product.image] : []),
      description: product.description || "",
      featured: product.featured || false,
    });

    setActiveTab("add");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`File "${file.name}" is not a valid image.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the maximum allowed limit of 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setForm((prev) => {
      const currentImages = prev.images || [];
      const newImages = [...currentImages, ...validFiles];
      return {
        ...prev,
        images: newImages,
        image: prev.image || newImages[0] || "",
      };
    });
  };

  const handleSetCoverImage = (imgSrc) => {
    setForm((prev) => ({
      ...prev,
      image: imgSrc,
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm((prev) => {
      const currentImages = prev.images || [];
      const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
      let newCover = prev.image;

      // If the removed image was the cover, pick a new one
      if (prev.image === currentImages[indexToRemove]) {
        newCover = newImages.length > 0 ? newImages[0] : "";
      }
      return {
        ...prev,
        images: newImages,
        image: newCover,
      };
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    let mainImage = form.image;
    let allImages = form.images || [];

    // Make sure there is a cover image
    if (allImages.length > 0 && !mainImage) {
      mainImage = allImages[0];
    }

    // Make sure the cover image exists in the images array
    if (mainImage && allImages.length === 0) {
      allImages = [mainImage];
    }

    // Validate required fields
    if (
      !form.title.trim() ||
      !form.price ||
      !mainImage ||
      !form.description.trim()
    ) {
      alert(
        "Please fill in all required fields (Title, Price, at least one Image, Description).",
      );
      return;
    }

    const purchasedQty = Math.max(0, parseInt(form.purchasedQty, 10) || 0);

    // Keep the existing sold quantity when editing
    const soldQty = editingProduct
      ? Number(
          getProductSoldCount(editingProduct.id, editingProduct.title) || 0,
        )
      : 0;

    // Stock = Purchased - Sold
    const stock = Math.max(0, purchasedQty - soldQty);

    const updatedProductData = {
      title: form.title.trim(),
      category: form.category,
      barcode:
        form.barcode.trim() ||
        `RC-${(form.category || "PRD").substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice
        ? parseFloat(form.originalPrice)
        : parseFloat(form.price) * 1.2,

      purchasedQty,
      stock,

      image: mainImage,
      images: allImages,
      description: form.description.trim(),
      featured: form.featured,
    };

    setIsSubmitting(true);
    try {
      let result;
      if (editingProduct) {
        result = await updateProduct({
          ...editingProduct,
          ...updatedProductData,
        });
      } else {
        result = await addProduct(updatedProductData);
      }

      // Only navigate back if the operation succeeded
      if (result !== null && result !== false) {
        setEditingProduct(null);
        setActiveTab("inventory");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 sm:pb-16 max-w-full overflow-hidden">
      {/* Admin Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 truncate max-w-full">
                Authorized ({user?.email || "Admin"})
              </span>
            </div>
            <h1 className="font-serif-brand text-lg sm:text-2xl md:text-3xl font-bold text-slate-100 mt-1 truncate">
              Riva Cairo Admin Portal
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Manage inventory, prices, stock and client orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={logoutAdmin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-red-950/60 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 shadow-md">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate block">
              Total Revenue
            </span>
            <div className="text-base sm:text-xl md:text-2xl font-bold font-serif-brand text-amber-400 mt-0.5 truncate">
              {totalRevenue.toFixed(2)}
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 truncate block">
              All client orders
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Delivered Sales */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-emerald-500/20 flex items-center justify-between gap-2 shadow-md">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate block">
              Delivered Sales
            </span>
            <div className="text-base sm:text-xl md:text-2xl font-bold font-serif-brand text-emerald-400 mt-0.5 truncate">
              {(deliveredSalesRevenue || 0).toFixed(2)}
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 truncate block">
              {deliveredOrdersCount || 0} delivered
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 shadow-md">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate block">
              Total Orders
            </span>
            <div className="text-base sm:text-xl md:text-2xl font-bold font-serif-brand text-slate-100 mt-0.5 truncate">
              {totalOrdersCount}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">
              Live order queue
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Active Inventory */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 shadow-md">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate block">
              Active Items
            </span>
            <div className="text-base sm:text-xl md:text-2xl font-bold font-serif-brand text-slate-100 mt-0.5 truncate">
              {totalProductsCount}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">
              Total catalog
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Package className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="col-span-2 md:col-span-1 xl:col-span-1 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 shadow-md">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate block">
              Low Stock
            </span>
            <div className="text-base sm:text-xl md:text-2xl font-bold font-serif-brand text-slate-100 mt-0.5 truncate">
              {outOfStockCount}
            </div>
            <span className="text-[9px] sm:text-[10px] text-amber-400 truncate block">
              Stock &le; 2 items
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 p-1 rounded-xl sm:rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Inventory ({products.length})
          </button>

          <button
            onClick={handleOpenAddForm}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "add"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {editingProduct ? "✏️ Edit Item" : "➕ Add Product"}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {activeTab === "inventory" && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add New Item</span>
          </button>
        )}
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-amber-400" />
                Category:
              </span>
              {["All", "Bags", "Wallet", "Jacket", "Belt"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    filterCategory === cat
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Inventory Cards (Visible on screens < 1024px) */}
          <div className="block lg:hidden space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No products match your search or category filter.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const purchased = Number(p.purchasedQty || 0);
                const sold = Number(getProductSoldCount(p.id, p.title) || 0);
                const remaining = Math.max(0, purchased - sold);

                return (
                  <div
                    key={p.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md"
                  >
                    {/* Top Row: Image, Title, Category, Actions */}
                    <div className="flex items-start gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-slate-100 text-xs sm:text-sm line-clamp-1">
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {p.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-semibold bg-slate-950 text-amber-400/90 border border-slate-800">
                            {p.barcode || `RC-${(p.category || "PRD").substring(0, 3).toUpperCase()}-001`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80 text-center font-mono">
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Price</span>
                        <span className="text-xs font-bold text-amber-400">
                          {p.price?.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Purchased</span>
                        <span className="text-xs font-bold text-blue-400">
                          {p.purchasedQty || 0}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Sold</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {sold}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Stock</span>
                        <span
                          className={`text-xs font-bold ${
                            remaining === 0
                              ? "text-red-400"
                              : remaining <= 5
                                ? "text-amber-400"
                                : "text-slate-200"
                          }`}
                        >
                          {remaining}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Products Table (Visible on screens >= 1024px) */}
          <div className="hidden lg:block bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Barcode</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Purchased Qty</th>
                    <th className="px-6 py-4">Sold</th>
                    <th className="px-6 py-4">Qty Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No products match your search/filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const purchased = Number(p.purchasedQty || 0);
                      const sold = Number(
                        getProductSoldCount(p.id, p.title) || 0,
                      );
                      const remaining = Math.max(0, purchased - sold);

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                              />
                              <div>
                                <div className="font-semibold text-slate-100">
                                  {p.title}
                                </div>
                                <div className="text-[10px] text-slate-400 line-clamp-1">
                                  {p.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Barcode */}
                          <td className="px-6 py-4 font-mono">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {p.barcode ||
                                `RC-${(p.category || "PRD").substring(0, 3).toUpperCase()}-001`}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {p.category}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-mono font-bold text-amber-400">
                            {p.price?.toFixed(2)}
                          </td>

                          {/* Purchased Qty */}
                          <td className="px-6 py-4 font-mono">
                            <span className="text-blue-400 font-bold">
                              {p.purchasedQty || 0}
                            </span>
                            <span className="text-slate-500 text-[10px] ml-1">
                              units
                            </span>
                          </td>

                          {/* Sold Qty */}
                          <td className="px-6 py-4 font-mono">
                            <span className="text-emerald-400 font-bold">
                              {sold}
                            </span>
                            <span className="text-slate-500 text-[10px] ml-1">
                              sold
                            </span>
                          </td>

                          {/* Remaining Stock */}
                          <td className="px-6 py-4 font-mono">
                            <span
                              className={
                                remaining === 0
                                  ? "text-red-400 font-bold"
                                  : remaining <= 5
                                    ? "text-amber-400 font-bold"
                                    : "text-slate-200 font-bold"
                              }
                            >
                              {remaining}
                            </span>
                            <span className="text-slate-500 text-[10px] ml-1">
                              units
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD / EDIT PRODUCT FORM */}
      {activeTab === "add" && (
        <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5 sm:mb-6">
            <div>
              <h2 className="font-serif-brand text-lg sm:text-xl font-bold text-slate-100">
                {editingProduct
                  ? `Edit Product: ${editingProduct.title}`
                  : "Add New Leather Product"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Fill in the product parameters below to display it live on the
                storefront.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("inventory")}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4 sm:space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Leather Weekender Duffle Bag"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category *
                </label>

                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-amber-400 font-semibold transition-all duration-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <span>
                    {form.category === "Bags" && "Bags (حقائب)"}
                    {form.category === "Wallet" && "Wallet (محافظ)"}
                    {form.category === "Jacket" && "Jacket (جواكت)"}
                    {form.category === "Belt" && "Belt (أحزمة)"}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      isCategoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/40 overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        Select Category
                      </span>
                    </div>

                    {[
                      { value: "Bags", label: "Bags", arabic: "حقائب" },
                      { value: "Wallet", label: "Wallet", arabic: "محافظ" },
                      { value: "Jacket", label: "Jacket", arabic: "جواكت" },
                      { value: "Belt", label: "Belt", arabic: "أحزمة" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            category: option.value,
                          });
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-all cursor-pointer ${
                          form.category === option.value
                            ? "bg-amber-500/10 text-amber-400"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-slate-500">
                            ({option.arabic})
                          </span>
                        </div>

                        {form.category === option.value && (
                          <span className="text-amber-400 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barcode Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Barcode / SKU Code
              </label>
              <input
                type="text"
                placeholder="e.g. RC-BAG-001 or 89340219801"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-amber-400 font-mono font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Price, Original Price & Purchased Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 250"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 300"
                  value={form.originalPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      originalPrice: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Purchased Quantity */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Purchased Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 50"
                  value={form.purchasedQty}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      purchasedQty: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-blue-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Total quantity purchased from the supplier.
                </p>
              </div>

              {/* Remaining Stock - Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Stock Preview
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs font-bold font-mono">
                  {(() => {
                    const purchased = Number(form.purchasedQty || 0);
                    const sold = editingProduct
                      ? Number(
                          getProductSoldCount(
                            editingProduct.id,
                            editingProduct.title,
                          ) || 0,
                        )
                      : 0;
                    const remaining = Math.max(0, purchased - sold);

                    return (
                      <span
                        className={
                          remaining === 0
                            ? "text-red-400"
                            : remaining <= 5
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }
                      >
                        {remaining} units
                      </span>
                    );
                  })()}
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Calculated automatically: (Purchased &minus; Sold).
                </p>
              </div>
            </div>

            {/* Product Images Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Product Images *
              </label>

              {/* File Upload from Device */}
              <div className="p-4 sm:p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/45 flex flex-col items-center justify-center text-center group hover:border-amber-500/50 transition-colors relative cursor-pointer min-h-27.5">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/tiff"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500 group-hover:text-amber-400 transition-colors mb-1" />
                <span className="text-xs text-slate-300 font-medium">
                  Tap to upload images from device
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  PNG, JPG, WEBP, AVIF up to 10MB each
                </span>
              </div>

              {/* Gallery List Preview */}
              {form.images && form.images.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-slate-400">
                    Selected Images ({form.images.length})
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                    {form.images.map((imgSrc, index) => {
                      const displaySrc =
                        typeof imgSrc === "string"
                          ? imgSrc
                          : imgSrc instanceof File
                            ? URL.createObjectURL(imgSrc)
                            : "";
                      const isCover =
                        form.image === imgSrc || (index === 0 && !form.image);
                      return (
                        <div
                          key={index}
                          className={`relative group aspect-square rounded-xl overflow-hidden bg-slate-950 border ${
                            isCover
                              ? "border-amber-500 ring-2 ring-amber-500/20"
                              : "border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <img
                            src={displaySrc}
                            alt={`Gallery ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(imgSrc)}
                                className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold rounded hover:bg-amber-400 cursor-pointer"
                              >
                                Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 bg-red-950/80 text-red-400 rounded hover:bg-red-900 hover:text-white cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-bold">
                              COVER
                            </span>
                          )}

                          {/* Number Badge */}
                          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-slate-900/90 text-[9px] text-slate-300 flex items-center justify-center border border-slate-700 font-mono">
                            {index + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Product Description *
              </label>
              <textarea
                rows="3"
                required
                placeholder="Handcrafted from vegetable-tanned leather..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  <span>
                    {editingProduct
                      ? "Saving Changes..."
                      : "Uploading & Publishing..."}
                  </span>
                </>
              ) : (
                <span>
                  {editingProduct
                    ? "Save Product Changes"
                    : "Publish Product to Store"}
                </span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CLIENT ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-4 sm:space-y-6 relative">
          {openStatusOrder !== null && (
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setOpenStatusOrder(null)}
            />
          )}

          {/* Mobile Orders Cards View (< 1024px) */}
          <div className="block lg:hidden space-y-3">
            {orders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No orders recorded yet.
              </div>
            ) : (
              orders.map((order, orderIdx) => (
                <div
                  key={order.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md"
                >
                  {/* Order Header: ID, Date, Amount */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Order ID</span>
                      <div className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                        {order.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">Total</span>
                      <div className="font-mono font-bold text-slate-100 text-sm sm:text-base">
                        {order.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-200">
                      {order.customerName}
                    </div>
                    {order.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <LuPhone className="w-3 h-3 text-amber-400 shrink-0" />
                        <a
                          href={`tel:${order.phone}`}
                          className="hover:text-amber-400 font-mono underline"
                        >
                          {order.phone}
                        </a>
                      </div>
                    )}
                    {order.address && (
                      <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                        <LuMapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                        <span>{order.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/70 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                      <LuBoxes className="w-2.5 h-2.5 text-amber-400" />
                      Purchased Items
                    </span>
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-slate-300 flex items-center justify-between"
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="font-mono text-amber-400 font-semibold shrink-0 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Dropdown */}
                  <div className="pt-1 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400 font-medium">Status:</span>
                      <div className="relative inline-block w-40">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenStatusOrder(
                              openStatusOrder === order.id ? null : order.id,
                            )
                          }
                          className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-slate-950 transition-all cursor-pointer ${
                            order.status === "Delivered"
                              ? "text-emerald-400 border-emerald-500/30"
                              : order.status === "Processing"
                                ? "text-blue-400 border-blue-500/30"
                                : "text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <span>{order.status}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                              openStatusOrder === order.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {openStatusOrder === order.id && (
                          <div
                            className={`absolute right-0 w-44 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-slate-950 overflow-hidden ${
                              orders.length > 2 && orderIdx >= orders.length - 2
                                ? "bottom-full mb-1"
                                : "top-full mt-1"
                            }`}
                          >
                            {[
                              {
                                value: "Pending",
                                label: "Pending",
                                color: "amber",
                              },
                              {
                                value: "Processing",
                                label: "Processing",
                                color: "blue",
                              },
                              {
                                value: "Delivered",
                                label: "Delivered",
                                color: "emerald",
                              },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  updateOrderStatus(order.id, option.value);
                                  setOpenStatusOrder(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all cursor-pointer ${
                                  order.status === option.value
                                    ? option.color === "amber"
                                      ? "bg-amber-500/10 text-amber-400"
                                      : option.color === "blue"
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "bg-emerald-500/10 text-emerald-400"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                              >
                                <span>{option.label}</span>
                                {order.status === option.value && (
                                  <span className="font-bold">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (>= 1024px) */}
          <div className="hidden lg:block bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
            <div className="p-4 border-b border-slate-800 font-serif-brand font-bold text-slate-200 rounded-t-2xl">
              Recent Client Orders ({orders.length})
            </div>

            <div className="overflow-x-auto min-h-80 pb-32">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Phone & Address</th>
                    <th className="px-6 py-4">Purchased Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, orderIdx) => (
                      <tr
                        key={order.id}
                        className={`transition-colors ${
                          openStatusOrder === order.id
                            ? "relative z-50 bg-slate-800/60"
                            : "relative z-1 hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-amber-400">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-200">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-[11px] text-slate-300">
                            {order.phone}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.address}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] text-slate-300"
                              >
                                {item.quantity}x{" "}
                                <span className="text-slate-100 font-medium">
                                  {item.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-100">
                          {order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`relative inline-block min-w-36.25 ${
                              openStatusOrder === order.id ? "z-50" : "z-10"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenStatusOrder(
                                  openStatusOrder === order.id
                                    ? null
                                    : order.id,
                                )
                              }
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold border bg-slate-950 transition-all duration-200 focus:outline-none cursor-pointer ${
                                order.status === "Delivered"
                                  ? "text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
                                  : order.status === "Processing"
                                    ? "text-blue-400 border-blue-500/30 hover:border-blue-500/60"
                                    : "text-amber-400 border-amber-500/30 hover:border-amber-500/60"
                              }`}
                            >
                              <span>{order.status}</span>

                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                                  openStatusOrder === order.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>

                            {openStatusOrder === order.id && (
                              <div
                                className={`absolute right-0 w-45 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-slate-950 overflow-hidden ${
                                  orders.length > 3 &&
                                  orderIdx >= orders.length - 2
                                    ? "bottom-full mb-2"
                                    : "top-full mt-2"
                                }`}
                              >
                                {[
                                  {
                                    value: "Pending",
                                    label: "Pending",
                                    color: "amber",
                                  },
                                  {
                                    value: "Processing",
                                    label: "Processing",
                                    color: "blue",
                                  },
                                  {
                                    value: "Delivered",
                                    label: "Delivered",
                                    color: "emerald",
                                  },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      updateOrderStatus(order.id, option.value);
                                      setOpenStatusOrder(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all cursor-pointer ${
                                      order.status === option.value
                                        ? option.color === "amber"
                                          ? "bg-amber-500/10 text-amber-400"
                                          : option.color === "blue"
                                            ? "bg-blue-500/10 text-blue-400"
                                            : "bg-emerald-500/10 text-emerald-400"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                                  >
                                    <span>{option.label}</span>

                                    {order.status === option.value && (
                                      <span className="font-bold">✓</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
