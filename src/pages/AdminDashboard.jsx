import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  DollarSign,
  ShoppingBag,
  LogOut,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Upload,
  Link,
  TrendingUp,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

export const AdminDashboard = () => {
  const {
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    logoutAdmin,
    updateOrderStatus,
    getProductSoldCount,
    deliveredSalesRevenue,
    deliveredOrdersCount,
  } = useShop();

  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory', 'add', 'orders'
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [openStatusOrder, setOpenStatusOrder] = useState(null);

  // Form State for Add / Edit
  const [form, setForm] = useState({
    title: "",
    category: "Bags",
    price: "",
    originalPrice: "",
    purchasedQty: "0",
    image: "",
    images: [],
    description: "",
    featured: false,
  });

  const [urlInput, setUrlInput] = useState("");

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
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddForm = () => {
    setEditingProduct(null);

    setForm({
      title: "",
      category: "Bags",
      price: "",
      originalPrice: "",
      purchasedQty: "0",
      image: "",
      images: [],
      description: "",
      featured: false,
    });

    setUrlInput("");
    setActiveTab("add");
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);

    setForm({
      title: product.title || "",
      category: product.category || "Bags",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      purchasedQty: (product.purchasedQty || 0).toString(),
      image: product.image || "",
      images: product.images || (product.image ? [product.image] : []),
      description: product.description || "",
      featured: product.featured || false,
    });

    setUrlInput("");
    setActiveTab("add");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const readPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((base64Images) => {
        setForm((prev) => {
          const currentImages = prev.images || [];
          const newImages = [...currentImages, ...base64Images];
          return {
            ...prev,
            images: newImages,
            image: prev.image || base64Images[0] || "",
          };
        });
      })
      .catch((err) => {
        console.error("Error reading files:", err);
        alert("Failed to read some files. Please check the file formats.");
      });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setForm((prev) => {
      const currentImages = prev.images || [];
      const newImages = [...currentImages, urlInput.trim()];
      return {
        ...prev,
        images: newImages,
        image: prev.image || urlInput.trim(),
      };
    });
    setUrlInput("");
  };

  const handleAddPresetImage = (url) => {
    setForm((prev) => {
      const currentImages = prev.images || [];
      if (currentImages.includes(url)) return prev;
      const newImages = [...currentImages, url];
      return {
        ...prev,
        images: newImages,
        image: prev.image || url,
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

  const handleSubmitForm = (e) => {
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

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...updatedProductData,
      });
    } else {
      addProduct(updatedProductData);
    }

    setEditingProduct(null);
    setActiveTab("inventory");
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Admin Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                Authorized Owner Access
              </span>
            </div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Riva Cairo Admin Portal
            </h1>
            <p className="text-xs text-slate-400">
              Manage your bags, wallets, jackets, belts inventory and client
              orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={resetProductsToDefault}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white text-xs font-medium transition-all"
            title="Reset default dataset"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Products</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Total Revenue
            </span>
            <div className="text-2xl font-bold font-serif-brand text-amber-400 mt-1">
              ${totalRevenue.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-400">
              All client orders
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Delivered Sales
            </span>
            <div className="text-2xl font-bold font-serif-brand text-emerald-400 mt-1">
              ${deliveredSalesRevenue.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-400">
              {deliveredOrdersCount} delivered order
              {deliveredOrdersCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Total Orders
            </span>
            <div className="text-2xl font-bold font-serif-brand text-slate-100 mt-1">
              {totalOrdersCount}
            </div>
            <span className="text-[10px] text-slate-500">Live order queue</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Active Inventory
            </span>
            <div className="text-2xl font-bold font-serif-brand text-slate-100 mt-1">
              {totalProductsCount} Items
            </div>
            <span className="text-[10px] text-slate-500">
              Bags, Wallets, Jackets, Belts
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Low Stock Warning
            </span>
            <div className="text-2xl font-bold font-serif-brand text-slate-100 mt-1">
              {outOfStockCount} Items
            </div>
            <span className="text-[10px] text-amber-400">
              Requires restocking
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "inventory"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Inventory List ({products.length})
          </button>

          <button
            onClick={handleOpenAddForm}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "add"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Client Orders ({orders.length})
          </button>
        </div>

        {activeTab === "inventory" && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        )}
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                Category:
              </span>
              {["All", "Bags", "Wallet", "Jacket", "Belt"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

          {/* Products Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Purchased Qty</th>
                    <th className="px-6 py-4">Sold Qty</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No products match your search/filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
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

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {p.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-amber-400">
                          ${p.price?.toFixed(2)}
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
                            {getProductSoldCount(p.id, p.title)}
                          </span>

                          <span className="text-slate-500 text-[10px] ml-1">
                            sold
                          </span>
                        </td>

                        {/* Remaining Stock */}
                        <td className="px-6 py-4 font-mono">
                          {(() => {
                            const purchased = Number(p.purchasedQty || 0);
                            const sold = Number(
                              getProductSoldCount(p.id, p.title) || 0,
                            );

                            const remaining = Math.max(0, purchased - sold);

                            return (
                              <>
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
                              </>
                            );
                          })()}
                        </td>

                        {/* <td className="px-6 py-4">
                          {p.featured ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30">
                              Featured Luxe
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400">
                              Standardfff
                            </span>
                          )}
                        </td> */}

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-2 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* TAB 2: ADD / EDIT PRODUCT FORM */}
      {activeTab === "add" && (
        <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="font-serif-brand text-xl font-bold text-slate-100">
                {editingProduct
                  ? `Edit Product: ${editingProduct.title}`
                  : "Add New Leather Product"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in the product parameters below to display it live on the
                storefront.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("inventory")}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category *
                </label>

                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-semibold transition-all duration-200 focus:outline-none focus:border-amber-500"
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
                  <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-800">
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
                        className={`w-full flex items-center justify-between px-4 py-3 text-xs transition-all ${
                          form.category === option.value
                            ? "bg-amber-500/10 text-amber-400"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
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

            {/* Price, Original Price & Purchased Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-amber-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-blue-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                />

                <p className="mt-1 text-[10px] text-slate-500">
                  Total quantity purchased from the supplier.
                </p>
              </div>

              {/* Remaining Stock - Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Stock
                </label>

                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold font-mono">
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
                  Automatically calculated from purchased quantity minus sold
                  quantity.
                </p>
              </div>
            </div>

            {/* Product Images (Multiple Upload & URL) */}
            <div className="space-y-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Product Images *{" "}
                <span className="text-slate-500">
                  (Upload from device or add URLs. First image is the main
                  cover)
                </span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload from Device */}
                <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/45 flex flex-col items-center justify-center text-center group hover:border-amber-500/50 transition-colors relative cursor-pointer min-h-[120px]">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/tiff"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-7 h-7 text-slate-500 group-hover:text-amber-400 transition-colors mb-1.5" />
                  <span className="text-xs text-slate-300 font-medium">
                    Upload from Device
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Supports PNG, JPG, WEBP, GIF, BMP, SVG, AVIF & more
                  </span>
                </div>

                {/* URL Input */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between min-h-[120px]">
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-amber-400" />
                      Add Image via Web URL
                    </span>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="w-full mt-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/30 text-xs font-semibold transition-all"
                  >
                    Add URL Image
                  </button>
                </div>
              </div>

              {/* Sample Presets */}
              {/* <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-400">
                <span className="text-slate-500 shrink-0">Sample Images:</span>
                <button
                  type="button"
                  onClick={() => handleAddPresetImage('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80')}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 shrink-0"
                >
                  Brown Bag
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetImage('https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80')}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 shrink-0"
                >
                  Leather Wallet
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetImage('https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80')}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 shrink-0"
                >
                  Biker Jacket
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetImage('https://images.unsplash.com/photo-1624222247344-550fb8ec5522?auto=format&fit=crop&w=800&q=80')}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 shrink-0"
                >
                  Dress Belt
                </button>
              </div> */}

              {/* Gallery List Preview */}
              {form.images && form.images.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs text-slate-400">
                    Current Image Gallery ({form.images.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {form.images.map((imgSrc, index) => {
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
                            src={imgSrc}
                            alt={`Gallery ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(imgSrc)}
                                className="px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-lg hover:bg-amber-400"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1.5 bg-red-950/80 text-red-400 rounded-lg hover:bg-red-900 hover:text-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold">
                              COVER
                            </span>
                          )}

                          {/* Number Badge */}
                          <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900/90 text-[10px] text-slate-300 flex items-center justify-center border border-slate-700 font-mono">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Featured toggle */}
            {/* <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="featured" className="text-xs font-medium text-slate-300 cursor-pointer">
                Mark as Featured Luxe Item (Showcase on Hero Banner)
              </label>
            </div> */}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20"
            >
              {editingProduct
                ? "Save Product Changes"
                : "Publish Product to Store"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CLIENT ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-serif-brand font-bold text-slate-200">
              Recent Client Orders ({orders.length})
            </div>

            <div className="overflow-x-auto">
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
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-800/40 transition-colors"
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
                          <div className="relative inline-block min-w-36.25">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenStatusOrder(
                                  openStatusOrder === order.id
                                    ? null
                                    : order.id,
                                )
                              }
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold border bg-slate-950 transition-all duration-200 focus:outline-none ${
                                order.status === "Delivered"
                                  ? "text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60"
                                  : order.status === "Shipped"
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
                              <div className="absolute right-0 top-full mt-2 w-45 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                                {[
                                  {
                                    value: "Pending",
                                    label: "Pending",
                                    color: "amber",
                                  },
                                  {
                                    value: "Shipped",
                                    label: "Shipped",
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
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all ${
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
