import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toJpeg } from "html-to-image";
import React from "react";
import { createRoot } from "react-dom/client";
import PrintableQuotation from "../components/PrintableQuotation";

export const formatINR = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Builds a standardized, branded jsPDF document for Quotations (and Invoices).
 */
export const buildQuotationPDF = (data = {}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const isQuote = !!(data.quoteNo || !data.invoiceNo);
  const docTitle = isQuote ? "ESTIMATE / QUOTATION" : "TAX INVOICE";
  const docNo = data.quoteNo || data.invoiceNo || (isQuote ? "DRAFT-QUOTE" : "DRAFT-INV");
  const docDate = data.date || data.invoiceDate || new Date().toISOString().split("T")[0];
  const clientName = data.clientName || data.customer || "Valued Client";
  const orgName = data.organizationName || "";
  const address = data.clientAddress || data.address || "";
  const phone = data.mobileNo || data.phone || "";
  const email = data.emailId || data.email || "";
  const projectTitle = data.projectTitle || data.project || "";
  const billType = data.billType || "GST";
  const customerGst = data.customerGst || data.gstNumber || "";
  const deliveryTimeline = data.deliveryTimeline || "3 to 4 Weeks";

  let items = data.items || [];
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch { items = []; }
  }
  if (!Array.isArray(items)) items = [];

  // Financial calculations
  const subTotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);
  const installation = parseFloat(data.installationMaterial || 0);
  const delivery = parseFloat(data.deliveryLoading || 0);
  const transport = parseFloat(data.transportationCharges || 0);
  const discount = parseFloat(data.additionalDiscount || 0);
  const taxableTotal = Math.max(0, subTotal + installation + delivery + transport - discount);

  const isGST = billType === "GST";
  const cgstRate = data.cgstPercent !== undefined && data.cgstPercent !== "" ? parseFloat(data.cgstPercent) : 9;
  const sgstRate = data.sgstPercent !== undefined && data.sgstPercent !== "" ? parseFloat(data.sgstPercent) : 9;
  const cgst = isGST ? (taxableTotal * cgstRate) / 100 : 0;
  const sgst = isGST ? (taxableTotal * sgstRate) / 100 : 0;
  const grandTotal = isGST ? taxableTotal + cgst + sgst : taxableTotal;

  // 1. Header Banner
  doc.setFillColor(11, 30, 54); // Deep Navy (#0b1e36)
  doc.rect(0, 0, 210, 26, "F");

  // Gold accent bar
  doc.setFillColor(201, 162, 39); // Gold (#c9a227)
  doc.rect(0, 25, 210, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("BLACK STONE INTERIORS", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 225, 235);
  doc.text("Architects & Interior Designers • Luxury Fitouts", 14, 17);
  doc.text("Email: blackstoneinteriors@gmail.com | Phone: +91 98400 00000", 14, 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(201, 162, 39);
  doc.text(docTitle, 196, 11, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Doc #: ${docNo}`, 196, 16, { align: "right" });
  doc.text(`Date: ${docDate}`, 196, 21, { align: "right" });

  // 2. Client & Project Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 30, 182, 25, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 182, 25, 2, 2, "D");

  doc.setTextColor(11, 30, 54);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("BILLED TO:", 18, 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(clientName + (orgName ? ` (${orgName})` : ""), 18, 41);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  if (address) doc.text(address.slice(0, 75), 18, 46);
  const contactStr = [phone && `Ph: ${phone}`, email && `Email: ${email}`, customerGst && `GSTIN: ${customerGst}`].filter(Boolean).join(" | ");
  if (contactStr) doc.text(contactStr, 18, 51);

  // Right side of info box
  doc.setTextColor(11, 30, 54);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PROJECT / BILLING:", 135, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  if (projectTitle) doc.text(`Project: ${projectTitle}`, 135, 41);
  doc.text(`Bill Type: ${billType}`, 135, 46);
  doc.text(`Timeline: ${deliveryTimeline}`, 135, 51);

  // 3. Items Table
  const tableColumn = ["#", "Section", "Product / Category", "Specification & Material", "Qty", "Unit", "Rate (₹)", "Disc. Price (₹)", "Amount (₹)"];
  const tableRows = items.map((it, idx) => {
    const qty = parseFloat(it.qty) || 0;
    const rate = parseFloat(it.rate) || 0;
    const gross = qty * rate;
    const net = parseFloat(it.amount) || 0;
    const dp = it.discountPrice !== undefined && it.discountPrice !== null && it.discountPrice !== "" ? parseFloat(it.discountPrice) : null;
    const discPrice = (dp !== null && (dp < rate || (rate > 0 && dp === 0))) ? dp : (qty > 0 && rate > 0 && net < gross - 0.01 ? net / qty : null);

    return [
      idx + 1,
      it.section || "General",
      [it.product, it.category].filter(Boolean).join(" - ") || "Item",
      it.specification || "—",
      it.qty || "0",
      it.unit || "Sq.Ft",
      formatINR(rate),
      discPrice !== null ? formatINR(discPrice) : "—",
      formatINR(net)
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 59,
    theme: "grid",
    headStyles: {
      fillColor: [201, 162, 39],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left"
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 46 },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 18, halign: "right" },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: 22, halign: "right" }
    },
    didDrawPage: (data) => {
      // Footer page numbering on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Black Stone Interiors • Quotation ${docNo} • Page ${data.pageNumber} of ${pageCount}`,
        105,
        292,
        { align: "center" }
      );
    }
  });

  // 4. Financial Summary Cards
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 4 : 200;
  
  // If finalY is too close to bottom, add a new page
  let summaryY = finalY;
  if (summaryY > 235) {
    doc.addPage();
    summaryY = 20;
  }

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, summaryY, 86, 42, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, summaryY, 86, 42, 2, 2, "D");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  let curY = summaryY + 5;
  doc.text("Items Sub Total:", 114, curY);
  doc.text(`₹ ${formatINR(subTotal)}`, 192, curY, { align: "right" });

  if (installation > 0 || delivery > 0 || transport > 0) {
    curY += 4.5;
    const addtl = installation + delivery + transport;
    doc.text("Installation & Transport:", 114, curY);
    doc.text(`₹ ${formatINR(addtl)}`, 192, curY, { align: "right" });
  }

  if (discount > 0) {
    curY += 4.5;
    doc.text("Additional Discount:", 114, curY);
    doc.text(`- ₹ ${formatINR(discount)}`, 192, curY, { align: "right" });
  }

  if (isGST) {
    curY += 4.5;
    doc.text(`CGST (${cgstRate}%):`, 114, curY);
    doc.text(`₹ ${formatINR(cgst)}`, 192, curY, { align: "right" });

    curY += 4.5;
    doc.text(`SGST (${sgstRate}%):`, 114, curY);
    doc.text(`₹ ${formatINR(sgst)}`, 192, curY, { align: "right" });
  }

  // Grand Total line
  curY += 6;
  doc.setFillColor(201, 162, 39);
  doc.roundedRect(112, curY - 3.5, 82, 8, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("GRAND TOTAL (INR):", 115, curY + 2);
  doc.text(`₹ ${formatINR(grandTotal)}`, 192, curY + 2, { align: "right" });

  // Sign-off box on left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(11, 30, 54);
  doc.text("Terms & Conditions:", 14, summaryY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("1. Valid for 30 days from issue date.", 14, summaryY + 10);
  doc.text("2. 50% advance along with confirmed work order.", 14, summaryY + 14);
  doc.text("3. Delivery timeline subject to site readiness.", 14, summaryY + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(11, 30, 54);
  doc.text("For BLACK STONE INTERIORS", 14, summaryY + 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Authorized Signatory", 14, summaryY + 36);

  return doc;
};

/**
 * Safely formats raw quotation or invoice data for PrintableQuotation
 */
export const formatSafeQuoteData = (quoteData = {}) => {
  let items = quoteData.items || [];
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }
  if (!Array.isArray(items)) items = [];

  return {
    customer: quoteData.customer || quoteData.clientName || "",
    clientName: quoteData.clientName || quoteData.customer || "",
    organizationName: quoteData.organizationName || "",
    address: quoteData.address || quoteData.clientAddress || "",
    clientAddress: quoteData.clientAddress || quoteData.address || "",
    projectTitle: quoteData.projectTitle || quoteData.project || "",
    workDescription: quoteData.workDescription || "",
    items,
    quoteNo: quoteData.quoteNo || "",
    date: quoteData.date || quoteData.quoteDate || new Date().toISOString().split("T")[0],
    billType: quoteData.billType || "GST",
    emailId: quoteData.emailId || quoteData.email || "",
    mobileNo: quoteData.mobileNo || quoteData.phone || "",
    customerGst: quoteData.customerGst || quoteData.gstNumber || "",
    deliveryTimeline: quoteData.deliveryTimeline || "3 to 4 Weeks",
    installationMaterial: quoteData.installationMaterial || "",
    deliveryLoading: quoteData.deliveryLoading || "",
    transportationCharges: quoteData.transportationCharges || "",
    additionalDiscount: quoteData.additionalDiscount || "",
    cgstPercent: quoteData.cgstPercent !== undefined ? quoteData.cgstPercent : "9",
    sgstPercent: quoteData.sgstPercent !== undefined ? quoteData.sgstPercent : "9",
    isInterState: Boolean(quoteData.isInterState)
  };
};

/**
 * Captures the exact DOM elements of PrintableQuotation (.print-page) and converts them
 * into a high-resolution, pixel-perfect multi-page PDF matching PrintableQuotation 100%.
 */
export const exportPrintableQuotationToPDF = async (containerOrElement, fileName = "Quotation.pdf") => {
  if (!containerOrElement) {
    throw new Error("Container element not provided");
  }

  // Find all .print-page elements
  const pages = containerOrElement.querySelectorAll
    ? Array.from(containerOrElement.querySelectorAll(".print-page"))
    : (containerOrElement.classList?.contains("print-page") ? [containerOrElement] : []);

  if (!pages || pages.length === 0) {
    throw new Error("No .print-page elements found inside container");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];
    
    // toJpeg from html-to-image with skipFonts: true natively renders oklch, gradients,
    // and avoids CORS / SecurityError on external stylesheet rules like Google Fonts!
    const imgData = await toJpeg(pageEl, {
      quality: 0.95,
      pixelRatio: 2, // 2x gives 300 DPI high-definition clarity
      backgroundColor: "#ffffff",
      skipFonts: true,
      cacheBust: false
    });

    if (i > 0) {
      pdf.addPage("a4", "portrait");
    }
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
  }

  pdf.save(fileName);
  return pdf;
};

/**
 * Downloads the exact PrintableQuotation as a PDF.
 * If targetElement is provided, captures it directly.
 * Otherwise, temporarily mounts PrintableQuotation into an offscreen container,
 * generates the 1:1 PDF, and cleans up.
 */
export const downloadQuotationPDF = async (data = {}, targetElement = null) => {
  const safeData = formatSafeQuoteData(data);
  const docNo = (safeData.quoteNo || "Quotation").replace(/[^a-zA-Z0-9_-]/g, "_");
  const client = (safeData.clientName || "Client").replace(/\s+/g, "_");
  const fileName = `${docNo}_${client}.pdf`;

  // 1. If targetElement is provided and has .print-page elements, export directly
  if (targetElement && (targetElement.classList?.contains("print-page") || targetElement.querySelector?.(".print-page"))) {
    return await exportPrintableQuotationToPDF(targetElement, fileName);
  }

  // 2. Otherwise, create a clean offscreen container with exact A4 width
  const container = document.createElement("div");
  container.className = "bsi-offscreen-pdf-exporter";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.zIndex = "-9999";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(React.createElement(PrintableQuotation, { data: safeData }));

  // Wait for React to render and DOM layout to calculate
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    return await exportPrintableQuotationToPDF(container, fileName);
  } finally {
    try {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    } catch {
      // Ignore unmount cleanup error
    }
  }
};

/**
 * Opens and views the quotation PDF preview.
 */
export const viewQuotationPDF = (data = {}) => {
  return downloadQuotationPDF(data);
};
