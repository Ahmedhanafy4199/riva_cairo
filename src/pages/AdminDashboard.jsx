import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  LuChevronLeft,
  LuChevronRight,
  LuUpload as Upload,
  LuTrendingUp as TrendingUp,
  LuPhone,
  LuMapPin,
  LuBoxes,
  LuTriangleAlert,
  LuExternalLink,
  LuPackageCheck,
  LuX,
  LuCheckCheck,
} from "react-icons/lu";
import { useShop } from "../context/ShopContext";
import { RichTextEditor } from "../components/RichTextEditor";
import { htmlToText, isHtmlEmpty } from "../lib/htmlUtils";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  label = "items",
}) => {
  if (totalItems <= itemsPerPage) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 sm:px-2 select-none">
      <div className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIdx}</span>-
        <span className="font-semibold text-slate-800 dark:text-slate-200">{endIdx}</span> of{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> {label}
      </div>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          aria-label="Previous page"
        >
          <LuChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === p
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold"
                    : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Compact Mobile Page Info */}
        <span className="sm:hidden px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 font-serif-brand">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <LuChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

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

  // Navigation Tabs: 'inventory', 'add', 'orders'
  const [activeTab, setActiveTab] = useState("inventory");

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

  // Orders Filter Sub-tabs & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState("All"); // 'All', 'Pending', 'Processing', 'Delivered', 'Returned'
  const [orderSearchTerm, setOrderSearchTerm] = useState("");

  // Card Interactive Modals
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  // Helper to calculate inventory status
  const getProductInventory = (product) => {
    const purchasedQty = Number(product.purchasedQty ?? product.purchased_qty ?? 0);
    const soldQty = Number(product.sold ?? 0);
    const stock = Number(product.qtyStock ?? product.qty_stock ?? product.stock ?? 0);

    return {
      purchasedQty,
      soldQty,
      stock,
    };
  };

  // ----------------------------------------------------------------
  // Real-time KPI Calculations
  // ----------------------------------------------------------------
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const processingOrders = orders.filter((o) => o.status === "Processing");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const returnedOrders = orders.filter((o) => o.status === "Returned");

  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const processingRevenue = processingOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const returnedRevenue = returnedOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const actualDeliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const deliveryFulfillmentRate = totalOrdersCount > 0 ? (deliveredOrders.length / totalOrdersCount) * 100 : 0;

  // Inventory valuation & units
  const totalInventoryUnits = products.reduce((sum, p) => sum + getProductInventory(p).stock, 0);
  const totalInventoryRetailValue = products.reduce(
    (sum, p) => sum + getProductInventory(p).stock * (parseFloat(p.price) || 0),
    0
  );

  const lowStockProducts = products.filter((product) => {
    const { stock } = getProductInventory(product);
    return stock <= 2;
  });
  const outOfStockCount = lowStockProducts.length;

  // Category breakdown for inventory
  const categoryStats = React.useMemo(() => {
    const cats = {
      Bags: { count: 0, stock: 0, value: 0 },
      Wallet: { count: 0, stock: 0, value: 0 },
      Jacket: { count: 0, stock: 0, value: 0 },
      Belt: { count: 0, stock: 0, value: 0 },
      Other: { count: 0, stock: 0, value: 0 },
    };
    products.forEach((p) => {
      const cat = cats[p.category] ? p.category : "Other";
      const { stock } = getProductInventory(p);
      cats[cat].count += 1;
      cats[cat].stock += stock;
      cats[cat].value += stock * (parseFloat(p.price) || 0);
    });
    return cats;
  }, [products]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    setOpenStatusOrder(null);
    await updateOrderStatus(orderId, status);
  };

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

  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const deferredSearchTerm = React.useDeferredValue(searchTerm);

  const filteredProducts = React.useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory =
        filterCategory === "All" || p.category === filterCategory;
      const matchesSearch =
        !term ||
        (p.title && p.title.toLowerCase().includes(term)) ||
        // (p.category && p.category.toLowerCase().includes(term)) ||
        (p.barcode && p.barcode.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, deferredSearchTerm]);

  React.useEffect(() => {
    setProductPage(1);
  }, [filterCategory, deferredSearchTerm]);

  const totalProductPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const safeProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = filteredProducts.slice(
    (safeProductPage - 1) * ITEMS_PER_PAGE,
    safeProductPage * ITEMS_PER_PAGE
  );

  // Filtered Orders for the Orders Tab
  const deferredOrderSearch = React.useDeferredValue(orderSearchTerm);
  const filteredOrders = React.useMemo(() => {
    const search = deferredOrderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === "All" || order.status === orderStatusFilter;

      if (!matchesStatus) return false;

      if (!search) return true;

      const matchesId = order.id?.toLowerCase().includes(search);
      const matchesCustomer = order.customerName?.toLowerCase().includes(search);
      const matchesPhone = order.phone?.toLowerCase().includes(search);
      const matchesAddress = order.address?.toLowerCase().includes(search) || order.city?.toLowerCase().includes(search);
      const matchesItems = order.items?.some((item) => item.title?.toLowerCase().includes(search));

      return matchesId || matchesCustomer || matchesPhone || matchesAddress || matchesItems;
    });
  }, [orders, orderStatusFilter, deferredOrderSearch]);

  React.useEffect(() => {
    setOrderPage(1);
  }, [orderStatusFilter, deferredOrderSearch]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const safeOrderPage = Math.min(orderPage, totalOrderPages);
  const paginatedOrders = filteredOrders.slice(
    (safeOrderPage - 1) * ITEMS_PER_PAGE,
    safeOrderPage * ITEMS_PER_PAGE
  );

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

    if (allImages.length > 0 && !mainImage) {
      mainImage = allImages[0];
    }

    if (mainImage && allImages.length === 0) {
      allImages = [mainImage];
    }

    if (
      !form.title.trim() ||
      !form.price ||
      !mainImage ||
      isHtmlEmpty(form.description)
    ) {
      alert(
        "Please fill in all required fields (Title, Price, at least one Image, Description).",
      );
      return;
    }

    const purchasedQty = Math.max(0, parseInt(form.purchasedQty, 10) || 0);
    const soldQty = editingProduct ? Number(editingProduct.sold || 0) : 0;
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
      sold: soldQty,
      qtyStock: stock,
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

      if (result !== null && result !== false) {
        setEditingProduct(null);
        setActiveTab("inventory");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn py-12 sm:pb-16 max-w-full overflow-hidden">
      {/* Admin Top Header */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ">
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
            <h1 className="font-serif-brand sm:text-2xl md:text-3xl font-semibold text-slate-100 mt-1 truncate">
              Riva Cairo Admin Portal
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Manage inventory, prices, stock, and client orders
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

      {/* ═══════════════════════════════════════════════════
          INTERACTIVE KPI CARDS OVERVIEW (5 CLEAN CARDS)
      ═══════════════════════════════════════════════════ */}
      <div className="px-3 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {/* Card 1: Total Revenue */}
          <button
            type="button"
            onClick={() => setIsRevenueModalOpen(true)}
            className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md transition-all cursor-pointer group text-left relative overflow-hidden active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate block">
                Total Revenue
              </span>
              <div className="text-sm sm:text-lg md:text-xl font-bold font-serif-brand text-amber-400 group-hover:text-amber-300 mt-0.5 truncate transition-colors">
                {totalRevenue.toFixed(2)}
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-400/90 truncate block group-hover:underline">
                View Financials &rarr;
              </span>
            </div>
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 shrink-0 transition-all">
              <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </button>

          {/* Card 2: Delivered Sales */}
          <button
            type="button"
            onClick={() => setIsDeliveredModalOpen(true)}
            className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md transition-all cursor-pointer group text-left relative overflow-hidden active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate block">
                Delivered Sales
              </span>
              <div className="text-sm sm:text-lg md:text-xl font-bold font-serif-brand text-emerald-400 group-hover:text-emerald-300 mt-0.5 truncate transition-colors">
                {actualDeliveredRevenue.toFixed(2)}
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-400/90 truncate block group-hover:underline">
                {deliveredOrders.length} orders &bull; Details &rarr;
              </span>
            </div>
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 shrink-0 transition-all">
              <LuPackageCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </button>

          {/* Card 3: Total Orders */}
          <button
            type="button"
            onClick={() => setIsOrdersModalOpen(true)}
            className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md transition-all cursor-pointer group text-left relative overflow-hidden active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate block">
                Total Orders
              </span>
              <div className="text-sm sm:text-lg md:text-xl font-bold font-serif-brand text-slate-100 group-hover:text-blue-300 mt-0.5 truncate transition-colors">
                {totalOrdersCount}
              </div>
              <span className="text-[9px] sm:text-[10px] text-blue-400/90 truncate block group-hover:underline">
                Status Queue &rarr;
              </span>
            </div>
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 shrink-0 transition-all">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </button>

          {/* Card 4: Active Items */}
          <button
            type="button"
            onClick={() => setIsInventoryModalOpen(true)}
            className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md transition-all cursor-pointer group text-left relative overflow-hidden active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate block">
                Active Items
              </span>
              <div className="text-sm sm:text-lg md:text-xl font-bold font-serif-brand text-slate-100 group-hover:text-purple-300 mt-0.5 truncate transition-colors">
                {totalProductsCount}
              </div>
              <span className="text-[9px] sm:text-[10px] text-purple-400/90 truncate block group-hover:underline">
                {totalInventoryUnits} units &bull; Stats &rarr;
              </span>
            </div>
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 shrink-0 transition-all">
              <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </button>

          {/* Card 5: Low Stock Warning */}
          <button
            type="button"
            onClick={() => setIsLowStockModalOpen(true)}
            className="col-span-2 sm:col-span-1 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md transition-all cursor-pointer group text-left relative overflow-hidden active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate block">
                Low Stock
              </span>
              <div className="text-sm sm:text-lg md:text-xl font-bold font-serif-brand text-amber-400 group-hover:text-amber-300 mt-0.5 truncate transition-colors">
                {outOfStockCount}
              </div>
              <span className="text-[9px] sm:text-[10px] text-amber-400/90 truncate block group-hover:underline">
                Stock &le; 2 &bull; Restock &rarr;
              </span>
            </div>
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 shrink-0 transition-all">
              <LuTriangleAlert className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          ADMIN MAIN NAVIGATION TABS
      ═══════════════════════════════════════════════════ */}
      <div className="flex flex-col px-4 sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 p-1 rounded-xl sm:rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
          {/* Inventory Tab */}
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({products.length})</span>
          </button>

          {/* Add / Edit Product Tab */}
          {/* <button
            onClick={handleOpenAddForm}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "add"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingProduct ? "Edit Product" : "Add Product"}</span>
          </button> */}

          {/* Orders Tab */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
            {pendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {activeTab === "inventory" && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add New Item</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          TAB 1: INVENTORY MANAGEMENT
      ═══════════════════════════════════════════════════ */}
      {activeTab === "inventory" && (
        <div className="space-y-4 px-4 sm:space-y-6">
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

          {/* Mobile Inventory Cards (< 1024px) */}
          <div className="block lg:hidden space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No products match your search or category filter.
              </div>
            ) : (
              paginatedProducts.map((p) => {
                const {
                  purchasedQty: purchased,
                  soldQty: sold,
                  stock: remaining,
                } = getProductInventory(p);

                return (
                  <div
                    key={p.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md"
                  >
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
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-serif-brand font-semibold bg-slate-950 text-amber-400/90 border border-slate-800">
                            {p.barcode || `RC-${(p.category || "PRD").substring(0, 3).toUpperCase()}-001`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80 text-center font-serif-brand">
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Price</span>
                        <span className="text-xs font-semibold text-amber-400">
                          {p.price?.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Purchased</span>
                        <span className="text-xs font-semibold text-blue-400">
                          {p.purchasedQty || 0}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Sold</span>
                        <span className="text-xs font-semibold text-emerald-400">
                          {sold}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 block">Stock</span>
                        <span
                          className={`text-xs font-semibold ${
                            remaining === 0
                              ? "text-red-400 font-bold"
                              : remaining <= 2
                                ? "text-amber-400 font-bold"
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

          {/* Desktop Products Table (>= 1024px) */}
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
                    paginatedProducts.map((p) => {
                      const {
                        purchasedQty: purchased,
                        soldQty: sold,
                        stock: remaining,
                      } = getProductInventory(p);

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
                                  {htmlToText(p.description)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-serif-brand">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-serif-brand bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {p.barcode ||
                                `RC-${(p.category || "PRD").substring(0, 3).toUpperCase()}-001`}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {p.category}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-serif-brand font-semibold text-amber-400">
                            {p.price?.toFixed(2)}
                          </td>

                          <td className="px-6 py-4 font-serif-brand">
                            <span className="text-blue-400 font-semibold">
                              {p.purchasedQty || 0}
                            </span>
                            <span className="text-slate-500 text-[10px] ml-1">
                              units
                            </span>
                          </td>

                          <td className="px-6 py-4 font-serif-brand">
                            <span className="text-emerald-400 font-semibold">
                              {sold}
                            </span>
                            <span className="text-slate-500 text-[10px] ml-1">
                              sold
                            </span>
                          </td>

                          <td className="px-6 py-4 font-serif-brand">
                            <span
                              className={
                                remaining === 0
                                  ? "text-red-400 font-bold px-2 py-0.5 bg-red-950/60 rounded-md border border-red-500/30"
                                  : remaining <= 2
                                    ? "text-amber-400 font-bold px-2 py-0.5  rounded-md border border-amber-500/30"
                                    : "text-slate-200 font-semibold"
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

          <Pagination
            currentPage={safeProductPage}
            totalPages={totalProductPages}
            onPageChange={setProductPage}
            totalItems={filteredProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            label="products"
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 2: ADD / EDIT PRODUCT FORM
      ═══════════════════════════════════════════════════ */}
      {activeTab === "add" && (
        <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5 sm:mb-6">
            <div>
              <h2 className="font-serif-brand sm:text-xl font-semibold text-slate-100">
                {editingProduct
                  ? `Edit Product: ${editingProduct.title}`
                  : "Add New Leather Product"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Fill in the product parameters below to display it live on the storefront.
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
                          <span className="text-amber-400 font-semibold">✓</span>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-amber-400 font-serif-brand font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Price, Original Price & Purchased Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-amber-400 font-semibold font-serif-brand focus:outline-none focus:border-amber-500"
                />
              </div>

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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-slate-400 font-serif-brand focus:outline-none focus:border-amber-500"
                />
              </div>

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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-blue-400 font-semibold font-serif-brand focus:outline-none focus:border-amber-500"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Total quantity purchased from the supplier.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Stock Preview
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs font-semibold font-serif-brand">
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
                            ? "text-red-400 font-bold"
                            : remaining <= 2
                              ? "text-amber-400 font-bold"
                              : "text-emerald-400 font-semibold"
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

            {/* Images Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Product Images *
              </label>

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
                                className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-semibold rounded hover:bg-amber-400 cursor-pointer"
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

                          {isCover && (
                            <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-semibold">
                              COVER
                            </span>
                          )}

                          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-slate-900/90 text-[9px] text-slate-300 flex items-center justify-center border border-slate-700 font-serif-brand">
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
              <RichTextEditor
                value={form.description}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, description: val }))
                }
                placeholder="Handcrafted from vegetable-tanned leather..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-xs sm:text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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

      {/* ═══════════════════════════════════════════════════
          TAB 3: CLIENT ORDERS MANAGEMENT WITH STATUS TABS
      ═══════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-4 px-4 sm:space-y-6 relative">
          {openStatusOrder !== null && (
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setOpenStatusOrder(null)}
            />
          )}

          {/* Orders Controls: Status Tabs & Search Bar */}
          <div className="bg-slate-900/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "All", label: "All Orders", count: orders.length, color: "slate" },
                { id: "Pending", label: "Pending", count: pendingOrders.length, color: "amber" },
                { id: "Processing", label: "Processing", count: processingOrders.length, color: "blue" },
                { id: "Delivered", label: "Delivered", count: deliveredOrders.length, color: "emerald" },
                { id: "Returned", label: "Returned", count: returnedOrders.length, color: "red" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    orderStatusFilter === tab.id
                      ? tab.color === "amber"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10"
                        : tab.color === "blue"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/10"
                          : tab.color === "emerald"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10"
                            : tab.color === "red"
                              ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-sm shadow-red-500/10"
                              : "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                      : "bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      orderStatusFilter === tab.id && tab.id === "All"
                        ? "bg-slate-950 text-amber-400 font-bold"
                        : "bg-slate-900 text-slate-300 border border-slate-700/50"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order ID, client, phone, item..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {orderSearchTerm && (
                <button
                  type="button"
                  onClick={() => setOrderSearchTerm("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Orders Cards (< 1024px) */}
          <div className="block lg:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No orders match your filter or search query.
              </div>
            ) : (
              paginatedOrders.map((order) => {
                const isReturned = order.status === "Returned";

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl p-3.5 space-y-3 shadow-md border transition-all ${
                      isReturned
                        ? "bg-red-950/15 border-red-500/30 ring-1 ring-red-500/20"
                        : "bg-slate-900/70 border-slate-800"
                    }`}
                  >
                    {/* Header: ID, Date, Amount */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">Order</span>
                          <span className="font-serif-brand font-semibold text-amber-400 text-xs sm:text-sm">
                            {order.id}
                          </span>
                        </div>
                        {order.createdAt && (
                          <span className="text-[10px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Total</span>
                        <div className="font-serif-brand font-semibold text-slate-100 text-sm sm:text-base">
                          {order.totalAmount?.toFixed(2)} EGP
                        </div>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-slate-200 flex items-center justify-between">
                        <span>{order.customerName}</span>
                      </div>
                      {order.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <LuPhone className="w-3 h-3 text-amber-400 shrink-0" />
                          <a
                            href={`tel:${order.phone}`}
                            className="hover:text-amber-400 font-serif-brand underline"
                          >
                            {order.phone}
                          </a>
                        </div>
                      )}
                      {order.address && (
                        <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                          <LuMapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                          <span>{order.address}{order.city ? `, ${order.city}` : ""}</span>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/70 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                        <LuBoxes className="w-2.5 h-2.5 text-amber-400" />
                        Purchased Items
                      </span>
                      {order.items?.map((item, idx) => {
                        const targetProductId =
                          item.productId ||
                          item.product_id ||
                          item.id ||
                          products.find(
                            (p) =>
                              p.title?.toLowerCase() === item.title?.toLowerCase()
                          )?.id;

                        return (
                          <div
                            key={idx}
                            className="text-[11px] text-slate-300 flex items-center justify-between"
                          >
                            {targetProductId ? (
                              <Link
                                to={`/product/${targetProductId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate text-slate-200 hover:text-amber-400 hover:underline transition-colors flex items-center gap-1 group font-medium"
                                title={`View ${item.title} page`}
                              >
                                <span className="truncate">{item.title}</span>
                                <LuExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ) : (
                              <span className="truncate">{item.title}</span>
                            )}
                            <span className="font-serif-brand text-amber-400 font-semibold shrink-0 ml-2">
                              x{item.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Dropdown */}
                    <div className="pt-1 relative">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400 font-medium">Status:</span>
                        <div className="relative inline-block w-44">
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
                                  : order.status === "Returned"
                                    ? "text-red-400 border-red-500/40 bg-red-950/40"
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
                            <div className="absolute right-0 w-44 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-slate-950 overflow-hidden top-full mt-1">
                              {[
                                { value: "Pending",    label: "Pending",    color: "amber"   },
                                { value: "Processing", label: "Processing", color: "blue"    },
                                { value: "Delivered",  label: "Delivered",  color: "emerald" },
                                { value: "Returned",   label: "Returned",   color: "red"     },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id, option.value)}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all cursor-pointer ${
                                    order.status === option.value
                                      ? option.color === "amber"
                                        ? "bg-amber-500/10 text-amber-400"
                                        : option.color === "blue"
                                          ? "bg-blue-500/10 text-blue-400"
                                          : option.color === "red"
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-emerald-500/10 text-emerald-400"
                                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  {order.status === option.value && (
                                    <span className="font-semibold">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (>= 1024px) */}
          <div className="hidden lg:block bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between font-serif-brand font-semibold text-slate-200 rounded-t-2xl">
              <span>Orders Queue ({filteredOrders.length} filtered / {orders.length} total)</span>
              <span className="text-xs font-sans text-slate-400 font-normal">
                Status Filter: <strong className="text-amber-400">{orderStatusFilter}</strong>
              </span>
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No orders recorded matching your filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order, orderIdx) => {
                      const isReturned = order.status === "Returned";

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isReturned
                              ? "bg-red-950/20 hover:bg-red-950/30"
                              : openStatusOrder === order.id
                                ? "relative z-50 bg-slate-800/60"
                                : "relative z-1 hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="px-6 py-4 font-serif-brand">
                            <span className="font-semibold text-amber-400 block">
                              {order.id}
                            </span>
                            {order.createdAt && (
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-200">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-serif-brand text-[11px] text-slate-300">
                              {order.phone}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {order.address}{order.city ? `, ${order.city}` : ""}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              {order.items?.map((item, idx) => {
                                const targetProductId =
                                  item.productId ||
                                  item.product_id ||
                                  item.id ||
                                  products.find(
                                    (p) =>
                                      p.title?.toLowerCase() === item.title?.toLowerCase()
                                  )?.id;

                                return (
                                  <div
                                    key={idx}
                                    className="text-[11px] text-slate-300 flex items-center gap-1.5"
                                  >
                                    <span className="text-slate-400 font-serif-brand shrink-0">
                                      {item.quantity}x
                                    </span>
                                    {targetProductId ? (
                                      <Link
                                        to={`/product/${targetProductId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-100 font-medium hover:text-amber-400 hover:underline transition-colors inline-flex items-center gap-1 group"
                                        title={`View ${item.title} page`}
                                      >
                                        <span>{item.title}</span>
                                        <LuExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </Link>
                                    ) : (
                                      <span className="text-slate-100 font-medium">
                                        {item.title}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-serif-brand font-semibold text-slate-100">
                            {order.totalAmount?.toFixed(2)} EGP
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
                                      : order.status === "Returned"
                                        ? "text-red-400 border-red-500/40 bg-red-950/40 hover:border-red-500/70"
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
                                    paginatedOrders.length > 3 &&
                                    orderIdx >= paginatedOrders.length - 2
                                      ? "bottom-full mb-2"
                                      : "top-full mt-2"
                                  }`}
                                >
                                  {[
                                    { value: "Pending",    label: "Pending",    color: "amber"   },
                                    { value: "Processing", label: "Processing", color: "blue"    },
                                    { value: "Delivered",  label: "Delivered",  color: "emerald" },
                                    { value: "Returned",   label: "Returned",   color: "red"     },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => handleUpdateOrderStatus(order.id, option.value)}
                                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all cursor-pointer ${
                                        order.status === option.value
                                          ? option.color === "amber"
                                            ? "bg-amber-500/10 text-amber-400"
                                            : option.color === "blue"
                                              ? "bg-blue-500/10 text-blue-400"
                                              : option.color === "red"
                                                ? "bg-red-500/10 text-red-400"
                                                : "bg-emerald-500/10 text-emerald-400"
                                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                      }`}
                                    >
                                      <span>{option.label}</span>

                                      {order.status === option.value && (
                                        <span className="font-semibold">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
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

          <Pagination
            currentPage={safeOrderPage}
            totalPages={totalOrderPages}
            onPageChange={setOrderPage}
            totalItems={filteredOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            label="orders"
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL 1: FINANCIAL & TOTAL REVENUE DRILL-DOWN
      ═══════════════════════════════════════════════════ */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setIsRevenueModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-brand font-semibold text-slate-100 text-sm sm:text-base md:text-lg truncate">
                    Revenue &amp; Financial Analytics
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Gross Volume, Realized Cash, and In-Pipeline Value
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevenueModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0 ml-2"
                aria-label="Close modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 flex-1 scrollbar-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 font-serif-brand">
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 block font-semibold">
                    Gross Order Volume
                  </span>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-400 mt-1 truncate">
                    {totalRevenue.toFixed(2)} EGP
                  </div>
                  <span className="text-[10px] font-sans text-slate-500 block mt-0.5">
                    Total value across {orders.length} orders
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-400 block font-semibold">
                    Realized Delivered Cash
                  </span>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-400 mt-1 truncate">
                    {actualDeliveredRevenue.toFixed(2)} EGP
                  </div>
                  <span className="text-[10px] font-sans text-slate-500 block mt-0.5">
                    {deliveredOrders.length} delivered orders
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-blue-500/30">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-blue-400 block font-semibold">
                    In Pipeline (Pending/Processing)
                  </span>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 mt-1 truncate">
                    {(pendingRevenue + processingRevenue).toFixed(2)} EGP
                  </div>
                  <span className="text-[10px] font-sans text-slate-500 block mt-0.5">
                    {pendingOrders.length + processingOrders.length} orders in progress
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-red-500/30">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-red-400 block font-semibold">
                    Returned / Cancelled Value
                  </span>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-400 mt-1 truncate">
                    {returnedRevenue.toFixed(2)} EGP
                  </div>
                  <span className="text-[10px] font-sans text-slate-500 block mt-0.5">
                    {returnedOrders.length} orders returned
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsRevenueModalOpen(false);
                  setActiveTab("orders");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-all text-center cursor-pointer shadow-md shadow-amber-500/10"
              >
                Go to Orders Tab &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsRevenueModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL 2: DELIVERED SALES DRILL-DOWN
      ═══════════════════════════════════════════════════ */}
      {isDeliveredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setIsDeliveredModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <LuPackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-brand font-semibold text-slate-100 text-sm sm:text-base md:text-lg truncate">
                    Delivered Orders &amp; Fulfillment
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Realized deliveries and customer receipts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveredModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0 ml-2"
                aria-label="Close modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 flex-1 scrollbar-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-center">
                <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Delivered Revenue</span>
                  <div className="text-xl sm:text-2xl font-bold font-serif-brand text-emerald-400 mt-1 truncate">
                    {actualDeliveredRevenue.toFixed(2)} EGP
                  </div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Delivered Count</span>
                  <div className="text-xl sm:text-2xl font-bold font-serif-brand text-slate-100 mt-1 truncate">
                    {deliveredOrders.length} orders
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Delivered Orders ({deliveredOrders.length})
                </span>
                {deliveredOrders.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 text-xs bg-slate-950/40 rounded-xl border border-slate-800/50">
                    No orders have been marked as delivered yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
                    {deliveredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-200 truncate">{order.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            Order #{order.id} &bull; {order.items?.length || 0} items
                          </div>
                        </div>
                        <div className="text-right font-serif-brand shrink-0">
                          <span className="font-semibold text-emerald-400 block text-xs sm:text-sm">
                            {order.totalAmount?.toFixed(2)} EGP
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDeliveredModalOpen(false);
                  setOrderStatusFilter("Delivered");
                  setActiveTab("orders");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-all text-center cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Filter Delivered in Orders Tab &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsDeliveredModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL 3: ORDERS STATUS OVERVIEW DRILL-DOWN
      ═══════════════════════════════════════════════════ */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setIsOrdersModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-brand font-semibold text-slate-100 text-sm sm:text-base md:text-lg truncate">
                    Orders Queue &amp; Status
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Live distribution of client orders by status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOrdersModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0 ml-2"
                aria-label="Close modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 flex-1 scrollbar-none">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrdersModalOpen(false);
                    setOrderStatusFilter("Pending");
                    setActiveTab("orders");
                  }}
                  className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 text-left transition-colors cursor-pointer group active:scale-[0.98]"
                >
                  <span className="text-[11px] sm:text-xs text-amber-400 font-semibold flex items-center justify-between">
                    <span>Pending</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal hidden sm:inline">Filter &rarr;</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-serif-brand text-amber-400 mt-1">
                    {pendingOrders.length}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
                    {pendingRevenue.toFixed(0)} EGP volume
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOrdersModalOpen(false);
                    setOrderStatusFilter("Processing");
                    setActiveTab("orders");
                  }}
                  className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 hover:border-blue-500 text-left transition-colors cursor-pointer group active:scale-[0.98]"
                >
                  <span className="text-[11px] sm:text-xs text-blue-400 font-semibold flex items-center justify-between">
                    <span>Processing</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal hidden sm:inline">Filter &rarr;</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-serif-brand text-blue-400 mt-1">
                    {processingOrders.length}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
                    {processingRevenue.toFixed(0)} EGP volume
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOrdersModalOpen(false);
                    setOrderStatusFilter("Delivered");
                    setActiveTab("orders");
                  }}
                  className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 text-left transition-colors cursor-pointer group active:scale-[0.98]"
                >
                  <span className="text-[11px] sm:text-xs text-emerald-400 font-semibold flex items-center justify-between">
                    <span>Delivered</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal hidden sm:inline">Filter &rarr;</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-serif-brand text-emerald-400 mt-1">
                    {deliveredOrders.length}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
                    {actualDeliveredRevenue.toFixed(0)} EGP realized
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOrdersModalOpen(false);
                    setOrderStatusFilter("Returned");
                    setActiveTab("orders");
                  }}
                  className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-red-500/30 hover:border-red-500 text-left transition-colors cursor-pointer group active:scale-[0.98]"
                >
                  <span className="text-[11px] sm:text-xs text-red-400 font-semibold flex items-center justify-between">
                    <span>Returned</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal hidden sm:inline">Filter &rarr;</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-serif-brand text-red-400 mt-1">
                    {returnedOrders.length}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
                    {returnedRevenue.toFixed(0)} EGP returned
                  </span>
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsOrdersModalOpen(false);
                  setOrderStatusFilter("All");
                  setActiveTab("orders");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-all text-center cursor-pointer shadow-md shadow-amber-500/10"
              >
                View All Orders &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsOrdersModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL 4: INVENTORY & CATALOG VALUATION DRILL-DOWN
      ═══════════════════════════════════════════════════ */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setIsInventoryModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-brand font-semibold text-slate-100 text-sm sm:text-base md:text-lg truncate">
                    Inventory &amp; Stock Intelligence
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Catalog count, physical stock, and retail valuation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInventoryModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0 ml-2"
                aria-label="Close modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 flex-1 scrollbar-none">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 font-serif-brand text-center">
                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-purple-500/30">
                  <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 block font-semibold uppercase">
                    Catalog
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-100 mt-0.5 sm:mt-1">
                    {totalProductsCount}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 block font-semibold uppercase">
                    Units
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-blue-400 mt-0.5 sm:mt-1">
                    {totalInventoryUnits}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] font-sans text-slate-400 block font-semibold uppercase">
                    Valuation
                  </span>
                  <div className="text-xs sm:text-xl font-bold text-amber-400 mt-0.5 sm:mt-1 truncate">
                    {totalInventoryRetailValue.toFixed(0)} <span className="text-[9px] font-normal">EGP</span>
                  </div>
                </div>
              </div>

              {/* Category distribution */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Category Distribution
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(categoryStats).map(([catName, stats]) => (
                    <div
                      key={catName}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-amber-400">{catName}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {stats.count} models
                        </span>
                      </div>
                      <div className="text-right font-serif-brand">
                        <span className="font-semibold text-slate-200">{stats.stock} units</span>
                        <span className="text-[10px] text-slate-500 block">
                          {stats.value.toFixed(0)} EGP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsInventoryModalOpen(false);
                  setActiveTab("inventory");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-500 text-slate-950 font-semibold text-xs hover:bg-purple-400 transition-all text-center cursor-pointer shadow-md shadow-purple-500/10"
              >
                Go to Inventory Tab &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsInventoryModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL 5: LOW STOCK & RESTOCK ALERT CENTER
      ═══════════════════════════════════════════════════ */}
      {isLowStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setIsLowStockModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <LuTriangleAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-brand font-semibold text-slate-100 text-sm sm:text-base md:text-lg truncate">
                    Low Stock &amp; Restock Alert Center
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Products with stock &le; 2 units requiring replenishment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLowStockModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0 ml-2"
                aria-label="Close modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-3.5 sm:p-6 space-y-3 flex-1 scrollbar-none">
              {lowStockProducts.length === 0 ? (
                <div className="text-center text-slate-500 py-12 text-xs bg-slate-950/40 rounded-xl border border-slate-800/50">
                  <LuCheckCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                  All products have sufficient stock levels!
                </div>
              ) : (
                lowStockProducts.map((p) => {
                  const { stock, purchasedQty, soldQty } = getProductInventory(p);
                  const isOutOfStock = stock === 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                            <span className="text-amber-400 font-mono">#{p.barcode}</span>
                            <span>&bull;</span>
                            <span>{p.category}</span>
                            <span>&bull;</span>
                            <span className="font-serif-brand font-semibold text-slate-300">{p.price?.toFixed(2)} EGP</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Purchased: {purchasedQty} | Sold: {soldQty}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold font-serif-brand ${
                            isOutOfStock
                              ? "bg-red-950 text-red-400 border border-red-500/30"
                              : "text-amber-400 border border-amber-500/30 bg-amber-500/10"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock (0)" : `${stock} Left`}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setIsLowStockModalOpen(false);
                            handleStartEdit(p);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-semibold hover:bg-amber-400 transition-all cursor-pointer shadow-sm"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-left">
                Total alert items: <strong className="text-amber-400">{lowStockProducts.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsLowStockModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
