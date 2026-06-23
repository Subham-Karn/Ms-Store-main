import React, { useState } from 'react';
import { X, Loader2, Package, CreditCard, Truck, Link as LinkIcon, FileText } from 'lucide-react';

const OrderEditModal = ({ order, onClose, isLoading, onSubmit }) => {
  const [formData, setFormData] = useState({
    paymentStatus: order.payment_status || "Verifying",
    status: order.status || "Order Placed",
    trackingNumber: order.trackingNumber || "",
    trackingURL: order.trackingURL || "",
    Note: order.Note || "",
  });

  const handleInputChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-lg border border-gray-100">
        
        {/* Close Button */}
        <button 
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Update Order
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 font-medium">Order ID:</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-mono text-xs font-bold tracking-wide">
              {order.order_number}
            </span>
          </div>
        </div>

        <form onSubmit={(e) => onSubmit(e, formData, order.id, order.user_id)} className="space-y-5">
          
          {/* ─── Status Row (Grid) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-50 pb-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Package size={13} /> Order Status
              </label>
              <select
                value={formData.status}
                onChange={handleInputChanges}
                name="status"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] text-sm text-gray-800 font-medium transition-all cursor-pointer"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CreditCard size={13} /> Payment
              </label>
              <select
                value={formData.paymentStatus}
                onChange={handleInputChanges}
                name="paymentStatus"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] text-sm text-gray-800 font-medium transition-all cursor-pointer"
              >
                <option value="Verifying">Verifying</option>
                <option value="Processing">Processing</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* ─── Tracking Info ─── */}
          <div className="space-y-4">
            <div>
              <label htmlFor="trackingNumber" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Truck size={13} /> Tracking Number
              </label>
              <input
                type="text"
                id="trackingNumber"
                onChange={handleInputChanges}
                value={formData.trackingNumber}
                name="trackingNumber"
                placeholder="e.g. AWB12345678"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] rounded-xl text-sm font-medium text-gray-800 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="trackingURL" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <LinkIcon size={13} /> Tracking URL
              </label>
              <input
                type="url"
                id="trackingURL"
                onChange={handleInputChanges}
                value={formData.trackingURL}
                name="trackingURL"
                placeholder="https://track.courier.com/..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] rounded-xl text-sm font-medium text-gray-800 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="note" className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <FileText size={13} /> Admin Note
              </label>
              <textarea
                id="note"
                onChange={handleInputChanges}
                value={formData.Note}
                rows="3"
                name="Note"
                placeholder="Private note for internal reference..."
                className="w-full p-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a] rounded-xl text-sm text-gray-800 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* ─── Actions ─── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-colors font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2
              ${isLoading ? "bg-[#1a5a8a]/60 cursor-not-allowed" : "bg-[#1a5a8a] hover:bg-[#15486e] shadow-md shadow-[#1a5a8a]/20 hover:-translate-y-0.5"}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEditModal;