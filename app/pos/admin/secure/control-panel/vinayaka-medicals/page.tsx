"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Receipt,
  Search,
  ChevronDown,
  X,
  PackagePlus,
  ShoppingBag,
  Trash2,
  Plus,
  TrendingUp,
  Trophy,
  IndianRupee,
  BarChart2,
  Package,
  List,
  Globe,
  Zap,
  Menu,
  Printer,
  History,
  ChevronLeft,
  ChevronRight,
  Percent,
  Calendar,
  Download,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Lock,
  Pencil,
  Boxes,
  AlertTriangle,
  Pill,
  Check,
  PackageX,
} from "lucide-react";
import {
  verifyPasscode,
  fetchProducts,
  fetchOrders,
  submitOrder,
  removeOrder,
  createProduct,
  editProduct,
  removeProduct,
  createBatch,
  removeBatch,
  editBatch,
} from "@/app/pos/actions";
import { ProductWithBatches, ProductBatch, CartItem } from "@/lib/types";

type CatalogItem = {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  mfgDate?: string;
  expiryDate?: string;
  scheduleCategory?: "NONE" | "H" | "H1";
  stockQuantity?: number;
  lowStockThreshold?: number;
  batchNo?: string;
  manufacturer?: string;
  hsnCode?: string;
  batches?: ProductBatch[];
  productId?: string;
};

type OrderItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  qty: number;
  product_id?: string | null;
  batch_id?: string | null;
};

type CompletedOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  source: "ONLINE" | "OFFLINE";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType?: "PERCENT" | "FIXED";
  discountValue?: number;
  deliveryFee: number;
  grandTotal: number;
  cashReceived: number;
  date: string;
  createdAt: string;
  status: "Completed" | "Pending";
};

const SearchableItemInput = ({
  item,
  catalog,
  updateItem,
}: {
  item: OrderItem;
  catalog: CatalogItem[];
  updateItem: (id: string, field: keyof OrderItem, value: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCatalog = catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(internalSearch.toLowerCase()) ||
      (c.desc && c.desc.toLowerCase().includes(internalSearch.toLowerCase())),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [internalSearch, isOpen]);

  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== "Escape") {
      setIsOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCatalog.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCatalog[selectedIndex]) {
        const catItem = filteredCatalog[selectedIndex];
        updateItem(item.id, "name", catItem.name);
        updateItem(item.id, "desc", catItem.desc || "");
        updateItem(item.id, "product_id", catItem.productId || null);
        if (catItem.price !== undefined) {
          updateItem(item.id, "price", catItem.price);
        }
        setIsOpen(false);
        setTimeout(() => {
          const priceInput = document.getElementById(`price-${item.id}`);
          if (priceInput) priceInput.focus();
        }, 50);
      } else if (internalSearch.trim()) {
        updateItem(item.id, "name", internalSearch.trim());
        updateItem(item.id, "desc", "");
        setIsOpen(false);
        setTimeout(() => {
          const priceInput = document.getElementById(`price-${item.id}`);
          if (priceInput) priceInput.focus();
        }, 50);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`relative cursor-pointer bg-[#FFFFFF] border ${isOpen ? "border-black/10 bg-white" : "border-black/10"} hover:border-black/10 rounded-lg px-4 py-2.5 transition-colors flex justify-between items-center group`}
        onClick={() => {
          setIsOpen(!isOpen);
          setInternalSearch("");
        }}
      >
        <div className="flex-1">
          <div className="font-semibold text-[#000000] text-sm">
            {item.name || (
              <span className="text-[#000000] font-normal">
                Select an item...
              </span>
            )}
          </div>
          {item.desc && !isOpen && (
            <div className="text-[10px] text-[#000000] mt-0.5">{item.desc}</div>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#000000] group-hover:text-[#A67C1E] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#FFFFFF] border border-black/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-black/10 bg-[#FFFFFF]">
            <div className="bg-[#FFFFFF] flex items-center px-3 py-2 rounded-md">
              <Search className="w-4 h-4 text-[#000000] mr-2" />
              <input
                type="text"
                placeholder="Search catalog..."
                className="w-full bg-transparent text-[#000000] text-sm focus:outline-none placeholder:text-[#000000]"
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCatalog.length > 0 ? (
              <ul className="py-1" ref={listRef}>
                {filteredCatalog.map((catItem, idx) => {
                  const isOutOfStock = catItem.stockQuantity === 0;
                  return (
                    <li
                      key={catItem.id}
                      className={`px-5 py-3 border-b border-transparent last:border-0 transition-colors ${
                        isOutOfStock
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } ${idx === selectedIndex && !isOutOfStock ? "bg-[#FFFFFF] border-l-4 border-l-[#DC2626]" : !isOutOfStock ? "hover:bg-[#FFFFFF] border-l-4 border-l-transparent" : "border-l-4 border-l-transparent"}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (isOutOfStock) return;
                        updateItem(item.id, "name", catItem.name);
                        updateItem(item.id, "desc", catItem.desc || "");
                        updateItem(
                          item.id,
                          "product_id",
                          catItem.productId || null,
                        );
                        if (catItem.price !== undefined) {
                          updateItem(item.id, "price", catItem.price);
                        }
                        setIsOpen(false);
                        setTimeout(() => {
                          const priceInput = document.getElementById(
                            `price-${item.id}`,
                          );
                          if (priceInput) priceInput.focus();
                        }, 50);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        if (isOutOfStock) return;
                        updateItem(item.id, "name", catItem.name);
                        updateItem(item.id, "desc", catItem.desc || "");
                        updateItem(
                          item.id,
                          "product_id",
                          catItem.productId || null,
                        );
                        if (catItem.price !== undefined) {
                          updateItem(item.id, "price", catItem.price);
                        }
                        setIsOpen(false);
                        setTimeout(() => {
                          const priceInput = document.getElementById(
                            `price-${item.id}`,
                          );
                          if (priceInput) priceInput.focus();
                        }, 50);
                      }}
                      onClick={() => {
                        if (isOutOfStock) return;
                        updateItem(item.id, "name", catItem.name);
                        updateItem(item.id, "desc", catItem.desc || "");
                        updateItem(
                          item.id,
                          "product_id",
                          catItem.productId || null,
                        );
                        if (catItem.price !== undefined) {
                          updateItem(item.id, "price", catItem.price);
                        }
                        setIsOpen(false);
                        setTimeout(() => {
                          const priceInput = document.getElementById(
                            `price-${item.id}`,
                          );
                          if (priceInput) priceInput.focus();
                        }, 50);
                      }}
                      onMouseEnter={() =>
                        !isOutOfStock && setSelectedIndex(idx)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-[#000000]">
                          {catItem.name}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${isOutOfStock ? "text-[#E11D48]" : "text-green-600"}`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : `Stock: ${catItem.stockQuantity}`}
                        </div>
                      </div>
                      {catItem.desc && (
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#000000] mt-1">
                          {catItem.desc}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-6 text-sm text-[#000000] text-center font-semibold">
                Press Enter to use "{internalSearch}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function POSBilling() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [role, setRole] = useState<"staff" | "admin" | null>(null);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<
    "billing" | "orders" | "analytics" | "inventory" | "alerts"
  >("billing");
  const [isOnline, setIsOnline] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customOrderDate, setCustomOrderDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<OrderItem[]>([
    { id: "1", name: "", desc: "", price: 0, qty: 1 },
  ]);
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percent">(
    "fixed",
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [applyGST, setApplyGST] = useState<boolean>(false);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [completedBillData, setCompletedBillData] =
    useState<CompletedOrder | null>(null);

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [showLowStockAlertModal, setShowLowStockAlertModal] = useState<boolean>(false);
  const [lowStockAlertProducts, setLowStockAlertProducts] = useState<CatalogItem[]>([]);

  const [showQuickAddStockModal, setShowQuickAddStockModal] = useState<boolean>(false);
  const [quickAddStockProduct, setQuickAddStockProduct] = useState<CatalogItem | null>(null);
  const [quickAddStockAmount, setQuickAddStockAmount] = useState<string>("");

  // Analytics filter/navigation states
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
    "all" | "today" | "week" | "month" | "year" | "custom"
  >("all");
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [analyticsSubTab, setAnalyticsSubTab] = useState<
    "revenue" | "today" | "products" | "coupons"
  >("revenue");
  const [analyticsSearchPhone, setAnalyticsSearchPhone] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [couponSearchQuery, setCouponSearchQuery] = useState("");

  useEffect(() => {
    const auth =
      sessionStorage.getItem("pos_authorized") ||
      localStorage.getItem("pos_authorized");
    const storedRole =
      sessionStorage.getItem("pos_role") || localStorage.getItem("pos_role");

    if (auth === "true") {
      sessionStorage.setItem("pos_authorized", "true");
      if (storedRole) {
        sessionStorage.setItem("pos_role", storedRole);
        setRole(storedRole as "staff" | "admin");
        if (storedRole === "staff") {
          setActiveTab("billing");
        }
      } else {
        setRole("admin");
      }
      setIsAuthorized(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleVerifyPasscode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = await verifyPasscode(passcode);
    if (result && result.success) {
      sessionStorage.setItem("pos_authorized", "true");
      sessionStorage.setItem("pos_role", result.role || "admin");
      setRole(result.role as "staff" | "admin");
      if (result.role === "staff") {
        setActiveTab("billing");
      }
      setIsAuthorized(true);
      setPasscode("");
      setPasscodeError("");
    } else {
      setPasscodeError("Incorrect passcode. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("pos_authorized");
    localStorage.removeItem("pos_authorized");
    sessionStorage.removeItem("pos_role");
    localStorage.removeItem("pos_role");
    setRole(null);
    setPasscode("");
    setPasscodeError("");
    setIsAuthorized(false);
  };

  const productToCatalogItem = (p: ProductWithBatches): CatalogItem => {
    let formattedExpiry = p.earliest_expiry || undefined;
    if (formattedExpiry && formattedExpiry.includes("T")) {
      const d = new Date(formattedExpiry);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        formattedExpiry = `${year}-${month}-${day}`;
      }
    }
    const activeBatch =
      p.batches?.find((b: any) => b.stock_quantity > 0) ||
      (p.batches && p.batches.length > 0 ? p.batches[0] : null);

    return {
      id: p.id,
      productId: p.id,
      name: p.name,
      desc: p.description || undefined,
      price: Number(p.active_selling_price) || 0,
      mfgDate: activeBatch?.mfg_date || undefined,
      expiryDate: formattedExpiry,
      scheduleCategory: p.schedule_category,
      stockQuantity: Number(p.total_stock) || 0,
      lowStockThreshold: Number(p.low_stock_threshold) || 0,
      batches: p.batches,
      batchNo: activeBatch?.batch_no || undefined,
      manufacturer: activeBatch?.manufacturer || undefined,
      hsnCode: activeBatch?.hsn_code || undefined,
    };
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
      ]);
      setCatalog(productsData.map(productToCatalogItem));

      setOrders(
        ordersData.map((o) => {
          return {
            id: o.id,
            customerName: o.customer_name || "Guest",
            customerPhone: o.customer_phone,
            source: o.source,
            items: o.items.map((i) => ({
              id: i.id,
              name: i.snapshot_name,
              desc: i.snapshot_name === "Custom Item" ? "Custom" : "",
              price: Number(i.snapshot_price) || 0,
              qty: Number(i.quantity) || 0,
            })),
            subtotal: Number(o.subtotal) || 0,
            discount: Number(o.discount_amount) || 0,
            discountType: o.discount_type,
            discountValue: o.discount_value
              ? Number(o.discount_value)
              : undefined,
            deliveryFee: Number(o.delivery_fee) || 0,
            grandTotal: Number(o.grand_total) || 0,
            cashReceived: Number(o.cash_received) || 0,
            date: o.bill_date,
            createdAt: o.created_at,
            status: o.status === "COMPLETED" ? "Completed" : "Pending",
          };
        }),
      );
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Modal State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(
    null,
  );
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatPrice, setNewCatPrice] = useState<number | "">("");
  const [newCatCostPrice, setNewCatCostPrice] = useState<number | "">("");
  const [newCatExpiry, setNewCatExpiry] = useState<string>("");
  const [newCatMfgDate, setNewCatMfgDate] = useState<string>("");
  const [newCatSchedule, setNewCatSchedule] = useState<"NONE" | "H" | "H1">(
    "NONE",
  );
  const [newCatStock, setNewCatStock] = useState<number | "">("");
  const [newCatThreshold, setNewCatThreshold] = useState<number | "">(10);
  const [newCatBatch, setNewCatBatch] = useState<string>("");
  const [newCatManufacturer, setNewCatManufacturer] = useState<string>("");
  const [newCatHsn, setNewCatHsn] = useState<string>("");
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const [scheduleFilter, setScheduleFilter] = useState<"ALL" | "H" | "H1">(
    "ALL",
  );
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set());
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchTargetProductId, setBatchTargetProductId] = useState<
    string | null
  >(null);

  const [activeCatalogRowId, setActiveCatalogRowId] = useState<string | null>(
    null,
  );
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogTargetRowId, setCatalogTargetRowId] = useState<string | null>(
    null,
  );

  // Order search/filters state
  const [orderSearchId, setOrderSearchId] = useState("");
  const [orderSearchName, setOrderSearchName] = useState("");
  const [orderSearchPhone, setOrderSearchPhone] = useState("");
  const [orderFilterSource, setOrderFilterSource] = useState("ALL");
  const [orderFilterStatus, setOrderFilterStatus] = useState("ALL");
  const [historyPeriod, setHistoryPeriod] = useState<
    "all" | "today" | "week" | "month" | "year" | "custom"
  >("all");
  const [historyStartDate, setHistoryStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [historyEndDate, setHistoryEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [selectedCoupon, setSelectedCoupon] = useState<string>("none");
  const coupons = [
    { code: "none", label: "No Coupon", type: "fixed", value: 0 },
    {
      code: "WELCOME10",
      label: "WELCOME10 (10% Off)",
      type: "percent",
      value: 10,
    },
    {
      code: "SUPERPOS",
      label: "SUPERPOS (₹100 Off)",
      type: "fixed",
      value: 100,
    },
    {
      code: "FESTIVE15",
      label: "FESTIVE15 (15% Off)",
      type: "percent",
      value: 15,
    },
  ];

  const handleCouponChange = (code: string) => {
    setSelectedCoupon(code);
    const coupon = coupons.find((c) => c.code === code);
    if (coupon) {
      setDiscountType(coupon.type as "fixed" | "percent");
      setDiscountValue(coupon.value);
    }
  };

  const getCouponCodeForOrder = (order: CompletedOrder) => {
    if (order.discount === 0) return "NONE";
    const matched = coupons.find((c) => {
      if (c.code === "none") return false;
      if (order.discountType && order.discountValue) {
        const typeMatches =
          c.type === (order.discountType === "PERCENT" ? "percent" : "fixed");
        const valMatches = c.value === order.discountValue;
        return typeMatches && valMatches;
      }
      if (c.type === "fixed") {
        return c.value === order.discount;
      } else {
        const calculated = order.subtotal * (c.value / 100);
        return Math.abs(calculated - order.discount) < 2;
      }
    });
    return matched ? matched.code.toUpperCase() : "PROMO";
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), name: "", desc: "", price: 0, qty: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleQtyChange = (id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let finalQty = Math.max(1, newQty);
        // Find catalog item by product_id OR by exact/case-insensitive name
        const catItem = catalog.find(
          (c) =>
            (item.product_id &&
              (c.id === item.product_id || c.productId === item.product_id)) ||
            (item.name &&
              c.name.trim().toLowerCase() === item.name.trim().toLowerCase()),
        );
        if (catItem && typeof catItem.stockQuantity === "number") {
          if (newQty > catItem.stockQuantity) {
            alert(
              `Cannot add more than available stock (${catItem.stockQuantity}) for "${catItem.name}"`,
            );
            finalQty = catItem.stockQuantity;
          } else {
            finalQty = newQty;
          }
        }
        return { ...item, qty: finalQty };
      }),
    );
  };

  const clearOrder = () => {
    setItems([
      { id: Math.random().toString(), name: "", desc: "", price: 0, qty: 1 },
    ]);
  };

  const resetCatalogForm = () => {
    setEditingBatchId(null);
    setNewCatName("");
    setNewCatDesc("");
    setNewCatPrice("");
    setNewCatCostPrice("");
    setNewCatExpiry("");
    setNewCatMfgDate("");
    setNewCatSchedule("NONE");
    setNewCatStock("");
    setNewCatThreshold(10);
    setNewCatBatch("");
    setNewCatManufacturer("");
    setNewCatHsn("");
  };

  const openEditCatalog = (catItem: CatalogItem, targetRowId?: string) => {
    setEditingCatalogId(catItem.id);
    setNewCatName(catItem.name || "");
    setNewCatDesc(catItem.desc || "");
    setNewCatPrice(catItem.price ?? "");
    setNewCatExpiry(catItem.expiryDate || "");
    setNewCatSchedule((catItem as any).scheduleCategory || "NONE");
    setNewCatStock(
      typeof catItem.stockQuantity === "number" ? catItem.stockQuantity : "",
    );
    setNewCatThreshold(
      typeof catItem.lowStockThreshold === "number"
        ? catItem.lowStockThreshold
        : 10,
    );
    setNewCatBatch(catItem.batchNo || "");
    setNewCatManufacturer(catItem.manufacturer || "");
    setNewCatHsn(catItem.hsnCode || "");

    // Set active batch details
    const activeBatch =
      catItem.batches?.find((b) => b.stock_quantity > 0) ||
      (catItem.batches && catItem.batches.length > 0
        ? catItem.batches[0]
        : null);
    setEditingBatchId(activeBatch ? activeBatch.id : null);
    if (activeBatch) {
      setNewCatCostPrice(activeBatch.cost_price || "");
      if (activeBatch.mfg_date) {
        let mDate = activeBatch.mfg_date;
        if (mDate.includes("T")) mDate = mDate.split("T")[0];
        setNewCatMfgDate(mDate);
      } else {
        setNewCatMfgDate("");
      }
    } else {
      setNewCatCostPrice("");
      setNewCatMfgDate("");
    }

    setCatalogTargetRowId(targetRowId || null);
    setShowCatalogModal(true);
  };

  const addToCatalog = async () => {
    if (!newCatName.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!newCatExpiry) {
      alert("Expiry date is required for every medical product.");
      return;
    }

    const priceNum = Number(newCatPrice);
    if (priceNum > 99999999.99) {
      alert(
        "The price exceeds the maximum allowable system limit of ₹99,999,999.99.",
      );
      return;
    }

    const productPayload = {
      name: newCatName.trim(),
      description: newCatDesc || null,
      category: "Medicine",
      schedule_category: newCatSchedule,
      low_stock_threshold:
        newCatThreshold === "" ? 10 : Number(newCatThreshold),
    };

    if (editingCatalogId) {
      const data = await editProduct(editingCatalogId, productPayload);
      if (!data) {
        alert(
          "Product not found — it may have been removed. Refresh and try again.",
        );
        return;
      }

      if (editingBatchId) {
        await editBatch(editingBatchId, {
          batch_no: newCatBatch || null,
          manufacturer: newCatManufacturer || null,
          hsn_code: newCatHsn || null,
          cost_price: newCatCostPrice === "" ? 0 : Number(newCatCostPrice),
          selling_price: newCatPrice === "" ? 0 : Number(newCatPrice),
          stock_quantity: newCatStock === "" ? 0 : Number(newCatStock),
          mfg_date: newCatMfgDate || null,
          expiry_date: newCatExpiry,
        });

        // Refresh catalog to reflect batch changes
        const updatedProducts = await fetchProducts();
        setCatalog(updatedProducts.map(productToCatalogItem));
      } else {
        setCatalog((prev) =>
          prev.map((c) =>
            c.id === editingCatalogId
              ? {
                  ...c,
                  name: data.name,
                  desc: data.description || undefined,
                  lowStockThreshold: data.low_stock_threshold,
                  scheduleCategory: data.schedule_category,
                }
              : c,
          ),
        );
      }

      if (catalogTargetRowId) {
        updateItem(catalogTargetRowId, "name", data.name);
        setCatalogTargetRowId(null);
      }

      resetCatalogForm();
      setEditingCatalogId(null);
      setShowCatalogModal(false);
    } else {
      const product = await createProduct(productPayload);

      const batchPayload = {
        batch_no: newCatBatch || null,
        manufacturer: newCatManufacturer || null,
        hsn_code: newCatHsn || null,
        cost_price: newCatCostPrice === "" ? 0 : Number(newCatCostPrice),
        selling_price: newCatPrice === "" ? 0 : Number(newCatPrice),
        stock_quantity: newCatStock === "" ? 0 : Number(newCatStock),
        mfg_date: newCatMfgDate || null,
        expiry_date: newCatExpiry,
      };

      await createBatch(product.id, batchPayload);

      const data = (await fetchProducts()).find((p) => p.id === product.id) || {
        ...product,
        batches: [],
        total_stock: batchPayload.stock_quantity,
        earliest_expiry: batchPayload.expiry_date,
        active_selling_price: batchPayload.selling_price,
      };
      const newItem = productToCatalogItem(data as any);
      setCatalog([...catalog, newItem]);

      if (catalogTargetRowId) {
        updateItem(catalogTargetRowId, "name", data.name);
        if (data.active_selling_price !== undefined) {
          updateItem(
            catalogTargetRowId,
            "price",
            data.active_selling_price || 0,
          );
        }
        setCatalogTargetRowId(null);
      }

      resetCatalogForm();
      setShowCatalogModal(false);
    }
  };

  const handleAddBatchSubmit = async () => {
    if (!batchTargetProductId) return;
    try {
      const batchPayload = {
        batch_no: newCatBatch || null,
        manufacturer: null,
        hsn_code: null,
        cost_price: newCatCostPrice === "" ? 0 : Number(newCatCostPrice),
        selling_price: newCatPrice === "" ? 0 : Number(newCatPrice),
        stock_quantity: newCatStock === "" ? 0 : Number(newCatStock),
        mfg_date: newCatMfgDate || null,
        expiry_date: newCatExpiry || "",
      };
      await createBatch(batchTargetProductId, batchPayload);

      const data = await fetchProducts();
      setCatalog(data.map(productToCatalogItem));

      setShowBatchModal(false);
      resetCatalogForm();
      setBatchTargetProductId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add batch.");
    }
  };

  const quickAddStock = (product: CatalogItem) => {
    const activeBatch = product.batches?.find((b) => b.stock_quantity > 0) || (product.batches && product.batches.length > 0 ? product.batches[0] : null);
    if (!activeBatch) {
      alert("No batch exists for this product. Please click Edit to add a batch first.");
      return;
    }
    setQuickAddStockProduct(product);
    setQuickAddStockAmount("");
    setShowQuickAddStockModal(true);
  };

  const handleQuickAddStockSubmit = async () => {
    if (!quickAddStockProduct) return;
    const addQty = parseInt(quickAddStockAmount);
    if (isNaN(addQty) || addQty <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    const activeBatch = quickAddStockProduct.batches?.find((b) => b.stock_quantity > 0) || (quickAddStockProduct.batches && quickAddStockProduct.batches.length > 0 ? quickAddStockProduct.batches[0] : null);
    if (!activeBatch) return;

    try {
      await editBatch(activeBatch.id, {
        stock_quantity: (activeBatch.stock_quantity || 0) + addQty,
      });
      const updatedProducts = await fetchProducts();
      setCatalog(updatedProducts.map(productToCatalogItem));
      setShowQuickAddStockModal(false);
      setQuickAddStockProduct(null);
      setQuickAddStockAmount("");
    } catch (e) {
      alert("Failed to update stock");
    }
  };

  const deleteFromCatalog = async (id: string) => {
    await removeProduct(id);
    setCatalog((prev) => prev.filter((c) => c.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const calculatedDiscount =
    discountType === "percent"
      ? subtotal * (discountValue / 100)
      : discountValue;
  const gstAmount = applyGST
    ? (subtotal - calculatedDiscount) * (gstPercentage / 100)
    : 0;
  const grandTotal =
    Math.max(0, subtotal - calculatedDiscount) + deliveryFee + gstAmount;

  // Completes and saves the sale to the database. Returns the created order
  // (or null if validation/creation failed). WhatsApp sharing is a separate,
  // optional step that runs only after the sale is safely saved.
  const completeSale = async (): Promise<CompletedOrder | null> => {
    if (!customerPhone || customerPhone.length !== 10) {
      alert(
        "Please enter a valid 10-digit mobile contact number to complete the sale.",
      );
      return null;
    }

    // Strict validation: every single row must have a name and a price > 0
    const hasInvalidItem = items.some(
      (i) =>
        !i.name ||
        i.name.trim() === "" ||
        i.price === undefined ||
        i.price <= 0,
    );

    if (hasInvalidItem || items.length === 0) {
      alert(
        "Please ensure all items have a valid name and a price greater than 0. Remove any empty rows before proceeding.",
      );
      return null;
    }
    const itemsToSave = items;

    // Recalculate values locally to avoid React state lag issues
    const localSubtotal = itemsToSave.reduce(
      (acc, item) => acc + item.price * item.qty,
      0,
    );
    const localCalculatedDiscount =
      discountType === "percent"
        ? localSubtotal * (discountValue / 100)
        : discountValue;
    const localGstAmount = applyGST
      ? (localSubtotal - localCalculatedDiscount) * (gstPercentage / 100)
      : 0;
    const localGrandTotal =
      Math.max(0, localSubtotal - localCalculatedDiscount) +
      deliveryFee +
      localGstAmount;

    // Validate totals against PostgreSQL numeric(10,2) overflow limit (99,999,999.99)
    const MAX_LIMIT = 99999999.99;
    if (
      localSubtotal > MAX_LIMIT ||
      localGrandTotal > MAX_LIMIT ||
      cashReceived > MAX_LIMIT ||
      deliveryFee > MAX_LIMIT
    ) {
      alert(
        "The order totals exceed the maximum allowable system limit of ₹99,999,999.99. Please adjust the item prices, delivery fee, or cash received.",
      );
      return null;
    }

    // Validate individual item prices
    const hasTooExpensiveItem = itemsToSave.some(
      (i) => i.price > MAX_LIMIT || i.price * i.qty > MAX_LIMIT,
    );
    if (hasTooExpensiveItem) {
      alert(
        "One or more item prices exceed the maximum system limit of ₹99,999,999.99. Please correct the item prices.",
      );
      return null;
    }

    const currentTimeStr = new Date().toTimeString().split(" ")[0];
    let orderTimestamp = new Date().toISOString();
    if (customOrderDate) {
      const parsedDate = new Date(`${customOrderDate}T${currentTimeStr}`);
      if (!isNaN(parsedDate.getTime())) {
        orderTimestamp = parsedDate.toISOString();
      }
    }

    const { orderId: newOrderId } = await submitOrder({
      orderId: `INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customerName: customerName || "Guest",
      customerPhone: customerPhone,
      source: isOnline ? "ONLINE" : "OFFLINE",
      billDate: orderTimestamp,
      items: itemsToSave.map((i) => ({
        id: i.id,
        product_id: i.product_id || null,
        batch_id: i.batch_id || null,
        name: i.name,
        desc: i.desc,
        price: i.price,
        qty: i.qty,
      })),
      discountType: discountType === "percent" ? "PERCENT" : "FIXED",
      discountValue: discountValue,
      discountAmount: localCalculatedDiscount,
      gstPercentage: applyGST ? gstPercentage : 0,
      gstAmount: localGstAmount,
      deliveryFee: deliveryFee,
      grandTotal: localGrandTotal,
      cashReceived: cashReceived,
    });

    const [productsData, ordersData] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
    ]);
    setCatalog(productsData.map(productToCatalogItem));

    // Instead of building a newOrder manually, we find it from the fetched data
    const createdOrder = ordersData.find((o) => o.id === newOrderId);

    let savedOrder: CompletedOrder | null = null;

    if (createdOrder) {
      // Coerce every numeric field to a Number. Postgres NUMERIC columns come
      // back as strings via the Neon driver; leaving them as strings makes the
      // analytics reducers concatenate (e.g. "0" + "150" + "200") instead of
      // adding, which is what produced the absurdly long revenue/offline totals.
      const mappedOrder: CompletedOrder = {
        id: createdOrder.id,
        customerName: createdOrder.customer_name || "Guest",
        customerPhone: createdOrder.customer_phone,
        source: createdOrder.source,
        items: createdOrder.items.map((i) => ({
          id: i.id,
          name: i.snapshot_name,
          desc: i.snapshot_name === "Custom Item" ? "Custom" : "",
          price: Number(i.snapshot_price) || 0,
          qty: Number(i.quantity) || 0,
        })),
        subtotal: Number(createdOrder.subtotal) || 0,
        discount: Number(createdOrder.discount_amount) || 0,
        discountType: createdOrder.discount_type,
        discountValue: createdOrder.discount_value
          ? Number(createdOrder.discount_value)
          : undefined,
        deliveryFee: Number(createdOrder.delivery_fee) || 0,
        grandTotal: Number(createdOrder.grand_total) || 0,
        cashReceived: Number(createdOrder.cash_received) || 0,
        date: createdOrder.bill_date,
        createdAt: createdOrder.created_at,
        status: createdOrder.status === "COMPLETED" ? "Completed" : "Pending",
      };

      setOrders((prev) => [mappedOrder, ...prev]);
      setCompletedBillData(mappedOrder as any);
      savedOrder = mappedOrder;
    }

    // Reset Form
    setCustomerName("");
    setCustomerPhone("");
    setCustomOrderDate(new Date().toISOString().split("T")[0]);
    setItems([{ id: "1", name: "", desc: "", price: 0, qty: 1 }]);
    setDiscountValue(0);
    setDeliveryFee(0);
    setCashReceived(0);
    setApplyGST(false);
    setGstPercentage(18);

    return savedOrder;
  };

  // Completes the sale first, then shares the saved bill over WhatsApp.
  const handleCompleteAndSendWhatsApp = async () => {
    const order = await completeSale();
    if (order) resendWhatsApp(order);
  };

  const resendWhatsApp = (order: CompletedOrder) => {
    if (!order.customerPhone || order.customerPhone.length < 10) {
      alert("Invalid customer phone number for this order.");
      return;
    }
    const domain = window.location.origin;
    const invoiceUrl = `${domain}/invoice/${order.id}`;
    const shopEmoji = String.fromCodePoint(0x2728);
    const checkEmoji = String.fromCodePoint(0x2705);
    const moneyEmoji = String.fromCodePoint(0x1f4b0);
    const receiptEmoji = String.fromCodePoint(0x1f4e6);
    let message = `${shopEmoji} *VINAYAKA MEDICALS* ${shopEmoji}\n\n`;
    message += `${checkEmoji} Here are your invoice details!\n\n`;

    message += `Subtotal: ₹${order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    if (order.discount > 0) {
      message += `Discount Applied: -₹${order.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    }

    // GST calculation
    const gstItem = order.items.find((i) => i.name && i.name.startsWith("GST"));
    const calculatedGst =
      order.grandTotal - (order.subtotal - order.discount + order.deliveryFee);

    if (calculatedGst > 0.1) {
      const gstLabel = gstItem ? gstItem.name : "GST";
      message += `${gstLabel}: ₹${calculatedGst.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    }

    if (order.deliveryFee > 0) {
      message += `Delivery Fee: ₹${order.deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    }

    message += `\n${moneyEmoji} *Total Amount: ₹${order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}*\n\n`;
    message += `${receiptEmoji} View and download your detailed digital receipt here:\n${invoiceUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = order.customerPhone.replace(/\D/g, "").slice(-10);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMessage}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone.",
      )
    )
      return;
    await removeOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
    if (completedBillData?.id === orderId) setCompletedBillData(null);
    if (activeInvoiceId === orderId) setActiveInvoiceId(null);
  };

  // Real-time analytics derived from orders with period filtering
  const {
    analyticsFilteredOrders,
    totalOrdersCount,
    totalRevenueAmount,
    avgOrderValue,
    onlineOrders,
    offlineOrders,
    onlineRevenue,
    offlineRevenue,
    topItems,
    currentWeekNumber,
    weekRevenue,
    maxWeekRevenue,
    monthRevenue,
    maxMonthRevenue,
    totalYearRevenue,
    avgMonthRevenue,
    todayOrders,
    todayRevenue,
    todayOrdersCount,
    todayOnlineOrdersCount,
    todayOfflineOrdersCount,
    todayOnlineRevenue,
    todayOfflineRevenue,
    todayItemsSold,
    todayTopItems,
    monthlyRevenue,
    totalItemsSold,
    topCategory,
    topProduct,
    dayNames,
    monthNames,
    itemSales,
    now,
  } = React.useMemo(() => {
    const now = new Date();

    const analyticsFilteredOrders = orders.filter((o) => {
      if (
        analyticsSearchPhone &&
        !o.customerPhone.includes(analyticsSearchPhone)
      ) {
        return false;
      }
      const orderDate = new Date(o.date);
      if (analyticsPeriod === "today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (analyticsPeriod === "week") {
        const startOfWeek = new Date(now);
        const dayOfWeek = startOfWeek.getDay();
        const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + distToMonday); // Monday start of week
        startOfWeek.setHours(0, 0, 0, 0);
        return orderDate >= startOfWeek;
      }
      if (analyticsPeriod === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (analyticsPeriod === "year") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      if (analyticsPeriod === "custom") {
        const orderTime = orderDate.getTime();
        const start = analyticsStartDate ? new Date(analyticsStartDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        const end = analyticsEndDate ? new Date(analyticsEndDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) {
          return orderTime >= start.getTime() && orderTime <= end.getTime();
        } else if (start) {
          return orderTime >= start.getTime();
        } else if (end) {
          return orderTime <= end.getTime();
        }
        return true;
      }
      return true; // "all"
    });

    const totalOrdersCount = analyticsFilteredOrders.length;
    const totalRevenueAmount = analyticsFilteredOrders.reduce(
      (acc, o) => acc + o.grandTotal,
      0,
    );
    const avgOrderValue =
      totalOrdersCount > 0 ? totalRevenueAmount / totalOrdersCount : 0;

    // Split channels
    const onlineOrders = analyticsFilteredOrders.filter(
      (o) => o.source === "ONLINE",
    ).length;
    const offlineOrders = analyticsFilteredOrders.filter(
      (o) => o.source === "OFFLINE",
    ).length;

    // Split revenues
    const onlineRevenue = analyticsFilteredOrders
      .filter((o) => o.source === "ONLINE")
      .reduce((acc, o) => acc + o.grandTotal, 0);
    const offlineRevenue = analyticsFilteredOrders
      .filter((o) => o.source === "OFFLINE")
      .reduce((acc, o) => acc + o.grandTotal, 0);

    // Top items by revenue in analyticsFilteredOrders
    const itemSales: Record<
      string,
      { name: string; revenue: number; qty: number }
    > = {};
    analyticsFilteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.name || item.name.startsWith("GST (")) return;
        if (!itemSales[item.name])
          itemSales[item.name] = { name: item.name, revenue: 0, qty: 0 };
        itemSales[item.name].revenue += item.price * item.qty;
        itemSales[item.name].qty += item.qty;
      });
    });
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Helper to get ISO week number of the year
    const getWeekOfYear = (d: Date) => {
      const target = new Date(d.valueOf());
      const dayNr = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
      target.setDate(target.getDate() - dayNr + 3); // Nearest Thursday
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };
    const currentWeekNumber = getWeekOfYear(now);

    // Revenue per day of current week (Mon–Sun) - CONSTANT (independent of analyticsPeriod filters)
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekRevenue = [0, 0, 0, 0, 0, 0, 0];

    // Find Monday to Sunday of current calendar week
    const currentDayOfWeek = now.getDay();
    const distToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayOfThisWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + distToMon,
    );
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
    sundayOfThisWeek.setHours(23, 59, 59, 999);

    orders.forEach((order) => {
      if (analyticsSearchPhone) {
        const q = analyticsSearchPhone.toLowerCase();
        const matchPhone = order.customerPhone.includes(q);
        const matchInvoice = order.id.toLowerCase().includes(q);
        if (!matchPhone && !matchInvoice) {
          return;
        }
      }
      const orderDate = new Date(order.date);
      const orderTime = orderDate.getTime();
      if (
        orderTime >= mondayOfThisWeek.getTime() &&
        orderTime <= sundayOfThisWeek.getTime()
      ) {
        const day = (orderDate.getDay() + 6) % 7;
        weekRevenue[day] += order.grandTotal;
      }
    });
    const maxWeekRevenue = Math.max(...weekRevenue, 1);

    // Revenue per month of current year - CONSTANT (independent of analyticsPeriod filters)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthRevenue = Array(12).fill(0);
    orders.forEach((order) => {
      if (analyticsSearchPhone) {
        const q = analyticsSearchPhone.toLowerCase();
        const matchPhone = order.customerPhone.includes(q);
        const matchInvoice = order.id.toLowerCase().includes(q);
        if (!matchPhone && !matchInvoice) {
          return;
        }
      }
      const d = new Date(order.date);
      if (d.getFullYear() === now.getFullYear()) {
        monthRevenue[d.getMonth()] += order.grandTotal;
      }
    });
    const maxMonthRevenue = Math.max(...monthRevenue, 1);
    const totalYearRevenue = monthRevenue.reduce((a, b) => a + b, 0);
    const avgMonthRevenue = totalYearRevenue / 12;

    // New Detailed KPI Computations based on analyticsFilteredOrders
    const todayOrders = orders.filter((o) => {
      if (analyticsSearchPhone) {
        const q = analyticsSearchPhone.toLowerCase();
        const matchPhone = o.customerPhone.includes(q);
        const matchInvoice = o.id.toLowerCase().includes(q);
        if (!matchPhone && !matchInvoice) {
          return false;
        }
      }
      const d = new Date(o.date);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    const todayRevenue = todayOrders.reduce((acc, o) => acc + o.grandTotal, 0);

    const todayOrdersCount = todayOrders.length;
    const todayOnlineOrdersCount = todayOrders.filter(
      (o) => o.source === "ONLINE",
    ).length;
    const todayOfflineOrdersCount = todayOrders.filter(
      (o) => o.source === "OFFLINE",
    ).length;

    const todayOnlineRevenue = todayOrders
      .filter((o) => o.source === "ONLINE")
      .reduce((acc, o) => acc + o.grandTotal, 0);
    const todayOfflineRevenue = todayOrders
      .filter((o) => o.source === "OFFLINE")
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const todayItemsSold = todayOrders.reduce(
      (acc, o) =>
        acc +
        o.items.reduce((sum, item) => {
          const isGST = item.name && item.name.startsWith("GST (");
          return sum + (isGST ? 0 : item.qty);
        }, 0),
      0,
    );

    // Today's top items
    const todayItemSales: Record<
      string,
      { name: string; revenue: number; qty: number }
    > = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.name || item.name.startsWith("GST (")) return;
        if (!todayItemSales[item.name])
          todayItemSales[item.name] = { name: item.name, revenue: 0, qty: 0 };
        todayItemSales[item.name].revenue += item.price * item.qty;
        todayItemSales[item.name].qty += item.qty;
      });
    });
    const todayTopItems = Object.values(todayItemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const monthlyRevenue = orders
      .filter((o) => {
        const d = new Date(o.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const totalItemsSold = analyticsFilteredOrders.reduce(
      (acc, o) =>
        acc +
        o.items.reduce((sum, item) => {
          const isGST = item.name && item.name.startsWith("GST (");
          return sum + (isGST ? 0 : item.qty);
        }, 0),
      0,
    );

    const categorySales: Record<string, number> = {};
    analyticsFilteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.name && item.name.startsWith("GST (")) return;
        const cat = item.desc || "Uncategorized";
        if (!categorySales[cat]) categorySales[cat] = 0;
        categorySales[cat] += item.price * item.qty;
      });
    });
    const topCategory =
      Object.keys(categorySales).length > 0
        ? Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0][0]
        : "None";
    const topProduct = topItems[0]?.name || "None";
    return {
      analyticsFilteredOrders,
      totalOrdersCount,
      totalRevenueAmount,
      avgOrderValue,
      onlineOrders,
      offlineOrders,
      onlineRevenue,
      offlineRevenue,
      topItems,
      currentWeekNumber,
      weekRevenue,
      maxWeekRevenue,
      monthRevenue,
      maxMonthRevenue,
      totalYearRevenue,
      avgMonthRevenue,
      todayOrders,
      todayRevenue,
      todayOrdersCount,
      todayOnlineOrdersCount,
      todayOfflineOrdersCount,
      todayOnlineRevenue,
      todayOfflineRevenue,
      todayItemsSold,
      todayTopItems,
      monthlyRevenue,
      totalItemsSold,
      topCategory,
      topProduct,
      dayNames,
      monthNames,
      itemSales,
      now,
    };
  }, [
    orders,
    analyticsSearchPhone,
    analyticsPeriod,
    analyticsStartDate,
    analyticsEndDate,
  ]);

  // Inventory-derived data: low stock + near-expiry products
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inventoryProducts = catalog.filter((c) => !c.id.startsWith("default-"));

  const daysUntil = (iso?: string): number | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const lowStockItems = inventoryProducts.filter((c) => {
    const threshold =
      typeof c.lowStockThreshold === "number" ? c.lowStockThreshold : 10;
    const stock = typeof c.stockQuantity === "number" ? c.stockQuantity : 0;
    const isLow = stock <= threshold;
    const days = daysUntil(c.expiryDate);
    const isExpiringSoon = days !== null && days <= 90;
    return isLow || isExpiringSoon;
  });

  const filteredInventory = inventoryProducts.filter((p) => {
    // 1. Check schedule filter first
    const itemSchedule = (p as any).scheduleCategory || "NONE";
    if (scheduleFilter !== "ALL" && itemSchedule !== scheduleFilter) {
      return false;
    }

    // 2. Check search text
    if (!inventorySearch.trim()) return true;
    const q = inventorySearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q) ||
      (p.batchNo || "").toLowerCase().includes(q) ||
      (p.manufacturer || "").toLowerCase().includes(q) ||
      (p.hsnCode || "").toLowerCase().includes(q)
    );
  });

  // Products with a stock problem (out of stock or at/below threshold), kept
  // separate from near-expiry items so we can raise a stock alarm proactively.
  const stockProblemItems = inventoryProducts.filter((c) => {
    const threshold =
      typeof c.lowStockThreshold === "number" ? c.lowStockThreshold : 10;
    const stock = typeof c.stockQuantity === "number" ? c.stockQuantity : 0;
    return stock <= threshold;
  });
  const outOfStockCount = stockProblemItems.filter(
    (c) => (typeof c.stockQuantity === "number" ? c.stockQuantity : 0) <= 0,
  ).length;

  const lowStockKey = lowStockItems
    .map((c) => c.id)
    .sort()
    .join("|");

  // Surface the stock alarm automatically once, right after inventory loads,
  // so out-of-stock / low-stock items are never missed even if the operator
  // never opens the Alerts tab.
  const initialStockAlertShownRef = useRef(false);
  useEffect(() => {
    if (initialStockAlertShownRef.current) return;
    if (!isAuthorized || catalog.length === 0) return;
    initialStockAlertShownRef.current = true;
    if (stockProblemItems.length > 0) {
      setLowStockAlertProducts(lowStockItems);
      setShowLowStockAlertModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, catalog.length]);

  useEffect(() => {
    if (!isAuthorized || lowStockItems.length === 0) return;
    const currentIds = lowStockItems.map((c) => c.id);
    const hasNew = currentIds.some((id) => !alertedIds.has(id));
    if (!hasNew) return;

    try {
      const AudioCtx =
        (
          window as unknown as {
            AudioContext?: typeof AudioContext;
            webkitAudioContext?: typeof AudioContext;
          }
        ).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [0, 0.18, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(880, now + offset);
          gain.gain.setValueAtTime(0.001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.15, now + offset + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.16);
        });
        setTimeout(() => ctx.close().catch(() => {}), 800);
      }
    } catch (err) {
      console.warn("Alert beep failed:", err);
    }

    setAlertedIds(new Set(currentIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, lowStockKey]);

  useEffect(() => {
    if (activeTab === "alerts") {
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
          setTimeout(() => ctx.close().catch(() => {}), 600);
        }
      } catch (err) {}
      
      if (lowStockItems.length > 0) {
        setLowStockAlertProducts(lowStockItems);
        setShowLowStockAlertModal(true);
      }
    }
  }, [activeTab]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC2626]"></div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC2626]"></div>
          <span className="text-xs text-[#000000] font-bold uppercase tracking-wider">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Custom luxury grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#DC2626/0.03_1px,transparent_1px),linear-gradient(to_bottom,#DC2626/0.03_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Abstract Background Orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#DC2626]/10 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#DC2626]/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Main Card Container */}
        <div className="relative z-10 w-full max-w-md bg-white border border-[#DC2626]/30 rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_70px_rgba(78,195,215,0.1)] overflow-hidden group flex flex-col items-center text-center">
          {/* Card top border gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DC2626] via-[#DC2626] to-[#DC2626]" />

          {/* Logo with Gradient Hover Glow */}
          <div className="relative group mb-6">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#DC2626] to-[#DC2626] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-20 h-20 bg-white rounded-2xl p-3.5 border border-[#DC2626]/30 shadow-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="VINAYAKA MEDICALS Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-serif text-[#DC2626] tracking-tight leading-tight mb-2">
            VINAYAKA MEDICALS
          </h1>
          <p className="text-[#1C1917]/50 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            Pharmacy POS Terminal • Anaimalai
          </p>

          {/* Form */}
          <form
            onSubmit={handleVerifyPasscode}
            className="w-full space-y-6 text-left"
          >
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-[#DC2626] uppercase tracking-[0.25em] ml-1">
                Security Passcode
              </label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#DC2626] group-focus-within/input:text-[#DC2626] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPasscode ? "text" : "password"}
                  name="update-pos-passcode"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-[#FAFAFA] border border-black/10 hover:border-[#DC2626]/50 focus:border-[#DC2626] focus:bg-white rounded-2xl pl-13 pr-13 py-3.5 text-[#DC2626] font-mono tracking-widest text-lg focus:outline-none transition-all placeholder:text-black/20"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (passcodeError) setPasscodeError("");
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 hover:text-[#DC2626] transition-colors cursor-pointer"
                >
                  {showPasscode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passcodeError && (
                <p className="text-xs text-[#E11D48] font-bold mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
                  {passcodeError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#DC2626] via-[#DC2626] to-[#DC2626] hover:brightness-105 active:scale-[0.98] text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(78,195,215,0.2)] flex items-center justify-center gap-3 mt-4 group cursor-pointer border border-[#DC2626]/30"
            >
              Authenticate
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </button>
          </form>

          {/* Status Badge */}
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
            <span className="text-[8px] font-bold text-[#DC2626] tracking-[0.15em] uppercase">
              SYSTEM ONLINE • ENCRYPTED
            </span>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-6 text-[#1C1917]/30 text-[9px] font-bold tracking-widest uppercase">
          VINAYAKA MEDICALS Terminal v1.0
        </div>
      </div>
    );
  }

  // Filtered orders for Order History tab
  const historyFilteredOrders = orders.filter((order) => {
    const matchId = order.id
      .toLowerCase()
      .includes(orderSearchId.toLowerCase());
    const matchName = order.customerName
      .toLowerCase()
      .includes(orderSearchName.toLowerCase());
    const matchPhone = (order.customerPhone || "").includes(orderSearchPhone);
    const matchSource =
      orderFilterSource === "ALL" || order.source === orderFilterSource;
    const matchStatus =
      orderFilterStatus === "ALL" ||
      order.status.toUpperCase() === orderFilterStatus.toUpperCase();

    // Period match
    let matchPeriod = true;
    if (historyPeriod !== "all") {
      const orderDate = new Date(order.date);
      const orderTime = orderDate.getTime();
      const now = new Date();

      if (historyPeriod === "today") {
        matchPeriod = orderDate.toDateString() === now.toDateString();
      } else if (historyPeriod === "week") {
        const currentDay = now.getDay();
        const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const startOfWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + distanceToMon,
        );
        startOfWeek.setHours(0, 0, 0, 0);
        matchPeriod = orderTime >= startOfWeek.getTime();
      } else if (historyPeriod === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchPeriod = orderTime >= startOfMonth.getTime();
      } else if (historyPeriod === "year") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        matchPeriod = orderTime >= startOfYear.getTime();
      } else if (historyPeriod === "custom") {
        const start = historyStartDate ? new Date(historyStartDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        const end = historyEndDate ? new Date(historyEndDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) {
          matchPeriod =
            orderTime >= start.getTime() && orderTime <= end.getTime();
        } else if (start) {
          matchPeriod = orderTime >= start.getTime();
        } else if (end) {
          matchPeriod = orderTime <= end.getTime();
        }
      }
    }

    return (
      matchId &&
      matchName &&
      matchPhone &&
      matchSource &&
      matchStatus &&
      matchPeriod
    );
  });

  const handleExportCSV = () => {
    if (historyFilteredOrders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    // CSV Headers padded with spaces to ensure columns default to a readable width in Excel
    const headers = [
      "Order ID          ",
      "Date                   ",
      "Customer Name           ",
      "Customer Phone          ",
      "Source        ",
      "Subtotal      ",
      "Discount      ",
      "Delivery Fee  ",
      "Grand Total   ",
      "Status        ",
      "Items                                                                               ",
    ];

    // CSV Rows
    const rows = historyFilteredOrders.map((o) => {
      const itemsStr = o.items.map((i) => `${i.name} (x${i.qty})`).join("; ");

      // Formatting date: MM/DD/YYYY HH:MM AM/PM as an Excel text formula to prevent ### errors.
      // Date comes from the (backdatable) bill_date; the time comes from the real
      // transaction timestamp (created_at) rendered in IST.
      const dateStr = new Date(o.date).toLocaleDateString("en-IN");
      const timeStr = new Date(o.createdAt || o.date).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        },
      );
      const formattedDate = `"=""${dateStr} ${timeStr}"""`;

      // Formatting phone number as an Excel text formula to prevent scientific notation
      const formattedPhone = o.customerPhone
        ? `"=""${o.customerPhone}"""`
        : `"N/A"`;

      return [
        o.id,
        formattedDate,
        o.customerName,
        formattedPhone,
        o.source,
        o.subtotal,
        o.discount,
        o.deliveryFee,
        o.grandTotal,
        o.status,
        `"${itemsStr.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => {
            if (typeof val === "string" && !val.startsWith('"')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Order_History_${historyPeriod}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryCSV = () => {
    if (inventoryProducts.length === 0) {
      alert("No products in inventory to export.");
      return;
    }
    const headers = [
      "Product ID",
      "Name",
      "Description",
      "Price",
      "Stock Qty",
      "Low-Stock Threshold",
      "Expiry Date",
      "Batch No",
      "Manufacturer",
      "HSN Code",
    ];
    const rows = inventoryProducts.map((p) => [
      p.id,
      p.name,
      p.desc || "",
      p.price ?? "",
      p.stockQuantity ?? "",
      p.lowStockThreshold ?? "",
      p.expiryDate || "",
      p.batchNo || "",
      p.manufacturer || "",
      p.hsnCode || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((v) => {
            const s = String(v ?? "");
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Vinayaka_Medicals_Inventory_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] flex flex-row font-sans overflow-hidden">
      {/* Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-black/10 w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-black/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center text-[#DC2626]">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-black tracking-tight">
                    {editingCatalogId
                      ? "Edit Catalog Item"
                      : "Add New Medicine"}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {editingCatalogId
                      ? "Modify product parameters"
                      : "Register product into catalog"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetCatalogForm();
                  setEditingCatalogId(null);
                  setShowCatalogModal(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-white">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                  Product Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol 500mg"
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Fever & pain relief tablet"
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors shadow-xs"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Selling Price (₹) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatPrice}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) =>
                      setNewCatPrice(
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Schedule Category
                  </label>
                  <select
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs appearance-none cursor-pointer"
                    value={newCatSchedule}
                    onChange={(e) => setNewCatSchedule(e.target.value as any)}
                  >
                    <option value="NONE">General (None)</option>
                    <option value="H">Schedule H</option>
                    <option value="H1">Schedule H1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Mfg Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors cursor-pointer shadow-xs"
                    value={newCatMfgDate}
                    onChange={(e) => setNewCatMfgDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Expiry Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors cursor-pointer shadow-xs"
                    value={newCatExpiry}
                    onChange={(e) => setNewCatExpiry(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatStock}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) =>
                      setNewCatStock(
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value, 10),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Low-Stock Alert At
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="10"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatThreshold}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) =>
                      setNewCatThreshold(
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value, 10),
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., B12345"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatBatch}
                    onChange={(e) => setNewCatBatch(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 3004"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatHsn}
                    onChange={(e) => setNewCatHsn(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                  Manufacturer
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cipla Ltd."
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors shadow-xs"
                  value={newCatManufacturer}
                  onChange={(e) => setNewCatManufacturer(e.target.value)}
                />
              </div>

              <button
                onClick={addToCatalog}
                className="w-full py-3.5 mt-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <PackagePlus className="w-4 h-4" />
                {editingCatalogId ? "Save Changes" : "Save Product to Catalog"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-black/10 w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-black/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center text-[#DC2626]">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-black tracking-tight">
                    Add New Batch
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Record batch stock & arrival info
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetCatalogForm();
                  setBatchTargetProductId(null);
                  setShowBatchModal(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body - Clear 2-column layout */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-white">
              {/* Row 1: Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatCostPrice}
                    onChange={(e) =>
                      setNewCatCostPrice(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatPrice}
                    onChange={(e) =>
                      setNewCatPrice(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
              </div>

              {/* Row 2: Stock Quantity & Batch Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-bold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatStock}
                    onChange={(e) =>
                      setNewCatStock(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BATCH-002"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors shadow-xs"
                    value={newCatBatch}
                    onChange={(e) => setNewCatBatch(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Mfg & Expiry Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Mfg Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors cursor-pointer shadow-xs"
                    value={newCatMfgDate}
                    onChange={(e) => setNewCatMfgDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    Expiry Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-black focus:outline-none transition-colors cursor-pointer shadow-xs"
                    value={newCatExpiry}
                    onChange={(e) => setNewCatExpiry(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddBatchSubmit}
                className="w-full py-3.5 mt-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <PackagePlus className="w-4 h-4" />
                Save New Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Collapsible Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 bg-gradient-to-b from-[#1E3A8A] via-[#1E40AF] to-[#172554] text-[#FFFFFF] flex flex-col justify-between h-screen shrink-0 shadow-2xl z-40 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64 border-r border-white/20 translate-x-0" : "w-0 min-w-0 border-r-0 -translate-x-64 overflow-hidden"}`}
      >
        <div className="w-64 flex flex-col justify-between h-full shrink-0 overflow-hidden relative">
          <div className="flex flex-col">
            {/* Header branding */}
            <div className="p-6 border-b border-white/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFFFFF] rounded-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  <img
                    src="/logo.png"
                    alt="VINAYAKA MEDICALS Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <span className="font-black text-sm tracking-tight text-[#FFFFFF] block leading-tight">
                    VINAYAKA MEDICALS
                  </span>
                  <span className="text-[9px] text-white/80 font-bold tracking-wider block mt-0.5">
                    Anaimalai
                  </span>
                </div>
              </div>

              {/* Close Button Inside Sidebar */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white font-bold hover:text-white transition-all cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-4 py-6 space-y-2">
              <button
                onClick={() => {
                  setActiveTab("billing");
                  setCompletedBillData(null);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "billing"
                    ? "bg-white text-[#1E3A8A] shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Receipt className="w-5 h-5 shrink-0" />
                Billing Panel
              </button>
              <button
                onClick={() => {
                  setActiveTab("orders");
                  setCompletedBillData(null);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-white text-[#1E3A8A] shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`}
              >
                <History className="w-5 h-5 shrink-0" />
                Order History
              </button>
              <button
                onClick={() => {
                  setActiveTab("alerts");
                  setCompletedBillData(null);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer relative ${
                  activeTab === "alerts"
                    ? "bg-white text-[#1E3A8A] shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                Stock Alerts
                {lowStockItems.length > 0 && (
                  <span
                    className={`ml-auto min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${activeTab === "alerts" ? "bg-[#E11D48] text-white" : "bg-[#E11D48] text-white animate-pulse"}`}
                  >
                    {lowStockItems.length}
                  </span>
                )}
              </button>
              {role === "admin" && (
                <button
                  onClick={() => {
                    setActiveTab("inventory");
                    setCompletedBillData(null);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === "inventory"
                      ? "bg-white text-[#1E3A8A] shadow-md"
                      : "text-white/90 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <Boxes className="w-5 h-5 shrink-0" />
                  Inventory
                </button>
              )}
              {role === "admin" && (
                <button
                  onClick={() => {
                    setActiveTab("analytics");
                    setCompletedBillData(null);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === "analytics"
                      ? "bg-white text-[#1E3A8A] shadow-md"
                      : "text-white/90 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <BarChart2 className="w-5 h-5 shrink-0" />
                  Analytics Dashboard
                </button>
              )}

              <div className="pt-4 border-t border-white/20 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/25 hover:shadow-md border border-white/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </nav>
          </div>

          {/* Footer branding */}
          <div className="p-5 border-t border-white/20 bg-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-xs uppercase">
              {role === "admin" ? "A" : "S"}
            </div>
            <div>
              <span className="text-xs font-bold text-white block uppercase tracking-wider">
                {role === "admin" ? "Admin Access" : "Staff Access"}
              </span>
              <span className="text-[9px] text-white/80 font-bold tracking-wider block">
                V2.1.0 • PREMIUM POS
              </span>
            </div>
          </div>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden min-w-0 px-3 sm:px-8 lg:px-12 pt-3 pb-8 relative flex flex-col animate-in fade-in duration-300">
        {/* Global Top Navbar */}
        <header className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-black/10 w-full mb-6 gap-4">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-9 h-9 bg-white border border-black/10 hover:bg-[#FFFFFF]/40 rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer"
                title="Open Menu"
              >
                <Menu className="w-4.5 h-4.5 text-[#DC2626]" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-black text-[#000000] tracking-tight">
                VINAYAKA MEDICALS
              </h1>
            </div>
          </div>

          {/* OFFLINE / ONLINE Toggle (only shown when billing tab is active) */}
          {activeTab === "billing" && (
            <div className="flex items-center bg-[#FFFFFF]/60 border border-black/10 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setIsOnline(false)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase cursor-pointer ${!isOnline ? "bg-[#E11D48] text-[#FFFFFF] shadow-sm" : "text-[#000000] hover:text-[#000000]"}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#E11D48]"></span>
                OFFLINE (POS)
              </button>
              <button
                onClick={() => setIsOnline(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase cursor-pointer ${isOnline ? "bg-[#00A86B] text-[#FFFFFF] shadow-sm" : "text-[#000000] hover:text-[#000000]"}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
                ONLINE ORDER
              </button>
            </div>
          )}
        </header>

        {/* Bill Generated — shown as a modal over the billing screen (not a new page) */}
        {activeTab === "billing" && completedBillData && (
          <div className="fixed inset-0 z-[390] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 w-full max-w-[640px] min-w-0 bg-white rounded-2xl shadow-2xl p-4 sm:p-5 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              {/* Header Bar */}
              <div className="flex justify-between items-center pb-2 border-b border-black/10">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#000000] tracking-tight">
                    Bill Generated
                  </h1>
                  <p className="text-[11px] font-mono font-bold text-[#DC2626] mt-0.5">
                    #{completedBillData.id}
                  </p>
                </div>
                <button
                  onClick={() => setCompletedBillData(null)}
                  className="bg-black hover:bg-black/80 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Sale
                </button>
              </div>

              {/* Payment Receipt Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-black/10 shadow-xs space-y-3">
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Payment Receipt
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-600">
                    Grand Total
                  </span>
                  <span className="text-xl font-black text-black">
                    ₹
                    {completedBillData.grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-600">
                    Amount Received
                  </span>
                  <span className="text-sm font-black text-black">
                    ₹
                    {(
                      completedBillData.cashReceived ||
                      completedBillData.grandTotal
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Balance Returned Box */}
                <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3 sm:p-3.5 flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-[#2563EB]">
                    Balance Returned
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#2563EB]">
                    ₹
                    {Math.max(
                      0,
                      (completedBillData.cashReceived || 0) -
                        completedBillData.grandTotal,
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => setActiveInvoiceId(completedBillData.id)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-black py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#DC2626]" />
                  Print Receipt
                </button>
                <button
                  onClick={() => resendWhatsApp(completedBillData)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  WhatsApp Invoice
                </button>
                <button
                  onClick={() => setCompletedBillData(null)}
                  className="bg-black hover:bg-black/80 text-white py-2.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Sale
                </button>
              </div>

              {/* Items Sold Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-black/10 shadow-xs space-y-3">
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Items Sold
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {completedBillData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-none"
                    >
                      <span className="font-semibold text-black">
                        {item.name}{" "}
                        <span className="text-gray-400 font-bold text-[10px] ml-1">
                          × {item.qty} {item.qty === 1 ? "piece" : "pieces"}
                        </span>
                      </span>
                      <span className="font-bold text-black">
                        ₹
                        {(item.price * item.qty).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
            <div className="flex-1 flex flex-col gap-6 max-w-[1400px] min-w-0 mx-auto w-full">
              {/* Subheader Accent Bar and Title */}
              <div className="flex justify-between items-center py-2 border-b border-black/10 w-full">
                <div className="flex items-center gap-4">
                  <span className="w-1.5 h-8 bg-[#DC2626] rounded-full"></span>
                  <div>
                    <h2 className="text-xl font-black text-[#000000] tracking-tight">
                      POS Billing Panel
                    </h2>
                    <p className="text-[11px] text-[#000000] font-semibold mt-0.5">
                      Quick Invoice generator & database synced checkout
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="flex flex-col lg:flex-row gap-8 w-full">
                {/* Left Column */}
                <div className="w-full lg:w-[60%] xl:w-[65%] flex flex-col gap-6 h-auto lg:h-full">
                  {/* Customer Details */}
                  <div className="flex-shrink-0 bg-white border border-black/10 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group">
                    <h2 className="text-base font-black flex items-center gap-3 text-[#000000] mb-6 tracking-tight">
                      <User className="w-4 h-4 text-[#DC2626]" />
                      Customer Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-[0.15em] mb-2">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          placeholder="Walk-in Customer"
                          className="w-full bg-[#FFFFFF]/40 border border-black/10 hover:border-black/10 focus:border-[#DC2626] focus:bg-white rounded-lg px-4 py-2.5 text-[#000000] text-sm font-semibold focus:outline-none transition-colors placeholder:text-[#000000] placeholder:font-normal shadow-sm"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-[0.15em] mb-2">
                          Mobile Number (WhatsApp)
                        </label>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit number"
                          maxLength={10}
                          className="w-full bg-[#FFFFFF]/40 border border-black/10 hover:border-black/10 focus:border-[#DC2626] focus:bg-white rounded-lg px-4 py-2.5 text-[#000000] text-sm font-semibold focus:outline-none transition-colors placeholder:text-[#000000] placeholder:font-normal shadow-sm"
                          value={customerPhone}
                          onChange={(e) =>
                            setCustomerPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-[0.15em] mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#DC2626]" />
                            Bill Date
                          </span>
                          <span className="text-[9px] text-[#DC2626] font-extrabold uppercase">
                            Custom / Past
                          </span>
                        </label>
                        <input
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full bg-[#FFFFFF]/40 border border-black/10 hover:border-black/10 focus:border-[#DC2626] focus:bg-white rounded-lg px-4 py-2.5 text-[#000000] text-sm font-bold focus:outline-none transition-colors cursor-pointer shadow-sm"
                          value={customOrderDate}
                          onChange={(e) => setCustomOrderDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Items Ledger */}
                  <div className="flex-1 bg-white border border-black/10 rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-visible">
                    <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-transparent gap-4">
                      <h2 className="text-base font-black flex items-center gap-3 text-[#000000] tracking-tight">
                        <Receipt className="w-4 h-4 text-[#DC2626]" />
                        Order Items
                      </h2>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                        <button
                          onClick={clearOrder}
                          className="text-[10px] font-bold text-[#000000] bg-[#FFFFFF] hover:bg-[#FFFFFF] border border-black/10 px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear Order
                        </button>
                        <button
                          onClick={() => {
                            setNewCatName("");
                            setNewCatDesc("");
                            setNewCatPrice("");
                            setCatalogTargetRowId(null);
                            setShowCatalogModal(true);
                          }}
                          className="text-[10px] font-bold text-[#000000] bg-[#FFFFFF] hover:bg-[#FFFFFF] border border-black/10 px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5 text-[#DC2626]" />{" "}
                          Add To Catalog
                        </button>
                        <button
                          onClick={addItem}
                          className="text-[10px] font-bold text-[#DC2626] bg-[#DC2626]/5 hover:bg-[#DC2626]/10 border border-[#DC2626]/20 px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Custom Item
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 overflow-visible">
                      {/* Table Header */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-black/10 text-[9px] font-black text-[#000000] uppercase tracking-[0.15em] mt-4 mb-2">
                        <div className="col-span-7 pl-2">
                          Item Name / Description
                        </div>
                        <div className="col-span-2 text-center">Price (₹)</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-4 pt-2 overflow-visible">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-stretch sm:items-center group border-b border-transparent pb-4 pt-1 overflow-visible relative"
                          >
                            {/* Item Name / Description Input + Catalog Button */}
                            <div className="col-span-7 relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                              <input
                                type="text"
                                placeholder="Type custom service description..."
                                className="flex-1 bg-white border border-black/10 focus:border-[#DC2626] rounded-lg px-4 py-2 text-xs font-semibold text-[#000000] focus:outline-none transition-colors placeholder:text-[#000000] min-w-0"
                                value={item.name}
                                onChange={(e) =>
                                  updateItem(item.id, "name", e.target.value)
                                }
                              />
                              <button
                                onClick={() => {
                                  setActiveCatalogRowId(
                                    activeCatalogRowId === item.id
                                      ? null
                                      : item.id,
                                  );
                                  setCatalogSearch("");
                                }}
                                className="flex items-center justify-center gap-1.5 border border-[#DC2626]/30 bg-[#DC2626]/5 text-[#DC2626] hover:bg-[#DC2626]/10 px-3 py-2 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider shrink-0 cursor-pointer w-full sm:w-auto"
                              >
                                <List className="w-3.5 h-3.5" />
                                Catalog
                              </button>

                              {/* Catalog Dropdown Popover */}
                              {activeCatalogRowId === item.id && (
                                <div className="absolute z-[80] top-full left-0 mt-1 w-full sm:w-80 max-w-[calc(100vw-2.5rem)] bg-[#FFFFFF] border-2 border-black/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                  <div className="p-2 border-b border-black/10 bg-[#FFFFFF] flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      placeholder="Search catalog items..."
                                      className="w-full bg-white border border-black/10 focus:border-[#DC2626] rounded-md px-3 py-1.5 text-xs font-semibold focus:outline-none transition-colors"
                                      value={catalogSearch}
                                      onChange={(e) =>
                                        setCatalogSearch(e.target.value)
                                      }
                                      autoFocus
                                    />
                                    <button
                                      onClick={() =>
                                        setActiveCatalogRowId(null)
                                      }
                                      className="text-[#000000] hover:text-[#A67C1E] cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="max-h-48 overflow-y-auto">
                                    {catalog.filter((c) =>
                                      c.name
                                        .toLowerCase()
                                        .includes(catalogSearch.toLowerCase()),
                                    ).length > 0 ? (
                                      catalog
                                        .filter((c) =>
                                          c.name
                                            .toLowerCase()
                                            .includes(
                                              catalogSearch.toLowerCase(),
                                            ),
                                        )
                                        .map((catItem) => {
                                          const isOutOfStock =
                                            catItem.stockQuantity === 0;
                                          return (
                                            <div
                                              key={catItem.id}
                                              className={`w-full flex items-center border-b border-transparent last:border-0 hover:bg-[#FFFFFF] transition-colors ${
                                                isOutOfStock ? "opacity-50" : ""
                                              }`}
                                            >
                                              <button
                                                className={`flex-1 text-left px-4 py-2.5 flex flex-col ${
                                                  isOutOfStock
                                                    ? "cursor-not-allowed"
                                                    : "cursor-pointer"
                                                }`}
                                                onClick={() => {
                                                  if (isOutOfStock) return;
                                                  updateItem(
                                                    item.id,
                                                    "name",
                                                    catItem.name,
                                                  );
                                                  updateItem(
                                                    item.id,
                                                    "product_id",
                                                    catItem.productId ||
                                                      catItem.id,
                                                  );
                                                  if (
                                                    catItem.price !== undefined
                                                  ) {
                                                    updateItem(
                                                      item.id,
                                                      "price",
                                                      catItem.price,
                                                    );
                                                  }
                                                  setActiveCatalogRowId(null);
                                                }}
                                              >
                                                <div className="flex justify-between items-center w-full">
                                                  <span className="text-xs font-bold text-[#000000]">
                                                    {catItem.name}
                                                  </span>
                                                  <span
                                                    className={`text-[10px] font-bold ${isOutOfStock ? "text-[#E11D48]" : "text-green-600"}`}
                                                  >
                                                    {isOutOfStock
                                                      ? "Out of Stock"
                                                      : `Stock: ${catItem.stockQuantity}`}
                                                  </span>
                                                </div>
                                                {catItem.desc && (
                                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#000000] mt-0.5">
                                                    {catItem.desc}
                                                  </span>
                                                )}
                                                {catItem.price !==
                                                  undefined && (
                                                  <span className="text-[10px] font-bold text-[#DC2626] mt-0.5">
                                                    ₹{catItem.price}
                                                  </span>
                                                )}
                                              </button>
                                              <div className="flex shrink-0">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditCatalog(
                                                      catItem,
                                                      item.id,
                                                    );
                                                    setActiveCatalogRowId(null);
                                                  }}
                                                  className="px-3 py-2.5 text-[#000000] hover:text-[#DC2626] transition-colors cursor-pointer"
                                                  title="Edit item"
                                                >
                                                  <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (
                                                      window.confirm(
                                                        "Are you sure you want to delete this item from the catalog?",
                                                      )
                                                    ) {
                                                      deleteFromCatalog(
                                                        catItem.id,
                                                      );
                                                    }
                                                  }}
                                                  className="px-3 py-2.5 text-[#000000] hover:text-[#A67C1E] transition-colors cursor-pointer"
                                                  title="Delete item"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })
                                    ) : (
                                      <div className="px-4 py-4 text-center">
                                        <div className="text-xs text-[#000000] font-semibold mb-2">
                                          No items match "{catalogSearch}"
                                        </div>
                                        <button
                                          onClick={() => {
                                            setNewCatName(catalogSearch);
                                            setCatalogTargetRowId(item.id);
                                            setShowCatalogModal(true);
                                            setActiveCatalogRowId(null);
                                          }}
                                          className="text-[10px] font-bold text-[#DC2626] bg-[#DC2626]/10 hover:bg-[#DC2626]/20 px-3 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                          + Add to Catalog
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Price, Qty, and Trash (Grid on mobile to prevent overflow, grid on desktop) */}
                            <div className="col-span-5 grid grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-5 gap-2 sm:gap-4 w-full items-center">
                              {/* Price Input */}
                              <div className="sm:col-span-2 flex items-center gap-1.5 sm:gap-2 sm:block min-w-0 w-full">
                                <span className="text-[10px] font-bold text-[#000000] uppercase sm:hidden shrink-0">
                                  Price:
                                </span>
                                <input
                                  type="number"
                                  className="w-full min-w-0 text-center bg-white border border-black/10 focus:border-[#DC2626] rounded-lg px-2 sm:px-3 py-2 text-xs font-semibold text-[#000000] focus:outline-none transition-colors"
                                  value={item.price || ""}
                                  onChange={(e) =>
                                    updateItem(
                                      item.id,
                                      "price",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  placeholder="0"
                                />
                              </div>

                              {/* Quantity Counter */}
                              <div className="sm:col-span-2 flex items-center justify-end gap-1.5 sm:gap-2 sm:block shrink-0">
                                <span className="text-[10px] font-bold text-[#000000] uppercase sm:hidden shrink-0">
                                  Qty:
                                </span>
                                <div className="flex items-center border border-black/10 bg-white rounded-lg overflow-hidden h-[36px] max-w-[90px] shrink-0">
                                  <button
                                    className="w-7 h-full flex items-center justify-center text-[#000000] hover:bg-[#FFFFFF] hover:text-[#A67C1E] font-bold text-xs transition-colors cursor-pointer"
                                    onClick={() =>
                                      handleQtyChange(item.id, item.qty - 1)
                                    }
                                  >
                                    −
                                  </button>
                                  <span className="flex-1 text-center font-bold text-xs text-[#000000] min-w-[18px]">
                                    {item.qty}
                                  </span>
                                  <button
                                    className="w-7 h-full flex items-center justify-center text-[#000000] hover:bg-[#FFFFFF] hover:text-[#A67C1E] font-bold text-xs transition-colors cursor-pointer"
                                    onClick={() =>
                                      handleQtyChange(item.id, item.qty + 1)
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Trash Button */}
                              <div className="sm:col-span-1 flex justify-end shrink-0">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-[#000000] hover:text-[#E11D48] hover:bg-[#FEE2E2] p-2 rounded-lg border border-black/10 hover:border-transparent transition-colors flex items-center justify-center cursor-pointer"
                                  title="Remove Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* Right Column - Premium Light Order Panel */}
                <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col shrink-0 bg-white text-[#000000] border border-black/10 rounded-2xl shadow-sm lg:sticky lg:top-28 lg:self-start transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 overflow-hidden group">
                  <div className="p-4 sm:p-6 pb-4 border-b border-black/10 flex justify-between items-center bg-[#FFFFFF]">
                    <h2 className="text-base font-black flex items-center gap-3 text-[#000000] tracking-tight">
                      <ShoppingBag className="w-4 h-4 text-[#DC2626]" />
                      Current Order
                    </h2>
                    <span
                      className={`flex items-center gap-2 bg-white border border-black/10 px-3 py-1 rounded-full font-bold text-[9px] ${isOnline ? "text-[#00A86B]" : "text-[#E11D48]"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#00A86B]" : "bg-[#E11D48]"}`}
                      ></span>
                      {isOnline ? "ONLINE ORDER" : "OFFLINE (POS)"}
                    </span>
                  </div>

                  <div className="p-4 sm:p-6 space-y-5">
                    {/* Customer Details Box */}
                    <div className="bg-[#FFFFFF]/40 border border-black/10 rounded-xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#000000] font-semibold">
                          SOURCE
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${isOnline ? "border-[#00A86B] text-[#00A86B] bg-[#00A86B]/10" : "border-[#E11D48] text-[#E11D48] bg-[#E11D48]/10"}`}
                        >
                          {isOnline ? "ONLINE" : "OFFLINE"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#000000] font-semibold">
                          CUSTOMER
                        </span>
                        <span className="font-bold text-[#000000] truncate max-w-[65%] text-right">
                          {customerName || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#000000] font-semibold">
                          PHONE
                        </span>
                        <span className="font-bold text-[#000000]">
                          {customerPhone || "-"}
                        </span>
                      </div>

                      {/* Items summary list inside customer details box */}
                      <div className="border-t border-black/10 pt-2.5 mt-2.5">
                        {items.filter((i) => i.name).length === 0 ? (
                          <div className="text-center py-2 text-[10px] text-[#000000] font-semibold italic">
                            No items added yet
                          </div>
                        ) : (
                          <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                            {items
                              .filter((i) => i.name)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between items-center text-[10px]"
                                >
                                  <span className="text-[#000000] font-semibold">
                                    {item.qty}x {item.name}
                                  </span>
                                  <span className="font-bold text-[#DC2626]">
                                    ₹
                                    {(item.price * item.qty).toLocaleString(
                                      undefined,
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discounts section */}
                    <div className="space-y-4 pt-1">
                      {/* Manual Discount */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-[0.1em] mb-1.5">
                          Manual Discount
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={discountType}
                            onChange={(e) => {
                              setDiscountType(
                                e.target.value as "fixed" | "percent",
                              );
                              setSelectedCoupon("none");
                            }}
                            className="bg-white border border-black/10 text-[#000000] rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#DC2626] cursor-pointer"
                          >
                            <option value="fixed">₹</option>
                            <option value="percent">%</option>
                          </select>
                          <input
                            type="number"
                            className="flex-1 text-right bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-bold text-[#000000] placeholder:text-[#000000] focus:outline-none focus:border-[#DC2626] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                            value={discountValue || ""}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              setDiscountValue(parseFloat(e.target.value) || 0);
                              setSelectedCoupon("none");
                            }}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Subtotal & Delivery Breakdown */}
                      <div className="space-y-2.5 pt-2 border-t border-black/10">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-[#000000]">
                            Subtotal (
                            {items
                              .filter((i) => i.name)
                              .reduce((sum, i) => sum + i.qty, 0)}{" "}
                            items)
                          </span>
                          <span className="font-bold text-[#000000]">
                            ₹
                            {subtotal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-[#000000]">Delivery</span>
                          <input
                            type="number"
                            className="w-20 text-right bg-white border border-black/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#000000] placeholder:text-[#000000] focus:outline-none focus:border-[#DC2626]"
                            value={deliveryFee || ""}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) =>
                              setDeliveryFee(parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </div>

                        {/* GST Section (Below Delivery, Above Grand Total) */}
                        <div className="pt-2">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${applyGST ? "bg-[#DC2626]" : "bg-gray-300"}`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${applyGST ? "translate-x-4" : "translate-x-1"}`}
                                />
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={applyGST}
                                onChange={(e) => setApplyGST(e.target.checked)}
                              />
                              <span className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                                Apply GST
                              </span>
                            </label>
                            {applyGST && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    className="w-14 text-right bg-white border border-black/10 rounded-lg px-2 py-1 text-xs font-bold text-[#000000] focus:outline-none focus:border-[#DC2626] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={gstPercentage || ""}
                                    onChange={(e) =>
                                      setGstPercentage(
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    placeholder="%"
                                  />
                                  <span className="text-xs font-bold text-[#000000]">
                                    %
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-[#DC2626] w-16 text-right">
                                  ₹
                                  {gstAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Grand Total */}
                      <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-black/10">
                        <span className="text-[#000000] uppercase tracking-wider">
                          Grand Total
                        </span>
                        <span className="text-xl text-[#DC2626] font-black">
                          ₹
                          {grandTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      {/* Cash Payment */}
                      <div className="bg-[#FFFFFF]/40 border border-black/10 rounded-xl p-4 mt-2">
                        <span className="block text-[9px] font-bold text-[#000000] uppercase tracking-wider mb-0.5">
                          Cash Payment
                        </span>
                        <label className="block text-[10px] font-bold text-[#000000] mb-2.5">
                          Amount Received (₹)
                        </label>
                        <input
                          type="number"
                          className="w-full bg-white border border-black/10 focus:border-[#DC2626] rounded-lg px-3 py-2 text-base font-bold text-[#000000] placeholder:text-[#000000] focus:outline-none transition-colors"
                          value={cashReceived || ""}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) =>
                            setCashReceived(parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                        />
                      </div>

                      {/* Change Return */}
                      {cashReceived > 0 && (
                        <div className="flex justify-between items-center bg-white border border-black/10 rounded-lg p-3 text-xs">
                          <span className="font-bold text-[#000000] uppercase tracking-[0.05em]">
                            Change Return
                          </span>
                          <span
                            className={`font-black text-sm ${cashReceived >= grandTotal ? "text-[#00A86B]" : "text-[#E11D48]"}`}
                          >
                            ₹
                            {Math.max(
                              0,
                              cashReceived - grandTotal,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}

                      {/* Complete Sale — saves the order to the database. This is
                          the authoritative "sale done" action; WhatsApp below is
                          purely for sharing the already-saved bill. */}
                      <button
                        onClick={() => completeSale()}
                        className="w-full mt-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 rounded-lg font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-[0_4px_14px_rgba(220,38,38,0.35)] cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Complete Sale
                      </button>

                      {/* Send Bill Button — completes/saves the sale, then shares it */}
                      <button
                        onClick={handleCompleteAndSendWhatsApp}
                        className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-lg font-bold text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-[0_4px_14px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        Send Bill Via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeTab === "orders" && (
          <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full pb-8 pr-2 animate-in fade-in duration-300">
            {/* Header Panel */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-[28px] font-black text-[#000000] tracking-tight">
                  Order History
                </h2>
                <p className="text-xs text-[#000000] font-semibold mt-1">
                  Manage and track past invoices
                </p>
              </div>

              {orders.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center bg-[#FFFFFF] border border-black/10 rounded-xl p-1 gap-1 max-w-full">
                    <span className="text-[9px] font-bold text-[#000000] uppercase tracking-wider px-2">
                      Period:
                    </span>
                    {(["all", "today", "week", "month", "year"] as const).map(
                      (p) => {
                        const displayLabel =
                          p === "all"
                            ? "All Time"
                            : p === "today"
                              ? "Today"
                              : p === "week"
                                ? "This Week"
                                : p === "month"
                                  ? "This Month"
                                  : "This Year";
                        const isActive = historyPeriod === p;
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              setHistoryPeriod(p);
                              setHistoryStartDate("");
                              setHistoryEndDate("");
                            }}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#DC2626] text-[#FFFFFF] shadow-sm"
                                : "text-[#000000] hover:bg-[#000000]/50"
                            }`}
                          >
                            {displayLabel}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="flex flex-wrap items-center border rounded-xl px-3 py-1.5 gap-2 shadow-sm bg-white border-black/10 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#000000]">
                        From:
                      </span>
                      <input
                        type="date"
                        value={historyStartDate}
                        onChange={(e) => {
                          setHistoryPeriod("custom");
                          setHistoryStartDate(e.target.value);
                        }}
                        className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-[#000000] w-[115px]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#000000]">
                        To:
                      </span>
                      <input
                        type="date"
                        value={historyEndDate}
                        onChange={(e) => {
                          setHistoryPeriod("custom");
                          setHistoryEndDate(e.target.value);
                        }}
                        className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-[#000000] w-[115px]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-[#DC2626] bg-transparent text-[#DC2626] hover:bg-[#DC2626] hover:text-[#FFFFFF] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-xl bg-[#FFFFFF] py-12">
                <p className="text-[#000000] font-medium">
                  No past transactions yet.
                </p>
              </div>
            ) : (
              <>
                {/* Search and Filters Bar */}
                <div className="bg-white border-2 border-black/10 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
                    <div>
                      <label className="block text-[9px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                        Search Order ID
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#000000] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. INV-..."
                          className="w-full bg-[#FFFFFF]/30 border border-black/10 focus:border-[#DC2626] rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-[#000000] focus:outline-none"
                          value={orderSearchId}
                          onChange={(e) => setOrderSearchId(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        placeholder="Search name..."
                        className="w-full bg-[#FFFFFF]/30 border border-black/10 focus:border-[#DC2626] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#000000] focus:outline-none"
                        value={orderSearchName}
                        onChange={(e) => setOrderSearchName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                        Customer Phone
                      </label>
                      <input
                        type="text"
                        placeholder="Search phone..."
                        className="w-full bg-[#FFFFFF]/30 border border-black/10 focus:border-[#DC2626] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#000000] focus:outline-none"
                        value={orderSearchPhone}
                        onChange={(e) => setOrderSearchPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                        Order Source
                      </label>
                      <select
                        className="w-full bg-[#FFFFFF]/30 border border-black/10 focus:border-[#DC2626] rounded-lg px-3 py-1.5 text-xs font-bold text-[#000000] focus:outline-none cursor-pointer"
                        value={orderFilterSource}
                        onChange={(e) => setOrderFilterSource(e.target.value)}
                      >
                        <option value="ALL">All Sources</option>
                        <option value="ONLINE">Online Orders</option>
                        <option value="OFFLINE">Offline (POS)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {(() => {
                  const filteredOrders = historyFilteredOrders;

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-xl bg-[#FFFFFF] py-12">
                        <p className="text-[#000000] font-semibold">
                          No transactions match your search filters.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-[#FFFFFF] border-2 border-black/10 rounded-xl shadow-sm overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FFFFFF] border-b border-black/10">
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest">
                              Order ID
                            </th>
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest">
                              Date & Time
                            </th>
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest">
                              Customer Name
                            </th>
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest">
                              Mobile Number
                            </th>
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest">
                              Source
                            </th>
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest">
                              Total Due
                            </th>
                            <th className="p-4 text-[10px] font-bold text-[#000000] uppercase tracking-widest text-right">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-transparent hover:bg-[#FFFFFF] transition-colors"
                            >
                              <td className="p-4 text-xs font-semibold text-[#000000]">
                                {order.id}
                              </td>
                              <td className="p-4 text-xs font-bold text-[#000000] whitespace-nowrap">
                                {new Date(order.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                                <span className="block text-[10px] font-semibold text-black/60">
                                  {new Date(
                                    order.createdAt || order.date,
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Asia/Kolkata",
                                  })}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-bold text-[#000000]">
                                {order.customerName}
                              </td>
                              <td className="p-4 text-xs font-mono font-bold text-[#000000]">
                                {order.customerPhone || "-"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${order.source === "ONLINE" ? "border-[#00A86B] text-[#00A86B] bg-[#00A86B]/10" : "border-[#E11D48] text-[#E11D48] bg-[#E11D48]/10"}`}
                                >
                                  {order.source}
                                </span>
                              </td>
                              <td className="p-4 text-sm font-black text-[#DC2626]">
                                ₹{order.grandTotal.toLocaleString()}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-3">
                                  <span className="px-3 py-1 rounded bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                                    {order.status}
                                  </span>
                                  <button
                                    onClick={() => resendWhatsApp(order)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                    </svg>
                                    WhatsApp
                                  </button>
                                  <button
                                    onClick={() => setActiveInvoiceId(order.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DC2626] hover:bg-[#9A7B1C] text-white rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    Invoice
                                  </button>
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-[10px] font-bold text-[#000000] hover:text-[#A67C1E] uppercase tracking-wider underline underline-offset-2"
                                  >
                                    Details
                                  </button>
                                  {role === "admin" && (
                                    <button
                                      onClick={() =>
                                        handleDeleteOrder(order.id)
                                      }
                                      className="text-[10px] font-bold text-[#E11D48] hover:text-white hover:bg-[#E11D48] border border-[#E11D48] px-2 py-1.5 rounded uppercase tracking-wider transition-colors ml-2"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {role === "admin" && activeTab === "analytics" && (
          <div className="flex-1 flex flex-col max-w-[1400px] min-w-0 mx-auto w-full pb-8 pr-2">
            {/* Header Panel */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-[28px] font-black text-[#000000] tracking-tight">
                  POS Analytics
                </h2>
                <p className="text-xs text-[#000000] font-semibold mt-1">
                  Real-time store & channel insights
                </p>
              </div>

              {/* Period Filters & Refresh Button */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {analyticsSubTab !== "today" && (
                  <>
                    <div className="flex flex-wrap items-center bg-[#FFFFFF] border border-black/10 rounded-xl p-1 gap-1 max-w-full">
                      <span className="text-[9px] font-bold text-[#000000] uppercase tracking-wider px-2">
                        Period:
                      </span>
                      {(["all", "today", "week", "month", "year"] as const).map(
                        (p) => {
                          const displayLabel =
                            p === "all"
                              ? "All Time"
                              : p === "today"
                                ? "Today"
                                : p === "week"
                                  ? "This Week"
                                  : p === "month"
                                    ? "This Month"
                                    : "This Year";
                          const isActive = analyticsPeriod === p;
                          return (
                            <button
                              key={p}
                              onClick={() => {
                                setAnalyticsPeriod(p);
                                setAnalyticsStartDate("");
                                setAnalyticsEndDate("");
                              }}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                isActive
                                  ? "bg-[#DC2626] text-[#FFFFFF] shadow-sm"
                                  : "text-[#000000] hover:bg-[#000000]/50"
                              }`}
                            >
                              {displayLabel}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <div className="flex flex-wrap items-center border rounded-xl px-3 py-1.5 gap-2 shadow-sm bg-white border-black/10 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#000000]">
                          From:
                        </span>
                        <input
                          type="date"
                          value={analyticsStartDate}
                          onChange={(e) => {
                            setAnalyticsPeriod("custom");
                            setAnalyticsStartDate(e.target.value);
                          }}
                          className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-[#000000] w-[115px]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#000000]">
                          To:
                        </span>
                        <input
                          type="date"
                          value={analyticsEndDate}
                          onChange={(e) => {
                            setAnalyticsPeriod("custom");
                            setAnalyticsEndDate(e.target.value);
                          }}
                          className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-[#000000] w-[115px]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="flex border-b border-black/10 mb-6 gap-6 overflow-x-auto scrollbar-none pb-0.5 w-full shrink-0">
              {(["revenue", "today", "products", "coupons"] as const).map(
                (tab) => {
                  const isActive = analyticsSubTab === tab;
                  const displayLabel =
                    tab === "today"
                      ? "Today's Sales"
                      : tab === "revenue"
                        ? "Revenue"
                        : tab === "products"
                          ? "Services"
                          : "Coupons";
                  return (
                    <button
                      key={tab}
                      onClick={() => setAnalyticsSubTab(tab)}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer shrink-0 ${
                        isActive
                          ? "text-[#DC2626]"
                          : "text-[#000000] hover:text-[#000000]"
                      }`}
                    >
                      {displayLabel}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2626] rounded-full" />
                      )}
                    </button>
                  );
                },
              )}
            </div>

            {/* Tab Contents */}
            {analyticsSubTab === "today" && (
              <>
                {/* Today's KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Today's Revenue
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <IndianRupee className="w-3 h-3 text-[#10B981] animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      ₹{todayRevenue.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Completed today
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Today's Bills
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-[#3B82F6] animate-swing" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      {todayOrdersCount}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Completed today
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Today's Items Sold
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                        <Package className="w-3 h-3 text-[#8B5CF6] animate-pop" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      {todayItemsSold} pcs
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Quantity sold today
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Today's Avg Order Value
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-[#F97316] animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      ₹
                      {Math.round(
                        todayOrdersCount > 0
                          ? todayRevenue / todayOrdersCount
                          : 0,
                      ).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Per invoice today
                    </div>
                  </div>
                </div>

                {/* Today's Detailed Split */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 mb-8">
                  {/* Left Side: Today's Order Source & Leaderboard */}
                  <div className="col-span-8 w-full flex flex-col gap-6">
                    {/* Today's Transactions Table */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h3 className="font-bold text-[#000000] text-sm">
                          Today's Transactions
                        </h3>

                        {/* Contact Search Input */}
                        <div className="flex items-center border border-black/10 bg-[#FFFFFF] rounded-lg px-3 py-1.5 gap-2 shadow-xs w-full sm:w-auto animate-in fade-in duration-200">
                          <Search className="w-3.5 h-3.5 text-[#000000]" />
                          <input
                            type="text"
                            placeholder="Search contact/invoice..."
                            className="text-xs font-semibold bg-transparent border-none outline-none focus:ring-0 text-[#000000] placeholder:text-[#000000]/50 w-full sm:w-[170px]"
                            value={analyticsSearchPhone}
                            onChange={(e) =>
                              setAnalyticsSearchPhone(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      {todayOrders.length === 0 ? (
                        <div className="text-center text-[#000000] text-xs font-semibold py-12">
                          {analyticsSearchPhone
                            ? "No matching transactions found."
                            : "No orders placed today."}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#FFFFFF] border-b border-black/10">
                                <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                                  Invoice ID
                                </th>
                                <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                                  Customer No
                                </th>
                                <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                                  Source
                                </th>
                                <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider text-right">
                                  Items
                                </th>
                                <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider text-right">
                                  Grand Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {todayOrders.map((order) => (
                                <tr
                                  key={order.id}
                                  className="border-b border-transparent hover:bg-[#FFFFFF]/50 transition-colors"
                                >
                                  <td className="p-3 text-xs font-semibold text-[#000000]">
                                    {order.id}
                                  </td>
                                  <td className="p-3 text-xs font-mono font-bold text-[#000000]">
                                    {order.customerPhone || "-"}
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${order.source === "ONLINE" ? "border-[#00A86B] text-[#00A86B] bg-[#00A86B]/10" : "border-[#E11D48] text-[#E11D48] bg-[#E11D48]/10"}`}
                                    >
                                      {order.source}
                                    </span>
                                  </td>
                                  <td className="p-3 text-xs font-semibold text-[#000000] text-right">
                                    {order.items.reduce(
                                      (sum, i) =>
                                        sum +
                                        (i.name && !i.name.startsWith("GST (")
                                          ? i.qty
                                          : 0),
                                      0,
                                    )}{" "}
                                    pcs
                                  </td>
                                  <td className="p-3 text-xs font-black text-[#DC2626] text-right">
                                    ₹{order.grandTotal.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Channel Split & Top items */}
                  <div className="col-span-4 w-full flex flex-col gap-6">
                    {/* Today's Channel Split Card */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-[#000000] mb-4 text-sm">
                        Today's Channel Split
                      </h3>
                      {todayOrdersCount === 0 ? (
                        <div className="text-center text-[#000000] text-xs font-semibold py-6">
                          No sales today.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider w-14">
                              Offline
                            </span>
                            <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#E11D48] rounded-full transition-all duration-700"
                                style={{
                                  width: `${(todayOfflineOrdersCount / todayOrdersCount) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-black text-[#000000] w-12 text-right">
                              ₹{todayOfflineRevenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#00A86B] uppercase tracking-wider w-14">
                              Online
                            </span>
                            <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00A86B] rounded-full transition-all duration-700"
                                style={{
                                  width: `${(todayOnlineOrdersCount / todayOrdersCount) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-black text-[#000000] w-12 text-right">
                              ₹{todayOnlineRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Today's Top Products Sold Card */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm flex-1">
                      <h3 className="font-bold text-[#000000] text-sm mb-4">
                        Today's Top Items
                      </h3>
                      {todayTopItems.length === 0 ? (
                        <div className="text-center text-[#000000] text-xs font-semibold py-6">
                          No items sold today.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {todayTopItems.map((item, idx) => (
                            <div
                              key={item.name}
                              className="flex items-center gap-3"
                            >
                              <span className="text-[11px] font-black text-[#000000] w-4">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-[#000000]">
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-black text-[#DC2626]">
                                    ₹{item.revenue.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#DC2626] rounded-full transition-all duration-700"
                                    style={{
                                      width: `${(item.revenue / todayTopItems[0].revenue) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="text-[10px] text-[#000000] font-semibold w-10 text-right">
                                {item.qty} pcs
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {analyticsSubTab === "revenue" && (
              <>
                {/* Top 5x2 KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Row 1 */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Total Revenue
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <IndianRupee className="w-3 h-3 text-[#10B981] animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      ₹
                      {totalRevenueAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      POS + manual combined
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Completed Bills
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-[#10B981] animate-swing" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      {totalOrdersCount}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      POS + manual bills
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Offline Bills
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#06B6D4]/10 flex items-center justify-center">
                        <IndianRupee className="w-3 h-3 text-[#06B6D4] animate-bounce" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      ₹
                      {offlineRevenue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Walk-in POS sales
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Online Bills
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                        <IndianRupee className="w-3 h-3 text-[#6366F1] animate-float" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      ₹
                      {onlineRevenue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Online POS sales
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  {/* Row 2 */}
                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Total Offline Bills
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
                        <ShoppingBag className="w-3 h-3 text-[#E11D48] animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      {offlineOrders}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Walk-in POS orders
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Total Online Bills
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-[#6366F1] animate-float" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      {onlineOrders}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Online channel orders
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Total Items Sold
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                        <Package className="w-3 h-3 text-[#8B5CF6] animate-pop" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      {totalItemsSold}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      From completed bills
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Avg Order Value
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-[#F97316] animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-[#000000] mb-1">
                      ₹{Math.round(avgOrderValue).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Per completed order
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Top Service
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#EC4899]/10 flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-[#EC4899] animate-pop" />
                      </div>
                    </div>
                    <div
                      className="text-xl font-black text-[#000000] mb-1 truncate"
                      title={topProduct}
                    >
                      {topProduct}
                    </div>
                    <div className="text-[9px] text-[#000000] font-semibold">
                      Most sold item
                    </div>
                  </div>
                </div>

                {/* Main Charts & Breakdowns */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                  {/* Left Chart Column */}
                  <div className="col-span-8 w-full flex flex-col gap-6">
                    {/* Monthly Revenue Trend Chart */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col min-h-[300px]">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-[#000000] text-sm mb-2 flex items-center">
                            Revenue Trend This Year{" "}
                            <span className="text-[#DC2626] font-black ml-1.5">
                              {now.getFullYear()}
                            </span>
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-[#000000]">
                              ₹{totalYearRevenue.toLocaleString()}
                            </span>
                            {avgMonthRevenue > 0 && (
                              <span className="bg-[#FFFFFF] border border-black/10 text-[#DC2626] px-2 py-0.5 rounded text-[10px] font-bold">
                                Avg ₹
                                {Math.round(avgMonthRevenue).toLocaleString()}
                                /mo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {orders.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-[#000000] text-sm font-semibold">
                          Process orders to see yearly revenue trend.
                        </div>
                      ) : (
                        <div className="flex-1 overflow-x-auto scrollbar-thin pb-2">
                          <div className="flex items-end justify-between px-2 gap-1 relative mt-4 min-w-[500px] h-[170px] pt-10">
                            {monthNames.map((month, i) => (
                              <div
                                key={month}
                                className="flex flex-col items-center gap-1.5 w-full group/bar relative outline-none"
                                tabIndex={0}
                              >
                                {/* Monthly sales text on top for mobile/visibility */}
                                <span className="text-[8px] font-black text-[#DC2626] h-3 flex items-end">
                                  {monthRevenue[i] > 0
                                    ? monthRevenue[i] >= 1000
                                      ? `₹${(monthRevenue[i] / 1000).toFixed(1)}k`
                                      : `₹${monthRevenue[i]}`
                                    : ""}
                                </span>

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#000000] text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 group-focus/bar:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                  <div className="text-[9px] text-white/70 font-semibold mb-0.5">
                                    {monthNames[i]}
                                  </div>
                                  ₹{(monthRevenue[i] || 0).toLocaleString()}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#000000]"></div>
                                </div>
                                <div
                                  className="w-full max-w-[24px] bg-[#DC2626] rounded-t-sm transition-all duration-1000 group-hover/bar:bg-[#A67C1E] cursor-pointer min-h-[4px]"
                                  style={{
                                    height: `${Math.max(4, (monthRevenue[i] / maxMonthRevenue) * 100)}px`,
                                  }}
                                />
                                <span className="text-[10px] font-bold text-[#000000] uppercase">
                                  {month}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Weekly Revenue Bar Chart */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col min-h-[250px]">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-[#000000] text-sm flex items-center">
                            Revenue This Week{" "}
                            <span className="text-[#DC2626] font-black ml-1.5">
                              (Week {currentWeekNumber} of {now.getFullYear()})
                            </span>
                          </h3>
                          <p className="text-[10px] text-[#000000] font-semibold mt-1">
                            ₹
                            {weekRevenue
                              .reduce((a, b) => a + b, 0)
                              .toLocaleString()}{" "}
                            total
                          </p>
                        </div>
                      </div>

                      {orders.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-[#000000] text-sm font-semibold">
                          Process orders to see weekly revenue.
                        </div>
                      ) : (
                        <div className="flex-1 flex items-end justify-between px-2 gap-2">
                          {dayNames.map((day, i) => (
                            <div
                              key={day}
                              className="flex flex-col items-center gap-3 w-full group/bar relative outline-none"
                              tabIndex={0}
                            >
                              <span className="text-[9px] font-black text-[#DC2626]">
                                {weekRevenue[i] > 0
                                  ? `₹${weekRevenue[i] >= 1000 ? (weekRevenue[i] / 1000).toFixed(1) + "k" : weekRevenue[i]}`
                                  : ""}
                              </span>

                              {/* Tooltip for exact weekly revenue */}
                              <div className="absolute bottom-[52px] mb-2 left-1/2 -translate-x-1/2 bg-[#000000] text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 group-focus/bar:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                <div className="text-[9px] text-white/70 font-semibold mb-0.5">
                                  {dayNames[i]}
                                </div>
                                ₹{(weekRevenue[i] || 0).toLocaleString()}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#000000]"></div>
                              </div>

                              <div className="w-full max-w-[20px] h-32 bg-[#F3F4F6] rounded-full relative overflow-hidden cursor-pointer">
                                <div
                                  className="absolute bottom-0 w-full bg-[#DC2626] rounded-full transition-all duration-1000 group-hover/bar:bg-[#A67C1E]"
                                  style={{
                                    height: `${(weekRevenue[i] / maxWeekRevenue) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#000000] uppercase">
                                {day}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Breakdowns) */}
                  <div className="col-span-4 w-full flex flex-col gap-6">
                    {/* Order Source Breakdown */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                      <h3 className="font-bold text-[#000000] mb-4 text-sm">
                        Order Source
                      </h3>
                      {totalOrdersCount === 0 ? (
                        <div className="text-center text-[#000000] text-sm font-semibold py-6">
                          No orders yet.
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider w-14">
                              Offline
                            </span>
                            <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#E11D48] rounded-full transition-all duration-700"
                                style={{
                                  width: `${(offlineOrders / totalOrdersCount) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-black text-[#000000] w-8 text-right">
                              {offlineOrders}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#00A86B] uppercase tracking-wider w-14">
                              Online
                            </span>
                            <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00A86B] rounded-full transition-all duration-700"
                                style={{
                                  width: `${(onlineOrders / totalOrdersCount) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-black text-[#000000] w-8 text-right">
                              {onlineOrders}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Top Items by Revenue */}
                    <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex-1">
                      <h3 className="font-bold text-[#000000] text-sm mb-4">
                        Top Items by Revenue
                      </h3>
                      {topItems.length === 0 ? (
                        <div className="text-center text-[#000000] text-sm font-semibold py-6">
                          No items sold yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {topItems.map((item, idx) => (
                            <div
                              key={item.name}
                              className="flex items-center gap-3"
                            >
                              <span className="text-[11px] font-black text-[#000000] w-4">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-xs font-bold text-[#000000]">
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-black text-[#DC2626]">
                                    ₹{item.revenue.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#DC2626] rounded-full transition-all duration-700"
                                    style={{
                                      width: `${(item.revenue / topItems[0].revenue) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="text-[10px] text-[#000000] font-semibold w-10 text-right">
                                {item.qty} pcs
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {analyticsSubTab === "products" && (
              <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="font-bold text-[#000000] text-sm">
                    Service Sales Leaderboard
                  </h3>

                  {/* Product Search Input */}
                  <div className="flex items-center border border-black/10 bg-[#FFFFFF] rounded-lg px-3 py-1.5 gap-2 shadow-xs w-full sm:w-auto animate-in fade-in duration-200">
                    <Search className="w-3.5 h-3.5 text-[#000000]" />
                    <input
                      type="text"
                      placeholder="Search service..."
                      className="text-xs font-semibold bg-transparent border-none outline-none focus:ring-0 text-[#000000] placeholder:text-[#000000]/50 w-full sm:w-[180px]"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {Object.keys(itemSales).length === 0 ? (
                  <div className="text-center text-[#000000] text-sm font-semibold py-12">
                    No services sold in this period.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FFFFFF] border-b border-black/10">
                          <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                            Service Name
                          </th>
                          <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider text-right">
                            Qty Sold
                          </th>
                          <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider text-right">
                            Revenue
                          </th>
                          <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                            Market Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(itemSales).filter((item) =>
                          item.name
                            .toLowerCase()
                            .includes(productSearchQuery.toLowerCase()),
                        ).length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-12 text-sm font-semibold text-[#000000]"
                            >
                              No matching services found.
                            </td>
                          </tr>
                        ) : (
                          Object.values(itemSales)
                            .filter((item) =>
                              item.name
                                .toLowerCase()
                                .includes(productSearchQuery.toLowerCase()),
                            )
                            .sort((a, b) => b.revenue - a.revenue)
                            .map((item, idx) => {
                              const share =
                                totalRevenueAmount > 0
                                  ? (item.revenue / totalRevenueAmount) * 100
                                  : 0;
                              return (
                                <tr
                                  key={item.name}
                                  className="border-b border-transparent hover:bg-[#FFFFFF]/50 transition-colors"
                                >
                                  <td className="p-3 text-xs font-black text-[#000000]">
                                    {idx + 1}
                                  </td>
                                  <td className="p-3 text-xs font-bold text-[#000000]">
                                    {item.name}
                                  </td>
                                  <td className="p-3 text-xs font-bold text-[#000000] text-right">
                                    {item.qty} pcs
                                  </td>
                                  <td className="p-3 text-xs font-black text-[#DC2626] text-right">
                                    ₹{item.revenue.toLocaleString()}
                                  </td>
                                  <td className="p-3 w-1/4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-[#DC2626] rounded-full"
                                          style={{ width: `${share}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold text-[#000000] w-8">
                                        {share.toFixed(1)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {analyticsSubTab === "coupons" && (
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                <div className="col-span-1 w-full bg-white border border-black/10 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <h3 className="font-bold text-[#000000] text-sm">
                    Discount Summary
                  </h3>

                  <div className="p-4 bg-[#FFFFFF] border border-black/10 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Total Discounts Given
                      </span>
                      <Percent className="w-4 h-4 text-[#DC2626]" />
                    </div>
                    <span className="text-2xl font-black text-[#DC2626]">
                      ₹
                      {analyticsFilteredOrders
                        .reduce((acc, o) => acc + o.discount, 0)
                        .toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] border border-black/10 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Discounted Orders
                      </span>
                      <Calendar className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <span className="text-2xl font-black text-[#000000]">
                      {
                        analyticsFilteredOrders.filter((o) => o.discount > 0)
                          .length
                      }
                    </span>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] border border-black/10 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]">
                        Avg Discount Per Order
                      </span>
                      <IndianRupee className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <span className="text-2xl font-black text-[#000000]">
                      ₹
                      {Math.round(
                        analyticsFilteredOrders.filter((o) => o.discount > 0)
                          .length > 0
                          ? analyticsFilteredOrders.reduce(
                              (acc, o) => acc + o.discount,
                              0,
                            ) /
                              analyticsFilteredOrders.filter(
                                (o) => o.discount > 0,
                              ).length
                          : 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 w-full bg-white border border-black/10 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="font-bold text-[#000000] text-sm">
                      Promo Campaign Performance
                    </h3>

                    {/* Coupons Search Input */}
                    <div className="flex items-center border border-black/10 bg-[#FFFFFF] rounded-lg px-3 py-1.5 gap-2 shadow-xs w-full sm:w-auto animate-in fade-in duration-200">
                      <Search className="w-3.5 h-3.5 text-[#000000]" />
                      <input
                        type="text"
                        placeholder="Search code/mobile/amount..."
                        className="text-xs font-semibold bg-transparent border-none outline-none focus:ring-0 text-[#000000] placeholder:text-[#000000]/50 w-full sm:w-[220px]"
                        value={couponSearchQuery}
                        onChange={(e) => setCouponSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {analyticsFilteredOrders.filter((o) => o.discount > 0)
                    .length === 0 ? (
                    <div className="text-center text-[#000000] text-sm font-semibold py-12">
                      No promotional discounts given in this period.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FFFFFF] border-b border-black/10">
                            <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                              Transaction ID
                            </th>
                            <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                              Customer Mobile
                            </th>
                            <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider text-right">
                              Order Total
                            </th>
                            <th className="p-3 text-[10px] font-bold text-[#000000] uppercase tracking-wider text-right">
                              Discount Applied
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsFilteredOrders
                            .filter((o) => o.discount > 0)
                            .filter((o) => {
                              const q = couponSearchQuery.toLowerCase();
                              const couponCode =
                                getCouponCodeForOrder(o).toLowerCase();
                              return (
                                o.id.toLowerCase().includes(q) ||
                                couponCode.includes(q) ||
                                (o.customerPhone || "").includes(q) ||
                                o.discount.toString().includes(q) ||
                                o.grandTotal.toString().includes(q)
                              );
                            }).length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center py-12 text-sm font-semibold text-[#000000]"
                              >
                                No matching coupon performance records found.
                              </td>
                            </tr>
                          ) : (
                            analyticsFilteredOrders
                              .filter((o) => o.discount > 0)
                              .filter((o) => {
                                const q = couponSearchQuery.toLowerCase();
                                const couponCode =
                                  getCouponCodeForOrder(o).toLowerCase();
                                return (
                                  o.id.toLowerCase().includes(q) ||
                                  couponCode.includes(q) ||
                                  (o.customerPhone || "").includes(q) ||
                                  o.discount.toString().includes(q) ||
                                  o.grandTotal.toString().includes(q)
                                );
                              })
                              .map((order) => (
                                <tr
                                  key={order.id}
                                  className="border-b border-transparent hover:bg-[#FFFFFF]/50 transition-colors"
                                >
                                  <td className="p-3 text-xs font-semibold text-[#000000]">
                                    {order.id}
                                  </td>
                                  <td className="p-3 text-xs font-mono font-bold text-[#000000]">
                                    {order.customerPhone || "-"}
                                  </td>
                                  <td className="p-3 text-xs font-bold text-right text-[#000000]">
                                    ₹{order.grandTotal.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-xs font-black text-[#E11D48] text-right">
                                    -₹{order.discount.toLocaleString()}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full pb-8 pr-2 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-[28px] font-black text-[#000000] tracking-tight flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-[#E11D48]" />
                  Stock Alerts
                </h2>
                <p className="text-xs text-[#000000] font-semibold mt-1">
                  Low stock and near-expiry items — refill or rotate before they
                  run out.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {outOfStockCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-white bg-[#E11D48] px-4 py-2 rounded-lg">
                    <PackageX className="w-3.5 h-3.5" />
                    {outOfStockCount} out of stock
                  </div>
                )}
                <div className="text-xs font-bold text-[#000000] bg-[#FFFFFF] border border-black/10 px-4 py-2 rounded-lg">
                  {lowStockItems.length} alert
                  {lowStockItems.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="bg-white border border-black/10 rounded-xl p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-7 h-7 text-[#10B981]" />
                </div>
                <p className="text-base font-bold text-[#000000]">All good.</p>
                <p className="text-xs font-semibold text-[#000000]/60 mt-1">
                  No products below their low-stock threshold, and nothing
                  expiring in the next 30 days.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead className="bg-[#FAFAFA] border-b border-black/10">
                      <tr>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider">
                          Product
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Stock
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Threshold
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Expiry
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {lowStockItems.map((p) => {
                        const stock =
                          typeof p.stockQuantity === "number"
                            ? p.stockQuantity
                            : 0;
                        const threshold =
                          typeof p.lowStockThreshold === "number"
                            ? p.lowStockThreshold
                            : 10;
                        const days = daysUntil(p.expiryDate);
                        const isOut = stock <= 0;
                        const isLow = !isOut && stock <= threshold;
                        const isExpired = days !== null && days < 0;
                        const isExpiringSoon =
                          days !== null && days >= 0 && days <= 30;
                        return (
                          <tr key={p.id} className="hover:bg-[#FAFAFA]">
                            <td className="p-3">
                              <div className="text-sm font-bold text-[#000000]">
                                {p.name}
                              </div>
                              {(p.batchNo || p.manufacturer) && (
                                <div className="text-[10px] font-semibold text-[#000000]/60 mt-0.5">
                                  {p.manufacturer}
                                  {p.manufacturer && p.batchNo ? " • " : ""}
                                  {p.batchNo ? `Batch ${p.batchNo}` : ""}
                                </div>
                              )}
                            </td>
                            <td
                              className={`p-3 text-center text-sm font-black ${isOut || isLow ? "text-[#E11D48]" : "text-[#000000]"}`}
                            >
                              {stock}
                            </td>
                            <td className="p-3 text-center text-sm font-bold text-[#000000]/70">
                              {threshold}
                            </td>
                            <td
                              className={`p-3 text-center text-xs font-bold ${isExpired ? "text-[#E11D48]" : isExpiringSoon ? "text-[#D97706]" : "text-[#000000]/70"}`}
                            >
                              {p.expiryDate || "—"}
                              {days !== null && (
                                <div className="text-[10px] font-semibold">
                                  {days < 0
                                    ? `Expired ${Math.abs(days)}d ago`
                                    : `${days}d left`}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                {isOut && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white bg-[#E11D48] px-2 py-1 rounded">
                                    <PackageX className="w-3 h-3" />
                                    Out of Stock
                                  </span>
                                )}
                                {isLow && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#B45309] bg-[#F59E0B]/20 px-2 py-1 rounded">
                                    Low Stock
                                  </span>
                                )}
                                {isExpired && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white bg-[#E11D48] px-2 py-1 rounded">
                                    Expired
                                  </span>
                                )}
                                {!isExpired && isExpiringSoon && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#D97706] bg-[#D97706]/10 px-2 py-1 rounded">
                                    Expiring Soon
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {role === "admin" && activeTab === "inventory" && (
          <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full pb-8 pr-2 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-[28px] font-black text-[#000000] tracking-tight flex items-center gap-3">
                  <Boxes className="w-7 h-7 text-[#DC2626]" />
                  Inventory
                </h2>
                <p className="text-xs text-[#000000] font-semibold mt-1">
                  Manage medicines — add, edit, delete, and track expiry & stock
                  levels.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setScheduleFilter("ALL")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${scheduleFilter === "ALL" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setScheduleFilter("H")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${scheduleFilter === "H" ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-black"}`}
                  >
                    Sch-H
                  </button>
                  <button
                    onClick={() => setScheduleFilter("H1")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${scheduleFilter === "H1" ? "bg-white shadow-sm text-purple-600" : "text-gray-500 hover:text-black"}`}
                  >
                    Sch-H1
                  </button>
                </div>
                <div className="relative flex-1 lg:flex-none">
                  <Search className="w-3.5 h-3.5 text-[#000000]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    className="pl-9 pr-3 py-2 bg-white border border-black/10 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#DC2626] w-full lg:w-48"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={exportInventoryCSV}
                  className="text-[10px] font-bold text-[#000000] bg-white border border-black/10 hover:bg-[#FAFAFA] px-3 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#DC2626]" /> Export CSV
                </button>
                <button
                  onClick={() => {
                    resetCatalogForm();
                    setEditingCatalogId(null);
                    setCatalogTargetRowId(null);
                    setShowCatalogModal(true);
                  }}
                  className="text-[10px] font-bold text-white bg-[#1E40AF] hover:bg-[#DC2626] px-3 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              </div>
            </div>

            {inventoryProducts.length === 0 ? (
              <div className="bg-white border border-black/10 rounded-xl p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#DC2626]/10 flex items-center justify-center mx-auto mb-4">
                  <Boxes className="w-7 h-7 text-[#DC2626]" />
                </div>
                <p className="text-base font-bold text-[#000000]">
                  No products yet.
                </p>
                <p className="text-xs font-semibold text-[#000000]/60 mt-1 mb-4">
                  Add your first medicine to start tracking stock and expiry.
                </p>
                <button
                  onClick={() => {
                    resetCatalogForm();
                    setEditingCatalogId(null);
                    setCatalogTargetRowId(null);
                    setShowCatalogModal(true);
                  }}
                  className="text-[10px] font-bold text-white bg-[#1E40AF] hover:bg-[#DC2626] px-4 py-2 rounded-lg uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Product
                </button>
              </div>
            ) : (
              <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-[#FAFAFA] border-b border-black/10">
                      <tr>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider">
                          Product
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Schedule
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-right">
                          Price
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Stock
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-center">
                          Expiry
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider">
                          Batch / Mfr
                        </th>
                        <th className="p-3 text-[10px] font-black text-[#000000] uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredInventory.map((p) => {
                        const stock =
                          typeof p.stockQuantity === "number"
                            ? p.stockQuantity
                            : 0;
                        const threshold =
                          typeof p.lowStockThreshold === "number"
                            ? p.lowStockThreshold
                            : 10;
                        const days = daysUntil(p.expiryDate);
                        const isLow = stock <= threshold;
                        const isExpired = days !== null && days < 0;
                        const isExpiringSoon =
                          days !== null && days >= 0 && days <= 90;
                        const isExpanded = expandedProductId === p.id;
                        const sch = p.scheduleCategory || "NONE";
                        return (
                          <React.Fragment key={p.id}>
                            <tr
                              className="hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                              onClick={() =>
                                setExpandedProductId(isExpanded ? null : p.id)
                              }
                            >
                              <td className="p-3">
                                <div className="text-sm font-bold text-[#000000] flex items-center gap-2">
                                  {p.name}
                                  {p.batches && p.batches.length > 1 && (
                                    <span className="text-[9px] bg-black/5 px-1.5 py-0.5 rounded text-black/60">
                                      {p.batches.length} batches
                                    </span>
                                  )}
                                </div>
                                {p.desc && (
                                  <div className="text-[10px] font-semibold text-[#000000]/60 mt-0.5">
                                    {p.desc}
                                  </div>
                                )}
                                {p.hsnCode && (
                                  <div className="text-[9px] font-bold text-[#000000]/40 mt-0.5 uppercase tracking-wider">
                                    HSN {p.hsnCode}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {sch === "H" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-1 rounded">
                                    H
                                  </span>
                                ) : sch === "H1" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                    H1
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#000000]/40">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right text-sm font-black text-[#000000]">
                                ₹
                                {(p.price ?? 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="p-3 text-center">
                                <div
                                  className={`text-sm font-black ${isLow ? "text-[#E11D48]" : "text-[#000000]"}`}
                                >
                                  {stock}
                                </div>
                                <div className="text-[9px] font-semibold text-[#000000]/50">
                                  min {threshold}
                                </div>
                              </td>
                              <td
                                className={`p-3 text-center text-xs font-bold ${isExpired ? "text-[#E11D48]" : isExpiringSoon ? "text-[#D97706]" : "text-[#000000]/70"}`}
                              >
                                {p.expiryDate || "—"}
                                {days !== null && (
                                  <div className="text-[9px] font-semibold">
                                    {days < 0
                                      ? `Expired ${Math.abs(days)}d ago`
                                      : `${days}d left`}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="text-xs font-semibold text-[#000000]">
                                  {p.manufacturer || (
                                    <span className="text-[#000000]/40">—</span>
                                  )}
                                </div>
                                <div className="text-[10px] font-semibold text-[#000000]/50">
                                  {p.batchNo ? `Batch ${p.batchNo}` : ""}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <div
                                  className="flex justify-end gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => quickAddStock(p)}
                                    className="text-[10px] font-bold text-[#10B981] hover:text-white hover:bg-[#10B981] border border-[#10B981]/30 px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Stock
                                  </button>
                                  <button
                                    onClick={() => openEditCatalog(p)}
                                    className="text-[10px] font-bold text-[#DC2626] hover:text-white hover:bg-[#DC2626] border border-[#DC2626]/30 px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Pencil className="w-3 h-3" /> Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `Delete "${p.name}" from inventory? This cannot be undone.`,
                                        )
                                      ) {
                                        deleteFromCatalog(p.id);
                                      }
                                    }}
                                    className="text-[10px] font-bold text-[#E11D48] hover:text-white hover:bg-[#E11D48] border border-[#E11D48]/30 px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-[#FAFAFA] border-b border-black/5">
                                <td colSpan={7} className="p-4">
                                  <div className="bg-white border border-black/10 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-[10px] font-bold text-black uppercase tracking-wider">
                                        Batch Details
                                      </h4>
                                      <button
                                        onClick={() => {
                                          setBatchTargetProductId(p.id);
                                          resetCatalogForm();
                                          setShowBatchModal(true);
                                        }}
                                        className="text-[10px] font-bold text-white bg-[#1E40AF] hover:bg-[#DC2626] px-2 py-1 rounded transition-colors cursor-pointer"
                                      >
                                        + Add Batch
                                      </button>
                                    </div>
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="border-b border-black/5 text-[#000000]/60">
                                          <th className="py-1.5 font-semibold">
                                            Batch No
                                          </th>
                                          <th className="py-1.5 font-semibold">
                                            Arrived At
                                          </th>
                                          <th className="py-1.5 font-semibold">
                                            Mfg Date
                                          </th>
                                          <th className="py-1.5 font-semibold">
                                            Expiry Date
                                          </th>
                                          <th className="py-1.5 font-semibold">
                                            Cost Price
                                          </th>
                                          <th className="py-1.5 font-semibold">
                                            Selling Price
                                          </th>
                                          <th className="py-1.5 font-semibold text-right">
                                            Stock
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {p.batches && p.batches.length > 0 ? (
                                          p.batches.map((b: any) => {
                                            let batchExpiry = b.expiry_date;
                                            if (
                                              batchExpiry &&
                                              batchExpiry.includes("T")
                                            ) {
                                              batchExpiry =
                                                batchExpiry.split("T")[0];
                                            }
                                            let batchArrival = b.arrived_at;
                                            if (
                                              batchArrival &&
                                              batchArrival.includes("T")
                                            ) {
                                              batchArrival =
                                                batchArrival.split("T")[0];
                                            }
                                            return (
                                              <tr
                                                key={b.id}
                                                className="border-b border-black/5 last:border-0"
                                              >
                                                <td className="py-1.5 font-bold">
                                                  {b.batch_no || "—"}
                                                </td>
                                                <td className="py-1.5">
                                                  {batchArrival || "—"}
                                                </td>
                                                <td className="py-1.5">
                                                  {b.mfg_date || "—"}
                                                </td>
                                                <td className="py-1.5">
                                                  {batchExpiry || "—"}
                                                </td>
                                                <td className="py-1.5">
                                                  ₹
                                                  {Number(
                                                    b.cost_price,
                                                  ).toLocaleString()}
                                                </td>
                                                <td className="py-1.5">
                                                  ₹
                                                  {Number(
                                                    b.selling_price,
                                                  ).toLocaleString()}
                                                </td>
                                                <td
                                                  className={`py-1.5 text-right font-black ${b.stock_quantity > 0 ? "text-green-600" : "text-[#E11D48]"}`}
                                                >
                                                  {b.stock_quantity}
                                                </td>
                                              </tr>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan={7}
                                              className="py-3 text-center text-[10px] font-semibold text-black/40"
                                            >
                                              No batches available.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {filteredInventory.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-xs font-semibold text-[#000000]/60"
                          >
                            No products match &quot;{inventorySearch}&quot;.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-black/10 flex justify-between items-center bg-[#FFFFFF]">
                <div>
                  <h3 className="text-xl font-bold text-[#000000]">
                    Order Details
                  </h3>
                  <p className="text-sm text-[#000000] font-medium mt-1">
                    {selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors group cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#000000] group-hover:text-[#A67C1E] transition-colors" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-[10px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                      Customer Name
                    </div>
                    <div className="text-sm font-semibold text-[#000000]">
                      {selectedOrder.customerName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                      Contact Number
                    </div>
                    <div className="text-sm font-semibold text-[#000000]">
                      {selectedOrder.customerPhone || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                      Order Source
                    </div>
                    <div className="text-sm font-semibold text-[#000000]">
                      {selectedOrder.source}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#000000] uppercase tracking-wider mb-1">
                      Date & Time
                    </div>
                    <div className="text-sm font-semibold text-[#000000]">
                      {new Date(selectedOrder.date).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-[11px] font-bold text-[#000000] uppercase tracking-[0.1em] border-b border-black/10 pb-2">
                  Order Items
                </div>
                <div className="space-y-3 mb-8">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#000000]">
                          {item.name}
                        </div>
                        {item.desc && (
                          <div className="text-[10px] text-[#000000] font-medium">
                            {item.desc}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#000000]">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#000000] font-medium">
                          {item.qty} x ₹{item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#000000] font-semibold">
                      Subtotal
                    </span>
                    <span className="text-[#000000] font-bold">
                      ₹{selectedOrder.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#000000] font-semibold">
                        Discount
                      </span>
                      <span className="text-[#E11D48] font-bold">
                        -₹{selectedOrder.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#000000] font-semibold">
                        Delivery Fee
                      </span>
                      <span className="text-[#000000] font-bold">
                        ₹{selectedOrder.deliveryFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg pt-2 mt-2 border-t border-transparent">
                    <span className="text-[#000000] font-black uppercase tracking-tight">
                      Total{" "}
                    </span>
                    <span className="text-[#DC2626] font-black">
                      ₹{selectedOrder.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {activeInvoiceId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="px-4 py-3 flex justify-between items-center bg-white border-b border-black/10 shrink-0">
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-[#000000]">
                  <Printer className="w-4 h-4 text-[#DC2626]" />
                  Invoice #{activeInvoiceId}
                </h3>
                <button
                  onClick={() => setActiveInvoiceId(null)}
                  className="w-8 h-8 flex items-center justify-center bg-black hover:bg-black/80 text-white rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 w-full bg-gray-50 overflow-hidden relative">
                <iframe
                  src={`/invoice/${activeInvoiceId}`}
                  className="w-full h-full border-none absolute inset-0"
                  title={`Invoice ${activeInvoiceId}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alert Modal */}
        {showLowStockAlertModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 border border-black/10">
              <div className="p-6 border-b border-black/10">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <h3 className="font-black text-lg text-black tracking-tight">Stock Alert</h3>
                  </div>
                  <button
                    onClick={() => setShowLowStockAlertModal(false)}
                    className="text-black/40 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-black/70">
                  Some products need restocking. Please review the out-of-stock
                  and low-stock items below.
                </p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2 bg-gray-50/50">
                <ul className="space-y-2 p-2">
                  {lowStockAlertProducts.map((p) => {
                    const stock =
                      typeof p.stockQuantity === "number" ? p.stockQuantity : 0;
                    const threshold =
                      typeof p.lowStockThreshold === "number"
                        ? p.lowStockThreshold
                        : 10;
                    const isOut = stock <= 0;
                    const isLow = !isOut && stock <= threshold;
                    return (
                      <li
                        key={p.id}
                        className="bg-white p-3 rounded-lg border border-black/5 flex justify-between items-center gap-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-black truncate">
                            {p.name}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isOut
                                ? "text-white bg-[#E11D48]"
                                : isLow
                                  ? "text-[#B45309] bg-[#F59E0B]/20"
                                  : "text-[#D97706] bg-[#D97706]/10"
                            }`}
                          >
                            {isOut
                              ? "Out of Stock"
                              : isLow
                                ? "Low Stock"
                                : "Expiring Soon"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-black shrink-0 ${isOut ? "text-[#E11D48]" : "text-black"}`}
                        >
                          Stock: {stock}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="p-4 border-t border-black/10 bg-white">
                <button
                  onClick={() => setShowLowStockAlertModal(false)}
                  className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Add Stock Modal */}
        {showQuickAddStockModal && quickAddStockProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 border border-black/10">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-lg text-black tracking-tight mb-1">Add Stock</h3>
                    <p className="text-xs font-bold text-black/60">{quickAddStockProduct.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowQuickAddStockModal(false);
                      setQuickAddStockProduct(null);
                    }}
                    className="text-black/40 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">
                    Quantity to Add
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-white border border-black/20 focus:border-[#10B981] rounded-xl px-4 py-3 text-sm font-black text-black placeholder:text-black/30 focus:outline-none transition-colors"
                    placeholder="Enter amount..."
                    value={quickAddStockAmount}
                    onChange={(e) => setQuickAddStockAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowQuickAddStockModal(false);
                      setQuickAddStockProduct(null);
                    }}
                    className="flex-1 py-3 bg-white border border-black/10 hover:bg-black/5 text-black rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickAddStockSubmit}
                    className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classy Footer */}
        <footer className="mt-auto pt-10 pb-2 border-t border-black/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-[#000000] font-semibold uppercase tracking-wider gap-4">
          <div className="text-[#000000]">
            © 2026 All Rights Reserved. VINAYAKA MEDICALS.
          </div>
          <div>
            Powered By{" "}
            <a
              href="https://www.cenexasystems.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DC2626] hover:underline font-bold transition-all"
            >
              Cenexa Systems
            </a>{" "}
            @2026
          </div>
          <div className="italic text-[#4B5563] font-bold tracking-[0.15em] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"></span>
            Medicines • Surgical • Free BP • Sugar Test
          </div>
        </footer>
      </main>
    </div>
  );
}
