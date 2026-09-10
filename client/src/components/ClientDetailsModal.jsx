import React, { useEffect } from "react";
import { X, Check, Building, Phone, Mail, FileText, Calendar, MapPin, Briefcase } from "lucide-react";

export default function ClientDetailsModal({
  isOpen,
  onClose,
  organizationName,
  setOrganizationName,
  mobileNo,
  setMobileNo,
  emailId,
  setEmailId,
  customerGst,
  setCustomerGst,
  deliveryTimeline,
  setDeliveryTimeline,
  clientAddress,
  setClientAddress,
  projectTitle,
  setProjectTitle
}) {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold brand gradient header */}
        <div className="bg-gradient-to-r from-[#B8911F] via-[#C9A227] to-[#D4AF37] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Building size={18} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide uppercase">
                Client & Project Details
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                Contact information, site location, GST, and project details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Row 1: Project Title & Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Building size={12} className="text-amber-600 dark:text-[var(--accent)]" /> Project Title
              </label>
              <input
                placeholder="e.g. 3BHK Apartment Interior"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] font-bold transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Briefcase size={12} className="text-amber-600 dark:text-[var(--accent)]" /> Organization Name (Optional)
              </label>
              <input
                placeholder="e.g. Acme Corporation"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] transition"
              />
            </div>
          </div>

          {/* Row 2: Mobile No & Email ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Phone size={12} className="text-blue-500" /> Mobile No
              </label>
              <input
                placeholder="+91..."
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Mail size={12} className="text-rose-500" /> Email ID
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] transition"
              />
            </div>
          </div>

          {/* Row 3: Customer GST & Delivery Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <FileText size={12} className="text-emerald-500" /> Customer GST
              </label>
              <input
                placeholder="GSTIN..."
                value={customerGst}
                onChange={(e) => setCustomerGst(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-violet-500" /> Delivery Timeline
              </label>
              <input
                placeholder="3 to 4 Weeks"
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
                className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] transition"
              />
            </div>
          </div>

          {/* Row 4: Site Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-amber-600 dark:text-[var(--accent)]" /> Site Address
            </label>
            <textarea
              rows={2}
              placeholder="Work site / project address..."
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full themed-input border border-[var(--border-color)] px-3 py-2 text-sm rounded-lg outline-none focus:border-[#C9A227] transition resize-y"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[var(--bg-surface)] px-6 py-3.5 border-t border-[var(--border-color)] flex justify-end gap-3 items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#B8911F] via-[#C9A227] to-[#D4AF37] hover:opacity-90 shadow-md transition flex items-center gap-1.5"
          >
            <Check size={14} /> Done
          </button>
        </div>
      </div>
    </div>
  );
}
