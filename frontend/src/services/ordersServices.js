import api from "../axios/api.js";

const ORDERS_PREFIX = "/orders";

export const createOrder = async (orderData) => {
  try {
    const formData = new FormData();
    formData.append("user_id", orderData.user_id);
    formData.append("status", orderData.status);
    formData.append("paymentMethod", orderData.paymentMethod);
    formData.append("txn_id", orderData.txnId || "");
    formData.append("total", orderData.total);
    formData.append("shippingCharge", orderData.shippingCharge || 0);
    formData.append("paymentStatus", orderData.paymentStatus || "Verifying");
    formData.append("cart", JSON.stringify(orderData.cart)); 
    formData.append("address", JSON.stringify(orderData.address));
    
    if (orderData.payment_screenshot instanceof File) {
      formData.append("payment_screenshot", orderData.payment_screenshot);
    }

    // Axios safely manages multi-part data boundary headers configuration automatically
    const response = await api.post(`${ORDERS_PREFIX}`, formData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (data, orderId, userId) => {
  try {
    // Aligned to match your backend controller PATCH/PUT route structure tracking parameters
    const response = await api.patch(`${ORDERS_PREFIX}/update-status/${orderId}`, {
      payment_status: data?.paymentStatus,
      status: data?.status,
      userId,
      trackingNumber: data?.trackingNumber,
      Note: data?.Note,
      trackingURL: data?.trackingURL,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getOrdersByUserId = async (userId) => {
  try {
    const response = await api.get(`${ORDERS_PREFIX}/user/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`${ORDERS_PREFIX}/${orderId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get(`${ORDERS_PREFIX}`);
    return response;
  } catch (error) {
    throw error;
  }
};