import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios/api.js"; // Tailored path to look accurately into your client axis services
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Please provide your registered email address");
    }

    try {
      setIsSubmitting(true);
      const res = await api.post("/auth/forgot-password", { email });

      if (res?.success) {
        toast.success("Recovery instructions dispatched successfully!");
        setIsEmailSent(true);
      } else {
        toast.error(res?.message || "Could not identify an account with this email");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password recovery request link down");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
        
        {/* Back navigation command header */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-3 w-3 transform group-hover:-translate-x-0.5 transition-transform" />
          Back to Sign In
        </Link>

        {!isEmailSent ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recover Password</h2>
              <p className="text-xs text-gray-500 mt-2">
                Provide your account email to dispatch verification credentials reset tokens
              </p>
            </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
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
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Reset Instructions"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="h-12 w-12 bg-blue-50 text-[#1a5a8a] border border-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Check your inbox</h3>
            <p className="text-sm text-gray-500 mt-2 px-2 max-w-xs mx-auto">
              We have dispatched a secure link to <span className="text-gray-900 font-medium break-all">{email}</span>. Click it to update your password profile security layers.
            </p>
            <button
              onClick={() => setIsEmailSent(false)}
              className="mt-6 text-xs text-[#1a5a8a] hover:underline font-semibold uppercase tracking-wider"
            >
              Resend verification email
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;