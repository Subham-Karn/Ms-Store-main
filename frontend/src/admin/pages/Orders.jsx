import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Eye, X, Pencil, ShoppingBag } from "lucide-react";

import { formatDate } from "../../util/formateDate";
import { generateInvoicePDF } from "../../lib/CreateInvoice";
import { updateOrderStatus } from "../../services/ordersServices";
// Import your Redux thunk
import { fetchAllOrdersAdmin } from "../../store/slices/orderSlice";
import OrderEditModal from "../modals/OrderEditModal";
import OrderDetailsModal from "../modals/OrderDetailsModal";

const Orders = () => {
  const dispatch = useDispatch();
  const { orderId } = useParams();

  // --- Redux State ---
  const { orders, isLoading: isOrdersLoading } = useSelector((state) => state.orders);
  
  // Always keep a safe array reference
  const orderList = useMemo(() => Array.isArray(orders) ? orders : [], [orders]);

  // --- Local UI State ---
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // --- Modals State ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all orders on mount
  useEffect(() => {
    // Passing true as per your admin payload requirement
    dispatch(fetchAllOrdersAdmin(true));
  }, [dispatch]);

  // Compute filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orderList];

    // If route has an explicit orderId, show only that order
    if (orderId) {
      const found = orderList.find((o) => o.id === orderId);
      return found ? [found] : [];
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(term) ||
          o.fullName?.toLowerCase().includes(term)
      );
    }

    if (filter !== "All") {
      result = result.filter((o) => o.status === filter);
    }

    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [search, filter, orderList, orderId]);

  // Update Status Handler
  const handleUpdate = async (e, data, orderTargetId, userId) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await updateOrderStatus(data, orderTargetId, userId);

      if (!res?.success) throw new Error(res.error || res.message);

      toast.success(res.message || "Order updated successfully");
      
      // Refresh the global Redux state to sync changes across the app
      dispatch(fetchAllOrdersAdmin(true));
      
      setEditingOrder(null);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  // Badge Color Generators
  const getOrderStatusColor = (status) => {
    switch (status) {
      case "Pending":
      case "Order Placed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shipped":
        return "bg-[#1a5a8a]/10 text-[#1a5a8a] border-[#1a5a8a]/20";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Verifying":
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen  flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingBag className="text-[#1a5a8a] h-7 w-7" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Order Management
        </h2>
      </div>

      {/* Filters Area */}
      {!orderId && (
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex flex-col w-full sm:w-1/2">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Search Orders (ID or Name)
              </label>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5a8a] focus:outline-none transition-shadow text-sm"
                  type="text"
                  placeholder="e.g., ORD-1234 or John Doe"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full sm:w-1/2">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a5a8a] text-sm cursor-pointer"
              >
                <option value="All">All Orders</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isOrdersLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-[#1a5a8a] animate-spin" />
          <p className="text-gray-500 font-medium">Loading Orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-[#1a5a8a] text-white">
                <tr>
                  <th className="py-4 px-4 text-left font-semibold rounded-tl-xl">Order ID</th>
                  <th className="py-4 px-4 text-left font-semibold">Customer</th>
                  <th className="py-4 px-4 text-left font-semibold">Total</th>
                  <th className="py-4 px-4 text-left font-semibold">Date</th>
                  <th className="py-4 px-4 text-left font-semibold">Payment</th>
                  <th className="py-4 px-4 text-left font-semibold">Status</th>
                  <th className="py-4 px-4 text-center font-semibold rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {order.fullName}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#1a5a8a]">
                      ₹{order.total}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${getOrderPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-[#1a5a8a]">{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Customer</p>
                    <p className="font-medium text-gray-800 truncate">{order.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Amount</p>
                    <p className="font-bold text-[#1a5a8a]">₹{order.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Payment</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getOrderPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Eye className="h-4 w-4" /> View Details
                  </button>
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="flex-1 py-2 flex items-center justify-center gap-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-dashed border-gray-300">
          <ShoppingBag className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          generateInvoicePDF={generateInvoicePDF}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Edit Modal */}
      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          isLoading={isUpdating}
          onSubmit={handleUpdate}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;

/* --------------------- DETAILS MODAL --------------------- */
// const OrderDetailsModal = ({ order, onClose }) => {
//   // Safe JSON parsing to prevent crashes on corrupted data
//   let parsedCart = [];
//   try {
//     parsedCart = typeof order.cart === "string" ? JSON.parse(order.cart) : order.cart;
//     if (!Array.isArray(parsedCart)) parsedCart = [parsedCart];
//   } catch (error) {
//     console.error("Failed to parse cart items:", error);
//   }

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
//       <div className="relative bg-white p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
//         <button 
//           className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
//           onClick={onClose}
//         >
//           <X className="h-5 w-5 text-gray-500" />
//         </button>

//         <h2 className="text-xl sm:text-2xl font-bold mb-5 text-[#1a5a8a] border-b pb-3">Order Abstract</h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//           {/* Shipping */}
//           <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
//             <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
//               Shipping Address
//             </h3>
//             <div className="text-sm text-gray-600 space-y-1">
//               <p className="font-semibold text-gray-800">{order.fullName}</p>
//               <p>{order.street}, {order.landmark}</p>
//               <p>{order.city}, {order.state} - {order.pincode}</p>
//               <p className="pt-2 border-t border-gray-200 mt-2">📞 {order.phoneNumber}</p>
//               <p>✉️ {order.email}</p>
//             </div>
//           </div>

//           {/* Payment */}
//           <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
//             <h3 className="font-bold text-gray-800 mb-2">Payment Info</h3>
//             <div className="text-sm text-gray-600 space-y-2">
//               <p><span className="font-medium text-gray-500">Method:</span> {order.payment_method}</p>
//               <p className="truncate"><span className="font-medium text-gray-500">Txn ID:</span> {order.txn_id || "N/A"}</p>
//               {order.payment_screenshot && (
//                 <div className="mt-3">
//                   <p className="font-medium text-gray-500 mb-1 text-xs">Attachment</p>
//                   <a href={order.payment_screenshot} target="_blank" rel="noreferrer">
//                     <img
//                       src={order.payment_screenshot}
//                       alt="Payment Proof"
//                       className="w-24 h-auto rounded border border-gray-300 hover:opacity-80 transition cursor-pointer shadow-sm"
//                     />
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Cart Contents */}
//         <h3 className="font-bold text-gray-800 mb-3">Itemized Cart</h3>
//         <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
//           {parsedCart.length > 0 ? (
//             parsedCart.map((cart, idx) => (
//               <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
//                 <img
//                   src={cart.bunner || "/placeholder.png"}
//                   alt={cart.title}
//                   className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md border border-gray-100"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{cart.title}</h4>
//                   <p className="text-xs text-gray-500 truncate mt-0.5">PID: {cart.pid}</p>
//                   <div className="flex items-center justify-between mt-2">
//                     <p className="font-bold text-[#1a5a8a]">
//                       ₹{cart.discountprice > 0 ? cart.discountprice : cart.orignalprice}
//                     </p>
//                     <p className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">Qty: {cart.quantity || 1}</p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-gray-500 text-center py-4">Failed to load item specifics.</p>
//           )}
//         </div>

//         {/* Action Bar */}
//         <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
//           <button
//             onClick={() => generateInvoicePDF(order)}
//             className="px-5 py-2.5 border-2 border-[#1a5a8a] text-[#1a5a8a] font-semibold rounded-lg hover:bg-[#1a5a8a] hover:text-white transition-colors w-full sm:w-auto"
//           >
//             Download Invoice PDF
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

/* --------------------- EDIT MODAL --------------------- */
// const OrderEditModal = ({ order, onClose, isLoading, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     paymentStatus: order.payment_status || "Verifying",
//     status: order.status || "Order Placed",
//     trackingNumber: order.trackingNumber || "",
//     trackingURL: order.trackingURL || "",
//     Note: order.Note || "",
//   });

//   const handleInputChanges = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
//       <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
//         <button 
//           className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
//           onClick={onClose}
//         >
//           <X className="h-5 w-5 text-gray-500" />
//         </button>

//         <h2 className="text-xl font-bold mb-1 text-gray-800">Update Order</h2>
//         <p className="text-xs text-gray-500 mb-5 font-mono border-b pb-3">ID: {order.order_number}</p>

//         <form onSubmit={(e) => onSubmit(e, formData, order.id, order.user_id)} className="space-y-4">
//           <div>
//             <label className="text-sm font-semibold text-gray-700">Order Status</label>
//             <select
//               value={formData.status}
//               onChange={handleInputChanges}
//               name="status"
//               className="w-full p-2.5 border border-gray-300 rounded-lg mt-1.5 outline-none focus:ring-2 focus:ring-[#1a5a8a] text-sm cursor-pointer"
//             >
//               <option value="Order Placed">Order Placed</option>
//               <option value="Pending">Pending</option>
//               <option value="Processing">Processing</option>
//               <option value="Shipped">Shipped</option>
//               <option value="Delivered">Delivered</option>
//               <option value="Cancelled">Cancelled</option>
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-gray-700">Payment Status</label>
//             <select
//               value={formData.paymentStatus}
//               onChange={handleInputChanges}
//               name="paymentStatus"
//               className="w-full p-2.5 border border-gray-300 rounded-lg mt-1.5 outline-none focus:ring-2 focus:ring-[#1a5a8a] text-sm cursor-pointer"
//             >
//               <option value="Verifying">Verifying</option>
//               <option value="Processing">Processing</option>
//               <option value="Paid">Paid</option>
//               <option value="Failed">Failed</option>
//             </select>
//           </div>

//           <div>
//             <label htmlFor="trackingNumber" className="text-sm font-semibold text-gray-700">Tracking Number</label>
//             <input
//               type="text"
//               id="trackingNumber"
//               onChange={handleInputChanges}
//               value={formData.trackingNumber}
//               name="trackingNumber"
//               placeholder="e.g. AWB12345678"
//               className="w-full p-2.5 border outline-none border-gray-300 focus:ring-2 focus:ring-[#1a5a8a] rounded-lg mt-1.5 text-sm"
//             />
//           </div>

//           <div>
//             <label htmlFor="trackingURL" className="text-sm font-semibold text-gray-700">Tracking URL</label>
//             <input
//               type="url"
//               id="trackingURL"
//               onChange={handleInputChanges}
//               value={formData.trackingURL}
//               name="trackingURL"
//               placeholder="https://track.courier.com/..."
//               className="w-full p-2.5 border outline-none border-gray-300 focus:ring-2 focus:ring-[#1a5a8a] rounded-lg mt-1.5 text-sm"
//             />
//           </div>

//           <div>
//             <label htmlFor="note" className="text-sm font-semibold text-gray-700">Admin Note</label>
//             <textarea
//               id="note"
//               onChange={handleInputChanges}
//               value={formData.Note}
//               rows="3"
//               name="Note"
//               placeholder="Private note for the order..."
//               className="w-full p-2.5 border outline-none border-gray-300 focus:ring-2 focus:ring-[#1a5a8a] rounded-lg mt-1.5 text-sm resize-none"
//             />
//           </div>

//           <div className="flex justify-end gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isLoading}
//               className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition flex items-center justify-center gap-2
//               ${isLoading ? "bg-[#1a5a8a]/70 cursor-not-allowed" : "bg-[#1a5a8a] hover:bg-[#15486e] shadow-md"}`}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="animate-spin h-4 w-4" />
//                   Saving...
//                 </>
//               ) : (
//                 "Update Order"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };