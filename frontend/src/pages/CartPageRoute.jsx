import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash, ShoppingBag, MapPin, ChevronRight, Package } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import RootLayout from "../util/RootLayout";
import AddressMondal from "../mondals/AddressMondal";
import { changeAddressDefault } from "../services/addressService";
import {
  fetchAddresses,
  createNewAddress,
  modifyAddress,
  removeAddress,
  updateCartItemQuantity, 
  removeFromCart,
  updateCartItemShipping,        
} from "../store/slices/cartSlice";
import { CgAdd } from "react-icons/cg";

const EMPTY_ADDRESS = {
  fullName: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  phoneNumber: "",
  email: "",
  isdefault: false,
};

const validateAddress = (addr) => {
  const errs = {};
  if (!addr.fullName?.trim()) errs.fullName = "Full name required";
  if (!addr.pincode || !/^\d{6}$/.test(addr.pincode)) errs.pincode = "Invalid Pincode";
  if (!addr.phoneNumber || !/^\d{10}$/.test(addr.phoneNumber)) errs.phoneNumber = "Invalid Phone";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) errs.email = "Invalid Email";
  return errs;
};

const SHIPPING_TIERS = {
  63: "Letter — ₹63",
  70: "Menila — ₹70",
  100: "Large — ₹100",
};

const shippingOptions = [
    { value: 63, label: "Letter", priceText: "₹63", icon: "📨" },
    { value: 70, label: "Manila", priceText: "₹70", icon: "📦" },
    { value: 100, label: "Large", priceText: "₹100", icon: "📫" },
  ];

const getShippingSize = (shippingPrice) =>
  SHIPPING_TIERS[shippingPrice] || "Free — ₹0";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, address:userAllAddress } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [tempAddress, setTempAddress] = useState(EMPTY_ADDRESS);
   console.log(user);
   
  useEffect(() => {
    document.title = "Ms Store | Cart";
    if (user?.id) {
      dispatch(fetchAddresses(user.id));
    }
  }, [dispatch, user?.id]);

  const { subtotal, shippingCharge, total } = useMemo(() => {
    const sub = cart.reduce(
      (sum, item) => sum + (item.discountprice || item.orignalprice) * item.quantity,
      0
    );
    const ship = cart.reduce(
      (sum, item) => sum + (item.shipping_charge || 0) * item.quantity,
      0
    );
    return { subtotal: sub, shippingCharge: ship, total: sub + ship };
  }, [cart]);

  const defaultAddress = useMemo(
    () => userAllAddress?.find((a) => a.isdefault),
    [userAllAddress]
  );

  const updateCartItem = (pid, quantity) => {
    dispatch(updateCartItemQuantity({ pid, quantity }));
  };

  const removeCartItem = (pid) => {
    dispatch(removeFromCart({ pid }));
  };

 const updateShippingCharge = (pid, shipping_charge) => {
  dispatch(updateCartItemShipping({ pid, shipping_charge }));
}


  const handleSetDefault = async (addId) => {
    try {
      await changeAddressDefault(user?.id ,addId, true);
      dispatch(fetchAddresses(user.id));
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const handleDeleteAddress = async (addId) => {
    if (!window.confirm("Delete this address?")) return; 
    try {
      await dispatch(removeAddress({ addressId:addId, userId: user.id })).unwrap();
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSaveAddress = async () => {
    const validationErrors = validateAddress(tempAddress);
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);

    setIsLoading(true);
    let response;
    try {
      if (editingAddress) {
        response = await dispatch(
          modifyAddress({ addressId: editingAddress, addressData: tempAddress, userId: user.id })
        ).unwrap();
        toast.success("Address updated");
      } else {
       response = await dispatch(
          createNewAddress({ addr: tempAddress, userId: user.id })
        ).unwrap();
        toast.success("Address added");
      }
      setIsAddressModalOpen(false);
      setTempAddress(EMPTY_ADDRESS);
      setEditingAddress(null);
      setErrors({});
    } catch (error){
      toast.error(error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddressModalOpen(false);
    setTempAddress(EMPTY_ADDRESS);
    setEditingAddress(null);
    setErrors({});
  };

  const handleOpenModal = (addr = null) => {
    setEditingAddress(addr?.add_id || null);
    setTempAddress(addr || EMPTY_ADDRESS);
    setErrors({});
    setIsAddressModalOpen(true);
  };

  const handleGoCheckOut = () => {
    if (!defaultAddress && user) {
      toast.error("Please set a default address before checkout.");
      return;
    }
    navigate("/checkout", {
      state: { cartItems: { cart, defaultAddress, shippingCharge, subtotal, total }, user },
    });
  };

  return (
    <RootLayout>
      <div className="w-full max-w-7xl mx-auto px-4 mt-25 sm:mt-35 pb-16">

        {/* ── Empty state ── */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <ShoppingBag size={36} className="text-[#1a5a8a]" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <Link
              to="/catalogs"
              className="px-7 py-3 bg-[#1a5a8a] text-white font-semibold rounded-xl
                         shadow hover:bg-[#14476a] transition-colors duration-200"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Cart Items ── */}
            <div className="flex-1 flex flex-col gap-3">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
              </h2>

              {cart.map((item, index) => (
                <div
                  key={item.pid ?? index}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4
                             border border-gray-200 p-4 bg-white rounded-xl
                             hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={item.bunner}
                      alt={item.title}
                      className="w-24 h-24 object-contain rounded-xl bg-gray-50 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                        {item.title}
                      </h3>

                      {/* Price display */}
                      <div className="flex items-baseline gap-2 mt-1">
                        {item.discountprice > 0 ? (
                          <>
                            <span className="text-[#1a5a8a] font-bold text-lg">
                              ₹{item.discountprice}
                            </span>
                            <span className="line-through text-sm text-gray-400">
                              ₹{item.orignalprice}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#1a5a8a] font-bold text-lg">
                            ₹{item.orignalprice || "N/A"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Action Selectors (Shipping, Qty, Trash) ── */}
                  <div className="flex sm:flex-col flex-row gap-2 items-end flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    
                    {/* Shipping Selector */}
                    <div className="flex items-center w-full sm:w-auto">
                      <select
                        value={item.shipping_charge || 0}
                        onChange={(e) => updateShippingCharge(item.pid, Number(e.target.value))}
                        className="w-full sm:w-auto border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600
                                   bg-gray-50 hover:border-gray-300 focus:outline-none
                                   focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a]
                                   transition cursor-pointer"
                      >
                        <option value={63}>Letter (₹63)</option>
                        <option value={70}>Manila (₹70)</option>
                        <option value={100}>Large (₹100)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                      {/* Quantity Selector */}
                      <select
                        value={item.quantity}
                        onChange={(e) => updateCartItem(item.pid, Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm
                                   bg-gray-50 hover:border-gray-300 focus:outline-none
                                   focus:ring-2 focus:ring-[#1a5a8a]/20 focus:border-[#1a5a8a]
                                   transition cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((q) => (
                          <option key={q} value={q}>Qty: {q}</option>
                        ))}
                      </select>

                      {/* Trash Button */}
                      <button
                        onClick={() => removeCartItem(item.pid)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50
                                   p-2 rounded-lg transition-all duration-150"
                        aria-label="Remove item"
                      >
                        <Trash size={17} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* ── Right Column: Address + Summary ── */}
            <div className="w-full lg:w-96 flex flex-col gap-4">

              {/* Address Section */}
              {user && (
                <div className="border border-gray-200 p-5 rounded-xl bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={16} className="text-[#1a5a8a]" />
                      Delivery Address
                    </h3>
                    {userAllAddress?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {userAllAddress.length} saved
                      </span>
                    )}
                  </div>

                  {userAllAddress?.length > 0 ? ( 
                    userAllAddress.slice(0, 3).map((a, index) => (
                      <div
                        key={a.add_id ?? index}
                        className={`p-3 mb-2 rounded-xl border-2 transition-all duration-200
                          ${a.isdefault
                            ? "border-[#1a5a8a] bg-blue-50/40"
                            : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{a.fullName}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {a.street}
                              {a.landmark ? `, ${a.landmark}` : ""},&nbsp;
                              {a.city}, {a.state} — {a.pincode}
                            </p>
                            <p className="text-xs text-gray-500">{a.phoneNumber}</p>
                          </div>
                          {a.isdefault && (
                            <span className="flex-shrink-0 text-[10px] font-semibold uppercase
                                           tracking-wide bg-[#1a5a8a] text-white px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
                          {!a.isdefault && (
                            <button
                              onClick={() => handleSetDefault(a.add_id)}
                              className="text-xs text-[#1a5a8a] hover:underline font-medium"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(a)}
                            className="text-xs text-gray-500 hover:text-gray-800 hover:underline"
                          >
                            Edit
                          </button>
                          {userAllAddress.length > 1 && (
                            <button
                              onClick={() => handleDeleteAddress(a.add_id)}
                              className="text-xs text-red-500 hover:underline ml-auto"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                      No address found. Please add one below.
                    </p>
                  )}

                  <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-1.5 mt-3 text-sm text-[#1a5a8a]
                               font-semibold hover:underline"
                  >
                    <CgAdd size={18} /> Add New Address
                  </button>
                </div>
              )}

              {/* Order Summary */}
              <div className="border border-gray-200 p-5 bg-white rounded-xl flex flex-col gap-3 sticky top-28">
                <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">
                    {!shippingCharge ? (
                      <span className="text-green-600 font-semibold">Free</span>
                    ) : (
                      `₹${shippingCharge.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-1">
                  <span>Total</span>
                  <span className="text-[#1a5a8a]">₹{total.toFixed(2)}</span>
                </div>
                {user && !defaultAddress && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Set a default address to proceed.
                  </p>
                )}

                <button
                  onClick={handleGoCheckOut}
                  disabled={!!user && !defaultAddress}
                  className="mt-1 w-full flex items-center justify-center gap-2 px-6 py-3
                             bg-[#1a5a8a] text-white font-semibold rounded-xl
                             hover:bg-[#14476a] active:scale-[0.98] transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  Proceed to Checkout
                  <ChevronRight size={16} />
                </button>

                <Link
                  to="/catalogs"
                  className="w-full text-center border border-[#1a5a8a] px-6 py-2.5
                             text-[#1a5a8a] font-medium rounded-xl hover:bg-blue-50
                             transition-colors duration-150 text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Address Modal */}
        <AddressMondal
          isOpen={isAddressModalOpen}
          onClose={handleCloseModal}  
          address={tempAddress}
          setAddress={setTempAddress}
          errors={errors}
          onSave={handleSaveAddress}
          isLoading={isLoading}
          isEditing={!!editingAddress}
        />
      </div>
    </RootLayout>
  );
};

export default CartPage;