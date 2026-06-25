import React, { useEffect, useRef, useState, useCallback } from "react";
import { navlinks } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Grip,
  Loader2,
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import SearchInput from "../util/SearchInput";
import { toTitleCase } from "../util/formateString";
import { logoutUser } from "../store/slices/userSlice";
import { fetchMenus } from "../store/slices/appSlice";

const VISIBLE_MENU_LIMIT = 10;

/* ── outside-click hook ── */
function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}

/* ── Avatar helper ── */
const Avatar = ({ user, size = 9 }) =>
  user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt="avatar"
      className={`w-${size} h-${size} rounded-full object-cover border-2 border-white/30`}
    />
  ) : (
    <div
      className={`w-${size} h-${size} flex items-center justify-center rounded-full bg-[#1a5a8a] text-white font-bold text-sm uppercase select-none`}
    >
      {user?.email?.charAt(0) ?? "G"}
    </div>
  );

/* ────────────────────────────────────────────────────────── */
/*  "More" Modal — shows all menus + submenus in a grid      */
/* ────────────────────────────────────────────────────────── */
const MoreModal = ({ menus, onClose }) => {
  const [expanded, setExpanded] = useState(null);
  const modalRef = useRef(null);
  useOutsideClick(modalRef, onClose);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        ref={modalRef}
        className="bg-white w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[80vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Grip size={18} className="text-[#1a5a8a]" />
            <h2 className="font-bold text-gray-800 text-base tracking-tight">All Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {menus.map((menu, i) => {
              const isOpen = expanded === i;
              return (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:border-[#1a5a8a]/30 transition-colors"
                >
                  <div className="flex items-center justify-between bg-[#1a5a8a]/5 px-4 py-3">
                    <Link
                      to={`/catalogs/${menu.name.toLowerCase()}`}
                      onClick={onClose}
                      className="flex-1 text-sm font-bold text-[#1a5a8a] capitalize hover:underline"
                    >
                      {toTitleCase(menu.name)}
                    </Link>
                    {menu.submenus?.length > 0 && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : i)}
                        className="ml-2 p-1 rounded-lg hover:bg-[#1a5a8a]/10 transition text-[#1a5a8a]"
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Submenus */}
                  {menu.submenus?.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out
                        ${isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <ul className="py-2 px-2 space-y-0.5">
                        {menu.submenus.map((sub, j) => (
                          <li key={j}>
                            <Link
                              to={`/catalogs/${menu.name.toLowerCase()}/${sub.name.toLowerCase()}`}
                              onClick={onClose}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-[#1a5a8a] hover:bg-[#1a5a8a]/5 rounded-lg transition"
                            >
                              <span className="w-1 h-1 rounded-full bg-[#1a5a8a]/40 shrink-0" />
                              {toTitleCase(sub.name)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────── */
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading } = useSelector((s) => s.user);
  const { menus, menuLoading } = useSelector((s) => s.app);
  const { cart } = useSelector((s) => s.cart);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [mobileTrackIndex, setMobileTrackIndex] = useState(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useOutsideClick(profileRef, () => setIsProfileOpen(false));
  useOutsideClick(searchRef, () => setSearchOpen(false));

  /* body scroll lock for mobile drawer */
  useEffect(() => {
    if (!showMoreModal) {
      document.body.style.overflow = isMenuOpen ? "hidden" : "";
    }
    return () => { if (!showMoreModal) document.body.style.overflow = ""; };
  }, [isMenuOpen, showMoreModal]);

  /* fetch menus once */
  useEffect(() => {
    if (!menus || menus.length === 0) dispatch(fetchMenus());
  }, [dispatch, menus]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const res = await dispatch(logoutUser()).unwrap();
      toast.success(res?.message || "Logged out");
      setIsProfileOpen(false);
      closeMenu();
      navigate("/");
    } catch (err) {
      toast.error(err?.error || "Failed to logout");
    } finally {
      setLogoutLoading(false);
    }
  };

  /* Split menus into visible + overflow */
  const visibleMenus = menus.slice(0, VISIBLE_MENU_LIMIT);
  const hasMore = menus.length > VISIBLE_MENU_LIMIT;

  return (
    <>
      {/* ── Marquee keyframes ── */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        /* Desktop submenu hover */
        .nav-menu-item:hover .nav-submenu {
          opacity: 1;
          transform: translateY(0) scale(1);
          visibility: visible;
          pointer-events: auto;
        }
      `}</style>

      <header className="w-full fixed top-0 z-50 shadow-sm">

        {/* ── Announcement bar ── */}
        <div className="w-full bg-[#1a5a8a] text-white py-1.5 text-[10px] md:text-xs font-bold overflow-hidden border-b border-blue-700">
          <div className="marquee-track gap-16">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex gap-16 pr-16 whitespace-nowrap">
                <span>🌍 WELCOME TO MS STORE — EXPLORE WORLD BANKNOTES &amp; COINS.</span>
                <span>⚡ 100% AUTHENTIC ANCIENT TO MODERN COLLECTIONS.</span>
                <span>🚚 FREE SHIPPING ON ORDERS OVER ₹5,000.</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Main nav row ── */}
        <nav className="w-full flex justify-between items-center px-4 md:px-12 py-3 border-b border-gray-100 bg-white">

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-[#1a5a8a] p-1 rounded-lg hover:bg-gray-100 transition"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          {/* Logo */}
          <Link to="/" className="flex items-center h-10 w-28 md:w-32 overflow-hidden rounded shrink-0">
            <img src="/logo.jpg" alt="MS Store" />
          </Link>
          {/* Desktop navlinks */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-[#1a5a8a]">
            {navlinks.map((item, i) => (
              <li key={i}>
                <Link to={item.link} className="hover:text-blue-500 transition-colors capitalize">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop search */}
          <div className="hidden md:block w-1/4 max-w-xs">
            <SearchInput />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Orders (desktop) */}
            <Link
              to="/orders"
              className="hidden sm:inline-flex items-center text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition"
            >
              My Orders
            </Link>

            {/* Mobile search toggle */}
            <div ref={searchRef} className="relative md:hidden">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 text-[#1a5a8a] hover:bg-gray-100 rounded-full transition"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {isSearchOpen && (
                <div className="absolute top-12 right-0 bg-white p-3 shadow-xl rounded-2xl min-w-[280px] border border-gray-100 z-50
                  origin-top-right transition-all duration-200 scale-100 opacity-100">
                  <SearchInput autoFocus onSubmit={() => setSearchOpen(false)} />
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-[#1a5a8a] hover:bg-gray-100 rounded-full transition">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </Link>

            {/* Admin badge */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex border border-red-200 text-red-600 bg-red-50/50 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide hover:bg-red-50 transition"
              >
                Admin
              </Link>
            )}

            {/* Profile dropdown */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button onClick={() => setIsProfileOpen((v) => !v)} className="focus:outline-none rounded-full">
                  <Avatar user={user} size={9} />
                </button>

                <div
                  className={`absolute top-12 right-0 bg-white shadow-2xl rounded-2xl w-64 py-3 border border-gray-100 z-50
                    transition-all duration-200 origin-top-right
                    ${isProfileOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <div className="px-4 pb-3 mb-1 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-sm truncate">{user.email?.split("@")[0]}</p>
                    <p className="text-gray-400 text-xs truncate mt-0.5">{user.email}</p>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-xs font-medium text-gray-700 transition"
                  >
                    <span>My Orders</span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </Link>

                  <Link
                    to="/account"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-xs font-medium text-gray-700 transition"
                  >
                    <span>Account Settings</span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-red-50 text-xs font-medium text-red-600 transition"
                    >
                      <span>Admin Portal</span>
                      <ArrowRight size={14} className="text-red-400" />
                    </Link>
                  )}

                  <div className="px-4 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="w-full py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      {logoutLoading && <Loader2 size={13} className="animate-spin" />}
                      {logoutLoading ? "Logging out…" : "Log Out"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex px-4 py-2 text-xs font-semibold text-white bg-[#1a5a8a] hover:bg-[#154a72] rounded-xl shadow transition"
              >
                Log In
              </Link>
            )}
          </div>
        </nav>

        {/* ── Desktop category bar ── */}
        <div className="w-full bg-[#1a5a8a] text-white hidden md:block">
          {menuLoading ? (
            <div className="py-2.5 flex items-center justify-center gap-2 opacity-70">
              <Loader2 className="animate-spin h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase">Loading…</span>
            </div>
          ) : (
            <ul className="flex items-center gap-0.5 px-6 lg:px-12 py-0.5 flex-wrap">
              {/* "Menu" label */}
              

              {/* Visible menu items */}
              {visibleMenus.map((menu, i) => (
                <li key={i} className="nav-menu-item relative group">
                  <Link
                    to={`/catalogs/${menu.name.toLowerCase()}`}
                    className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium tracking-wide uppercase hover:bg-white/10 rounded transition-colors whitespace-nowrap"
                  >
                    {menu.name}
                    {/* Arrow icon only if submenu exists */}
                    {menu.submenus?.length > 0 && (
                      <ChevronDown
                        size={12}
                        className="opacity-70 group-hover:opacity-100 transition-transform duration-200 group-hover:rotate-180"
                      />
                    )}
                  </Link>

                  {/* Submenu dropdown */}
                  {menu.submenus?.length > 0 && (
                    <div
                      className="nav-submenu absolute top-full left-0 w-52 bg-white text-gray-800 shadow-2xl rounded-b-2xl
                        border-t-2 border-[#1a5a8a] opacity-0 scale-95 translate-y-1 invisible pointer-events-none
                        transition-all duration-200 origin-top-left z-50"
                    >
                      <ul className="py-2">
                        {menu.submenus.map((sub, j) => (
                          <li key={j}>
                            <Link
                              to={`/catalogs/${menu.name.toLowerCase()}/${sub.name.toLowerCase()}`}
                              className="flex items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-gray-50 hover:text-[#1a5a8a] transition group/sub"
                            >
                              <span>{toTitleCase(sub.name)}</span>
                              <ChevronRight
                                size={12}
                                className="text-gray-300 group-hover/sub:text-[#1a5a8a] transition-colors"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}

              {/* "More" button — only when menus > VISIBLE_MENU_LIMIT */}
              {hasMore && (
                <li className="ml-auto shrink-0">
                  <button
                    onClick={() => setShowMoreModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wider uppercase
                      bg-white/15 hover:bg-white/25 rounded-full transition-all duration-200 border border-white/20
                      hover:border-white/40 whitespace-nowrap"
                  >
                    <Grip size={13} />
                    More
                    <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      +{menus.length - VISIBLE_MENU_LIMIT}
                    </span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </header>

      {/* ──────────────── "More" Modal ──────────────── */}
      {showMoreModal && (
        <MoreModal menus={menus} onClose={() => setShowMoreModal(false)} />
      )}

      {/* ━━━━━━━━━━━━━ MOBILE DRAWER ━━━━━━━━━━━━━ */}

      {/* Backdrop */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300
          ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 h-screen w-4/5 max-w-sm z-[70] bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
          
          <button onClick={closeMenu} className="p-1.5 rounded-full hover:bg-gray-200 transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* User identity block */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-11 h-11 rounded-full object-cover border-2 border-[#1a5a8a]/20" />
            ) : (
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1a5a8a] text-white font-bold uppercase text-sm shrink-0">
                {user ? user.email?.charAt(0) : "G"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">
                {user ? user.email?.split("@")[0] : "Guest"}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email ?? "Sign in to your account"}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {user ? (
              <>
                <Link
                  to="/orders"
                  onClick={closeMenu}
                  className="flex-1 text-center py-2 text-xs font-semibold text-[#1a5a8a] border-2 border-[#1a5a8a]/30 rounded-xl hover:bg-[#1a5a8a]/5 transition"
                >
                  My Orders
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="flex-1 text-center py-2 text-xs font-semibold text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition"
                >
                  {logoutLoading && <Loader2 size={12} className="animate-spin" />}
                  {logoutLoading ? "Logging out…" : "Log Out"}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex-1 text-center py-2 text-xs font-semibold text-white bg-[#1a5a8a] rounded-xl hover:bg-[#154a72] transition"
              >
                Log In
              </Link>
            )}
          </div>
        </div>

        {/* Static navlinks */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-2 px-1">Quick Links</p>
          <div className="flex flex-wrap gap-2">
            {navlinks.map((item, i) => (
              <Link
                key={i}
                to={item.link}
                onClick={closeMenu}
                className="text-xs font-medium text-[#1a5a8a] bg-[#1a5a8a]/8 hover:bg-[#1a5a8a]/15 px-3 py-1.5 rounded-full capitalize transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Category menus (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-2 px-1">Categories</p>
          {menus.map((item, i) => {
            const isOpen = mobileTrackIndex === i;
            return (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                <div className="flex items-center justify-between bg-white hover:bg-gray-50 transition">
                  <Link
                    to={`/catalogs/${item.name.toLowerCase()}`}
                    onClick={closeMenu}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-[#1a5a8a] capitalize"
                  >
                    {toTitleCase(item.name)}
                  </Link>
                  {item.submenus?.length > 0 && (
                    <button
                      onClick={() => setMobileTrackIndex(isOpen ? null : i)}
                      className="px-4 py-3 text-gray-400 hover:text-[#1a5a8a] transition"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu accordion */}
                <div
                  className={`overflow-hidden transition-all duration-250 ease-out bg-gray-50/60
                    ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <ul className="px-3 py-2 space-y-0.5 border-t border-gray-100">
                    {item.submenus?.map((sm, j) => (
                      <li key={j}>
                        <Link
                          to={`/catalogs/${item.name.toLowerCase()}/${sm.name.toLowerCase()}`}
                          onClick={closeMenu}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-[#1a5a8a] hover:bg-white rounded-lg transition"
                        >
                          <span className="w-1 h-1 rounded-full bg-[#1a5a8a]/40 shrink-0" />
                          {toTitleCase(sm.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/60 flex justify-center gap-5">
          {[
            { to: "/about", label: "About" },
            { to: "/return-policy", label: "Returns" },
            { to: "/refund-policy", label: "Privacy" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={closeMenu} className="text-[10px] font-medium text-gray-400 hover:text-[#1a5a8a] transition">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;