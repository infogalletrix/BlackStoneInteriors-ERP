import { forwardRef } from "react";

const PrintableQuotation = forwardRef(({ data }, ref) => {
  const safeData = data || {};
  const rawItems = safeData.items || [];
  let parsedItems = rawItems;
  if (typeof rawItems === "string") {
    try {
      parsedItems = JSON.parse(rawItems);
    } catch {
      parsedItems = [];
    }
  }
  const items = Array.isArray(parsedItems) ? parsedItems : [];

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

  // Pre-calculate section totals across the entire quotation
  const sectionTotals = items.reduce((acc, item) => {
    const sec = item.section?.trim() || "General";
    acc[sec] = (acc[sec] || 0) + (parseFloat(item.amount) || 0);
    return acc;
  }, {});

  // Group items by section order to keep items of the same section contiguous
  const sectionOrder = [];
  const itemsBySection = {};
  items.forEach((item) => {
    const sec = item.section?.trim() || "General";
    if (!itemsBySection[sec]) {
      itemsBySection[sec] = [];
      sectionOrder.push(sec);
    }
    itemsBySection[sec].push(item);
  });
  const contiguousItems = sectionOrder.flatMap((sec) => itemsBySection[sec]);
  const taggedItems = contiguousItems.map((item, index) => ({
    ...item,
    _globalIndex: index + 1,
  }));

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
    <div className="flex justify-between items-start pb-2.5 border-b border-slate-200 relative z-10">
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
    <div className="grid grid-cols-2 gap-2.5 my-2.5">
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
  const renderItemsTable = (itemsSlice, continuedSections = new Set()) => {
    if (!itemsSlice || itemsSlice.length === 0) return null;

    // Group itemsSlice into sections in sequential order
    const sectionGroups = [];
    let currentGroup = null;

    itemsSlice.forEach((item) => {
      const sec = item.section?.trim() || "General";
      if (!currentGroup || currentGroup.sectionName !== sec) {
        currentGroup = { sectionName: sec, items: [] };
        sectionGroups.push(currentGroup);
      }
      currentGroup.items.push(item);
    });

    return (
      <div className="space-y-2 mb-2">
        {sectionGroups.map((group, sIdx) => {
          const isContinued = continuedSections?.has(group.sectionName);
          const pageSecTotal = group.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
          const overallSecTotal = sectionTotals[group.sectionName] || pageSecTotal;

          return (
            <div key={sIdx} className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-visible mb-2">
              {/* Section Sub-Header Bar */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-3 py-1 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d5c63]"></span>
                  <span className="font-black text-[9.5px] text-[#0b1e36] uppercase tracking-wider">
                    {group.sectionName} {isContinued && <span className="text-slate-400 font-bold text-[8px] lowercase tracking-normal">(contd.)</span>}
                  </span>
                </div>
                <span className="text-[8.5px] font-extrabold text-[#0d5c63]">
                  Section Total: INR {fmt(overallSecTotal)}
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
                  {group.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <td className="py-1 px-2 text-center text-slate-400 font-bold">
                        {item._globalIndex !== undefined ? item._globalIndex : idx + 1}
                      </td>
                      <td className="py-1 px-2 align-top text-slate-900">
                        <div className="font-bold">{item.product || "—"}</div>
                        {item.category && (
                          <div className="text-[7.5px] font-semibold text-[#0d5c63] mt-0.5 inline-block bg-teal-50 px-1 py-0.5 rounded border border-teal-100">
                            {item.category}
                          </div>
                        )}
                      </td>
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
            <td className="p-1.5 text-slate-600 font-medium">Delivery and Transport</td>
            <td className="p-1.5 text-right font-semibold text-slate-800">
              {(delivery + transport) > 0 ? `INR ${fmt(delivery + transport)}` : "Included"}
            </td>
          </tr>
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
    <div className="pt-1.5 border-t border-slate-200">
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
      return [{ pageNum: 1, totalPages: 1, items: [], isFirst: true, isLast: true, continuedSections: new Set() }];
    }

    const getItemHeight = (item) => {
      const spec = (item.specification || "") + (item.product || "");
      if (spec.length > 120) return 13;
      if (spec.length > 50) return 10;
      return 7.5;
    };
    const SEC_HDR_HEIGHT = 13; // section sub-header (6.5mm) + table thead (6.5mm)

    // Compute total height of all items
    let totalItemsHeight = 0;
    let prevSec = null;
    allItems.forEach((it) => {
      const sec = it.section?.trim() || "General";
      if (sec !== prevSec) {
        totalItemsHeight += SEC_HDR_HEIGHT;
        prevSec = sec;
      }
      totalItemsHeight += getItemHeight(it);
    });

    // 1. Single-Page Check (Safe capacity: ~115mm)
    if (totalItemsHeight <= 115) {
      return [{
        pageNum: 1,
        totalPages: 1,
        items: allItems,
        isFirst: true,
        isLast: true,
        continuedSections: new Set()
      }];
    }

    // 2. Multi-Page Splitting:
    // Page 1 capacity: 165mm
    // Middle page capacity: 195mm
    // Last page capacity WITH summary: 145mm
    const pages = [];
    let currentIndex = 0;
    let pageNum = 1;

    while (currentIndex < allItems.length) {
      const isFirstPage = (pageNum === 1);
      const remainingItems = allItems.slice(currentIndex);

      // Calculate remaining items height
      let remHeight = 0;
      let rSec = null;
      remainingItems.forEach((it) => {
        const sec = it.section?.trim() || "General";
        if (sec !== rSec) {
          remHeight += SEC_HDR_HEIGHT;
          rSec = sec;
        }
        remHeight += getItemHeight(it);
      });

      // If NOT page 1 and remaining items fit comfortably on last page with summary (<= 145mm):
      if (!isFirstPage && remHeight <= 145) {
        pages.push({
          items: remainingItems,
          isFirst: false,
          isLast: true,
          usedHeight: remHeight
        });
        break;
      }

      // Page capacity
      let pageCapacity = isFirstPage ? 165 : 195;

      // For 2-page documents, balance Page 1 so Page 2 has adequate items
      if (isFirstPage && remHeight > 115 && remHeight <= 280) {
        pageCapacity = Math.min(165, Math.max(90, remHeight - 110));
      }

      let currentHeight = 0;
      let pageItems = [];
      let pSec = null;

      while (currentIndex < allItems.length) {
        const item = allItems[currentIndex];
        const sec = item.section?.trim() || "General";
        let cost = getItemHeight(item);
        if (sec !== pSec) {
          cost += SEC_HDR_HEIGHT;
        }

        // Check if adding this item exceeds capacity (and we already have at least 1 item on this page)
        if (currentHeight + cost > pageCapacity && pageItems.length > 0) {
          break;
        }

        pageItems.push(item);
        currentHeight += cost;
        pSec = sec;
        currentIndex++;
      }

      const isLast = (currentIndex >= allItems.length);
      pages.push({
        items: pageItems,
        isFirst: isFirstPage,
        isLast: isLast,
        usedHeight: currentHeight
      });

      if (isLast) break;
      pageNum++;
    }

    // Safety check: ensure last page has items <= 145mm
    const lastIdx = pages.length - 1;
    if (pages.length > 1 && pages[lastIdx].usedHeight > 145) {
      const lastPage = pages[lastIdx];
      const overflowItems = [];
      let oHeight = 0;
      let oSec = null;

      while (lastPage.items.length > 1) {
        const item = lastPage.items[lastPage.items.length - 1];
        const sec = item.section?.trim() || "General";
        let cost = getItemHeight(item);
        if (sec !== oSec) cost += SEC_HDR_HEIGHT;

        if (oHeight + cost > 130 && overflowItems.length > 0) break;

        overflowItems.unshift(lastPage.items.pop());
        oHeight += cost;
        oSec = sec;
        lastPage.usedHeight -= cost;
        if (lastPage.usedHeight <= 135) break;
      }

      if (overflowItems.length > 0) {
        pages.push({
          items: overflowItems,
          isFirst: false,
          isLast: true,
          usedHeight: oHeight
        });
      }
    }

    // Explicit guarantee: Filter out any empty pages
    const validPages = pages.filter((p) => p.items && p.items.length > 0);
    const totalPages = validPages.length > 0 ? validPages.length : 1;

    // Precompute continuedSections for each page
    const seenSections = new Set();

    return validPages.map((p, idx) => {
      const continued = new Set();
      const pageSecs = new Set(p.items.map((it) => it.section?.trim() || "General"));
      pageSecs.forEach((sec) => {
        if (seenSections.has(sec)) {
          continued.add(sec);
        } else {
          seenSections.add(sec);
        }
      });

      return {
        pageNum: idx + 1,
        totalPages,
        items: p.items,
        isFirst: idx === 0,
        isLast: idx === totalPages - 1,
        continuedSections: continued,
      };
    });
  };

  const paginatedPages = paginateQuotation(taggedItems);

  return (
    <div ref={ref} className="print-document bg-white text-slate-800 font-sans text-[10px]">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-document {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .print-page {
            width: 100% !important;
            max-width: 194mm !important;
            height: 275mm !important;
            max-height: 275mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            padding: 0 !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          thead {
            display: table-row-group !important;
          }
        }
        @media screen {
          .print-page {
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
            padding: 8mm 12mm 6mm 12mm;
            margin: 0 auto 24px auto;
            box-shadow: 0 4px 25px rgba(0,0,0,0.12);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            background: white;
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

            {/* Items Table for this page */}
            <div className={page.isFirst ? "" : "mt-2"}>
              {renderItemsTable(page.items, page.continuedSections)}
            </div>

            {/* If THIS IS the last page, render all summary cards directly below items table */}
            {page.isLast && (
              <div className="grid grid-cols-2 gap-2.5 items-start mt-2.5 mb-2">
                {/* Left Column: Bank Details, Terms, Digital Approval */}
                <div className="space-y-1.5">
                  {renderBankDetailsCard()}
                  {renderTermsConditionsCard()}
                  {renderDigitalApprovalCard()}
                </div>

                {/* Right Column: Financial Breakdown, Payment Plan */}
                <div className="space-y-1.5">
                  {renderFinancialBreakdownCard()}
                  {renderPaymentPlanCard()}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Section pinned to page bottom */}
          <div className="mt-auto pt-1">
            {/* If NOT the last page, show continuation notice */}
            {!page.isLast && (
              <div className="text-right text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Quotation Items & Financial Summary Continue on Page {page.pageNum + 1} →
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
