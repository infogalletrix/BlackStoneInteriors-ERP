import jsPDF from "jspdf";

const formatINR = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Builds a clean, branded, pixel-perfect PDF document for one or more receipts.
 */
export const buildReceiptPDF = (receiptOrList) => {
  const receipts = Array.isArray(receiptOrList) ? receiptOrList : [receiptOrList];
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  receipts.forEach((r, pageIdx) => {
    if (pageIdx > 0) {
      doc.addPage("a4", "portrait");
    }

    const receiptNo = r.receiptNo || "RCPT-DRAFT";
    const dateStr = r.date ? new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const clientName = r.clientName || "Valued Client";
    const orgName = r.organizationName || "";
    const siteId = r.siteId ? String(r.siteId) : "";
    const siteName = r.siteName || "";
    const amount = parseFloat(r.amountPaid || r.totalAmount || 0);
    const mode = r.paymentMode || "Cash";
    const category = r.category || "Payment";
    const description = r.description || "Payment received";
    const comments = r.comments || "";
    const status = (r.status || "Completed").toUpperCase();

    // ── 1. HEADER BANNER ──
    // Deep navy background
    doc.setFillColor(11, 30, 54); // #0b1e36
    doc.rect(0, 0, 210, 36, "F");

    // Gold accent bar
    doc.setFillColor(201, 162, 39); // #c9a227
    doc.rect(0, 35, 210, 1.5, "F");

    // Company title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("BLACK STONE INTERIORS", 14, 13);

    // Subtitle & contact info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(215, 225, 235);
    doc.text("Plot No 72 Sector 6 IMT Manesar, Gurgaon, Haryana 122050", 14, 19);
    doc.text("Phone: +91 9555174096, +91 9315157200 | GSTIN: 06ABFFB6382G1ZF", 14, 24);
    doc.text("Email: Nakul.blackstoneinterior@gmail.com", 14, 29);

    // Document Title (Right-aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(201, 162, 39);
    doc.text("PAYMENT RECEIPT", 196, 13, { align: "right" });

    // Receipt Meta info (Right-aligned)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Receipt #: ${receiptNo}`, 196, 19, { align: "right" });
    doc.text(`Date: ${dateStr}`, 196, 24, { align: "right" });

    if (siteId) {
      doc.setFontSize(7.5);
      doc.setTextColor(180, 205, 225);
      doc.text(`Work Order: WO-${siteId}`, 196, 29, { align: "right" });
    }

    // ── 2. RECEIPT CARD CONTAINER ──
    const cardTop = 44;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, cardTop, 182, 175, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, cardTop, 182, 175, 3, 3, "D");

    // Top Card Header: Status & Verification Badge
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, cardTop, 182, 16, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(14, cardTop + 16, 196, cardTop + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(11, 30, 54);
    doc.text("OFFICIAL PAYMENT ACKNOWLEDGEMENT", 20, cardTop + 10.5);

    // Status pill
    if (status === "COMPLETED") {
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(160, cardTop + 4.5, 30, 7, 2, 2, "F");
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(160, cardTop + 4.5, 30, 7, 2, 2, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text("COMPLETED", 175, cardTop + 9.5, { align: "center" });
    } else {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(160, cardTop + 4.5, 30, 7, 2, 2, "F");
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(160, cardTop + 4.5, 30, 7, 2, 2, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(status, 175, cardTop + 9.5, { align: "center" });
    }

    // ── 3. AMOUNT RECEIVED HERO BOX ──
    const heroY = cardTop + 22;
    doc.setFillColor(240, 253, 244); // light emerald #f0fdf4
    doc.roundedRect(20, heroY, 170, 26, 2, 2, "F");
    doc.setDrawColor(187, 247, 208); // emerald border #bbf7d0
    doc.setLineWidth(0.4);
    doc.roundedRect(20, heroY, 170, 26, 2, 2, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text("AMOUNT RECEIVED", 26, heroY + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(4, 120, 87); // emerald-800
    doc.text(`INR  ${formatINR(amount)}`, 26, heroY + 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Mode: ${mode}`, 184, heroY + 14, { align: "right" });
    doc.text(`Category: ${category}`, 184, heroY + 19, { align: "right" });

    // ── 4. DETAILS BREAKDOWN TABLE ──
    let curY = heroY + 34;

    const renderRow = (label, val, subVal = null) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, curY, 50, subVal ? 14 : 10, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, curY, 170, subVal ? 14 : 10, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label, 24, curY + 6.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(val || "—", 74, curY + 6.5);

      if (subVal) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(subVal, 74, curY + 11);
      }

      curY += subVal ? 14 : 10;
    };

    renderRow("Received From", clientName, orgName ? `Organization: ${orgName}` : null);
    if (siteId || siteName) {
      renderRow("Work Order / Project", `WO-${siteId || "—"}`, siteName ? `Project Name: ${siteName}` : null);
    }
    renderRow("Payment Towards", `${category} — ${description}`);
    renderRow("Payment Mode", mode);

    if (comments) {
      renderRow("Remarks / Notes", comments);
    }

    renderRow("Receipt ID / Ref", r.id ? String(r.id) : receiptNo, "Verified Computer-Generated Document");

    // ── 5. COMPANY BANK / LEGAL NOTE ──
    curY += 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, curY, 170, 24, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, curY, 170, 24, 2, 2, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(11, 30, 54);
    doc.text("BANK & PAYMENT TERMS", 24, curY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("1. All payments are subject to bank clearance. Receipts issued against cheques are valid subject to realization.", 24, curY + 10.5);
    doc.text("2. Please quote Receipt Number and Work Order ID in all future correspondence.", 24, curY + 15);
    doc.text("3. Bank: YES BANK | Account: BLACK STONE INTERIOR | A/C No: 072261900003797 | IFSC: YESB0000722", 24, curY + 19.5);

    // ── 6. SIGN-OFF BLOCK ──
    curY += 30;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for your business!", 20, curY + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(11, 30, 54);
    doc.text("BLACK STONE INTERIORS", 20, curY + 9);

    // Digital approval badge on right
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(125, curY - 2, 65, 14, 2, 2, "F");
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(125, curY - 2, 65, 14, 2, 2, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text("✓ Digitally Approved", 157.5, curY + 4, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Computer-generated; valid without physical signature.", 157.5, curY + 8.5, { align: "center" });

    // Page footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Black Stone Interiors • Receipt ${receiptNo} • Page ${pageIdx + 1} of ${receipts.length}`,
      105,
      288,
      { align: "center" }
    );
  });

  return doc;
};

/**
 * Downloads a receipt or list of receipts as a standardized PDF file.
 */
export const downloadReceiptPDF = (receiptOrList) => {
  const doc = buildReceiptPDF(receiptOrList);
  const receipts = Array.isArray(receiptOrList) ? receiptOrList : [receiptOrList];

  let fileName = "Payment_Receipt.pdf";
  if (receipts.length === 1) {
    const r = receipts[0];
    const no = (r.receiptNo || "Receipt").replace(/[^a-zA-Z0-9_-]/g, "_");
    const client = (r.clientName || "Client").replace(/\s+/g, "_");
    fileName = `${no}_${client}.pdf`;
  } else {
    fileName = `Payment_Receipts_Export_${receipts.length}_Items.pdf`;
  }

  doc.save(fileName);
  return doc;
};

/**
 * Opens the receipt PDF directly in a new browser window/tab for viewing.
 */
export const viewReceiptPDF = (receiptOrList) => {
  const doc = buildReceiptPDF(receiptOrList);
  const pdfBlobUrl = doc.output("bloburl");
  if (typeof window !== "undefined") {
    window.open(pdfBlobUrl, "_blank");
  }
  return pdfBlobUrl;
};
