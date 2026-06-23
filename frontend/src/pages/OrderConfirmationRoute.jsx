import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RootLayout from "../util/RootLayout";
import {
  MapPin, Phone, Mail, CreditCard,
  Package2, Copy, XCircle, FileText, Check,
} from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { generateInvoicePDF } from "../lib/CreateInvoice";

const OrderConfirmationPage = () => {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();
  const { order }    = location.state || {};
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    document.title = "Order Confirmation | Ms Store";
  }, []);

  // ── Guard: missing or mismatched order ───────────────────────────────────
  if (!order || order?.id !== id) {
    return (
      <RootLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
          <XCircle className="h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-semibold text-[#1a5a8a]">No Order Found</h2>
          <p className="text-gray-500 mb-4 text-sm">
            This order doesn't exist or the link may have expired.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-[#1a5a8a] text-white rounded-lg hover:bg-[#14476a] transition"
          >
            Go to Homepage
          </button>
        </div>
      </RootLayout>
    );
  }

  // ── Parse cart ────────────────────────────────────────────────────────────
  // ✅ FIX: API returns cart as Array, not a JSON string — no JSON.parse needed
  const cart = Array.isArray(order.cart)
    ? order.cart
    : (() => { try { return JSON.parse(order.cart); } catch { return []; } })();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const RUPEE = "₹";

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ✅ FIX: getPaymentStatusColor was returning a string used inside template literal
  // `text-${fn()}` doesn't work with Tailwind (purge). Use full class map instead.
  const paymentStatusClass = (status = "") => {
    switch (status.toLowerCase()) {
      case "paid":       return "bg-green-100 text-green-700";
      case "confirmed":  return "bg-blue-100  text-blue-700";
      case "failed":     return "bg-red-100   text-red-700";
      default:           return "bg-amber-100 text-amber-700"; // Verifying
    }
  };

  const paymentLabel =
    order.payment_method === "bank" ? "Bank Transfer" : "QR Payment";

  // ✅ FIX: address fields are flat on order object (not nested under order.address)
  const addr = {
    fullName:    order.fullName,
    street:      order.street,
    landmark:    order.landmark,
    city:        order.city,
    state:       order.state,
    pincode:     order.pincode,
    phoneNumber: order.phoneNumber,
    email:       order.email,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <RootLayout>
      <div className="min-h-screen mt-20 md:mt-28 bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Success Banner ── */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
            <FaCheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a5a8a] mb-1">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-500 text-sm">
              Your order has been received and is being processed.
            </p>

            {/* Order number + copy */}
            <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 border border-gray-200
                            rounded-lg px-4 py-2 text-sm">
              <span className="text-gray-500">Order:</span>
              <span className="font-mono font-semibold text-gray-800">
                {order.order_number}
              </span>
              <button
                onClick={() => handleCopy(order.order_number)}
                className="ml-1 text-gray-400 hover:text-[#1a5a8a] transition-colors"
                aria-label="Copy order number"
              >
                {isCopied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
              </button>
              {isCopied && (
                <span className="text-xs text-green-600 font-medium">Copied!</span>
              )}
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Items + Actions */}
            <div className="lg:col-span-2 space-y-4">

              {/* Cart items */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#1a5a8a] mb-4">
                  <Package2 size={18} /> Order Summary
                </h2>

                <ul className="divide-y divide-gray-100">
                  {cart.map((item) => {
                    // ✅ FIX: discountprice could be 0 (falsy) — use explicit null check
                    const price = item.discountprice > 0 ? item.discountprice : item.orignalprice;
                    return (
                      <li key={item.pid}
                          className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                        <img
                          src={item.bunner}
                          alt={item.title}
                          className="h-16 w-16 object-contain rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm leading-snug truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty {item.quantity} × {RUPEE}{price}
                          </p>
                          {item.discountprice > 0 && (
                            <p className="text-xs text-gray-400 line-through">
                              {RUPEE}{item.orignalprice}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-[#1a5a8a] text-sm flex-shrink-0">
                          {RUPEE}{price * item.quantity}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    {/* ✅ FIX: order has no `subtotal` key — compute from cart */}
                    <span>{RUPEE}{cart.reduce((s, i) => s + (i.discountprice > 0 ? i.discountprice : i.orignalprice) * i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {order.shipping_charge
                        ? `${RUPEE}${order.shipping_charge}`
                        : <span className="text-green-600 font-medium">Free</span>}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-[#1a5a8a] pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>{RUPEE}{order.total}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row
                              items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Placed on{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => generateInvoicePDF(order)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5
                               border border-[#1a5a8a] text-[#1a5a8a] rounded-lg text-sm font-medium
                               hover:bg-[#1a5a8a] hover:text-white transition-colors"
                  >
                    <FileText size={16} /> Invoice
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1a5a8a] text-white rounded-lg
                               text-sm font-medium hover:bg-[#14476a] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Shipping + Payment */}
            <div className="space-y-4">

              {/* Shipping */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#1a5a8a] mb-3">
                  <MapPin size={16} /> Shipping Address
                </h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">{addr.fullName}</p>
                  <p className="text-gray-500">
                    {addr.street}
                    {addr.landmark ? `, ${addr.landmark}` : ""}
                  </p>
                  <p className="text-gray-500">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <div className="pt-2 space-y-1">
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone size={13} className="text-[#1a5a8a]" /> {addr.phoneNumber}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={13} className="text-[#1a5a8a]" /> {addr.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#1a5a8a] mb-3">
                  <CreditCard size={16} /> Payment Details
                </h2>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium">{paymentLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID</span>
                    {/* ✅ FIX: API key is txn_id not txnId */}
                    <span className="font-mono text-xs font-medium break-all text-right max-w-[120px]">
                      {order.txn_id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    {/* ✅ FIX: full Tailwind class — not dynamic template literal */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentStatusClass(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>

                  {/* ✅ FIX: payment_screenshot may be an empty object {} from API — guard with check */}
                  {order.payment_screenshot &&
                   typeof order.payment_screenshot === "string" &&
                   order.payment_screenshot.startsWith("http") && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1.5">Screenshot</p>
                      <img
                        src={order.payment_screenshot}
                        alt="Payment screenshot"
                        className="h-28 w-28 object-contain rounded-lg border border-gray-200
                                   hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default OrderConfirmationPage;