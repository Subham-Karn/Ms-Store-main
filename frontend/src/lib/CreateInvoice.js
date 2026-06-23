// utils/generateInvoice.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { app } from "../assets/assets";

/* ── helpers ── */
const RUPEE = "\u20B9";
const BRAND = "#1a5a8a";
const BRAND_DARK = "#124063";
const ACCENT = "#0ea5e9";
const LIGHT_BG = [240, 248, 255]; // aliceblue
const LIGHT_GRAY = [248, 249, 250];
const TEXT_DARK = [22, 30, 46];
const TEXT_MID = [90, 100, 120];
const TEXT_LIGHT = [160, 170, 185];
const SUCCESS_GREEN = [16, 185, 129];
const WARN_AMBER = [245, 158, 11];
const DANGER_RED = [239, 68, 68];
const INDIGO = [99, 102, 241];

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const fmtAmount = (n) =>
  RUPEE + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

/* payment status colour */
const paymentColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid":        return SUCCESS_GREEN;
    case "verifying":   return WARN_AMBER;
    case "processing":  return INDIGO;
    case "failed":      return DANGER_RED;
    default:            return TEXT_MID;
  }
};

/* order status colour */
const orderStatusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "delivered":   return SUCCESS_GREEN;
    case "shipped":     return WARN_AMBER;
    case "processing":  return INDIGO;
    case "cancelled":
    case "canceled":    return DANGER_RED;
    default:            return hex2rgb(ACCENT);
  }
};

/* draw a rounded rectangle (approximation via lines + arcs) */
const roundRect = (doc, x, y, w, h, r, fillRgb, strokeRgb) => {
  if (fillRgb)   doc.setFillColor(...fillRgb);
  if (strokeRgb) doc.setDrawColor(...strokeRgb);
  else           doc.setDrawColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, r, r, fillRgb ? (strokeRgb ? "FD" : "F") : "D");
};

/* draw a thin horizontal rule */
const hRule = (doc, y, x1 = 14, x2 = 196, rgb = [220, 226, 234]) => {
  doc.setDrawColor(...rgb);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
};

/* info row: label on left, value on right */
const infoRow = (doc, y, label, value, labelRgb = TEXT_MID, valRgb = TEXT_DARK) => {
  doc.setFontSize(9);
  doc.setTextColor(...labelRgb);
  doc.text(label, 20, y);
  doc.setTextColor(...valRgb);
  doc.text(String(value || "N/A"), 196, y, { align: "right" });
};

/* small coloured pill badge */
const badge = (doc, x, y, text, rgb) => {
  const PAD_X = 3, PAD_Y = 1.2, R = 2;
  const w = doc.getStringUnitWidth(text) * 8 / doc.internal.scaleFactor + PAD_X * 2;
  roundRect(doc, x, y - 4, w, 5.5, R, [...rgb, 30]);  // translucent fill
  doc.setTextColor(...rgb);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(text, x + PAD_X, y, {});
  doc.setFont("helvetica", "normal");
};

/* ── MAIN EXPORT ── */
export const generateInvoicePDF = (order) => {
  if (!order) return;

  const cart = Array.isArray(order.cart)
    ? order.cart
    : (() => { try { return JSON.parse(order.cart || "[]"); } catch { return []; } })();

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210, PH = 297;

  /* ════════════════════════════════════════════════
     PAGE BACKGROUND  — subtle top gradient band
  ════════════════════════════════════════════════ */
  doc.setFillColor(...hex2rgb(BRAND));
  doc.rect(0, 0, PW, 42, "F");

  /* subtle diagonal stripe pattern in header */
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.15);
  for (let i = -60; i < PW + 60; i += 8) {
    doc.line(i, 0, i + 42, 42);
  }

  /* ════════════════════════════════════════════════
     LOGO + BRAND NAME
  ════════════════════════════════════════════════ */
  if (app?.logo) {
    try { doc.addImage(app.logo, "PNG", 14, 8, 22, 22); } catch (e) { /* skip */ }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Ms Store", app?.logo ? 40 : 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 220, 240);
  doc.text("Official Tax Invoice", app?.logo ? 40 : 14, 28);

  /* RIGHT side of header: invoice meta */
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 240);
  doc.text("INVOICE", 196, 14, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`#${order.order_number || order.id}`, 196, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 240);
  doc.text(`Date: ${fmtDate(order.created_at)}`, 196, 27, { align: "right" });
  doc.text(`Time: ${fmtTime(order.created_at)}`, 196, 32, { align: "right" });

  /* ════════════════════════════════════════════════
     STATUS CHIPS ROW  (below header)
  ════════════════════════════════════════════════ */
  let cy = 50;
  doc.setFontSize(8);

  // Order Status
  doc.setTextColor(...TEXT_MID);
  doc.text("Order Status:", 14, cy);
  badge(doc, 42, cy, order.status || "N/A", orderStatusColor(order.status));

  // Payment Status
  doc.setTextColor(...TEXT_MID);
  doc.text("Payment Status:", 90, cy);
  badge(doc, 122, cy, order.payment_status || "N/A", paymentColor(order.payment_status));

  cy += 6;
  hRule(doc, cy);

  /* ════════════════════════════════════════════════
     TWO-COLUMN INFO SECTION
  ════════════════════════════════════════════════ */
  cy += 6;
  const COL_W = 86, LEFT_X = 14, RIGHT_X = 110;

  /* ─ LEFT: Shipping Address ─ */
  roundRect(doc, LEFT_X, cy, COL_W, 48, 3, LIGHT_BG);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex2rgb(BRAND));
  doc.text("SHIPPING ADDRESS", LEFT_X + 4, cy + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);

  const addrLines = [
    order.fullName || order.address?.fullName || "N/A",
    [order.street, order.landmark].filter(Boolean).join(", "),
    [order.city, order.state, order.pincode].filter(Boolean).join(", "),
    `Phone: ${order.phoneNumber || "N/A"}`,
    `Email: ${order.email || "N/A"}`,
  ];

  addrLines.forEach((line, i) => {
    doc.setFont("helvetica", i === 0 ? "bold" : "normal");
    doc.setFontSize(i === 0 ? 9.5 : 8.5);
    doc.text(line, LEFT_X + 4, cy + 14 + i * 6.5, { maxWidth: COL_W - 8 });
  });

  /* ─ RIGHT: Payment Details ─ */
  roundRect(doc, RIGHT_X, cy, COL_W, 48, 3, LIGHT_BG);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex2rgb(BRAND));
  doc.text("PAYMENT DETAILS", RIGHT_X + 4, cy + 7);

  const pmtRows = [
    ["Method",         order.payment_method?.toUpperCase() || "N/A"],
    ["Transaction ID", order.txn_id || "N/A"],
    ["Payment Status", order.payment_status || "N/A"],
    ["Add ID",         order.add_id || "N/A"],
    ["User",           order.user_id || "N/A"],
  ];

  pmtRows.forEach(([label, value], i) => {
    const rowY = cy + 15 + i * 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MID);
    doc.text(label, RIGHT_X + 4, rowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_DARK);
    // coloured payment status value
    if (label === "Payment Status") {
      doc.setTextColor(...paymentColor(value));
    }
    doc.text(String(value), RIGHT_X + COL_W - 4, rowY, { align: "right", maxWidth: 54 });
  });

  cy += 54;

  /* ════════════════════════════════════════════════
     TRACKING DETAILS  (full width band)
  ════════════════════════════════════════════════ */
  if (order.trackingNumber || order.tracking_number || order.trackingURL || order.tracking_url) {
    roundRect(doc, LEFT_X, cy, 182, 20, 3, [235, 248, 255]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...hex2rgb(ACCENT));
    doc.text("TRACKING INFORMATION", LEFT_X + 4, cy + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MID);
    doc.text("Tracking No:", LEFT_X + 4, cy + 14);
    doc.setTextColor(...TEXT_DARK);
    doc.setFont("helvetica", "bold");
    doc.text(order.trackingNumber || order.tracking_number || "Pending", LEFT_X + 32, cy + 14);

    const tUrl = order.trackingURL || order.tracking_url;
    if (tUrl) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MID);
      doc.text("URL:", 120, cy + 14);
      doc.setTextColor(...hex2rgb(ACCENT));
      doc.textWithLink(tUrl.length > 40 ? tUrl.slice(0, 40) + "…" : tUrl, 130, cy + 14, { url: tUrl });
    }

    cy += 26;
  }

  /* ════════════════════════════════════════════════
     ORDER ITEMS TABLE
  ════════════════════════════════════════════════ */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...hex2rgb(BRAND));
  doc.text("ORDER SUMMARY", LEFT_X, cy + 6);
  cy += 10;

  const tableRows = cart.map((item, idx) => {
    const price = item.discountprice > 0 ? item.discountprice : (item.orignalprice || item.price || 0);
    const qty   = item.quantity || 1;
    return [
      idx + 1,
      item.title || "Unnamed Product",
      String(qty),
      fmtAmount(price),
      fmtAmount(price * qty),
    ];
  });

  // totals
  const subtotal      = cart.reduce((sum, item) => {
    const price = item.discountprice > 0 ? item.discountprice : (item.orignalprice || item.price || 0);
    return sum + price * (item.quantity || 1);
  }, 0);
  const shippingCharge = Number(order.shipping_charge || 0);
  const grandTotal     = Number(order.total || 0);
  const discount       = subtotal + shippingCharge - grandTotal;

  autoTable(doc, {
    head: [["#", "Product", "Qty", "Unit Price", "Amount"]],
    body: tableRows,
    startY: cy,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      valign: "middle",
      textColor: TEXT_DARK,
    },
    headStyles: {
      fillColor: hex2rgb(BRAND),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 251, 255],
    },
    columnStyles: {
      0: { cellWidth: 10,  halign: "center" },
      1: { cellWidth: 85,  halign: "left"   },
      2: { cellWidth: 15,  halign: "center" },
      3: { cellWidth: 35,  halign: "right"  },
      4: { cellWidth: 35,  halign: "right", fontStyle: "bold" },
    },
    tableLineColor: [220, 228, 240],
    tableLineWidth: 0.2,
    margin: { left: 14, right: 14 },
  });

  let finalY = doc.lastAutoTable.finalY || cy + 40;

  /* ── TOTALS BLOCK ── */
  const TOT_X = 120, TOT_W = 76;
  finalY += 4;

  const totRows = [
    ["Subtotal",        fmtAmount(subtotal),       TEXT_DARK,    false],
    ["Shipping Charge", fmtAmount(shippingCharge), TEXT_DARK,    false],
    discount > 0
      ? ["Discount",    `- ${fmtAmount(discount)}`, [...SUCCESS_GREEN], false]
      : null,
    ["GRAND TOTAL",     fmtAmount(grandTotal),      hex2rgb(BRAND), true],
  ].filter(Boolean);

  totRows.forEach(([label, value, rgb, bold], i) => {
    const rowY = finalY + i * 7;
    if (bold) {
      roundRect(doc, TOT_X, rowY - 4.5, TOT_W, 8, 2, [...hex2rgb(BRAND), 15]);
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 8.5);
    doc.setTextColor(...rgb);
    doc.text(label, TOT_X + 4, rowY);
    doc.text(value, TOT_X + TOT_W - 4, rowY, { align: "right" });
    if (!bold) hRule(doc, rowY + 2, TOT_X, TOT_X + TOT_W, [230, 236, 244]);
  });

  finalY += totRows.length * 7 + 8;

  /* ════════════════════════════════════════════════
     NOTES SECTION
  ════════════════════════════════════════════════ */
  const hasCustomerNote = !!order.customerNote || !!order.customer_note;
  const hasAdminNote    = !!order.admin_note    || !!order.adminNote;

  if (hasCustomerNote || hasAdminNote) {
    finalY += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...hex2rgb(BRAND));
    doc.text("NOTES", 14, finalY);
    finalY += 5;

    if (hasCustomerNote) {
      const noteText = order.customerNote || order.customer_note;
      const lines = doc.splitTextToSize(noteText, 174);
      const boxH  = 8 + lines.length * 5;
      roundRect(doc, 14, finalY, 182, boxH, 3, [240, 253, 244]); // light green
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 101, 52);
      doc.text("Customer Note:", 18, finalY + 6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(21, 128, 61);
      lines.forEach((line, i) => doc.text(line, 18, finalY + 11 + i * 5));
      finalY += boxH + 4;
    }

    if (hasAdminNote) {
      const noteText = order.admin_note || order.adminNote;
      const lines = doc.splitTextToSize(noteText, 174);
      const boxH  = 8 + lines.length * 5;
      roundRect(doc, 14, finalY, 182, boxH, 3, [255, 251, 235]); // amber tint
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 53, 15);
      doc.text("Seller Note:", 18, finalY + 6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(146, 64, 14);
      lines.forEach((line, i) => doc.text(line, 18, finalY + 11 + i * 5));
      finalY += boxH + 4;
    }
  }

  /* ════════════════════════════════════════════════
     FOOTER
  ════════════════════════════════════════════════ */
  const footerY = Math.max(finalY + 10, PH - 28);

  hRule(doc, footerY - 4, 14, 196, hex2rgb(BRAND));

  doc.setFillColor(...hex2rgb(BRAND));
  doc.rect(0, footerY, PW, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for shopping with Ms Store!", PW / 2, footerY + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 210, 235);
  doc.text(
    "This is a computer-generated invoice and does not require a physical signature.",
    PW / 2,
    footerY + 14,
    { align: "center" }
  );
  doc.text(
    `Generated on ${fmtDate(new Date().toISOString())} at ${fmtTime(new Date().toISOString())}`,
    PW / 2,
    footerY + 20,
    { align: "center" }
  );

  /* ── Save ── */
  doc.save(`MsStore_Invoice_${order.order_number || order.id}.pdf`);
};