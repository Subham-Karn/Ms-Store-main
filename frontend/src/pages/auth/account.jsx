import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import RootLayout from "../../util/RootLayout";
import {
  User,
  Package,
  LogOut,
  ShoppingCart,
  Shield,
  CalendarDays,
  Mail,
  ChevronRight,
  Clock,
  Star,
  TrendingUp,
  Loader2,
  Bell,
  Lock,
  HelpCircle,
  Banknote,
  Award,
} from "lucide-react";
import { logoutUser } from "../../store/slices/userSlice";
import toast from "react-hot-toast";

/* ── small stat card ── */
const StatCard = ({ icon: Icon, label, value, color = "blue", delay = 0 }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-violet-50 text-violet-600 border-violet-100",
  };
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-lg font-bold text-gray-800 leading-none">{value}</p>
      </div>
    </div>
  );
};

/* ── sidebar nav item ── */
const SideItem = ({ to, icon: Icon, label, active, danger, onClick }) => {
  const base =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left";
  const style = danger
    ? "text-red-500 hover:bg-red-50"
    : active
    ? "bg-[#1a5a8a] text-white shadow-md shadow-[#1a5a8a]/20"
    : "text-gray-600 hover:bg-gray-50 hover:text-[#1a5a8a]";

  if (onClick)
    return (
      <button onClick={onClick} className={`${base} ${style}`}>
        <Icon size={18} />
        <span className="flex-1">{label}</span>
      </button>
    );

  return (
    <Link to={to} className={`${base} ${style}`}>
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={14} className="opacity-60" />}
    </Link>
  );
};

/* ── info row ── */
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-[#1a5a8a]/8 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-[#1a5a8a]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

/* ── quick action card ── */
const ActionCard = ({ to, icon: Icon, title, desc, color }) => {
  const accent = {
    blue: "group-hover:bg-[#1a5a8a] group-hover:text-white border-[#1a5a8a]/15 text-[#1a5a8a] bg-[#1a5a8a]/6",
    amber: "group-hover:bg-amber-500 group-hover:text-white border-amber-200 text-amber-600 bg-amber-50",
    green: "group-hover:bg-emerald-500 group-hover:text-white border-emerald-200 text-emerald-600 bg-emerald-50",
    violet: "group-hover:bg-violet-500 group-hover:text-white border-violet-200 text-violet-600 bg-violet-50",
  };
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${accent[color]}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
};

/* ════════════════════════════════════════════════ */
const Account = () => {
  const { user } = useSelector((s) => s.user);
  const { orders = [] } = useSelector((s) => s.orders || {});
  const { cart = [] } = useSelector((s) => s.cart || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLogoutLoading(false);
    }
  };

  if (!user) return null;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const memberDays = user.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt)) / 86_400_000)
    : 0;

  const displayName = user.fullName || user.email?.split("@")[0] || "Collector";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel =
    user.role === "admin" ? "Administrator" : user.role === "seller" ? "Seller" : "Collector";

  const roleBadge =
    user.role === "admin"
      ? "bg-red-100 text-red-700 border border-red-200"
      : user.role === "seller"
      ? "bg-amber-100 text-amber-700 border border-amber-200"
      : "bg-emerald-100 text-emerald-700 border border-emerald-200";

  return (
    <RootLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        .account-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
      `}</style>

      <div className="account-root min-h-screen bg-[#f7f8fc] mt-[110px] md:mt-[130px]">
        {/* ── Hero banner ── */}
        <div className="bg-gradient-to-r from-[#0d3d63] via-[#1a5a8a] to-[#1e6fa8] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* Avatar */}
              <div className="relative shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/25 shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/25 shadow-xl
                    flex items-center justify-center text-2xl font-bold tracking-tight">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white" title="Online" />
              </div>

              {/* Identity */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="display-font text-2xl md:text-3xl font-bold leading-tight">{displayName}</h1>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${roleBadge}`}>
                    {roleLabel}
                  </span>
                </div>
                <p className="text-blue-200 text-sm">{user.email}</p>
                <p className="text-blue-300 text-xs mt-1 flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  Member since {joinDate} · {memberDays} days collecting
                </p>
              </div>

              {/* Admin shortcut */}
              {user.role === "admin" && (
                <Link to="/admin"
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-red-500/90 hover:bg-red-600
                    text-white text-xs font-bold rounded-xl transition shrink-0">
                  <Shield size={15} /> Admin Portal
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
          <div className="grid lg:grid-cols-[240px,1fr] gap-8">

            {/* ── Sidebar ── */}
            <aside className="space-y-2 fade-up">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 mb-3">Navigation</p>

              <SideItem to="/account"  icon={User}        label="My Profile"   active />
              <SideItem to="/orders"   icon={Package}     label="My Orders"    />
              <SideItem to="/cart"     icon={ShoppingCart} label="My Cart"      />
              {user.role === "admin" && (
                <SideItem to="/admin" icon={Shield} label="Admin Portal" />
              )}

              <div className="pt-2 border-t border-gray-100 mt-2" />

              <div className="pt-2 border-t border-gray-100 mt-2" />
              <SideItem
                icon={logoutLoading ? Loader2 : LogOut}
                label={logoutLoading ? "Logging out…" : "Log Out"}
                danger
                onClick={handleLogout}
              />
            </aside>

            {/* ── Main content ── */}
            <main className="space-y-6 fade-up" style={{ animationDelay: "80ms" }}>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Package}     label="Total Orders"  value={orders.length || 0}      color="blue"   delay={0}   />
                <StatCard icon={ShoppingCart} label="Cart Items"   value={cart.length || 0}         color="amber"  delay={60}  />
                <StatCard icon={TrendingUp}  label="Days Active"   value={memberDays}               color="green"  delay={120} />
                <StatCard icon={Award}       label="Account Tier"  value={memberDays > 365 ? "Gold" : "Silver"} color="purple" delay={180} />
              </div>

              {/* Profile details card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-800 text-base">Profile Information</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${roleBadge}`}>
                    {roleLabel}
                  </span>
                </div>

                <div className="px-6 py-2">
                  <InfoRow icon={User}         label="Display Name"   value={displayName} />
                  <InfoRow icon={Mail}         label="Email Address"  value={user.email || "—"} />
                  <InfoRow icon={Shield}       label="Account Role"   value={roleLabel} />
                  <InfoRow icon={CalendarDays} label="Member Since"   value={joinDate} />
                </div>
              </div>

            </main>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default Account;