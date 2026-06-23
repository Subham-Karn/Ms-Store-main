const formateDateandTime = require("./formateDateandTime");

const generateUpdateMessageHTML = (user, order) => {
  if (!user || !order) return "<p>Invalid data provided.</p>";

  const { order_number, payment_status, status, updateat, cart } = order;
  let products = [];

  try {
    products = JSON.parse(cart);
  } catch (err) {
    console.error("Failed to parse cart:", err);
  }

  // Order & Payment Status Messages
  let orderStatusMsg = "";
  switch (status.toLowerCase()) {
    case "pending":
      orderStatusMsg = "Your order has been received and is pending confirmation.";
      break;
    case "processing":
      orderStatusMsg = "Your order is being processed.";
      break;
    case "shipped":
      orderStatusMsg = "Your order has been shipped and is on its way!";
      break;
    case "delivered":
      orderStatusMsg = "Your order has been delivered successfully. 🎉";
      break;
    case "cancelled":
      orderStatusMsg = "Your order has been cancelled. If this wasn’t you, please contact support.";
      break;
    default:
      orderStatusMsg = `Your order status is updated to: ${status}.`;
  }

  let paymentStatusMsg = "";
  switch (payment_status.toLowerCase()) {
    case "verifying":
      paymentStatusMsg = "Payment is currently being verified.";
      break;
    case "verified":
      paymentStatusMsg = "Payment has been successfully verified.";
      break;
    case "failed":
      paymentStatusMsg = "Payment failed. Please retry or contact support.";
      break;
    default:
      paymentStatusMsg = `Payment status is updated to: ${payment_status}.`;
  }

  // Product Table Rows
  let productRows = "";
  if (products.length > 0) {
    products.forEach((p, index) => {
      productRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${p.title}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${p.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${p.discountprice || p.orignalprice}</td>
        </tr>
      `;
    });
  }

  const userName = user?.user_metadata?.fullName || user?.user_metadata?.full_name || user.email;

  // HTML Email Template
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #1a5a8a; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">MS Store</h2>
        <p style="margin: 5px 0 0 0;">Order Update Notification</p>
      </div>
      <div style="padding: 20px;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>${orderStatusMsg}</p>
        <p><strong>Payment Status:</strong> ${paymentStatusMsg}</p>
        <p><strong>Order Number:</strong> ${order_number}</p>
        <p><strong>Updated At:</strong> ${formateDateandTime(updateat)}</p>

        ${products.length > 0 ? `
        <h3 style="margin-top: 20px;">Products in your order</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">#</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        ` : ""}

        <p style="margin-top: 20px;">Thank you for shopping with <strong>MS Store</strong>!</p>
        <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply to this email.</p>
      </div>
      <div style="background-color: #f2f2f2; text-align: center; padding: 10px; font-size: 12px; color: #555;">
        © ${new Date().getFullYear()} MS Store. All rights reserved.
      </div>
    </div>
  </div>
  `;
};

module.exports = generateUpdateMessageHTML;
