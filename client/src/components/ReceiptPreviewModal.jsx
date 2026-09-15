import React, { useState, useRef } from "react";
import {
  Printer,
  Download,
  ExternalLink,
  X,
  Pencil,
  FileText,
  Calendar,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import PrintableReceipt from "./PrintableReceipt";
import { downloadReceiptPDF, viewReceiptPDF, getReceiptFileName } from "../utils/receiptPdfGenerator";

export default function ReceiptPreviewModal({ receipt, onClose, onPrint, onEdit, onDownload }) {
  if (!receipt) return null;

  const documentCanvasRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const formattedDate = receipt.date
    ? new Date(receipt.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—";

  // Initial responsive zoom based on window width (794px is approx 210mm at 96dpi)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const initialZoom = isMobile
    ? Math.max(0.42, Math.min(0.65, (window.innerWidth - 32) / 794))
    : 0.95;

  const [zoom, setZoom] = useState(initialZoom);

  const handlePrint = () => {
    if (onPrint) {
      onPrint(receipt);
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (documentCanvasRef.current) {
        const originalTransform = documentCanvasRef.current.style.transform;
        documentCanvasRef.current.style.transform = "none";
        await downloadReceiptPDF(receipt, documentCanvasRef.current);
        documentCanvasRef.current.style.transform = originalTransform;
      } else {
        await downloadReceiptPDF(receipt);
      }
    } catch (err) {
      console.error("Failed to download receipt PDF from canvas, falling back:", err);
      await downloadReceiptPDF(receipt);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Partial":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Draft":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      default:
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
      {/* ── TOP RECEIPT VIEWER TOOLBAR ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wide truncate">
                {receipt.receiptNo ? `Receipt #${receipt.receiptNo}` : "Receipt Preview"}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(receipt.status)}`}>
                {receipt.status || "Completed"}
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Official Printable Format
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
              <span>{receipt.clientName || "Valued Client"}</span>
              {receipt.organizationName && <span>• {receipt.organizationName}</span>}
              {receipt.siteId && (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded font-bold">
                  WO: {receipt.siteId}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar size={11} /> {formattedDate}
              </span>
            </p>
          </div>
        </div>

        {/* Zoom Controls (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(0.35, prev - 0.1))}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="px-2 text-xs font-black text-slate-300 min-w-[50px] text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(1.8, prev + 0.1))}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(initialZoom)}
            className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition text-xs font-bold cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => viewReceiptPDF(receipt)}
            className="hidden lg:flex bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl font-bold text-xs items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Open PDF in new tab"
          >
            <ExternalLink size={14} />
            <span>Open PDF</span>
          </button>

          {onPrint && receipt.status !== "Draft" && (
            <button
              type="button"
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-[0.98] cursor-pointer"
              title="Print Receipt Document"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#C9A227] hover:bg-[#B8911F] active:bg-[#A8811A] text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Download PDF matching the printable receipt"
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

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(receipt);
              }}
              className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl font-bold text-xs items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Edit Receipt"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
          )}

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

      {/* ── MOBILE ZOOM BAR ── */}
      <div className="sm:hidden bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400">
        <span className="font-bold">Receipt Preview</span>
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

      {/* ── DOCUMENT CANVAS (Scrollable viewport for exact PrintableReceipt) ── */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center bg-slate-900/60 select-text">
        <div
          ref={documentCanvasRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            marginBottom: `${Math.max(40, 80 * zoom)}px`
          }}
          className="transition-transform duration-150 ease-out shadow-2xl rounded-sm"
        >
          <PrintableReceipt receipt={receipt} />
        </div>
      </div>
    </div>
  );
}
