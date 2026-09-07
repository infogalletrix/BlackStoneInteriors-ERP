import { forwardRef } from "react";

const PrintableQuotation = forwardRef(({ data }, ref) => {
  const safeData = data || {};
  const items = safeData.items || [];

  // Group items by section
  const groupedItems = items.reduce((acc, item) => {
    const sec = item.section || "General";
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(item);
    return acc;
  }, {});

  const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const installation = parseFloat(safeData.installationMaterial || 0);
  const delivery = parseFloat(safeData.deliveryLoading || 0);
  const transport = parseFloat(safeData.transportationCharges || 0);
  const discount = parseFloat(safeData.additionalDiscount || 0);

  const taxableTotal = Math.max(0, subTotal + installation + delivery + transport - discount);

  const isGST = safeData.billType === "GST";
  const isInterState = safeData.isInterState;
  const cgstRate = safeData.cgstPercent !== undefined && safeData.cgstPercent !== "" ? parseFloat(safeData.cgstPercent || 0) : 9;
  const sgstRate = safeData.sgstPercent !== undefined && safeData.sgstPercent !== "" ? parseFloat(safeData.sgstPercent || 0) : 9;
  const igstRate = cgstRate + sgstRate;

  const sgst = (isGST && !isInterState) ? (taxableTotal * sgstRate) / 100 : 0;
  const cgst = (isGST && !isInterState) ? (taxableTotal * cgstRate) / 100 : 0;
  const igst = (isGST && isInterState) ? (taxableTotal * igstRate) / 100 : 0;
  const grandTotal = taxableTotal + sgst + cgst + igst;

  return (
    <div
      ref={ref}
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
      className="p-8 bg-white text-slate-800 font-sans w-[210mm] min-h-[297mm] flex flex-col justify-between mx-auto text-[10px] relative overflow-hidden"
    >
      {/* ── TOP DECORATIVE ACCENT CURVE (Matching Reference 1 & 2) ── */}
      <div className="absolute top-0 right-0 w-80 h-44 bg-gradient-to-bl from-[#0d5c63]/25 via-[#1982c4]/15 to-transparent rounded-bl-[140px] pointer-events-none -z-0" />
      <div className="absolute top-0 right-0 w-48 h-28 bg-gradient-to-bl from-[#0b1e36]/15 to-transparent rounded-bl-[100px] pointer-events-none -z-0" />

      <div>
        {/* ── HEADER ── */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200 relative z-10">
          {/* Company Info & Logo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-900 rounded-2xl p-2.5 flex items-center justify-center shadow-md">
              <img
                src="/logo.png"
                alt="Black Stone Interiors"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = '<span class="text-white font-black text-xl tracking-tighter">BSI</span>';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-[#0b1e36] uppercase">
                BLACK STONE INTERIORS
              </h1>
              <p className="text-slate-500 font-medium text-[9px] mt-0.5">
                Plot No 72 Sector 6 IMT Manesar, Haryana 122050
              </p>
              <div className="flex items-center gap-3 text-slate-600 text-[9px] font-semibold mt-1.5">
                <span className="flex items-center gap-1">
                  📞 +91 9555174096
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  ✉️ Nakul.blackstoneinterior@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Document Title & Meta Pill */}
          <div className="text-right">
            <h2 className="text-2xl font-black text-[#0b1e36] tracking-tight uppercase mb-2">
              QUOTATION
            </h2>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 shadow-sm text-right space-y-1 min-w-[170px]">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[8.5px]">Quote No:</span>
                <span className="font-black text-[#0b1e36] text-[10.5px] tracking-wide">{safeData.quoteNo || "—"}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[8.5px]">Date:</span>
                <span className="font-bold text-slate-700">
                  {safeData.date ? new Date(safeData.date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[8.5px]">Type:</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                  isGST ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}>
                  {isGST ? "GST Billing" : "Non-GST"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CLIENT & PROJECT METADATA (Two-Card Layout) ── */}
        <div className="grid grid-cols-2 gap-4 my-5">
          {/* Card 1: Client Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
              <span className="text-[9px] font-extrabold text-[#0d5c63] uppercase tracking-wider">
                Quotation Issued To
              </span>
              <span className="text-[8px] text-slate-400 font-semibold uppercase">Client Details</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-black text-slate-900 leading-tight">
                {safeData.customer || "Valued Client"}
              </div>
              {safeData.organizationName && (
                <div className="text-[9.5px] font-bold text-slate-600">
                  {safeData.organizationName}
                </div>
              )}
              {safeData.address && (
                <div className="text-[9px] text-slate-600 leading-relaxed pt-0.5">
                  📍 {safeData.address}
                </div>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 pt-1 text-[8.5px] text-slate-600 font-semibold">
                {safeData.mobileNo && (
                  <span>📞 +91 {safeData.mobileNo}</span>
                )}
                {safeData.emailId && (
                  <span>✉️ {safeData.emailId}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Project & Delivery Specs */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
              <span className="text-[9px] font-extrabold text-[#0d5c63] uppercase tracking-wider">
                Project & Delivery Details
              </span>
              <span className="text-[8px] text-slate-400 font-semibold uppercase">Terms & Timeline</span>
            </div>
            <div className="grid grid-cols-[105px_auto] gap-y-1.5 text-[9px]">
              {safeData.projectTitle && (
                <>
                  <span className="text-slate-500 font-bold">Project Name:</span>
                  <span className="font-black text-slate-800">{safeData.projectTitle}</span>
                </>
              )}
              <span className="text-slate-500 font-bold">Delivery Timeline:</span>
              <span className="font-bold text-[#0b1e36]">
                {safeData.deliveryTimeline || "3 to 4 Weeks"}
              </span>

              {safeData.customerGst && (
                <>
                  <span className="text-slate-500 font-bold">Customer GSTIN:</span>
                  <span className="font-bold text-slate-800 uppercase tracking-wide">
                    {safeData.customerGst}
                  </span>
                </>
              )}

              {safeData.workDescription && (
                <>
                  <span className="text-slate-500 font-bold">Work Scope:</span>
                  <span className="text-slate-700 leading-snug">{safeData.workDescription}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── LINE ITEMS TABLE (Inspired by Reference Images 1 & 3) ── */}
        <div className="space-y-4 mb-6">
          {Object.entries(groupedItems).map(([sectionName, secItems], sIdx) => {
            const secTotal = secItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            return (
              <div key={sIdx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Section Sub-Header Bar */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0d5c63]"></span>
                    <span className="font-black text-[10px] text-[#0b1e36] uppercase tracking-wider">
                      {sectionName}
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-[#0d5c63]">
                    Section Subtotal: INR {secTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Table */}
                <table className="w-full border-collapse text-[9px]">
                  <thead>
                    <tr className="bg-[#0b1e36] text-white font-bold text-[8.5px] uppercase tracking-wider">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2 text-left w-36">Product</th>
                      <th className="py-2 px-2 text-left">Specification</th>
                      <th className="py-2 px-2 text-center w-12">Qty</th>
                      <th className="py-2 px-2 text-center w-12">UOM</th>
                      <th className="py-2 px-2 text-right w-20">Unit Rate</th>
                      <th className="py-2 px-2 text-right w-24">Disc. Rate</th>
                      <th className="py-2 px-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {secItems.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                        <td className="py-1.5 px-2 text-center align-top text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 align-top font-bold text-slate-900">
                          {item.product || "—"}
                        </td>
                        <td className="py-1.5 px-2 align-top text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {item.specification || "—"}
                        </td>
                        <td className="py-1.5 px-2 text-center align-top font-semibold text-slate-700">
                          {item.qty || "—"}
                        </td>
                        <td className="py-1.5 px-2 text-center align-top text-slate-500 font-medium">
                          {item.unit || "Sq.Ft"}
                        </td>
                        <td className="py-1.5 px-2 text-right align-top text-slate-600">
                          {item.rate ? `₹${parseFloat(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "Incl."}
                        </td>
                        <td className="py-1.5 px-2 text-right align-top">
                          {item.discountPrice ? (
                            item.discountPercent && parseFloat(item.discountPercent) > 0 ? (
                              <div>
                                <div className="font-semibold text-slate-800">
                                  ₹{parseFloat(item.discountPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </div>
                                <span className="text-[7.5px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded inline-block">
                                  -{item.discountPercent}%
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-slate-800">
                                ₹{parseFloat(item.discountPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </span>
                            )
                          ) : "Incl."}
                        </td>
                        <td className="py-1.5 px-2 text-right align-top font-black text-slate-900">
                          {item.amount ? `₹${parseFloat(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "Incl."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* ── FINANCIAL SUMMARY & POLICIES (Two Column Grid) ── */}
        <div className="grid grid-cols-2 gap-5 items-start">
          {/* Left Column: Bank Details, Terms, Payment Plan */}
          <div className="space-y-3.5">
            {/* Bank / Fund Transfer Information Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-[#0b1e36] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                <span>🏦</span>
                <span>Bank Transfer Details</span>
              </div>
              <div className="grid grid-cols-[105px_auto] gap-y-1 text-[8.5px]">
                <span className="text-slate-500 font-semibold">Bank Name:</span>
                <span className="font-bold text-slate-900">YES BANK</span>
                <span className="text-slate-500 font-semibold">Account Name:</span>
                <span className="font-bold text-slate-900">BLACK STONE INTERIOR</span>
                <span className="text-slate-500 font-semibold">Account No:</span>
                <span className="font-mono font-bold text-[#0b1e36] text-[9.5px]">072261900003797</span>
                <span className="text-slate-500 font-semibold">IFSC Code:</span>
                <span className="font-mono font-bold text-[#0d5c63]">YESB0000722</span>
              </div>
            </div>

            {/* Terms & Conditions Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm text-[8.5px]">
              <div className="text-[9px] font-black text-[#0b1e36] uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
                Terms & Conditions
              </div>
              <ol className="list-decimal pl-3.5 space-y-0.5 text-slate-600 leading-tight font-medium">
                <li>Above quotation estimate is valid for 30 days from date of issue.</li>
                <li>Delivery Timeline: 3 to 4 Weeks from final drawing sign-off.</li>
                <li>Comprehensive 7 Years warranty on woodwork; OEM warranty on hardware.</li>
                <li>All payments to be made in favour of <strong>"Black Stone Interiors"</strong>.</li>
              </ol>
            </div>

            {/* Digital Verification & System Generated Note */}
            <div className="pt-2 flex justify-between items-end pr-2 border-t border-slate-200/80 mt-2">
              <div className="text-[8px] text-slate-400 font-medium">
                Thank you for choosing Black Stone Interiors!
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-[8.5px] font-bold">
                  <span>✓</span>
                  <span>Digitally Approved by Authorised Signatory</span>
                </div>
                <p className="text-[7.5px] text-slate-400 mt-1 italic">
                  This is a computer-generated document and digitally approved by authorized signatory, hence no physical signature is required.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Financial Breakdown & Payment Plan */}
          <div className="space-y-3.5">
            {/* Financial Breakdown Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-[9px]">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/80">
                    <td className="p-2 font-bold text-slate-600">Sub Total</td>
                    <td className="p-2 text-right font-black text-slate-900">
                      INR {subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-600 font-medium">Installation Material</td>
                    <td className="p-2 text-right font-semibold text-slate-800">
                      {installation ? `INR ${installation.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "Included"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-600 font-medium">Delivery, Loading & Unloading</td>
                    <td className="p-2 text-right font-semibold text-slate-800">
                      {delivery ? `INR ${delivery.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "Included"}
                    </td>
                  </tr>
                  {transport > 0 && (
                    <tr>
                      <td className="p-2 text-slate-600 font-medium">Transportation Charges</td>
                      <td className="p-2 text-right font-semibold text-slate-800">
                        INR {transport.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {discount > 0 && (
                    <tr className="text-rose-600">
                      <td className="p-2 font-semibold">Additional Discount</td>
                      <td className="p-2 text-right font-bold">
                        - INR {discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="p-2 text-[#0d5c63]">Taxable Total</td>
                    <td className="p-2 text-right text-[#0d5c63]">
                      INR {taxableTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {isGST && !isInterState && (
                    <>
                      <tr>
                        <td className="p-2 text-slate-600 font-medium">CGST @ {cgstRate}%</td>
                        <td className="p-2 text-right font-semibold text-slate-800">
                          INR {cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-medium">SGST @ {sgstRate}%</td>
                        <td className="p-2 text-right font-semibold text-slate-800">
                          INR {sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </>
                  )}
                  {isGST && isInterState && (
                    <tr>
                      <td className="p-2 text-slate-600 font-medium">IGST @ {igstRate}%</td>
                      <td className="p-2 text-right font-semibold text-slate-800">
                        INR {igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Grand Total Highlight Badge */}
              <div className="bg-[#0b1e36] text-white p-3 flex justify-between items-center">
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-slate-300 font-bold">
                    {isGST ? "Estimated Total (Incl. GST)" : "Estimated Grand Total"}
                  </div>
                  <div className="text-[7.5px] text-teal-300 font-medium">
                    {isGST ? `Inclusive of ${cgstRate + sgstRate}% GST` : "Zero Tax Non-GST Quote"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black tracking-tight text-white">
                    INR {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Schedule Plan */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm text-[8.5px]">
              <div className="text-[9px] font-black text-[#0b1e36] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Standard Payment Plan
              </div>
              <div className="space-y-1 font-semibold">
                <div className="flex justify-between text-slate-700">
                  <span>1. 10% on Booking</span>
                  <span className="font-bold text-slate-900">
                    INR {(grandTotal * 0.1).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>2. 40% on Production Start</span>
                  <span className="font-bold text-slate-900">
                    INR {(grandTotal * 0.4).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>3. 40% Before Dispatch</span>
                  <span className="font-bold text-slate-900">
                    INR {(grandTotal * 0.4).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>4. 10% on Handover</span>
                  <span className="font-bold text-slate-900">
                    INR {(grandTotal * 0.1).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BRAND BANNER (Inspired by Reference Images 1 & 2) ── */}
      <div className="mt-8 pt-3 border-t border-slate-200">
        <div className="bg-gradient-to-r from-[#0b1e36] via-[#0d5c63] to-[#0b1e36] text-white rounded-xl px-4 py-2 flex flex-wrap justify-between items-center text-[8.5px] font-semibold shadow-md">
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>Plot No 72 Sector 6 IMT Manesar, Haryana 122050</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📞</span>
            <span>+91 9555174096</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>✉️</span>
            <span>Nakul.blackstoneinterior@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintableQuotation;
