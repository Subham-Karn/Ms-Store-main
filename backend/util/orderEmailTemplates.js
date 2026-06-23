// utils/orderEmailTemplates.js

const SUPPORT_EMAIL = "sharmonu371@gmail.com";

const getItemsHtml = (cart) => {
  return cart
    .map(item => `<li><strong>${item.title}</strong> x ${item.quantity || 1} - ₹${item.discountprice || item.price}</li>`)
    .join('');
};

const getAutomatedFooterHtml = () => `
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size: 12px; color: #777; line-height: 1.5;">
    ⚠️ <strong>This is an automatically generated system notice. Please do not reply directly to this sending address.</strong><br />
    If you need assistance, have any questions, or want to modify something, please contact our dedicated support division directly at: 
    <a href="mailto:${SUPPORT_EMAIL}" style="color: #2196F3; font-weight: bold; text-decoration: none;">${SUPPORT_EMAIL}</a>
  </p>
`;

export const getOrderPlacementTemplate = (order, isAdminCopy = false) => {
  const itemsList = getItemsHtml(order.cart);

  if (isAdminCopy) {
    return {
      subject: `🚨 NEW ORDER RECEIVED - Ms Store #${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #d32f2f; padding: 20px;">
          <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">New Ms Store Order Alert</h2>
          <p>An incoming order has been registered in the database infrastructure system.</p>
          
          <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 15px 0;">
            <strong>Action Required:</strong> Please evaluate payment details, confirm inventory levels, and update processing statuses within your store management dashboard panel.
          </div>

          <h3>Order Profile Summary:</h3>
          <p><strong>Order Number:</strong> #${order.order_number}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method}</p>
          <p><strong>Transaction Reference ID (TXN):</strong> ${order.txn_id || 'N/A'}</p>
          
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${order.fullName}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Phone:</strong> ${order.phoneNumber}</p>
          <p><strong>Shipping Vector Address:</strong> ${order.street}, ${order.landmark ? order.landmark + ',' : ''} ${order.city}, ${order.state} - ${order.pincode}</p>

          <h3>Manifest Configuration Elements:</h3>
          <ul>${itemsList}</ul>
          <p><strong>Subtotal Value:</strong> ₹${order.total - order.shipping_charge}</p>
          <p><strong>Shipping Surcharges:</strong> ₹${order.shipping_charge}</p>
          <p style="font-size: 18px; color: #d32f2f;"><strong>Total Revenue Capture:</strong> ₹${order.total}</p>
          
          ${order.payment_screenshot ? `<p><strong>Screenshot Verification Link:</strong> <a href="${order.payment_screenshot}" target="_blank">View Asset Attachment</a></p>` : ''}
        </div>
      `
    };
  }

  return {
    subject: `Your Ms Store Order Confirmation - #${order.order_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Thank You for Your Order at Ms Store!</h2>
        <p>Hello ${order.fullName},</p>
        <p>Your order has been received and is currently being processed by our fulfillment channels.</p>
        
        <h3>Order Parameters:</h3>
        <p><strong>Order Number:</strong> #${order.order_number}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
        
        <h3>Items Ordered:</h3>
        <ul>${itemsList}</ul>
        
        <p><strong>Shipping Charge:</strong> ₹${order.shipping_charge}</p>
        <p style="font-size: 18px; color: #4CAF50;"><strong>Total Amount Paid:</strong> ₹${order.total}</p>
        
        ${getAutomatedFooterHtml()}
      </div>
    `
  };
};

export const getOrderUpdateTemplate = (order) => {
  return {
    subject: `Ms Store: Order Configuration Status Shift - #${order.order_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">Your Order Status Was Updated</h2>
        <p>Hello ${order.fullName || 'Valued Customer'},</p>
        <p>The processing engine has registered a state variation on your Ms Store order <strong>#${order.order_number}</strong>.</p>
        
        <h3>Current Pipeline State Matrix:</h3>
        <p><strong>Order Stage:</strong> <span style="background: #e3f2fd; color: #0d47a1; padding: 4px 8px; border-radius: 4px;">${order.status}</span></p>
        <p><strong>Payment Verification:</strong> ${order.payment_status}</p>
        
        ${getAutomatedFooterHtml()}
      </div>
    `
  };
};

export const getStatusAndTrackingTemplate = (order) => {
  return {
    subject: `Ms Store: Shipping Dispatch Manifest - #${order.order_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">Shipment Dispatched Vectors Active</h2>
        <p>Hello ${order.fullName || 'Valued Customer'},</p>
        <p>Logistics tracking parameters have been initialized for your Ms Store order <strong>#${order.order_number}</strong>.</p>
        
        <h3>Fulfillment Attributes:</h3>
        <p><strong>Current State:</strong> <span style="background: #fff3e0; color: #e65100; padding: 4px 8px; border-radius: 4px;">${order.status}</span></p>
        <p><strong>Payment Tracking:</strong> ${order.payment_status}</p>
        
        ${order.trackingNumber ? `<p><strong>Tracking Waybill Number:</strong> <code>${order.trackingNumber}</code></p>` : ''}
        ${order.trackingURL ? `<p><strong>Live Routing Pipeline:</strong> <a href="${order.trackingURL}" target="_blank" style="color: #2196F3; font-weight: bold;">Trace Physical Asset Coordinates Here</a></p>` : ''}
        ${order.Note ? `<p><strong>Merchant Processing Dispatch Note:</strong> <em>"${order.Note}"</em></p>` : ''}
        
        ${getAutomatedFooterHtml()}
      </div>
    `
  };
};