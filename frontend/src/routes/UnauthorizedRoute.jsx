import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

const UnauthorizedRoute = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        
        {/* Guard Clearance Icon Header */}
        <div className="relative h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
          <ShieldAlert className="h-10 w-10" />
          <div className="absolute bottom-2 right-2 bg-white p-1 rounded-md border border-gray-200 shadow-sm">
            <Lock className="h-3 w-3 text-red-500" />
          </div>
        </div>

        {/* Error Typography */}
        <h1 className="text-7xl font-black text-[#1a5a8a] tracking-tighter select-none">
          403
        </h1>
        <h2 className="text-xl font-bold text-gray-900 mt-2 tracking-tight">
          Access Matrix Denied
        </h2>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-xs mx-auto">
          Your profile account credentials do not hold high enough administrative privilege clearance matrices to inspect this vista panel.
        </p>

        {/* Action Button Controls */}
        <div className="mt-8 pt-5 border-t border-gray-100">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to Public Marketplace
          </button>
        </div>

      </div>
    </div>
  );
};

export default UnauthorizedRoute;