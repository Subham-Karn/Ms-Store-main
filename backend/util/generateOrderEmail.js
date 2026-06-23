const formateDateandTime = require("./formateDateandTime");

// Enhanced Customer + Admin Email Template Generator
const generateOrderEmailTemplate = (order, isAdmin = false) => {
  let orderParsedItems = [];
  const { total } = order;

  try {
    if (Array.isArray(order.cart)) {
      orderParsedItems = order.cart; 
    } else if (typeof order.cart === "string") {
      orderParsedItems = JSON.parse(order.cart); 
    }
  } catch (err) {
    console.error("Error parsing order.cart:", err);
    orderParsedItems = [];
  }

  // Badge helper for payment & order status
  const getBadge = (text, type) => {
    let bgColor = "#eee";
    let textColor = "#333";

    if (type === "payment") {
      switch (text.toLowerCase()) {
        case "paid":
          bgColor = "#d4edda";
          textColor = "#155724";
          break;
        case "failed":
          bgColor = "#f8d7da";
          textColor = "#721c24";
          break;
        case "verifying":
        case "processing":
          bgColor = "#fff3cd";
          textColor = "#856404";
          break;
      }
    }

    if (type === "order") {
      switch (text.toLowerCase()) {
        case "pending":
        case "processing":
          bgColor = "#fff3cd";
          textColor = "#856404";
          break;
        case "shipped":
          bgColor = "#cce5ff";
          textColor = "#004085";
          break;
        case "delivered":
          bgColor = "#d4edda";
          textColor = "#155724";
          break;
        case "cancelled":
          bgColor = "#f8d7da";
          textColor = "#721c24";
          break;
      }
    }

    return `<span style="display:inline-block; padding:4px 8px; border-radius:5px; font-size:12px; font-weight:600; background-color:${bgColor}; color:${textColor};">${text}</span>`;
  };

  // Build item list rows
  const itemsList = orderParsedItems
    .map(
      (item) => `
        <tr>
          <td style="padding:8px; border:1px solid #ddd;">${item.title} (x${item.quantity})</td>
          <td style="padding:8px; border:1px solid #ddd;">₹${item.discountprice > 0 ? item.discountprice : item.orignalprice}</td>
          <td style="padding:8px; border:1px solid #ddd;">₹${item.shipping_charge || 0}</td>
          <td style="padding:8px; border:1px solid #ddd;">₹${(item.discountprice || item.orignalprice) * item.quantity + (item.shipping_charge || 0)}</td>
        </tr>`
    )
    .join("");

  const userName = isAdmin ? "Admin" : order.fullName;

  return `
  <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden;">
    <div style="background-color:#1a5a8a; color:white; padding:20px; text-align:center;">
      <h2 style="margin:0;">${isAdmin ? "📢 New Order Received" : "✅ Order Confirmation"}</h2>
      <p style="margin:5px 0 0 0;">Order #${order.order_number}</p>
    </div>
    <div style="padding:20px;">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>${isAdmin ? "A new order has been placed on MS Store." : "Thank you for shopping with MS Store! Your order has been confirmed."}</p>

      <h3 style="color:#1a5a8a; margin-bottom:10px;">Order Summary</h3>
      <p><strong>Order Date:</strong> ${formateDateandTime(order.created_at)}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method} | <strong>Payment Status:</strong> ${getBadge(order.payment_status, "payment")}</p>
      <p><strong>Order Status:</strong> ${getBadge(order.status, "order")}</p>

      <h3 style="color:#1a5a8a; margin-bottom:10px;">Products</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px; border:1px solid #ddd;">Item</th>
            <th style="padding:8px; border:1px solid #ddd;">Price</th>
            <th style="padding:8px; border:1px solid #ddd;">Shipping</th>
            <th style="padding:8px; border:1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <p><strong>Total Amount: </strong>₹${total}</p>

      <h3 style="color:#1a5a8a; margin-bottom:10px;">Shipping Address</h3>
      <p>
        ${order.fullName}<br/>
        ${order.street}, ${order.city}, ${order.state} - ${order.pincode}<br/>
        Phone: ${order.phoneNumber}<br/>
        Email: ${order.email}
      </p>

      <p style="margin-top:20px;">Thank you for shopping with <strong>MS Store</strong>!</p>
      <p style="font-size:12px; color:#888;">This is an automated message. Please do not reply to this email.</p>
    </div>
    <div style="background:#f2f2f2; text-align:center; padding:10px; font-size:12px; color:#555;">
      © ${new Date().getFullYear()} MS Store. All rights reserved.
    </div>
  </div>
  `;
};

module.exports = { generateOrderEmailTemplate };
