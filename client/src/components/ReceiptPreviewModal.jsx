import React from "react";
import { Printer, X, Pencil, CheckCircle2, FileText, Calendar, Building, User, CreditCard, Tag } from "lucide-react";

export default function ReceiptPreviewModal({ receipt, onClose, onPrint, onEdit }) {
  if (!receipt) return null;

  const formattedDate = receipt.date ? new Date(receipt.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "—";

  const amount = parseFloat(receipt.amountPaid || receipt.totalAmount || 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Partial":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "Draft":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      default:
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 text-themed rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden border border-[var(--border-color)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex justify-between items-center border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-2xl">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white tracking-tight">{receipt.receiptNo}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(receipt.status)}`}>
                  {receipt.status || "Completed"}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium mt-0.5 flex items-center gap-2">
                <Calendar size={12} /> {formattedDate}
                {receipt.siteId && (
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-bold">
                    WO: {receipt.siteId}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrint && receipt.status !== "Draft" && (
              <button
                onClick={() => onPrint(receipt)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Printer size={14} /> Print
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(receipt);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Styled Official Receipt Card */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
          {/* Company Branding & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[var(--border-color)] gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-slate-900 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = '<span class="text-white font-black text-sm">BSI</span>';
                  }}
                />
              </div>
              <div>
                <h4 className="font-black text-themed text-base uppercase tracking-tight">
                  Black Stone Interiors
                </h4>
                <p className="text-[11px] text-muted font-medium">Official Payment Receipt</p>
                <p className="text-[10px] text-muted">GSTIN: 06ABFFB6382G1ZF</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted block">Amount Paid</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">
                ₹ {amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Info */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 mb-1.5">
                <User size={12} className="text-[var(--accent)]" /> Received From
              </p>
              <p className="font-black text-themed text-base">{receipt.clientName || "—"}</p>
              {receipt.organizationName && (
                <p className="text-xs font-bold text-muted mt-0.5 flex items-center gap-1">
                  <Building size={11} /> {receipt.organizationName}
                </p>
              )}
              {receipt.siteName && (
                <p className="text-[11px] text-muted mt-1 font-medium">
                  Project: {receipt.siteName}
                </p>
              )}
            </div>

            {/* Payment Mode & Category */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 mb-1.5">
                    <CreditCard size={12} className="text-[var(--accent)]" /> Mode
                  </p>
                  <p className="font-bold text-themed text-sm">{receipt.paymentMode || "Cash"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 mb-1.5">
                    <Tag size={12} className="text-[var(--accent)]" /> Category
                  </p>
                  <p className="font-bold text-themed text-sm">{receipt.category || "Payment"}</p>
                </div>
              </div>
              {receipt.siteId && (
                <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[11px] text-muted font-medium">
                  Work Order Ref: <strong className="text-themed font-bold">#{receipt.siteId}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Description & Remarks */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[var(--border-color)] space-y-3 shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                Towards (Description)
              </p>
              <p className="text-sm font-medium text-themed">
                {receipt.description || "No description provided"}
              </p>
            </div>

            {receipt.comments && (
              <div className="pt-3 border-t border-[var(--border-color)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                  Remarks / Comments
                </p>
                <p className="text-xs text-muted italic font-medium">
                  "{receipt.comments}"
                </p>
              </div>
            )}
          </div>

          {/* Status Note */}
          <div className="p-3 rounded-2xl bg-white/5 border border-[var(--border-color)] flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Computer-generated official receipt
            </span>
            <span className="font-mono text-[10px]">
              ID: {receipt.id}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-muted border border-[var(--border-color)] hover:bg-white/5 transition"
          >
            Close
          </button>
          {onPrint && receipt.status !== "Draft" && (
            <button
              type="button"
              onClick={() => onPrint(receipt)}
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider btn-accent flex items-center gap-1.5 shadow-md transition"
            >
              <Printer size={14} /> Print Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
