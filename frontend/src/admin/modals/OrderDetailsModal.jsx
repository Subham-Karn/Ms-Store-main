import React from 'react';
import { X, MapPin, CreditCard, ShoppingBag, Download, Phone, Mail, FileImage } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose, generateInvoicePDF }) => {
    console.log(order);
    
  // Safe JSON parsing to prevent crashes on corrupted data
  let parsedCart = [];
  try {
    parsedCart = typeof order.cart === "string" ? JSON.parse(order.cart) : order.cart;
    if (!Array.isArray(parsedCart)) parsedCart = [parsedCart];
  } catch (error) {
    console.error("Failed to parse cart items:", error);
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40  flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col">
        
        {/* ── Close Button ── */}
        <button 
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Header ── */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Details</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Order ID:</span>
            <span className="text-xs font-mono font-bold text-[#1a5a8a] bg-[#1a5a8a]/5 px-2 py-0.5 rounded-md">
              {order.order_number || order.id}
            </span>
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          
          {/* Shipping Card */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col h-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin size={13} /> Shipping Address
            </h3>
            <div className="text-sm text-gray-600 flex-1">
              <p className="font-bold text-gray-900 text-base mb-1">{order.fullName}</p>
              <p className="leading-relaxed">{order.street}</p>
              {order.landmark && <p className="leading-relaxed">{order.landmark}</p>}
              <p className="leading-relaxed">{order.city}, {order.state} - {order.pincode}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-2">
              <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                <Phone size={12} className="text-gray-400" /> {order.phoneNumber}
              </p>
              <p className="text-xs font-medium text-gray-500 flex items-center gap-2 truncate">
                <Mail size={12} className="text-gray-400 flex-shrink-0" /> {order.email}
              </p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col h-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard size={13} /> Payment Info
            </h3>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Method</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Transaction ID</p>
                <p className="text-sm font-mono font-medium text-gray-700 break-all">{order.txn_id || "N/A"}</p>
              </div>
              
              {/* Attachment */}
              {order.payment_screenshot && typeof order.payment_screenshot === "string" && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                    <FileImage size={10} /> Attachment
                  </p>
                  <a href={order.payment_screenshot} target="_blank" rel="noreferrer" className="inline-block group">
                    <div className="relative overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={order.payment_screenshot}
                        alt="Payment Proof"
                        className="h-16 w-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Cart Contents ── */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 px-1">
            <ShoppingBag size={13} /> Itemized Cart ({parsedCart.length})
          </h3>
          <div className="space-y-2">
            {parsedCart.length > 0 ? (
              parsedCart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-3 hover:bg-gray-50/50 transition-colors">
                  <img
                    src={item.bunner || item.image || "/placeholder.png"}
                    alt={item.title}
                    className="h-16 w-16 object-cover rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">PID: {item.pid || item.id}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="font-bold text-[#1a5a8a] text-sm">
                        ₹{item.discountprice > 0 ? Number(item.discountprice).toLocaleString('en-IN') : Number(item.orignalprice).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[11px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-500">No item details available.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action Bar ── */}
        <div className="mt-8 pt-5 border-t border-gray-50 flex justify-end">
          <button
            onClick={() => generateInvoicePDF(order)}
            className="w-full sm:w-auto px-6 py-3 bg-[#1a5a8a]/5 text-[#1a5a8a] font-bold text-sm rounded-xl border border-[#1a5a8a]/20 hover:bg-[#1a5a8a] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            Download Invoice
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsModal;