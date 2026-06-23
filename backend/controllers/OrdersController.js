import { db } from "../db/firebaseAdmin.js";
import generateOrderNumber from "../util/generateOrderN0.js";
import sendEmail from "../util/mailer.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import {
  getOrderPlacementTemplate,
  getOrderUpdateTemplate,
  getStatusAndTrackingTemplate,
} from "../util/orderEmailTemplates.js";

export const createOrder = async (req, res, next) => {
  try {
    const {
      user_id,
      cart, 
      total,
      status,
      paymentMethod,
      address, 
      paymentStatus,
      shippingCharge,
      txn_id,
      payment_screenshot, 
    } = req.body;

    let addressObj = {};
    if (typeof address === "string") {
      try {
        addressObj = address === "undefined" ? {} : JSON.parse(address);
      } catch (err) {
        addressObj = {}; 
      }
    } else {
      addressObj = address || {};
    }

    let cartObj = [];
    if (typeof cart === "string") {
      try {
        cartObj = cart === "undefined" ? [] : JSON.parse(cart);
      } catch (err) {
        cartObj = []; 
      }
    } else {
      cartObj = cart || [];
    }
    
    // 2. Dynamic Validation
    const requiredFields = {
      "User ID": user_id,
      "Order Items": cartObj,
      "Total Amount": total,
      "Order Status": status,
      "Payment Method": paymentMethod,
      "Shipping Address": addressObj
    };

    const missingFields = Object.keys(requiredFields).filter(key => {
      const value = requiredFields[key];
      
      // Check for empty strings
      if (typeof value === "string") return !value.trim();
      // Check for empty arrays (like the cart)
      if (Array.isArray(value)) return value.length === 0;
      // FIX: Check for empty objects (like the fallback address)
      if (typeof value === "object" && value !== null) return Object.keys(value).length === 0;
      
      // Standard falsy check (null, undefined, 0, false)
      return !value;
    });

    if (missingFields.length > 0) {
      throw new ApiError(400, `Missing fields: ${missingFields.join(", ")}`);
    }

    // 3. Prepare Payload
    const docRef = db.collection("orders").doc();
    const orderPayload = {
      id: docRef.id,
      user_id,
      order_number: generateOrderNumber(), 
      ...addressObj,
      payment_method: paymentMethod,
      payment_status: paymentStatus || "Verifying",
      txn_id: txn_id || null,
      payment_screenshot: payment_screenshot || null,
      cart: cartObj,
      shipping_charge: Number(shippingCharge) || 0,
      total: Number(total),
      status,
      created_at: new Date().toISOString(),
    };

    // 4. Save to Database
    await docRef.set(orderPayload);

    // 5. Async Email Notification (Non-blocking)
    const sendOrderEmails = async () => {
      try {
        if (orderPayload.email) {
          const customer = getOrderPlacementTemplate(orderPayload, false);
          await sendEmail(orderPayload.email, customer.subject, "", customer.html);
        }
        if (process.env.ADMIN_EMAIL) {
          const admin = getOrderPlacementTemplate(orderPayload, true);
          await sendEmail(process.env.ADMIN_EMAIL, admin.subject, "", admin.html);
        }
      } catch (err) {
        console.error("Email Notification Failed:", err.message);
      }
    };
    
    // Fire and forget
    sendOrderEmails();

    return res.status(201).json(new ApiResponse(201, orderPayload, "Order placed successfully"));
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const snapshot = await db.collection("orders").get();
    const orders = [];
    
    snapshot.forEach((doc) => orders.push(doc.data()));

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (error) {
    next(error);
  }
};


export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params; 

    if (!id) {
      throw new ApiError(400, "Order number is required");
    }

    const snapshot = await db
      .collection("orders")
      .where("order_number", "==", id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new ApiError(404, "Order not found");
    }

    const doc = snapshot.docs[0];
    const orderData = doc.data();
    const finalPayload = {
      id: doc.id, 
      ...orderData
    };

    return res
      .status(200)
      .json(new ApiResponse(200,{ order:finalPayload}, "Order retrieved successfully"));
      
  } catch (error) {
    next(error);
  }
};

export const getOrdersByUserId = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    if (!user_id) throw new ApiError(400, "User ID is required");

    const snapshot = await db.collection("orders").where("user_id", "==", user_id).get();
    const orders = [];
    
    snapshot.forEach((doc) => orders.push(doc.data()));

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders found"));
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id) throw new ApiError(400, "Order ID is required");

    const docRef = db.collection("orders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Order not found");
    }

    const mergedUpdates = {
      ...updates,
      updateat: new Date().toISOString(),
    };

    await docRef.update(mergedUpdates);
    const updatedDoc = await docRef.get();
    const currentOrderData = updatedDoc.data();

    if (currentOrderData.email) {
      const emailContent = getOrderUpdateTemplate(currentOrderData);
      sendEmail(currentOrderData.email, emailContent.subject, "", emailContent.html)
        .catch(err => console.error("Customer adjustment state signal link broken:", err.message));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, currentOrderData, "Order updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) throw new ApiError(400, "Order ID is required");

    const docRef = db.collection("orders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Order not found");
    }

    await docRef.delete();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Order deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const updatePaymentandOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { payment_status, status, userId, trackingNumber, Note, trackingURL } = req.body;

  try {
    if (!id) throw new ApiError(400, "Order ID is required");

    const docRef = db.collection("orders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ApiError(404, "Order not found");
    }

    const updatedFields = {
      payment_status,
      status,
      user_id: userId,
      trackingNumber: trackingNumber || null,
      trackingURL: trackingURL || null,
      Note: Note || null,
      updateat: new Date().toISOString(),
    };

    await docRef.update(updatedFields);
    const updatedDoc = await docRef.get();
    const detailedOrderData = updatedDoc.data();

    if (detailedOrderData.email) {
      const emailContent = getStatusAndTrackingTemplate(detailedOrderData);
      sendEmail(detailedOrderData.email, emailContent.subject, "", emailContent.html)
        .catch(err => console.error("Fulfillment dispatch vector notify error loop:", err.message));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, detailedOrderData, "Order updated successfully"));
  } catch (error) {
    next(error);
  }
};