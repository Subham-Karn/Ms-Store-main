import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, HelpCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        
        {/* Animated Icon Header */}
        <div className="relative h-20 w-20 mx-auto mb-6 flex items-center justify-center text-orange-600">
          <HelpCircle className="h-10 w-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </div>

        {/* Error Typography */}
        <h1 className="text-7xl font-black text-[#1a5a8a] tracking-tighter select-none">
          404
        </h1>
        <h2 className="text-xl font-bold text-gray-900 mt-2 tracking-tight">
          Historical Page Missing
        </h2>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-xs mx-auto">
          The requested catalog index link or interface segment does not exist or has been archived permanently.
        </p>

        {/* Action Button Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#1a5a8a] hover:bg-[#15466b] rounded-xl shadow-lg shadow-blue-700/10 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home size={14} />
            Return Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;