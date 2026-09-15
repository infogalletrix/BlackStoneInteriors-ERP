import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";
import React from "react";
import { createRoot } from "react-dom/client";
import PrintableReceipt from "../components/PrintableReceipt";

/**
 * Derives a clean filename for single or bulk receipt PDF downloads.
 */
export const getReceiptFileName = (receiptOrList) => {
  if (Array.isArray(receiptOrList)) {
    if (receiptOrList.length === 1) {
      return getReceiptFileName(receiptOrList[0]);
    }
    return `Payment_Receipts_Export_${receiptOrList.length}_Items.pdf`;
  }
  const r = receiptOrList || {};
  const no = (r.receiptNo || "Receipt").replace(/[^a-zA-Z0-9_-]/g, "_");
  const client = (r.clientName || "Client").trim().replace(/\s+/g, "_");
  return `Receipt_${no}_${client}.pdf`;
};

/**
 * Captures rendered DOM elements of PrintableReceipt and compiles them into a
 * high-definition, pixel-perfect A4 PDF matching PrintableReceipt 100%.
 */
export const exportPrintableReceiptToPDF = async (containerOrElement, fileName = "Receipt.pdf") => {
  if (!containerOrElement) {
    throw new Error("Container element not provided");
  }

  // Find all .receipt-page elements (or fall back to the container itself)
  const pages = containerOrElement.querySelectorAll
    ? Array.from(containerOrElement.querySelectorAll(".receipt-page"))
    : (containerOrElement.classList?.contains("receipt-page") ? [containerOrElement] : []);

  const targetElements = pages.length > 0 ? pages : [containerOrElement];

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  for (let i = 0; i < targetElements.length; i++) {
    const pageEl = targetElements[i];

    // toJpeg with skipFonts: true renders flawlessly without external font CORS issues
    const imgData = await toJpeg(pageEl, {
      quality: 0.95,
      pixelRatio: 2, // 300 DPI high-definition clarity
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
 * Builds an identical jsPDF instance from DOM, using an active targetElement if supplied
 * or dynamically mounting PrintableReceipt into a temporary offscreen container.
 */
export const buildReceiptPDFFromDOM = async (receiptOrList, targetElement = null) => {
  const dataList = Array.isArray(receiptOrList) ? receiptOrList : [receiptOrList];

  // 1. If targetElement has .receipt-page elements, export directly
  if (targetElement) {
    const pages = targetElement.querySelectorAll
      ? Array.from(targetElement.querySelectorAll(".receipt-page"))
      : [];
    const targetElements = pages.length > 0 ? pages : [targetElement];

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    for (let i = 0; i < targetElements.length; i++) {
      const pageEl = targetElements[i];
      const imgData = await toJpeg(pageEl, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: true,
        cacheBust: false
      });
      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }
    return pdf;
  }

  // 2. Otherwise render offscreen with PrintableReceipt
  const container = document.createElement("div");
  container.className = "bsi-offscreen-receipt-pdf-exporter";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.zIndex = "-9999";
  container.style.background = "#ffffff";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(React.createElement(PrintableReceipt, { receipts: dataList }));

  // Wait for React to render and images (e.g. /logo.png) to be fully loaded
  await new Promise((resolve) => setTimeout(resolve, 350));
  const imgs = container.querySelectorAll("img");
  await Promise.all(
    Array.from(imgs).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  try {
    const pages = Array.from(container.querySelectorAll(".receipt-page"));
    const targetElements = pages.length > 0 ? pages : [container];

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    for (let i = 0; i < targetElements.length; i++) {
      const pageEl = targetElements[i];
      const imgData = await toJpeg(pageEl, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: true,
        cacheBust: false
      });
      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }

    return pdf;
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
 * Downloads the payment receipt PDF identical to PrintableReceipt.
 */
export const downloadReceiptPDF = async (receiptOrList, targetElement = null) => {
  const fileName = getReceiptFileName(receiptOrList);
  const pdf = await buildReceiptPDFFromDOM(receiptOrList, targetElement);
  pdf.save(fileName);
  return pdf;
};

/**
 * Opens and views the receipt PDF in a new browser tab/window.
 */
export const viewReceiptPDF = async (receiptOrList, targetElement = null) => {
  const pdf = await buildReceiptPDFFromDOM(receiptOrList, targetElement);
  const blobUrl = pdf.output("bloburl");
  window.open(blobUrl, "_blank");
  return pdf;
};
