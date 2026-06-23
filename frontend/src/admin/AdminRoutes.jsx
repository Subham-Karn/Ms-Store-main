import React, { lazy, Suspense } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { Loader2, LayoutDashboard, SearchX } from 'lucide-react';

import AdminLayout from './components/AdminLayout';

// Lazy loaded components
const AdminDashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Stocks = lazy(() => import('./pages/Stocks'));
const Orders = lazy(() => import('./pages/Orders'));
const AddCatalog = lazy(() => import('./components/AddCatalog'));
const EditCatalog = lazy(() => import('./components/EditCatalog'));

// ─── PREMIUM LOADING STATE ───
const AdminRouteLoader = () => (
  <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-5 animate-in fade-in duration-500">
    <div className="relative flex items-center justify-center w-16 h-16 bg-[#1a5a8a]/5 rounded-3xl border border-[#1a5a8a]/10 shadow-sm">
      {/* Outer pulsing ring */}
      <div className="absolute inset-0 rounded-3xl border border-[#1a5a8a]/20 animate-ping opacity-20" />
      <Loader2 className="animate-spin h-7 w-7 text-[#1a5a8a] stroke-[2.5]" />
    </div>
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm font-bold text-gray-800 tracking-wide">
        Initializing Workspace
      </span>
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a5a8a] animate-pulse" />
        Loading Modules...
      </span>
    </div>
  </div>
);

// ─── PREMIUM 404 STATE ───
const AdminNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in zoom-in-95 duration-300">
    <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
      <SearchX className="w-10 h-10 text-gray-300" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
      Vista Not Found
    </h1>
    <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
      The administrative module you are looking for does not exist, has been moved, or you lack the clearance to view it.
    </p>
    <Link 
      to="/admin" 
      className="px-6 py-3 bg-[#1a5a8a] text-white text-sm font-bold rounded-xl hover:bg-[#15486e] transition-all duration-300 shadow-lg shadow-[#1a5a8a]/20 hover:-translate-y-0.5 flex items-center gap-2 group"
    >
      <LayoutDashboard className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
      Return to Dashboard
    </Link>
  </div>
);

const AdminRoutes = () => {
  return (
    <Suspense fallback={<AdminRouteLoader />}>
      <Routes>
        {/* Parent Layout Route */}
        <Route path="/" element={<AdminLayout />}>
          
          {/* Standard Index Route */}
          <Route index element={<AdminDashboard />} />
          
          {/* Explicit Dashboard Route */}
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Resource Routes */}
          <Route path="users" element={<Users />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/add" element={<AddCatalog />} />
          <Route path="inventory/edit/:id" element={<EditCatalog />} />
          <Route path="stocks" element={<Stocks />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<Orders />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<AdminNotFound />} />
          
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;