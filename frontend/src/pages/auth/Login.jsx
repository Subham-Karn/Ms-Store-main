import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import {useSelector , useDispatch} from "react-redux"
import { googleOAuth, loginUser } from "../../store/slices/userSlice.js";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const {user , isLoading} = useSelector(state =>state.user);
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(()=>{
    if(user){
       navigate("/")
    }
  },[user])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all security fields");
    }
    try {
      setIsSubmitting(true);
      const res = await dispatch(loginUser(formData)).unwrap();
      toast.success(res.data?.message || "Welcome Back")
      navigate("/")
    } catch (err) {
      toast.error(err.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
     try {
       const response = await dispatch(googleOAuth()).unwrap();
       toast.success(response.data?.message || "Welcome Back")
       navigate("/")
     } catch (error) {
       toast.error(error.error);
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md  p-8 ">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-gray-500 mt-2">Access your rare currency premium catalog dashboard</p>
        </div>

        {/* Input Form Wrapper */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a5a8a] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Account Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a5a8a] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1a5a8a] hover:bg-[#15466b] disabled:opacity-50 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-700/10"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign In to Account"}
          </button>
        </form>

        {/* Divider UI */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 uppercase tracking-widest font-medium">
            Or
          </span>
        </div>

        {/* Google Authentication */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className={`w-full  font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm ${isLoading ? "opacity-35 " : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.423 1.487 15.619 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.77 0-.795-.085-1.4-.195-1.945H12.24z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-center text-gray-500 mt-6">
          Don't have a collector profile?{" "}
          <Link to="/signup" className="text-[#1a5a8a] hover:underline font-bold">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;