import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Truck,
  CreditCard,
  QrCode,
  Upload,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import RootLayout from "../util/RootLayout";
import { app } from "../assets/assets";
import { createNewOrder } from "../store/slices/orderSlice";   
import { clearCart } from "../store/slices/cartSlice";          
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { isLoading: isLoadingOrder } = useSelector((state) => state.orders);

 
  const { cartItems, user } = location.state;
  const defaultAddress = cartItems?.defaultAddress || null;   
  const cart           = cartItems?.cart           || [];    
  const subtotal       = cartItems?.subtotal       || 0;
  const shippingCharge = cartItems?.shippingCharge || 0;
  const total          = cartItems?.total          || 0;
  
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [txnId,         setTxnId]         = useState("");
  const [screenshot,    setScreenshot]    = useState(null);
  const [preview,       setPreview]       = useState(null);
  const [copiedField,   setCopiedField]   = useState(null);
  const [qrProvider,    setQrProvider]    = useState("gpay");

  const [addressFormData, setAddressFormData] = useState({
    fullName:    "",
    phoneNumber: "+91",
    email:       "",
    street:      "",
    landmark:    "",
    city:        "",
    state:       "",
    pincode:     "",
  });

  useEffect(() => {
    document.title = "Ms Store | Checkout";
  }, []);
  if (!cartItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <h2 className="text-2xl font-semibold text-[#1a5a8a]">Checkout</h2>
        <p className="text-gray-500">Cart is empty or session expired.</p>
        <button
          onClick={() => navigate("/cart")}
          className="bg-[#1a5a8a] text-white px-5 py-2 rounded-md hover:bg-[#14476a] transition"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

const handlePlaceOrder = async (e) => {
    e?.preventDefault?.();
    
    // 1. Address Validation
    let finalAddress;

    if (!user) {
      // Guest User Validation
      const { fullName, email, phoneNumber, street, city, state, pincode } = addressFormData;
      if (!fullName || !email || !phoneNumber || !street || !city || !state || !pincode) {
        toast.error("Please fill all required address fields.");
        return;
      }
      finalAddress = addressFormData;
    } else {
      if (!defaultAddress) {
        toast.error("Please add a shipping address to your profile first.");
        return;
      }
      finalAddress = defaultAddress;
    }

    // Payment Validation
    if (!txnId.trim()) {
      toast.error("Please enter the Transaction ID.");
      return;
    }
    if (!screenshot) {
      toast.error("Please upload a payment screenshot.");
      return;
    }
   
    // 2. Build FormData
    const formData = new FormData();
    formData.append("status", "Order Placed");
    formData.append("paymentMethod", paymentMethod);
    formData.append("txn_id", txnId); 
    formData.append("paymentStatus", "Verifying");
    formData.append("total", total || 0);
    formData.append("subtotal", subtotal || 0);
    formData.append("shippingCharge", shippingCharge || 0);
    formData.append("user_id", user?.id || "Anonymous User");
    
    // Safely stringify the validated data
    formData.append("address", JSON.stringify(finalAddress));
    formData.append("cart", JSON.stringify(cart || [])); 
    
    formData.append("payment_screenshot", screenshot);
    
    try {
      const resultAction = await dispatch(createNewOrder(formData));

      if (createNewOrder.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Order failed");
      }

      const order = resultAction.payload;

      toast.success("Order placed successfully!");
      dispatch(clearCart());

      navigate(`/orders/${order?.id || order?.order_number}`, {
        state: { order },
      });
    } catch (err) {
      toast.error(err.message || "Failed to place order. Please try again.");
    }
};
  // ── Sub-component: Payment Details ────────────────────────────────────────
  const PaymentDetails = () => (
    <div className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
      <h3 className="font-semibold text-lg flex items-center text-[#1a5a8a] mb-3">
        <CreditCard className="mr-2" size={20} /> Payment Options
      </h3>

      {/* Payment type toggle */}
      <div className="flex gap-3 mb-4">
        {[
          { key: "bank", label: "Bank Transfer" },
          { key: "qr",   label: "Pay via QR"    },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPaymentMethod(key)}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition
              ${paymentMethod === key
                ? "bg-[#1a5a8a] text-white border-[#1a5a8a]"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bank Transfer */}
      {paymentMethod === "bank" ? (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mb-4 space-y-1.5">
          <p className="text-base font-bold text-gray-700 mb-2">Punjab National Bank</p>
          {[
            { label: "Account Holder", value: "Subham Sharma",          key: "holder"  },
            { label: "Account Number", value: "0696101700019167",        key: "account" },
            { label: "IFSC Code",      value: "PUNB0069610",             key: "ifsc"    },
            { label: "Branch",         value: "Kishanganj, Bihar 855107", key: "branch"  },
          ].map((f) => (
            <div key={f.key} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium w-36 flex-shrink-0">{f.label}:</span>
              <span className="flex items-center gap-1.5">
                {f.value}
                <button onClick={() => handleCopy(f.value, f.key)} aria-label={`Copy ${f.label}`}>
                  {copiedField === f.key
                    ? <Check size={15} className="text-green-500" />
                    : <Copy   size={15} className="text-gray-400 hover:text-gray-600 cursor-pointer" />}
                </button>
              </span>
            </div>
          ))}
          <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-xs rounded-r-md">
            Transfer the exact amount and paste the Transaction ID below with a screenshot.
          </div>
        </div>
      ) : (
        /* QR */
        <div className="flex flex-col items-center mb-4">
          <div className="flex gap-2 mb-3">
            {[
              { key: "gpay",    label: "Google Pay" },
              { key: "phonepe", label: "PhonePe"    },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setQrProvider(key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition
                  ${qrProvider === key
                    ? "bg-[#1a5a8a] text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col items-center gap-2">
            <img
              src={qrProvider === "gpay" ? app.gpayQR : app.phonepayQR}
              alt={`${qrProvider} QR`}
              className="h-40 w-40 object-contain bg-white p-2 rounded-md ring-2 ring-[#1a5a8a]"
            />
            <p className="text-sm text-gray-600">
              Pay to:{" "}
              <strong className="text-gray-800">
                {qrProvider === "gpay" ? "sharmonu371-2@okaxis" : "sharmonu371@okaxis"}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Transaction ID */}
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          placeholder="Enter transaction / reference ID"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                     outline-none focus:ring-1 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] transition"
        />
      </div>

      {/* Screenshot Upload */}
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Payment Screenshot <span className="text-red-500">*</span>
        </label>
        {!preview ? (
          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border
                            border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-sm transition">
            <Upload size={16} /> Choose File
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={preview}
              alt="Payment screenshot"
              className="h-28 w-28 object-contain bg-gray-100 rounded-md ring-2 ring-[#1a5a8a]"
            />
            <button
              onClick={() => { setPreview(null); setScreenshot(null); }}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Place Order — shown only for logged-in users here; guests use the form submit */}
      {user && (
        <button
          onClick={handlePlaceOrder}
          disabled={isLoadingOrder}
          className="mt-5 w-full bg-[#1a5a8a] text-white py-2.5 rounded-md text-sm font-semibold
                     hover:bg-[#14476a] active:scale-[0.98] transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoadingOrder ? "Placing Order…" : "Place Order"}
        </button>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 p-4 mt-20 sm:mt-35">

        {/* Full-screen loading overlay */}
        {isLoadingOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="p-6 bg-[#1a5a8a] text-white rounded-xl shadow-xl text-center">
              <Loader2 className="animate-spin mb-3 mx-auto" size={36} />
              <h2 className="text-lg font-semibold">Placing Your Order…</h2>
              <p className="text-xs text-blue-200 mt-1">
                Sit back — we're securing your order.
              </p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">

          {/* ── Left column ── */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">

            {/* Address block */}
            {!user  ? (
              /* Guest: manual address form */
              <form
                onSubmit={handlePlaceOrder}
                className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
              >
                <h3 className="font-semibold text-lg flex items-center text-[#1a5a8a] mb-3">
                  <Truck className="mr-2" size={20} /> Shipping Address
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(addressFormData).map(([key, value]) => (
                    <div key={key} className={`flex flex-col gap-1 ${key === "street" || key === "landmark" ? "col-span-2" : ""}`}>
                      <label htmlFor={key} className="text-xs font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        id={key}
                        name={key}
                        type="text"
                        value={value}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md
                        focus:ring-1 focus:ring-[#1a5a8a] focus:border-[#1a5a8a] outline-none transition"
                      />
                    </div>
                  ))}
                  {/* ─── ADD THIS SUBMIT BUTTON ─── */}
                <button
                  type="submit"
                  className="mt-5 w-full py-3 bg-[#1a5a8a] text-white rounded-lg font-bold hover:bg-[#154d76] transition-colors"
                >
                  Place Order as Guest
                </button>
                </div>
                {/* Guest place-order button is in the form so Enter / submit works */}
              </form>
            ) : (
              /* Logged-in: show default address */
              <div className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                <h3 className="font-semibold text-lg flex items-center text-[#1a5a8a] mb-2">
                  <Truck className="mr-2" size={20} /> Shipping Address
                </h3>
                {defaultAddress ? (
                  <div className="text-sm text-gray-700 space-y-1 mt-1">
                    <p className="font-semibold text-base text-gray-900">{defaultAddress.fullName}</p>
                    <p>
                      {defaultAddress.street}
                      {defaultAddress.landmark ? `, ${defaultAddress.landmark}` : ""},&nbsp;
                      {defaultAddress.city}, {defaultAddress.state} — {defaultAddress.pincode}
                    </p>
                    <p className="text-gray-500">
                      {defaultAddress.phoneNumber} &nbsp;·&nbsp; {defaultAddress.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    No default address. Please add one in your profile.
                  </p>
                )}
              </div>
            )}

            <PaymentDetails />
          </div>

          {/* ── Right column: Order Summary ── */}
          <div className="w-full lg:w-1/3 border border-gray-200 rounded-lg bg-white shadow-sm p-4 self-start sticky top-28">
            <h3 className="text-base font-bold text-[#1a5a8a] mb-4">Order Summary</h3>
            <ul className="space-y-3 mb-4">
              {cart.map((item, idx) => {
                const price = item.discountprice > 0 ? item.discountprice : item.orignalprice;
                return (
                  <li key={item.pid ?? idx} className="flex justify-between items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.bunner}
                        alt={item.title}
                        className="h-16 w-16 object-contain bg-gray-100 rounded-md flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 leading-snug">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty {item.quantity} × ₹{price}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[#1a5a8a] flex-shrink-0">
                      ₹{item.quantity * price}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCharge ? `₹${shippingCharge.toFixed(2)}` : <span className="text-green-600 font-medium">Free</span>}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[#1a5a8a] border-t border-gray-100 pt-2 mt-1">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default CheckoutPage;