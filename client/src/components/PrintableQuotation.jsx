import { forwardRef } from "react";

const PrintableQuotation = forwardRef(({ data }, ref) => {
  const safeData = data || {};
  const items = safeData.items || [];

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

  // Format currency with Indian locale (lakhs, crores, thousands)
  const fmt = (val) => {
    return Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ── REUSABLE UI BLOCKS ──────────────────────────────────────────

  // 1. Decorative Accent Curves
  const renderDecorativeCurves = () => (
    <>
      <div className="absolute top-0 right-0 w-80 h-44 bg-gradient-to-bl from-[#0d5c63]/25 via-[#1982c4]/15 to-transparent rounded-bl-[140px] pointer-events-none -z-0" />
      <div className="absolute top-0 right-0 w-48 h-28 bg-gradient-to-bl from-[#0b1e36]/15 to-transparent rounded-bl-[100px] pointer-events-none -z-0" />
    </>
  );

  // 2. Primary Header (Used consistently on ALL pages)
  const renderPrimaryHeader = (pageNumber = 1, totalPages = 1) => (
    <div className="flex justify-between items-start pb-4 border-b border-slate-200 relative z-10">
      {/* Company Info & Logo */}
      <div className="flex items-center gap-3.5">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl p-2 flex items-center justify-center shadow-md">
          <img
            src="/logo.png"
            alt="Black Stone Interiors"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<span class="text-white font-black text-lg tracking-tighter">BSI</span>';
            }}
          />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-wider text-[#0b1e36] uppercase">
            BLACK STONE INTERIORS
          </h1>
          <p className="text-slate-500 font-medium text-[8.5px] mt-0.5">
            Plot No 72 Sector 6 IMT Manesar, Haryana 122050
          </p>
          <div className="flex items-center gap-2.5 text-slate-600 text-[8.5px] font-semibold mt-1">
            <span>📞 +91 9555174096</span>
            <span className="text-slate-300">•</span>
            <span>✉️ Nakul.blackstoneinterior@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Document Title & Meta Box */}
      <div className="text-right">
        <h2 className="text-xl font-black text-[#0b1e36] tracking-tight uppercase mb-1.5">
          QUOTATION
        </h2>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 shadow-sm text-right space-y-0.5 min-w-[155px]">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[8px]">Quote No:</span>
            <span className="font-black text-[#0b1e36] text-[9.5px] tracking-wide">{safeData.quoteNo || "—"}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[8px]">Date:</span>
            <span className="font-bold text-slate-700 text-[8.5px]">
              {safeData.date ? new Date(safeData.date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[8px]">Type:</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[7.5px] font-extrabold uppercase ${
              isGST ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900 border border-amber-300/80"
            }`}>
              {isGST ? "GST Billing" : "GST - Extra"}
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center gap-2 pt-0.5 border-t border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase text-[7.5px]">Page:</span>
              <span className="font-black text-slate-600 text-[8px]">
                {pageNumber} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 3. Client & Project Details Box (Page 1)
  const renderClientProjectDetails = () => (
    <div className="grid grid-cols-2 gap-3.5 my-3.5">
      {/* Client Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1.5">
          <span className="text-[8.5px] font-extrabold text-[#0d5c63] uppercase tracking-wider">
            Quotation Issued To
          </span>
          <span className="text-[7.5px] text-slate-400 font-semibold uppercase">Client Details</span>
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-900 leading-tight">
            {safeData.customer || "Valued Client"}
          </div>
          {safeData.organizationName && (
            <div className="text-[9px] font-bold text-slate-600">
              {safeData.organizationName}
            </div>
          )}
          {safeData.address && (
            <div className="text-[8.5px] text-slate-600 leading-relaxed pt-0.5">
              📍 {safeData.address}
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5 text-[8px] text-slate-600 font-semibold">
            {safeData.mobileNo && <span>📞 +91 {safeData.mobileNo}</span>}
            {safeData.emailId && <span>✉️ {safeData.emailId}</span>}
          </div>
        </div>
      </div>

      {/* Project Specs */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1.5">
          <span className="text-[8.5px] font-extrabold text-[#0d5c63] uppercase tracking-wider">
            Project & Delivery Details
          </span>
          <span className="text-[7.5px] text-slate-400 font-semibold uppercase">Terms & Timeline</span>
        </div>
        <div className="grid grid-cols-[95px_auto] gap-y-1 text-[8.5px]">
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
  );

  // 4. Work Items Table with continuous serial numbering
  const renderItemsTable = (itemsSlice) => {
    if (!itemsSlice || itemsSlice.length === 0) return null;
    const grouped = itemsSlice.reduce((acc, item) => {
      const sec = item.section || "General";
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-3 mb-4">
        {Object.entries(grouped).map(([sectionName, secItems], sIdx) => {
          const secTotal = secItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
          return (
            <div key={sIdx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* Section Sub-Header Bar */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-3 py-1 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d5c63]"></span>
                  <span className="font-black text-[9.5px] text-[#0b1e36] uppercase tracking-wider">
                    {sectionName}
                  </span>
                </div>
                <span className="text-[8.5px] font-extrabold text-[#0d5c63]">
                  Subtotal: INR {fmt(secTotal)}
                </span>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                    <th className="py-1 px-2 text-center w-7">SI</th>
                    <th className="py-1 px-2 w-28">Product</th>
                    <th className="py-1 px-2">Specification & Material</th>
                    <th className="py-1 px-1.5 text-center w-12">Qty</th>
                    <th className="py-1 px-1.5 text-center w-12">Unit</th>
                    <th className="py-1 px-2 text-right w-20">Rate</th>
                    <th className="py-1 px-2 text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[8.5px]">
                  {secItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-1 px-2 text-center text-slate-400 font-bold">
                        {item._globalIndex !== undefined ? item._globalIndex : idx + 1}
                      </td>
                      <td className="py-1 px-2 align-top font-bold text-slate-900">{item.product || "—"}</td>
                      <td className="py-1 px-2 align-top text-slate-600 leading-snug">{item.specification || "Standard Material & Hardware"}</td>
                      <td className="py-1 px-1.5 text-center align-top font-bold text-slate-800">{item.qty || 1}</td>
                      <td className="py-1 px-1.5 text-center align-top text-slate-500">{item.unit || "Sq.Ft"}</td>
                      <td className="py-1 px-2 text-right align-top font-medium text-slate-700">
                        {item.rate ? `₹${fmt(item.rate)}` : "—"}
                      </td>
                      <td className="py-1 px-2 text-right align-top font-black text-slate-900">
                        {item.amount ? `₹${fmt(item.amount)}` : "Incl."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // 5. Bank Transfer Details Card
  const renderBankDetailsCard = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[8.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
        <span>🏦</span>
        <span>BANK TRANSFER DETAILS</span>
      </div>
      <div className="grid grid-cols-[90px_auto] gap-y-0.5 text-[8px]">
        <span className="text-slate-500 font-semibold">Bank Name:</span>
        <span className="font-bold text-slate-900">YES BANK</span>
        <span className="text-slate-500 font-semibold">Account Name:</span>
        <span className="font-bold text-slate-900">BLACK STONE INTERIOR</span>
        <span className="text-slate-500 font-semibold">Account No:</span>
        <span className="font-mono font-bold text-[#0b1e36] text-[9px]">072261900003797</span>
        <span className="text-slate-500 font-semibold">IFSC Code:</span>
        <span className="font-mono font-bold text-[#0d5c63]">YESB0000722</span>
      </div>
    </div>
  );

  // 6. Terms & Conditions Card
  const renderTermsConditionsCard = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm text-[8px]">
      <div className="text-[8.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-1 border-b border-slate-200 pb-1">
        TERMS & CONDITIONS
      </div>
      <ol className="list-decimal pl-3 space-y-0.5 text-slate-600 leading-tight font-medium text-[7.8px]">
        <li>Above quotation estimate is valid for 30 days from date of issue.</li>
        <li>Delivery Timeline: {safeData.deliveryTimeline || "3 to 4 Weeks from final drawing sign-off."}</li>
        <li>Comprehensive 7 Years warranty on woodwork; OEM warranty on hardware.</li>
        <li>All payments to be made in favour of <strong>"Black Stone Interiors"</strong>.</li>
      </ol>
    </div>
  );

  // 7. Thank you & Digitally Approved Notice Card
  const renderDigitalApprovalCard = () => (
    <div className="pt-2 flex justify-between items-end pr-1 border-t border-slate-200/80 mt-1">
      <div>
        <div className="text-[8px] font-bold text-slate-600 leading-tight">
          Thank you for choosing
        </div>
        <div className="text-[8.5px] font-black text-[#0b1e36] tracking-wide uppercase">
          Black Stone Interiors!
        </div>
      </div>
      <div className="text-right max-w-[270px]">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-[8px] font-bold">
          <span>✓</span>
          <span>Digitally Approved by Authorised Signatory</span>
        </div>
        <p className="text-[7px] text-slate-400 mt-0.5 italic leading-tight">
          This is a computer-generated document and digitally approved by authorized signatory, hence no physical signature is required.
        </p>
      </div>
    </div>
  );

  // 8. Financial Breakdown Table Card
  const renderFinancialBreakdownCard = () => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-[8.5px]">
        <tbody className="divide-y divide-slate-100">
          <tr className="bg-slate-50/80">
            <td className="p-1.5 font-bold text-slate-600">Sub Total</td>
            <td className="p-1.5 text-right font-black text-slate-900">
              INR {fmt(subTotal)}
            </td>
          </tr>
          <tr>
            <td className="p-1.5 text-slate-600 font-medium">Installation Material</td>
            <td className="p-1.5 text-right font-semibold text-slate-800">
              {installation ? `INR ${fmt(installation)}` : "Included"}
            </td>
          </tr>
          <tr>
            <td className="p-1.5 text-slate-600 font-medium">Delivery, Loading & Unloading</td>
            <td className="p-1.5 text-right font-semibold text-slate-800">
              {delivery ? `INR ${fmt(delivery)}` : "Included"}
            </td>
          </tr>
          {transport > 0 && (
            <tr>
              <td className="p-1.5 text-slate-600 font-medium">Transportation Charges</td>
              <td className="p-1.5 text-right font-semibold text-slate-800">
                INR {fmt(transport)}
              </td>
            </tr>
          )}
          {discount > 0 && (
            <tr className="text-rose-600">
              <td className="p-1.5 font-semibold">Additional Discount</td>
              <td className="p-1.5 text-right font-bold">
                - INR {fmt(discount)}
              </td>
            </tr>
          )}
          <tr className="bg-slate-50 font-bold border-t border-slate-200">
            <td className="p-1.5 text-[#0d5c63]">Taxable Total</td>
            <td className="p-1.5 text-right text-[#0d5c63]">
              INR {fmt(taxableTotal)}
            </td>
          </tr>
          {isGST && !isInterState && (
            <>
              <tr>
                <td className="p-1.5 text-slate-600 font-medium">CGST @ {cgstRate}%</td>
                <td className="p-1.5 text-right font-semibold text-slate-800">
                  INR {fmt(cgst)}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 text-slate-600 font-medium">SGST @ {sgstRate}%</td>
                <td className="p-1.5 text-right font-semibold text-slate-800">
                  INR {fmt(sgst)}
                </td>
              </tr>
            </>
          )}
          {isGST && isInterState && (
            <tr>
              <td className="p-1.5 text-slate-600 font-medium">IGST @ {igstRate}%</td>
              <td className="p-1.5 text-right font-semibold text-slate-800">
                INR {fmt(igst)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Grand Total Highlight Badge */}
      <div className="bg-[#0b1e36] text-white p-2.5 flex justify-between items-center">
        <div>
          <div className="text-[7.5px] uppercase tracking-widest text-slate-300 font-bold">
            {isGST ? "ESTIMATED TOTAL (INCL. GST)" : "ESTIMATED TOTAL (GST - EXTRA)"}
          </div>
          <div className="text-[7px] text-teal-300 font-medium">
            {isGST ? `Inclusive of ${cgstRate + sgstRate}% GST` : "GST - Extra as Applicable"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black tracking-tight text-white">
            INR {fmt(grandTotal)}
          </div>
        </div>
      </div>
    </div>
  );

  // 9. Standard Payment Plan Card
  const renderPaymentPlanCard = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm text-[8px]">
      <div className="text-[8.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
        STANDARD PAYMENT PLAN
      </div>
      <div className="space-y-1 font-semibold">
        <div className="flex justify-between text-slate-700">
          <span>1. 10% on Booking</span>
          <span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.1)}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>2. 40% on Production Start</span>
          <span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.4)}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>3. 40% Before Dispatch</span>
          <span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.4)}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>4. 10% on Handover</span>
          <span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.1)}</span>
        </div>
      </div>
    </div>
  );

  // 10. Bottom Brand Footer Banner
  const renderBottomBrandBanner = () => (
    <div className="pt-2 border-t border-slate-200 mt-auto">
      <div className="bg-gradient-to-r from-[#0b1e36] via-[#0d5c63] to-[#0b1e36] text-white rounded-xl px-4 py-1.5 flex flex-wrap justify-between items-center text-[8px] font-semibold shadow-md">
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
  );

  // ── DYNAMIC MULTI-PAGE PAGINATION CALCULATION ────────────────────
  const paginateQuotation = (allItems) => {
    if (!allItems || allItems.length === 0) {
      return [{ pageNum: 1, totalPages: 1, items: [], isFirst: true, isLast: true }];
    }

    // Attach continuous 1-based serial number across all items in quotation
    const taggedItems = allItems.map((item, index) => ({
      ...item,
      _globalIndex: index + 1,
    }));

    // If 6 or fewer items, everything fits cleanly on 1 page with all summary cards
    if (taggedItems.length <= 6) {
      return [{ pageNum: 1, totalPages: 1, items: taggedItems, isFirst: true, isLast: true }];
    }

    // Group items by section to preserve cohesive section groups
    const sections = [];
    taggedItems.forEach((item) => {
      const secName = item.section || "General";
      const lastSec = sections[sections.length - 1];
      if (lastSec && lastSec.name === secName) {
        lastSec.items.push(item);
      } else {
        sections.push({ name: secName, items: [item] });
      }
    });

    const pages = [];
    let currentPage = [];
    let isFirst = true;

    for (let s = 0; s < sections.length; s++) {
      const sec = sections[s];
      let remaining = [...sec.items];

      while (remaining.length > 0) {
        // Page 1 has Header + Client Details box: comfortable capacity is ~11 items.
        // Subsequent pages can comfortably hold ~14 items.
        const pageLimit = isFirst ? 11 : 14;
        const spaceLeft = pageLimit - currentPage.length;

        if (remaining.length <= spaceLeft) {
          currentPage.push(...remaining);
          remaining = [];
        } else {
          // If current page already has a good amount of items (>= 6) and next section doesn't fit,
          // push current page and start fresh rather than awkwardly splitting a small section
          if (currentPage.length >= 6) {
            pages.push(currentPage);
            currentPage = [];
            isFirst = false;
          } else {
            const take = Math.max(1, spaceLeft);
            currentPage.push(...remaining.slice(0, take));
            remaining = remaining.slice(take);
            if (currentPage.length >= pageLimit) {
              pages.push(currentPage);
              currentPage = [];
              isFirst = false;
            }
          }
        }
      }
    }

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Balance check: if there is only 1 page resulting but items > 6, split evenly
    if (pages.length === 1 && taggedItems.length > 6) {
      const half = Math.ceil(taggedItems.length / 2);
      pages[0] = taggedItems.slice(0, half);
      pages.push(taggedItems.slice(half));
    } else if (pages.length > 1) {
      // If the last page has > 9 items alongside summary cards, move excess items to an earlier page
      const lastIdx = pages.length - 1;
      if (pages[lastIdx].length > 9) {
        const excess = pages[lastIdx].splice(0, pages[lastIdx].length - 8);
        pages.splice(lastIdx, 0, excess);
      }
    }

    const totalPages = pages.length;
    return pages.map((pageItems, idx) => ({
      pageNum: idx + 1,
      totalPages,
      items: pageItems,
      isFirst: idx === 0,
      isLast: idx === totalPages - 1,
    }));
  };

  const paginatedPages = paginateQuotation(items);

  return (
    <div ref={ref} className="print-document bg-white text-slate-800 font-sans text-[10px]">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 12mm 14mm 8mm 14mm !important;
            box-sizing: border-box !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
        @media screen {
          .print-page {
            width: 210mm;
            min-height: 297mm;
            height: 297mm;
            box-sizing: border-box;
            padding: 12mm 14mm 8mm 14mm;
            margin: 0 auto 24px auto;
            box-shadow: 0 4px 25px rgba(0,0,0,0.12);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
            overflow: hidden;
          }
        }
      `}</style>

      {paginatedPages.map((page) => (
        <div key={page.pageNum} className="print-page">
          {renderDecorativeCurves()}

          <div>
            {/* Primary Header on EVERY page for consistent official branding */}
            {renderPrimaryHeader(page.pageNum, page.totalPages)}

            {/* Client & Project Details ONLY on Page 1 */}
            {page.isFirst && renderClientProjectDetails()}

            {/* If continuation page (Page 2+), show a sleek context reference */}
            {!page.isFirst && (
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1 my-2.5 text-[8px] text-slate-600">
                <div>
                  <span className="text-slate-400 font-semibold uppercase">Client: </span>
                  <span className="font-bold text-[#0b1e36]">{safeData.customer || "Valued Client"}</span>
                  {safeData.projectTitle && (
                    <>
                      <span className="text-slate-300 mx-2">•</span>
                      <span className="text-slate-400 font-semibold uppercase">Project: </span>
                      <span className="font-bold text-slate-800">{safeData.projectTitle}</span>
                    </>
                  )}
                </div>
                <div className="font-bold text-[#0d5c63]">
                  Quotation Continuation • Page {page.pageNum} of {page.totalPages}
                </div>
              </div>
            )}

            {/* Items Table for this page */}
            {renderItemsTable(page.items)}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto pt-2">
            {/* If NOT the last page, show continuation notice */}
            {!page.isLast && (
              <div className="text-right text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                Quotation Items & Financial Summary Continue on Page {page.pageNum + 1} →
              </div>
            )}

            {/* If THIS IS the last page, render all summary cards */}
            {page.isLast && (
              <div className="grid grid-cols-2 gap-3.5 items-start mb-2.5">
                {/* Left Column: Bank Details, Terms, Digital Approval */}
                <div className="space-y-2">
                  {renderBankDetailsCard()}
                  {renderTermsConditionsCard()}
                  {renderDigitalApprovalCard()}
                </div>

                {/* Right Column: Financial Breakdown, Payment Plan */}
                <div className="space-y-2">
                  {renderFinancialBreakdownCard()}
                  {renderPaymentPlanCard()}
                </div>
              </div>
            )}

            {/* Bottom Brand Banner on EVERY page */}
            {renderBottomBrandBanner()}
          </div>
        </div>
      ))}
    </div>
  );
});

export default PrintableQuotation;
