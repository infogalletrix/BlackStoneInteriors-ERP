import { forwardRef } from "react";

const PrintableInvoice = forwardRef(({ data }, ref) => {
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

  const invoiceNumber = safeData.invoiceNo || safeData.quoteNo || "—";
  const invoiceDate = safeData.date || safeData.invoiceDate;

  // Format currency with Indian locale
  const fmt = (val) => {
    return Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 1. Decorative Accent Curves
  const renderDecorativeCurves = () => (
    <>
      <div className="absolute top-0 right-0 w-80 h-44 bg-gradient-to-bl from-[#0d5c63]/25 via-[#1982c4]/15 to-transparent rounded-bl-[140px] pointer-events-none -z-0" />
      <div className="absolute top-0 right-0 w-48 h-28 bg-gradient-to-bl from-[#0b1e36]/15 to-transparent rounded-bl-[100px] pointer-events-none -z-0" />
    </>
  );

  // 2. Primary Header (Page 1)
  const renderPrimaryHeader = (pageNumber = 1, totalPages = 1) => (
    <div className="flex justify-between items-start pb-4 border-b border-slate-200 relative z-10">
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

      <div className="text-right">
        <h2 className="text-xl font-black text-[#0b1e36] tracking-tight uppercase mb-1.5">
          TAX INVOICE
        </h2>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 shadow-sm text-right space-y-0.5 min-w-[155px]">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[8px]">Invoice No:</span>
            <span className="font-black text-[#0b1e36] text-[9.5px] tracking-wide">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[8px]">Date:</span>
            <span className="font-bold text-slate-700 text-[8.5px]">
              {invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[8px]">Type:</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[7.5px] font-extrabold uppercase ${
              isGST ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}>
              {isGST ? (isInterState ? "IGST Invoice" : "GST Invoice") : "Non-GST"}
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

  // 3. Continuation Header (Page 2+)
  const renderContinuationHeader = (pageNumber = 2, totalPages = 2) => (
    <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl p-1.5 flex items-center justify-center shadow-sm">
          <img src="/logo.png" alt="BSI" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-wider text-[#0b1e36] uppercase">
            BLACK STONE INTERIORS
          </h2>
          <p className="text-slate-500 font-medium text-[8px]">
            Tax Invoice Continuation • Inv No: <span className="font-bold text-[#0b1e36]">{invoiceNumber}</span>
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
          Page {pageNumber} of {totalPages}
        </span>
        <p className="text-[8px] text-slate-500 mt-1 font-semibold">
          Client: {safeData.customer || "—"}
        </p>
      </div>
    </div>
  );

  // 4. Client & Project Details Box
  const renderClientProjectDetails = () => (
    <div className="grid grid-cols-2 gap-3.5 my-3.5">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1.5">
          <span className="text-[8.5px] font-extrabold text-[#0d5c63] uppercase tracking-wider">
            Billed To (Client Details)
          </span>
          <span className="text-[7.5px] text-slate-400 font-semibold uppercase">Recipient</span>
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

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1.5">
          <span className="text-[8.5px] font-extrabold text-[#0d5c63] uppercase tracking-wider">
            Invoice & Delivery Details
          </span>
          <span className="text-[7.5px] text-slate-400 font-semibold uppercase">Terms & GST</span>
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

          {(safeData.customerGst || safeData.gstNumber) && (
            <>
              <span className="text-slate-500 font-bold">Customer GSTIN:</span>
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                {safeData.customerGst || safeData.gstNumber}
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

  // 5. Work Items Table
  const renderItemsTable = (itemsSlice, startIdxOffset = 0) => {
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
                      <td className="py-1 px-2 text-center text-slate-400 font-bold">{startIdxOffset + idx + 1}</td>
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

  // 6. Bank Transfer Details Card
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

  // 7. Terms & Conditions Card
  const renderTermsConditionsCard = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm text-[8px]">
      <div className="text-[8.5px] font-black text-[#0b1e36] uppercase tracking-wider mb-1 border-b border-slate-200 pb-1">
        TERMS & CONDITIONS
      </div>
      <ol className="list-decimal pl-3 space-y-0.5 text-slate-600 leading-tight font-medium text-[7.8px]">
        <li>Payment due immediately upon receipt of invoice unless agreed otherwise.</li>
        <li>Comprehensive 7 Years warranty on woodwork; OEM warranty on hardware.</li>
        <li>Interest @ 18% p.a. applicable on delayed payments beyond due date.</li>
        <li>All payments to be made in favour of <strong>"Black Stone Interiors"</strong>.</li>
      </ol>
    </div>
  );

  // 8. Thank you & Digitally Approved Notice Card
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

  // 9. Financial Breakdown Table Card
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
            {isGST ? "INVOICE GRAND TOTAL (INCL. GST)" : "INVOICE TOTAL (NON-GST)"}
          </div>
          <div className="text-[7px] text-teal-300 font-medium">
            {isGST ? `Inclusive of ${cgstRate + sgstRate}% GST` : "Zero Tax Non-GST Invoice"}
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

  const itemCount = items.length;

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
            padding: 14mm 14mm 10mm 14mm !important;
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
            padding: 14mm 14mm 10mm 14mm;
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

      {/* ── CASE 1: COMPACT (<= 5 items) -> Fits on Page 1 ── */}
      {itemCount <= 5 && (
        <div className="print-page">
          {renderDecorativeCurves()}
          <div>
            {renderPrimaryHeader(1, 1)}
            {renderClientProjectDetails()}
            {renderItemsTable(items)}
          </div>

          <div className="mt-auto pt-2">
            <div className="grid grid-cols-2 gap-3.5 items-start mb-2.5">
              <div className="space-y-2">
                {renderBankDetailsCard()}
                {renderTermsConditionsCard()}
                {renderDigitalApprovalCard()}
              </div>
              <div className="space-y-2">
                {renderFinancialBreakdownCard()}
              </div>
            </div>
            {renderBottomBrandBanner()}
          </div>
        </div>
      )}

      {/* ── CASE 2: MULTI-PAGE (> 5 items) ── */}
      {itemCount > 5 && (
        <>
          <div className="print-page">
            {renderDecorativeCurves()}
            <div>
              {renderPrimaryHeader(1, 2)}
              {renderClientProjectDetails()}
              {renderItemsTable(items.slice(0, 8), 0)}
            </div>

            <div className="mt-auto pt-2">
              <div className="text-right text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                Invoice items & total summary continue on Page 2 →
              </div>
              {renderBottomBrandBanner()}
            </div>
          </div>

          <div className="print-page">
            {renderDecorativeCurves()}
            <div>
              {renderContinuationHeader(2, 2)}
              {items.length > 8 && renderItemsTable(items.slice(8), 8)}
            </div>

            <div className="mt-auto pt-2">
              <div className="grid grid-cols-2 gap-3.5 items-start mb-2.5">
                <div className="space-y-2">
                  {renderBankDetailsCard()}
                  {renderTermsConditionsCard()}
                  {renderDigitalApprovalCard()}
                </div>
                <div className="space-y-2">
                  {renderFinancialBreakdownCard()}
                </div>
              </div>
              {renderBottomBrandBanner()}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default PrintableInvoice;
