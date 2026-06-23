import React, { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, Package, Box } from "lucide-react";
import { FaBoxOpen } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { app } from "../../assets/assets";
// Ensure this path points to your actual userSlice location
import { logoutUser } from "../../store/slices/userSlice"; 

const AdminLayout = () => {
  const { user, isLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Prevent background scroll while sidebar open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  const menuLinks = [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
    { title: "Users", icon: <Users size={18} />, path: "/admin/users" },
    { title: "Inventory", icon: <Box size={18} />, path: "/admin/inventory" },
    { title: "Stocks", icon: <FaBoxOpen size={18} />, path: "/admin/stocks" },
    { title: "Orders", icon: <Package size={18} />, path: "/admin/orders" },
  ];

  const handleLogout = async () => {
    try {
      
      setLogoutLoading(true);
      const res = await dispatch(logoutUser()).unwrap();
      toast.success(res?.message || "Logout Success");
      setIsSidebarOpen(false); // Fixed undefined variable crash
      navigate("/login");
    } catch (error) {
      toast.error(error?.error || "Failed to logout");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden w-full">
      
      {/* Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden  animate-fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a5a8a] text-white transform transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} md:translate-x-0 md:relative md:z-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={app.logo} alt="logo" className="object-cover h-full w-full" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-bold text-lg leading-none tracking-wide">Admin Panel</div>
              <Link 
                to="/" 
                className="bg-white/10 text-white hover:bg-white text-xs py-1 px-2 rounded font-medium transition-colors w-fit leading-none mt-1 hover:text-[#1a5a8a]"
              >
                Exit to Store
              </Link>
            </div>
          </div>

          {/* Close Button for Mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1">
          {menuLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={() => setIsSidebarOpen(false)} 
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white text-[#1a5a8a] font-bold shadow-sm" : "hover:bg-white/10 text-white/90 hover:text-white"
                }`
              }
            >
              <span className="opacity-90">{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer (User Info & Logout) */}
        <div className="p-4 border-t border-white/10 bg-[#164a72]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#1a5a8a] text-lg font-bold flex-shrink-0 shadow-inner">
              {((user?.fullName || user?.email || "A")[0] || "A").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-white">
                {user?.fullName || "Administrator"}
              </div>
              <div className="text-xs text-blue-200 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-400 rounded-lg transition-colors flex items-center justify-center shadow-sm"
          >
            {logoutLoading ? "Invalidating Session..." : "Secure Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Top Bar (Hidden on Desktop) */}
        <header className="md:hidden flex-shrink-0 w-full bg-[#1a5a8a] text-white flex items-center justify-between px-4 py-3 shadow-md z-30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-white overflow-hidden flex items-center justify-center">
              <img src={app.logo} alt="logo" className="object-cover h-full w-full" />
            </div>
            <span className="font-bold tracking-wide">Admin Portal</span>
          </div>

          <button
            aria-label="Open menu"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-6 w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;