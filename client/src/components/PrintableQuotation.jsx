import { forwardRef } from "react";

const PrintableQuotation = forwardRef(({ data }, ref) => {
  const safe = data || {};
  let items = safe.items || [];
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch { items = []; }
  }
  if (!Array.isArray(items)) items = [];

  // Financial Calculations
  const subTotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const installation = parseFloat(safe.installationMaterial || 0);
  const delivery = parseFloat(safe.deliveryLoading || 0);
  const transport = parseFloat(safe.transportationCharges || 0);
  const discount = parseFloat(safe.additionalDiscount || 0);
  const taxableTotal = Math.max(0, subTotal + installation + delivery + transport - discount);

  const isGST = safe.billType === "GST";
  const isInterState = Boolean(safe.isInterState);
  const cgstRate = safe.cgstPercent !== undefined && safe.cgstPercent !== "" ? parseFloat(safe.cgstPercent) : 9;
  const sgstRate = safe.sgstPercent !== undefined && safe.sgstPercent !== "" ? parseFloat(safe.sgstPercent) : 9;
  const igstRate = cgstRate + sgstRate;

  const sgst = (isGST && !isInterState) ? (taxableTotal * sgstRate) / 100 : 0;
  const cgst = (isGST && !isInterState) ? (taxableTotal * cgstRate) / 100 : 0;
  const igst = (isGST && isInterState) ? (taxableTotal * igstRate) / 100 : 0;
  const grandTotal = taxableTotal + sgst + cgst + igst;

  const fmt = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Precompute overall section totals
  const sectionTotals = items.reduce((acc, it) => {
    const s = (it.section || "General").trim();
    acc[s] = (acc[s] || 0) + (parseFloat(it.amount) || 0);
    return acc;
  }, {});

  // Group contiguous items by section, then category
  const sectionOrder = [];
  const itemsBySection = {};
  items.forEach((it) => {
    const s = (it.section || "General").trim();
    if (!itemsBySection[s]) {
      itemsBySection[s] = [];
      sectionOrder.push(s);
    }
    itemsBySection[s].push(it);
  });

  const contiguousItems = [];
  sectionOrder.forEach((sec) => {
    const secItems = itemsBySection[sec];
    const catOrder = [];
    const itemsByCat = {};
    secItems.forEach((it) => {
      const c = (it.category || "").trim();
      if (!itemsByCat[c]) {
        itemsByCat[c] = [];
        catOrder.push(c);
      }
      itemsByCat[c].push(it);
    });
    catOrder.forEach((cat) => contiguousItems.push(...itemsByCat[cat]));
  });

  const taggedItems = contiguousItems.map((it, idx) => ({ ...it, _globalIndex: idx + 1 }));

  // ── PAGINATION LOGIC ─────────────────────────────────────────────
  const getItemHeight = (item) => {
    const spec = item.specification || "";
    const prod = item.product || "";
    const cat = item.category || "";
    const maxLines = Math.max(
      Math.ceil(spec.length / 45),
      Math.ceil(prod.length / 20),
      Math.ceil(cat.length / 20),
      1
    );
    if (maxLines >= 4) return 8.5;
    if (maxLines === 3) return 7.0;
    if (maxLines === 2) return 5.5;
    return 4.0;
  };
  const SEC_HDR_HEIGHT = 7.5; // section sub-header bar + table thead

  const paginateQuotation = (allItems) => {
    if (!allItems || allItems.length === 0) {
      return [{ pageNum: 1, totalPages: 1, items: [], isFirst: true, isLast: true, continuedSections: new Set() }];
    }

    let totalItemsHeight = 0;
    let prevSec = null;
    allItems.forEach((it) => {
      const s = (it.section || "General").trim();
      totalItemsHeight += getItemHeight(it) + (s !== prevSec ? SEC_HDR_HEIGHT : 0);
      prevSec = s;
    });

    // Single-Page check: fits all items + client details + summary cards if items height <= 140mm
    if (totalItemsHeight <= 140) {
      return [{
        pageNum: 1,
        totalPages: 1,
        items: allItems,
        isFirst: true,
        isLast: true,
        continuedSections: new Set(),
      }];
    }

    // Multi-Page Splitting:
    // Page 1 capacity: 215mm (packs maximum items, eliminates blank space)
    // Middle page capacity: 240mm
    // Last page capacity with summary: 170mm
    const pages = [];
    let currIdx = 0;
    let pageNum = 1;

    while (currIdx < allItems.length) {
      const isP1 = (pageNum === 1);
      const rem = allItems.slice(currIdx);

      // Remaining items height
      let remH = 0;
      let rSec = null;
      rem.forEach((it) => {
        const s = (it.section || "General").trim();
        remH += getItemHeight(it) + (s !== rSec ? SEC_HDR_HEIGHT : 0);
        rSec = s;
      });

      // If NOT page 1 and remaining items fit comfortably on last page with summary (<= 170mm):
      if (!isP1 && remH <= 170) {
        pages.push({ items: rem, isFirst: false, isLast: true, usedH: remH });
        break;
      }

      const cap = isP1 ? 215 : 240;
      const pageItems = [];
      let pageH = 0;
      let pSec = null;

      while (currIdx < allItems.length) {
        const it = allItems[currIdx];
        const s = (it.section || "General").trim();
        const cost = getItemHeight(it) + (s !== pSec ? SEC_HDR_HEIGHT : 0);
        if (pageH + cost > cap && pageItems.length > 0) break;
        pageItems.push(it);
        pageH += cost;
        pSec = s;
        currIdx++;
      }

      const isLast = (currIdx >= allItems.length);
      // If Page 1 packed all items but summary cannot fit on Page 1, create Page 2 for summary cards
      if (isP1 && isLast && totalItemsHeight > 140) {
        pages.push({ items: pageItems, isFirst: true, isLast: false, usedH: pageH });
        pages.push({ items: [], isFirst: false, isLast: true, usedH: 0 });
        break;
      }

      pages.push({ items: pageItems, isFirst: isP1, isLast, usedH: pageH });
      if (isLast) break;
      pageNum++;
    }

    const totalPages = pages.length;
    const seenSections = new Set();

    return pages.map((p, idx) => {
      const continued = new Set();
      p.items.forEach((it) => {
        const s = (it.section || "General").trim();
        if (seenSections.has(s)) continued.add(s);
        else seenSections.add(s);
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

  // ── UI SUB-COMPONENTS ────────────────────────────────────────────

  // Top decorative curves
  const renderDecorativeCurves = () => (
    <>
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#0d5c63]/25 via-[#1982c4]/15 to-transparent rounded-bl-[140px] pointer-events-none -z-0" />
      <div className="absolute top-0 right-0 w-48 h-24 bg-gradient-to-bl from-[#0b1e36]/15 to-transparent rounded-bl-[100px] pointer-events-none -z-0" />
    </>
  );

  // Header on every page
  const renderHeader = (pageNumber, totalPages) => (
    <div className="flex justify-between items-start pb-2 border-b border-slate-200 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-slate-900 rounded-xl p-1.5 flex items-center justify-center shadow-md">
          <img
            src="/logo.png"
            alt="Black Stone Interiors"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<span class="text-white font-black text-base tracking-tighter">BSI</span>';
            }}
          />
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-[#0b1e36] uppercase">BLACK STONE INTERIORS</h1>
          <p className="text-slate-500 font-medium text-[8px] mt-0.5">Plot No 72 Sector 6 IMT Manesar, Haryana 122050</p>
          <div className="flex items-center gap-2 text-slate-600 text-[8px] font-semibold mt-0.5">
            <span>📞 +91 9555174096</span>
            <span className="text-slate-300">•</span>
            <span>✉️ Nakul.blackstoneinterior@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <h2 className="text-lg font-black text-[#0b1e36] tracking-tight uppercase mb-1">QUOTATION</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-right space-y-0.5 min-w-[145px] shadow-xs">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[7.5px]">Quote No:</span>
            <span className="font-black text-[#0b1e36] text-[9px] tracking-wide">{safe.quoteNo || "—"}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[7.5px]">Date:</span>
            <span className="font-bold text-slate-700 text-[8px]">
              {safe.date ? new Date(safe.date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[7.5px]">Type:</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[7px] font-extrabold uppercase ${
              isGST ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900 border border-amber-300/80"
            }`}>
              {isGST ? "GST Billing" : "GST - Extra"}
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center gap-2 pt-0.5 border-t border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase text-[7px]">Page:</span>
              <span className="font-black text-slate-600 text-[7.5px]">{pageNumber} of {totalPages}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Client & Project Details (Page 1)
  const renderClientDetails = () => (
    <div className="grid grid-cols-2 gap-2 my-1.5">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
          <span className="text-[7.5px] font-extrabold text-[#0d5c63] uppercase tracking-wider">Quotation Issued To</span>
          <span className="text-[7px] text-slate-400 font-semibold uppercase">Client Details</span>
        </div>
        <div className="space-y-0.5 text-[8px]">
          <div className="text-[9.5px] font-black text-slate-900 leading-tight">{safe.customer || "Valued Client"}</div>
          {safe.organizationName && <div className="text-[8px] font-bold text-slate-600">{safe.organizationName}</div>}
          {safe.address && <div className="text-[7.5px] text-slate-600 leading-tight">📍 {safe.address}</div>}
          <div className="flex flex-wrap gap-x-2 text-[7px] text-slate-600 font-semibold">
            {safe.mobileNo && <span>📞 +91 {safe.mobileNo}</span>}
            {safe.emailId && <span>✉️ {safe.emailId}</span>}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
          <span className="text-[7.5px] font-extrabold text-[#0d5c63] uppercase tracking-wider">Project & Delivery Details</span>
          <span className="text-[7px] text-slate-400 font-semibold uppercase">Terms & Timeline</span>
        </div>
        <div className="grid grid-cols-[80px_auto] gap-y-0.5 text-[7.5px]">
          {safe.projectTitle && (
            <>
              <span className="text-slate-500 font-bold">Project Name:</span>
              <span className="font-black text-slate-800">{safe.projectTitle}</span>
            </>
          )}
          <span className="text-slate-500 font-bold">Delivery Timeline:</span>
          <span className="font-bold text-[#0b1e36]">{safe.deliveryTimeline || "3 to 4 Weeks"}</span>
          {safe.customerGst && (
            <>
              <span className="text-slate-500 font-bold">Customer GSTIN:</span>
              <span className="font-bold text-slate-800 uppercase tracking-wide">{safe.customerGst}</span>
            </>
          )}
          {safe.workDescription && (
            <>
              <span className="text-slate-500 font-bold">Work Scope:</span>
              <span className="text-slate-700 leading-snug">{safe.workDescription}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Items Table with CATEGORY between Product and Specification
  const renderItemsTable = (itemsSlice, continuedSections = new Set()) => {
    if (!itemsSlice || itemsSlice.length === 0) return null;

    const sectionGroups = [];
    let curSec = null;
    itemsSlice.forEach((it) => {
      const s = (it.section || "General").trim();
      if (!curSec || curSec.sectionName !== s) {
        curSec = { sectionName: s, items: [] };
        sectionGroups.push(curSec);
      }
      curSec.items.push(it);
    });

    return (
      <div className="space-y-1">
        {sectionGroups.map((secGroup, sIdx) => {
          const isCont = continuedSections?.has(secGroup.sectionName);
          const pageTotal = secGroup.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
          const overallTotal = sectionTotals[secGroup.sectionName] || pageTotal;

          return (
            <div key={sIdx} className="border border-slate-200 rounded-lg shadow-xs bg-white overflow-hidden mb-1">
              {/* Section Sub-Header */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-2.5 py-0.5 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d5c63]"></span>
                  <span className="font-black text-[8.5px] text-[#0b1e36] uppercase tracking-wider">
                    {secGroup.sectionName} {isCont && <span className="text-slate-400 font-bold text-[7px] lowercase tracking-normal">(contd.)</span>}
                  </span>
                </div>
                <span className="text-[7.5px] font-extrabold text-[#0d5c63]">Section Total: INR {fmt(overallTotal)}</span>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[7px]">
                    <th className="py-0.5 px-2 text-center w-6">SI</th>
                    <th className="py-0.5 px-2 w-24">Product</th>
                    <th className="py-0.5 px-2 w-24">Category</th>
                    <th className="py-0.5 px-2">Specification & Material</th>
                    <th className="py-0.5 px-1 text-center w-8">Qty</th>
                    <th className="py-0.5 px-1 text-center w-9">Unit</th>
                    <th className="py-0.5 px-2 text-right w-16">Rate</th>
                    <th className="py-0.5 px-2 text-right w-20">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[7.5px]">
                  {secGroup.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 leading-tight">
                      <td className="py-0.5 px-2 text-center text-slate-400 font-bold">{it._globalIndex || idx + 1}</td>
                      <td className="py-0.5 px-2 align-top text-slate-900 font-bold">{it.product || "—"}</td>
                      <td className="py-0.5 px-2 align-top text-slate-700 font-medium">{it.category || "—"}</td>
                      <td className="py-0.5 px-2 align-top text-slate-600 leading-snug">{it.specification || "Standard Material & Hardware"}</td>
                      <td className="py-0.5 px-1 text-center align-top font-bold text-slate-800">{it.qty || 1}</td>
                      <td className="py-0.5 px-1 text-center align-top text-slate-500">{it.unit || "Sq.Ft"}</td>
                      <td className="py-0.5 px-2 text-right align-top font-medium text-slate-700">{it.rate ? `₹${fmt(it.rate)}` : "—"}</td>
                      <td className="py-0.5 px-2 text-right align-top font-black text-slate-900">{it.amount ? `₹${fmt(it.amount)}` : "Incl."}</td>
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

  // Commercial Summary Cards (Last Page)
  const renderSummaryCards = () => (
    <div className="grid grid-cols-2 gap-2 items-start mt-1.5">
      {/* Left Column: Bank Details, Terms, Digital Approval */}
      <div className="space-y-1">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-xs">
          <div className="flex items-center gap-1 text-[7.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-1 border-b border-slate-200 pb-0.5">
            <span>🏦</span>
            <span>BANK TRANSFER DETAILS</span>
          </div>
          <div className="grid grid-cols-[75px_auto] gap-y-0.5 text-[7px]">
            <span className="text-slate-500 font-semibold">Bank Name:</span>
            <span className="font-bold text-slate-900">YES BANK</span>
            <span className="text-slate-500 font-semibold">Account Name:</span>
            <span className="font-bold text-slate-900">BLACK STONE INTERIOR</span>
            <span className="text-slate-500 font-semibold">Account No:</span>
            <span className="font-mono font-bold text-[#0b1e36] text-[8px]">072261900003797</span>
            <span className="text-slate-500 font-semibold">IFSC Code:</span>
            <span className="font-mono font-bold text-[#0d5c63]">YESB0000722</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-xs text-[7px]">
          <div className="text-[7.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-0.5 border-b border-slate-200 pb-0.5">TERMS & CONDITIONS</div>
          <ol className="list-decimal pl-3 space-y-0.5 text-slate-600 leading-tight font-medium text-[6.8px]">
            <li>Quotation estimate is valid for 30 days from date of issue.</li>
            <li>Delivery Timeline: {safe.deliveryTimeline || "3 to 4 Weeks from final drawing sign-off."}</li>
            <li>Comprehensive 7 Years warranty on woodwork; OEM warranty on hardware.</li>
            <li>All payments to be made in favour of <strong>"Black Stone Interiors"</strong>.</li>
          </ol>
        </div>

        <div className="pt-0.5 flex justify-between items-end pr-1 border-t border-slate-200">
          <div>
            <div className="text-[7px] font-bold text-slate-600">Thank you for choosing</div>
            <div className="text-[7.5px] font-black text-[#0b1e36] tracking-wide uppercase">Black Stone Interiors!</div>
          </div>
          <div className="text-right max-w-[240px]">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[7px] font-bold">
              <span>✓</span>
              <span>Digitally Approved by Authorised Signatory</span>
            </div>
            <p className="text-[6px] text-slate-400 mt-0.5 italic leading-tight">Computer-generated document digitally approved; no physical signature required.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Financial Breakdown, Payment Plan */}
      <div className="space-y-1">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-[7.5px]">
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-50/80">
                <td className="py-0.5 px-1.5 font-bold text-slate-600">Sub Total</td>
                <td className="py-0.5 px-1.5 text-right font-black text-slate-900">INR {fmt(subTotal)}</td>
              </tr>
              <tr>
                <td className="py-0.5 px-1.5 text-slate-600 font-medium">Installation Material</td>
                <td className="py-0.5 px-1.5 text-right font-semibold text-slate-800">{installation ? `INR ${fmt(installation)}` : "Included"}</td>
              </tr>
              <tr>
                <td className="py-0.5 px-1.5 text-slate-600 font-medium">Delivery and Transport</td>
                <td className="py-0.5 px-1.5 text-right font-semibold text-slate-800">{(delivery + transport) > 0 ? `INR ${fmt(delivery + transport)}` : "Included"}</td>
              </tr>
              {discount > 0 && (
                <tr className="text-rose-600">
                  <td className="py-0.5 px-1.5 font-semibold">Additional Discount</td>
                  <td className="py-0.5 px-1.5 text-right font-bold">- INR {fmt(discount)}</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td className="py-0.5 px-1.5 text-[#0d5c63]">Taxable Total</td>
                <td className="py-0.5 px-1.5 text-right text-[#0d5c63]">INR {fmt(taxableTotal)}</td>
              </tr>
              {isGST && !isInterState && (
                <>
                  <tr>
                    <td className="py-0.5 px-1.5 text-slate-600 font-medium">CGST @ {cgstRate}%</td>
                    <td className="py-0.5 px-1.5 text-right font-semibold text-slate-800">INR {fmt(cgst)}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-1.5 text-slate-600 font-medium">SGST @ {sgstRate}%</td>
                    <td className="py-0.5 px-1.5 text-right font-semibold text-slate-800">INR {fmt(sgst)}</td>
                  </tr>
                </>
              )}
              {isGST && isInterState && (
                <tr>
                  <td className="py-0.5 px-1.5 text-slate-600 font-medium">IGST @ {igstRate}%</td>
                  <td className="py-0.5 px-1.5 text-right font-semibold text-slate-800">INR {fmt(igst)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-[#0b1e36] text-white px-2 py-1 flex justify-between items-center">
            <div>
              <div className="text-[6.5px] uppercase tracking-widest text-slate-300 font-bold">{isGST ? "ESTIMATED TOTAL (INCL. GST)" : "ESTIMATED TOTAL (GST - EXTRA)"}</div>
              <div className="text-[6px] text-teal-300 font-medium">{isGST ? `Inclusive of ${cgstRate + sgstRate}% GST` : "GST - Extra as Applicable"}</div>
            </div>
            <div className="text-right font-black text-[11px] text-white">INR {fmt(grandTotal)}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-xs text-[7px]">
          <div className="text-[7.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-0.5 border-b border-slate-200 pb-0.5">STANDARD PAYMENT PLAN</div>
          <div className="space-y-0.5 font-semibold">
            <div className="flex justify-between text-slate-700"><span>1. 10% on Booking</span><span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.1)}</span></div>
            <div className="flex justify-between text-slate-700"><span>2. 40% on Production Start</span><span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.4)}</span></div>
            <div className="flex justify-between text-slate-700"><span>3. 40% Before Dispatch</span><span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.4)}</span></div>
            <div className="flex justify-between text-slate-700"><span>4. 10% on Handover</span><span className="font-bold text-slate-900">INR {fmt(grandTotal * 0.1)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Bottom brand banner
  const renderFooter = (page) => (
    <div className="mt-auto pt-1">
      {!page.isLast && (
        <div className="text-right text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mb-1">
          Quotation Items & Financial Summary Continue on Page {page.pageNum + 1} →
        </div>
      )}
      <div className="bg-gradient-to-r from-[#0b1e36] via-[#0d5c63] to-[#0b1e36] text-white rounded-lg px-3 py-1 flex flex-wrap justify-between items-center text-[7.5px] font-semibold shadow-sm">
        <div className="flex items-center gap-1"><span>📍</span><span>Plot No 72 Sector 6 IMT Manesar, Haryana 122050</span></div>
        <div className="flex items-center gap-1"><span>📞</span><span>+91 9555174096</span></div>
        <div className="flex items-center gap-1"><span>✉️</span><span>Nakul.blackstoneinterior@gmail.com</span></div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="print-document bg-white text-slate-800 font-sans text-[9px]">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-document {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
          }
          .print-page {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
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
            padding: 8mm 10mm 8mm 10mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            position: relative !important;
            overflow: hidden !important;
            background: white !important;
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
            height: 297mm;
            max-height: 297mm;
            box-sizing: border-box;
            padding: 8mm 10mm 8mm 10mm;
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

          {/* Top content area: Header, Client Info, Items, and/or Summary */}
          <div>
            {renderHeader(page.pageNum, page.totalPages)}
            {page.isFirst && renderClientDetails()}

            {page.items && page.items.length > 0 ? (
              <div className="mt-1">
                {renderItemsTable(page.items, page.continuedSections)}
              </div>
            ) : page.isLast && !page.isFirst ? (
              <div className="mt-2 mb-1 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex justify-between items-center shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d5c63]"></span>
                  <span className="text-[8px] font-black text-[#0b1e36] uppercase tracking-wider">
                    Commercial Terms & Financial Summary
                  </span>
                </div>
                <span className="text-[7px] font-bold text-[#0d5c63] uppercase">Official Sign-off</span>
              </div>
            ) : null}

            {page.isLast && renderSummaryCards()}
          </div>

          {/* Bottom pinned footer */}
          {renderFooter(page)}
        </div>
      ))}
    </div>
  );
});

export default PrintableQuotation;
