import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Package2, Clock, CheckCircle, Ship, CreditCard,
  ShoppingCart, XCircle, Loader2, ChevronDown,
  ChevronUp, ExternalLink, Calendar, AlertCircle,
  ArrowRight, Search, X, StickyNote, Hourglass,
  Settings, BadgeCheck, BadgeX, RefreshCw,
} from "lucide-react";
import { GoIssueTrackedBy } from "react-icons/go";
import RootLayout from "../util/RootLayout";
import { fetchUserOrders, fetchOrderById } from "../store/slices/orderSlice";

/* ─── Order Status config ─── */
const ORDER_STATUS_CONFIG = {
  "Order Placed": {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    step: 1,
  },
  Pending: {
    icon: Hourglass,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    step: 1,
  },
  Processing: {
    icon: Settings,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    step: 2,
  },
  Shipped: {
    icon: Ship,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    step: 3,
  },
  Delivered: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    step: 4,
  },
  Cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    step: 0,
  },
  // legacy alias
  Canceled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    step: 0,
  },
};

/* ─── Payment Status config ─── */
const PAYMENT_STATUS_CONFIG = {
  Verifying: {
    icon: RefreshCw,
    badge: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-400",
  },
  Processing: {
    icon: Settings,
    badge: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-400",
  },
  Paid: {
    icon: BadgeCheck,
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
  },
  Failed: {
    icon: BadgeX,
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-400",
  },
};

const STEPS = [
  { label: "Placed",     statuses: ["Order Placed", "Pending"] },
  { label: "Processing", statuses: ["Processing"] },
  { label: "Shipped",    statuses: ["Shipped"] },
  { label: "Delivered",  statuses: ["Delivered"] },
];

/* ─── Progress Stepper ─── */
const OrderStepper = ({ status }) => {
  if (status === "Cancelled" || status === "Canceled") return null;
  const currentStep = ORDER_STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="w-full mt-3 mb-1">
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const done    = stepNum < currentStep;
          const active  = stepNum === currentStep;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done || active
                      ? "bg-[#1a5a8a] text-white"
                      : "bg-gray-100 text-gray-400 border border-gray-200"}`}
                >
                  {done || active ? <CheckCircle size={14} /> : stepNum}
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded transition-all
                    ${stepNum < currentStep ? "bg-[#1a5a8a]" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-start mt-1">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const done    = stepNum < currentStep;
          const active  = stepNum === currentStep;
          return (
            <React.Fragment key={step.label + "-lbl"}>
              <div className="flex-shrink-0 w-7 flex justify-center">
                <span
                  className={`font-semibold whitespace-nowrap leading-tight
                    ${done || active ? "text-[#1a5a8a]" : "text-gray-400"}`}
                  style={{ fontSize: "9px" }}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && <div className="flex-1 mx-1" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Payment Status Badge ─── */
const PaymentStatusBadge = ({ paymentStatus }) => {
  if (!paymentStatus) return null;
  const cfg = PAYMENT_STATUS_CONFIG[paymentStatus];
  if (!cfg) return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
      {paymentStatus}
    </span>
  );
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
      <Icon size={10} />
      {paymentStatus}
    </span>
  );
};

/* ─── Single Order Card ─── */
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = ORDER_STATUS_CONFIG[order.status] || {
    icon: Package2,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
  };
  const StatusIcon = cfg.icon;

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  return (
    <div
      className={`bg-white rounded-2xl border ${cfg.border} overflow-hidden
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* ── Card header ── */}
      <div className={`${cfg.bg} px-4 py-2.5 flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
          <StatusIcon size={14} className={cfg.color} />
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 whitespace-nowrap">
              <Calendar size={11} />
              {formattedDate}
            </span>
          )}
          <span className="text-sm font-extrabold text-[#1a5a8a] whitespace-nowrap">
            ₹{Number(order.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-4 py-4">
        {/* Order ID + Payment method */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">
              Order ID
            </p>
            <p className="text-[13px] font-bold text-gray-800 font-mono truncate">
              #{order.order_number || order.id}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">
              Payment
            </p>
            <p className="text-[13px] font-semibold text-gray-700 flex items-center gap-1 justify-end">
              <CreditCard size={12} className="text-gray-400 flex-shrink-0" />
              {order.payment_method || "—"}
            </p>
          </div>
        </div>

        {/* Payment Status row */}
        {order.payment_status && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Payment Status:
            </span>
            <PaymentStatusBadge paymentStatus={order.payment_status} />
          </div>
        )}

        {/* Stepper */}
        <OrderStepper status={order.status} />

        {/* First item preview */}
        {order.cartItems?.[0] && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={order.cartItems[0].bunner || order.cartItems[0].image}
              alt={order.cartItems[0].title}
              className="h-12 w-12 object-cover rounded-xl border border-gray-100 flex-shrink-0 bg-gray-50"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-1">
                {order.cartItems[0].title}
              </p>
              {order.cartItems.length > 1 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  +{order.cartItems.length - 1} more item{order.cartItems.length > 2 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tracking + actions row */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-100 min-w-0">
            <GoIssueTrackedBy size={12} className="flex-shrink-0" />
            <span className="font-medium truncate max-w-[140px]">
              {order.trackingNumber || order.tracking_number || "Tracking pending"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {(order.trackingURL || order.tracking_url) && (
              <a
                href={order.trackingURL || order.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-[#1a5a8a] hover:underline"
              >
                Track <ExternalLink size={11} />
              </a>
            )}
            {order.cartItems?.length > 1 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#1a5a8a] transition-colors"
              >
                {expanded ? "Less" : "Details"}
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
            {order.cartItems?.length <= 1 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#1a5a8a] transition-colors"
              >
                {expanded ? "Less" : "Details"}
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div className="mt-3 border-t border-dashed border-gray-100 pt-3 space-y-3">
            {/* Items list */}
            {order.cartItems?.length > 0 && (
              <div className="space-y-2">
                {order.cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={item.bunner || item.image}
                      alt={item.title}
                      className="h-10 w-10 object-cover rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity ? `Qty: ${item.quantity}` : ""}
                        {item.price ? ` · ₹${Number(item.price).toLocaleString("en-IN")}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tracking URL detailed */}
            {(order.trackingURL || order.tracking_url) && (
              <div className="bg-blue-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold mb-0.5">
                  Tracking URL
                </p>
                <a
                  href={order.trackingURL || order.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 font-medium break-all hover:underline flex items-center gap-1"
                >
                  {order.trackingURL || order.tracking_url}
                  <ExternalLink size={10} className="flex-shrink-0" />
                </a>
              </div>
            )}

            {/* Admin / Seller Note */}
            {order.Note && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-0.5 flex items-center gap-1">
                  <StickyNote size={10} /> Note from Seller
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">{order.admin_note}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Filter tab ─── */
const FilterTab = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5
      ${active
        ? "bg-[#1a5a8a] text-white shadow-sm"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
  >
    {label}
    {count != null && (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
          ${active ? "bg-white/25 text-white" : "bg-gray-200 text-gray-500"}`}
      >
        {count}
      </span>
    )}
  </button>
);

/* ─── Search Bar ─── */
const SearchBar = ({ value, onChange, onClear, resultCount, total }) => (
  <div className="mb-5">
    <div className="relative">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Order ID…"
        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a]
          placeholder:text-gray-400 transition-all font-mono"
      />
      {value && (
        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      )}
    </div>
    {value && (
      <p className="mt-1.5 text-xs text-gray-400 pl-1">
        {resultCount === 0
          ? "No orders match that ID"
          : `${resultCount} of ${total} order${total !== 1 ? "s" : ""} matched`}
      </p>
    )}
  </div>
);

/* ─── Guest Order Lookup ─── */
const GuestOrderLookup = () => {
  const dispatch = useDispatch();
  const [orderId, setOrderId]   = useState("");
  const [result,  setResult]    = useState(null);  
  const [error,   setError]     = useState("");
  const [loading, setLoading]   = useState(false);

const handleSearch = async () => {
    const trimmed = orderId.trim().replace(/^#/, "");
    if (!trimmed) return;
    
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const response = await dispatch(fetchOrderById({ orderId: trimmed })).unwrap();
      const order = response?.order || null
      if (order) {
        let cart = [];
        if (typeof order.cart === "string") {
          try { 
            cart = JSON.parse(order.cart); 
          } catch (e) { 
            cart = []; 
          }
        } else {
          cart = order.cart || [];
        }

        setResult({ ...order, cartItems: cart });
      } else {
        setError("No order found with that ID. Please check and try again.");
      }
    } catch (error) {
      // Because we used unwrap(), the catch block receives your thunk's rejected value directly
      setError(error?.message || typeof error === "string" ? error : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Search size={18} className="text-[#1a5a8a]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-800">Track Your Order</h2>
            <p className="text-xs text-gray-400">Enter your Order ID to see status and details</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">#</span>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Order ID…"
              className="w-full pl-7 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a]
                placeholder:text-gray-400 transition-all font-mono"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !orderId.trim()}
            className="bg-[#1a5a8a] hover:bg-[#154b74] disabled:bg-gray-200 disabled:text-gray-400
              text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Find
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
            <AlertCircle size={13} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4">
          <OrderCard order={result} />
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
const MyOrdersPage = () => {
  const { user }   = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.orders);
  const navigate   = useNavigate();
  const dispatch   = useDispatch();

  const [isLoading,    setIsLoading]    = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery,  setSearchQuery]  = useState("");
  const userId = user?.id;

  useEffect(() => {
    document.title = "Ms Store | My Orders";
    const loadOrders = async () => {
      if (userId) {
        setIsLoading(true);
        await dispatch(fetchUserOrders(userId));
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, [dispatch, userId]);

  const parsedOrders = useMemo(() => {
    return (orders || []).map((order) => {
      let cart = [];
      try { cart = JSON.parse(order.cart || "[]"); } catch (e) { cart = []; }
      return { ...order, cartItems: cart };
    });
  }, [orders]);

  const filterCounts = useMemo(() => {
    const counts = { All: parsedOrders.length };
    parsedOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [parsedOrders]);

  const filtered = useMemo(() => {
    let list = activeFilter === "All"
      ? parsedOrders
      : parsedOrders.filter((o) => o.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().replace(/^#/, "");
      list = list.filter((o) =>
        String(o.order_number || o.id || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [parsedOrders, activeFilter, searchQuery]);

  /* ── Not logged in → show guest lookup ── */
  if (!user) {
    return (
      <RootLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 md:mt-36 pb-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
              My Orders
            </h1>
            <p className="text-sm text-gray-500">Track your order without signing in</p>
          </div>

          <GuestOrderLookup />

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 mb-3">Have an account? Sign in to see all your orders.</p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-[#1a5a8a] hover:bg-[#154b74] text-white
                font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Login <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 md:mt-36 pb-10">

        {/* ── Page heading ── */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          {!isLoading && parsedOrders.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {parsedOrders.length} order{parsedOrders.length !== 1 ? "s" : ""} placed
            </p>
          )}
        </div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-[#1a5a8a]" />
            <p className="text-sm text-gray-500">Fetching your orders…</p>
          </div>

        /* ── Empty ── */
        ) : parsedOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package2 size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-6">When you place an order it'll appear here.</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-[#1a5a8a] text-white text-sm
                font-semibold px-5 py-2 rounded-xl hover:bg-[#154b74] transition-colors"
            >
              Start Shopping <ArrowRight size={15} />
            </button>
          </div>

        /* ── Orders list ── */
        ) : (
          <>
            <SearchBar
              value={searchQuery}
              onChange={(v) => setSearchQuery(v)}
              onClear={() => setSearchQuery("")}
              resultCount={filtered.length}
              total={parsedOrders.length}
            />

            {!searchQuery && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
                {["All", "Order Placed", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Canceled"]
                  .filter((f) => f === "All" || filterCounts[f])
                  .map((f) => (
                    <FilterTab
                      key={f}
                      label={f === "Order Placed" ? "Placed" : f}
                      count={filterCounts[f]}
                      active={activeFilter === f}
                      onClick={() => setActiveFilter(f)}
                    />
                  ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <AlertCircle size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  {searchQuery
                    ? `No order found with ID containing "${searchQuery}"`
                    : `No ${activeFilter.toLowerCase()} orders found.`}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs font-semibold text-[#1a5a8a] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </RootLayout>
  );
};

export default MyOrdersPage;