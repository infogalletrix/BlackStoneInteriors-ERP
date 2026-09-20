import { useState, useEffect, useRef } from "react";
import { X, Printer, Download, ZoomIn, ZoomOut, RotateCcw, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PrintableQuotation from "./PrintableQuotation";
import { exportPrintableQuotationToPDF, downloadQuotationPDF } from "../utils/quotationPdfGenerator";

export default function QuotationPdfPreviewModal({
  isOpen,
  onClose,
  quoteData,
  onPrint
}) {
  if (!isOpen || !quoteData) return null;

  const documentCanvasRef = useRef(null);
  const printContentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Format data for PrintableQuotation
  const safeData = {
    customer: quoteData.customer || quoteData.clientName || "",
    clientName: quoteData.clientName || quoteData.customer || "",
    organizationName: quoteData.organizationName || "",
    address: quoteData.address || quoteData.clientAddress || "",
    clientAddress: quoteData.clientAddress || quoteData.address || "",
    projectTitle: quoteData.projectTitle || quoteData.project || "",
    workDescription: quoteData.workDescription || "",
    items: quoteData.items || [],
    quoteNo: quoteData.quoteNo || "",
    date: quoteData.date || quoteData.quoteDate || "",
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
    sgstPercent: quoteData.sgstPercent !== undefined ? quoteData.sgstPercent : "9"
  };

  // Dedicated react-to-print handler
  const handleReactToPrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: `${(safeData.quoteNo || "Quotation").replace(/[^a-zA-Z0-9_-]/g, "_")}_${(safeData.clientName || "Client").replace(/\s+/g, "_")}`,
    preserveAfterPrint: true,
  });

  // Determine initial zoom level based on device screen width
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const initialZoom = isMobile
    ? Math.max(0.42, Math.min(0.65, (window.innerWidth - 32) / 794)) // 794px is approx 210mm at 96dpi
    : 1.0;

  const [zoom, setZoom] = useState(initialZoom);

  // Print handler using standard react-to-print
  const handlePrintDocument = () => {
    if (onPrint) {
      onPrint(safeData);
      return;
    }
    handleReactToPrint();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (!documentCanvasRef.current) {
        await downloadQuotationPDF(safeData);
        return;
      }

      const docNo = (safeData.quoteNo || "Quotation").replace(/[^a-zA-Z0-9_-]/g, "_");
      const client = (safeData.clientName || "Client").replace(/\s+/g, "_");
      const fileName = `${docNo}_${client}.pdf`;

      // Temporarily remove transform on the zoom wrapper so it renders true 210mm x 297mm A4 geometry
      const originalTransform = documentCanvasRef.current.style.transform;
      documentCanvasRef.current.style.transform = "none";

      await exportPrintableQuotationToPDF(documentCanvasRef.current, fileName);

      documentCanvasRef.current.style.transform = originalTransform;
    } catch (err) {
      console.error("Failed to export exact printable quote to PDF from canvas, rendering offscreen:", err);
      await downloadQuotationPDF(safeData);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
      {/* ── TOP PDF VIEWER TOOLBAR ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wide truncate">
                {safeData.quoteNo ? `Quotation #${safeData.quoteNo}` : "Quotation Preview"}
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Printable PDF Format
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {safeData.clientName ? `${safeData.clientName} ${safeData.projectTitle ? `• ${safeData.projectTitle}` : ""}` : "Estimate Document"}
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(0.35, prev - 0.1))}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="px-2 text-xs font-black text-slate-300 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(1.8, prev + 0.1))}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(initialZoom)}
            className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition text-xs font-bold"
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrintDocument}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-[0.98] cursor-pointer"
            title="Print or AirPrint Document"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#C9A227] hover:bg-[#B8911F] active:bg-[#A8811A] text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Download PDF matching the printable quote"
          >
            {isDownloading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span className="hidden sm:inline">Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span className="hidden sm:inline">Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Preview"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── MOBILE ZOOM BAR (Visible on small screens) ── */}
      <div className="sm:hidden bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400">
        <span className="font-bold">A4 PDF Preview</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(0.35, prev - 0.1))}
            className="px-2 py-0.5 bg-slate-800 rounded font-black text-white"
          >
            -
          </button>
          <span className="font-mono text-white">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(1.8, prev + 0.1))}
            className="px-2 py-0.5 bg-slate-800 rounded font-black text-white"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(initialZoom)}
            className="px-2 py-0.5 bg-slate-800 rounded font-bold text-slate-300"
          >
            Fit
          </button>
        </div>
      </div>

      {/* ── DOCUMENT CANVAS (Scrollable viewport for A4 sheets) ── */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center bg-slate-900/60 select-text">
        <div
          ref={documentCanvasRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            marginBottom: `${Math.max(40, 100 * zoom)}px`
          }}
          className="transition-transform duration-150 ease-out"
        >
          <PrintableQuotation data={safeData} />
        </div>
      </div>

      {/* ── CLEAN OFFSCREEN PRINT CONTAINER (react-to-print) ── */}
      <div className="fixed top-0 -left-[99999px] pointer-events-none print:hidden" style={{ zIndex: -100, opacity: 0 }} aria-hidden="true">
        <PrintableQuotation ref={printContentRef} data={safeData} />
      </div>
    </div>
  );
}
