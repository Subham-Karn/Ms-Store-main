import {
  IndianRupee,
  Package,
  SquareArrowUpRight,
  UsersRound,
  Clock,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { GrCatalog } from "react-icons/gr";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCatalogs } from "../../store/slices/appSlice";
import { fetchAllUsers } from "../../store/slices/userSlice";
import { fetchAllOrdersAdmin } from "../../store/slices/orderSlice";

/* ─── Helpers ─── */
const fmtINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ORDER_STATUS_STYLE = {
  "Order Placed": "bg-[#e8f1f8] text-[#0c447c] border border-[#b8d4ea]",
  Pending:        "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Processing:     "bg-purple-100 text-purple-800 border border-purple-200",
  Shipped:        "bg-[#1a5a8a] text-white",
  Delivered:      "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Cancelled:      "bg-red-100 text-red-800 border border-red-200",
  Canceled:       "bg-red-100 text-red-800 border border-red-200",
};

const PAYMENT_STATUS_STYLE = {
  Paid:       "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Failed:     "bg-red-100 text-red-800 border border-red-200",
  Verifying:  "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Processing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

const statusStyle = (s) => ORDER_STATUS_STYLE[s]  || "bg-gray-100 text-gray-600 border border-gray-200";
const payStyle    = (s) => PAYMENT_STATUS_STYLE[s] || "bg-gray-100 text-gray-600 border border-gray-200";

/* ─── Stat Card ─── */
const STAT_THEMES = {
  orders: {
    card:  "bg-[#e8f1f8] border-[#b8d4ea]",
    icon:  "bg-[#1a5a8a]",
    arc:   "bg-[#1a5a8a]",
    label: "text-[#0c447c]",
    value: "text-[#042c53]",
    trend: "text-[#185fa5]",
  },
  catalogs: {
    card:  "bg-[#edf5f0] border-[#b3dcc5]",
    icon:  "bg-[#1a7a4a]",
    arc:   "bg-[#1a7a4a]",
    label: "text-[#27500a]",
    value: "text-[#173404]",
    trend: "text-[#3b6d11]",
  },
  users: {
    card:  "bg-[#fdf3e7] border-[#f5d9a8]",
    icon:  "bg-[#c97d10]",
    arc:   "bg-[#c97d10]",
    label: "text-[#633806]",
    value: "text-[#412402]",
    trend: "text-[#854f0b]",
  },
  revenue: {
    card:  "bg-[#e9edf5] border-[#bcc8df]",
    icon:  "bg-[#2a4a8a]",
    arc:   "bg-[#2a4a8a]",
    label: "text-[#185fa5]",
    value: "text-[#0c447c]",
    trend: "text-[#185fa5]",
  },
};

const StatCard = ({ title, value, trend, icon, themeKey }) => {
  const t = STAT_THEMES[themeKey];
  return (
    <div
      className={`relative rounded-2xl border p-[18px] flex flex-col gap-1 overflow-hidden
        transition-transform duration-150 hover:-translate-y-0.5 ${t.card}`}
    >
      {/* soft arc in corner */}
      <div
        className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.15] ${t.arc}`}
      />

      {/* icon box */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 flex-shrink-0 ${t.icon}`}
      >
        <span className="text-white">{icon}</span>
      </div>

      <span className={`text-[10px] font-bold uppercase tracking-[0.09em] ${t.label}`}>
        {title}
      </span>

      <span className={`text-[26px] font-extrabold leading-tight ${t.value}`}>
        {value}
      </span>
    </div>
  );
};

/* ─── Dashboard ─── */
const Dashboard = () => {
  const { catalogs } = useSelector((state) => state.app);
  const { users }    = useSelector((state) => state.user);
  const { orders }   = useSelector((state) => state.orders);
  const dispatch     = useDispatch();
  useEffect(() => {
    document.title = "Ms Store | Dashboard";
    dispatch(fetchCatalogs());
    dispatch(fetchAllUsers());
    dispatch(fetchAllOrdersAdmin(true));
  }, [dispatch]);

  const totalRevenue = useMemo(
    () => (orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0),
    [orders]
  );

  const recentOrders = useMemo(() => {
    const cutoff = Date.now() - 20 * 60 * 1000;
    return (orders || []).filter(
      (o) => o.created_at && new Date(o.created_at).getTime() >= cutoff
    );
  }, [orders]);

  const getCartItems = (cart) => {
    if (!cart) return [];
    if (Array.isArray(cart)) return cart;
    if (typeof cart === "string") {
      try { return JSON.parse(cart); } catch { return []; }
    }
    if (typeof cart === "object") return [cart];
    return [];
  };

  const getFirstProductTitle = (cart) => {
    const items = getCartItems(cart);
    if (!items.length) return "—";
    const first = items[0];
    const rest  = items.length - 1;
    const title = first?.title || first?.name || "Product";
    return rest > 0 ? `${title}  +${rest} more` : title;
  };

  const topStats = [
    {
      themeKey: "orders",
      title:    "Total Orders",
      value:    orders?.length ?? 0,
      icon:     <Package size={20} />,
    },
    {
      themeKey: "catalogs",
      title:    "Total Catalogs",
      value:    catalogs?.length ?? 0,
      icon:     <GrCatalog size={20} />,
    },
    {
      themeKey: "users",
      title:    "Total Users",
      value:    (users?.length ?? 0).toLocaleString("en-IN"),
      icon:     <UsersRound size={20} />,
    },
    {
      themeKey: "revenue",
      title:    "Total Revenue",
      value:    `₹${fmtINR(totalRevenue)}`,
      icon:     <IndianRupee size={20} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-1">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topStats.map((item) => (
          <StatCard key={item.themeKey} {...item} />
        ))}
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-[#dce6ef] p-5">

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#1a5a8a]" />
            <p className="text-sm font-bold text-[#042c53]">Recent Orders</p>
            <span className="text-xs text-gray-400">(last 20 min)</span>
          </div>
          {recentOrders.length > 0 && (
            <span className="text-[11px] font-bold bg-[#e8f1f8] text-[#0c447c]
              border border-[#b8d4ea] px-3 py-1 rounded-full">
              {recentOrders.length} new
            </span>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e8f1f8] flex items-center justify-center mb-3">
              <RefreshCw size={18} className="text-[#1a5a8a]" />
            </div>
            <p className="text-sm font-semibold text-[#0c447c]">No recent orders</p>
            <p className="text-xs text-gray-400 mt-1">
              New orders placed in the last 20 minutes will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#e5eef5]">
                  {["Order ID", "Product", "Customer", "Price", "Order Status", "Payment", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[10px] uppercase tracking-[0.08em]
                          font-bold text-[#6b87a0] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr
                    key={order.id || i}
                    className="border-b border-[#f0f5f9] hover:bg-[#f4f8fc] transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] font-bold text-[#042c53]">
                        #{order.order_number || order.id}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-3 py-3 max-w-[150px]">
                      <span className="text-xs font-medium text-gray-700 line-clamp-1">
                        {getFirstProductTitle(order.cart)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-700">
                        {order.fullName || "—"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs font-extrabold text-[#042c53]">
                        ₹{fmtINR(order.total)}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="px-3 py-3">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap
                          ${statusStyle(order.status)}`}
                      >
                        {order.status || "—"}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-3 py-3">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap
                          ${payStyle(order.payment_status)}`}
                      >
                        {order.payment_status || "—"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-3 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5
                          bg-[#1a5a8a] hover:bg-[#154b74] text-white rounded-lg
                          text-[11px] font-bold transition-colors whitespace-nowrap"
                      >
                        View <SquareArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;