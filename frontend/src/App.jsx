import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Import Route Layout Wrappers
import UnauthorizedRoute from './routes/UnauthorizedRoute';
import AdminRoutes from './admin/AdminRoutes';
import NotFound from './routes/NotFoundRoute';
import ProtectedRoutes from './routes/ProtectedRoutes';

// Import Pages & Features
import HomeRoute from './pages/HomeRoute';
import ProdutsviewRoute from './pages/ProdutsviewRoute';
import SearchResults from './pages/SearchResultRoute';
import CatalogPage from './pages/CatalogsRoute';
import CartPage from './pages/CartPageRoute';
import CategoriesRoute from './pages/CategoriesRoute';
import CheckoutPage from './pages/CheckoutRoute';
import OrderConfirmation from './pages/OrderConfirmationRoute';
import MyOrdersPage from './pages/OrdersRoute';
import AboutUsRoute from './pages/AboutUsRoute';
import ReturnRoute from './pages/ReturnRoute';

// Assets & State Utilities
import { app } from './assets/assets';
import Login from './pages/auth/Login';
import Signup from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/Forgetpassword';
import { useState } from 'react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/slices/userSlice';
import Account from './pages/auth/account';

const App = () => {
const [isAuthLoaded, setAuthLoaded] = useState(false);
  const { user } = useSelector((state) => state.user);
  
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const initAuth = useCallback(async () => {
    try {
      setAuthLoaded(true);
      await dispatch(fetchUser()).unwrap(); 
    } catch (error) {
      toast.error(error?.error || "Failed to load session");
    } finally {
      setAuthLoaded(false); 
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user && token) {
      initAuth();
    }
  }, [initAuth, user, token]);
  
  if (user && isAuthLoaded) {
    return (
      <div className="fixed inset-0 bg-[#1a5a8a] flex flex-col items-center justify-center gap-3z-50">
        <div className="h-20 w-20 bg-white rounded shadow-lg overflow-hidden animate-pulse">
          <img className="h-full w-full object-cover" src={"/logo.jpg"} alt="Ms Store Logo" />
        </div>
        <div className="text-white flex flex-col items-center gap-2 mt-1">
          <Loader2 className="animate-spin h-6 w-6 stroke-[2.5]" />
          <h2 className="text-xs uppercase tracking-widest opacity-80">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Notifications Layout Injection Viewport */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#1a5a8a',
            fontWeight: '500',
            fontSize: '14px',
          },
        }}
      />

      <Routes>
        {/* Public Utility Routes */}
        <Route path="/" element={<HomeRoute />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/account' element={<Account/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/forget-password' element={<ForgotPassword/>}/>
        <Route path="/catalogs" element={<CatalogPage />} />
        <Route path="/about" element={<AboutUsRoute />} />
        <Route path="/return-policy" element={<ReturnRoute />} />
        <Route path="/refund-policy" element={<ReturnRoute />} />
        <Route path="/contact" element={<HomeRoute />} />
        <Route path="/search" element={<SearchResults />} />

        {/* E-Commerce Product Catalog Navigation Matrices */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/catalog/:id" element={<ProdutsviewRoute />} />
        <Route path="/catalogs/:category" element={<CategoriesRoute />} />
        <Route path="/catalogs/:category/:subcategory" element={<CategoriesRoute />} />

        {/* Secured Order Fulfillment Checkpoints */}
        <Route path="/checkout" element={
          <CheckoutPage />
        } />
        <Route path="/orders" element={
          <MyOrdersPage />
        } />
        <Route path="/orders/:id" element={
          <OrderConfirmation />
        } />

        {/* Operational Security Escalation Handlers */}
        <Route path="/unauthorized" element={<UnauthorizedRoute />} />
        <Route path="*" element={<NotFound />} />

        {/* Privilege Scaled Administrative Panels */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoutes allowedRoles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoutes>
          } 
        />
      </Routes>
    </>
  );
};

export default App;