import { forwardRef } from 'react';

const FinalSettlementSheet = forwardRef(({ site, receipts }, ref) => {
  if (!site) return null;

  const totalBudget = site.budget || 0;
  
  // Calculate total receipts
  const totalReceived = receipts?.reduce((sum, r) => sum + parseFloat(r.amountPaid || 0), 0) || 0;
  
  // Assuming no specific offers/deductions are tracked per-site natively right now,
  // we will leave "Less Offer" as 0, or just generic 0 for FOC.
  const totalOffer = 0; 
  const grandTotal = totalBudget - totalOffer;
  const balance = grandTotal - totalReceived;

  const today = new Date().toLocaleDateString("en-GB");

  return (
    <div className="hidden">
      <div ref={ref} className="bg-white text-black p-8 font-sans w-[210mm] min-h-[297mm] mx-auto text-sm flex flex-col print:flex print:w-full print:h-[297mm] print:m-0 print:p-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-4 border-b border-black pb-4">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-lg" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Black Stone Interiors</h1>
            <p className="font-bold text-gray-600 text-[10px] mt-1">Phone: +91 9599174996, +91 9315157200</p>
            <p className="font-bold text-gray-600 text-[9px] mt-0.5">Email: Nakul.blackstoneinteriors@gmail.com | GSTIN: 06ABFFB6382G1ZF</p>
            <p className="font-bold text-gray-600 text-[9px] leading-tight mt-0.5">Address: Plot No 72 sector 6 IMT Manesar, Gurgaon Haryana 122050</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center font-bold text-lg mb-2 uppercase underline underline-offset-4 tracking-wider">
          Final Settlement Sheet
        </h1>

        {/* Header Table */}
        <table className="w-full border-collapse border border-black mb-4 text-xs font-semibold">
          <tbody>
            <tr>
              <td className="border border-black p-1 pl-2 w-1/3">DATE</td>
              <td className="border border-black p-1 text-center w-1/12">-</td>
              <td className="border border-black p-1 pr-2 text-right w-7/12">{today}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2">CUSTOMER NAME</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 pr-2 text-right uppercase">{site.clientName || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2">SITE ADDRESS</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 pr-2 text-right uppercase">{site.address || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2">ORGANIZATION</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 pr-2 text-right uppercase">{site.organizationName || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2">WORK ORDER ID</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 pr-2 text-right uppercase">#{site.id}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2">PROJECT STATUS</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 pr-2 text-right uppercase">{site.status}</td>
            </tr>
          </tbody>
        </table>

        {/* Particulars Table */}
        <table className="w-full border-collapse border border-black mb-0 text-xs">
          <thead>
            <tr>
              <th className="border border-black p-1 text-center font-bold w-1/2">PARTICULARS</th>
              <th className="border border-black p-1 text-center font-bold w-1/4">AMOUNT</th>
              <th className="border border-black p-1 text-center font-bold w-1/4">AMOUNT<br/>RECEIVED</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 pl-2 font-semibold uppercase">Total Project Budget</td>
              <td className="border border-black p-1 text-center">{totalBudget}</td>
              <td className="border border-black p-1 text-center bg-gray-50 border-b-0"></td>
            </tr>
            {/* Empty padding rows for layout match */}
            {[...Array(6)].map((_, i) => (
              <tr key={`pad-${i}`}>
                <td className="border border-black p-1 h-5"></td>
                <td className="border border-black p-1"></td>
                <td className="border-l border-r border-black p-1 bg-gray-50"></td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-1 pl-2 font-bold uppercase">Base Cost</td>
              <td className="border border-black p-1 text-center font-bold">{totalBudget}</td>
              <td className="border-l border-r border-black p-1 bg-gray-50"></td>
            </tr>
            
            {/* Offer Section Header */}
            <tr className="bg-purple-800 text-white font-bold text-center">
              <td colSpan="3" className="border border-black p-1 h-3"></td>
            </tr>

            <tr>
              <td className="border border-black p-1 pl-2 font-semibold uppercase">Less Offer:</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border-l border-r border-black p-1 bg-gray-50"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2 font-semibold uppercase">FOC / Discounts</td>
              <td className="border border-black p-1 text-center">{totalOffer}</td>
              <td className="border-l border-r border-black p-1 bg-gray-50"></td>
            </tr>
            {[...Array(2)].map((_, i) => (
              <tr key={`pad2-${i}`}>
                <td className="border border-black p-1 h-5"></td>
                <td className="border border-black p-1"></td>
                <td className="border-l border-r border-black p-1 bg-gray-50"></td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-1 font-bold text-center uppercase">Total Offer</td>
              <td className="border border-black p-1 text-center font-bold">{totalOffer}</td>
              <td className="border-l border-r border-black p-1 bg-gray-50"></td>
            </tr>

            {/* Total Cost Section */}
            <tr className="bg-purple-800 text-white font-bold">
              <td className="border border-black p-1 pl-2 uppercase">Total Cost of the Project</td>
              <td className="border border-black p-1 text-center">{grandTotal}</td>
              <td className="border border-black p-1 bg-purple-800 border-l-white"></td>
            </tr>
            <tr className="bg-purple-800 text-white">
              <td colSpan="3" className="border border-black p-1 h-2"></td>
            </tr>

            {/* Payment Details */}
            <tr>
              <td className="border border-black p-1 pl-2 font-bold uppercase underline">Payment Details:</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border-l border-r border-black p-1 bg-gray-50"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 pl-2 font-bold uppercase underline">Payment by Cash / Cheque / Bank</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border-l border-r border-black p-1 bg-gray-50"></td>
            </tr>
            
            {/* List Receipts */}
            {receipts && receipts.length > 0 ? receipts.map((r, i) => (
              <tr key={r.id || i}>
                <td className="border border-black p-1 pl-2 uppercase">
                  By {r.paymentMode || "Bank"} {r.receiptNo ? `(${r.receiptNo})` : ""}
                </td>
                <td className="border border-black p-1 text-center">
                  {new Date(r.date).toLocaleDateString("en-GB")}
                </td>
                <td className="border border-black p-1 pr-2 text-right">
                  ₹ {parseFloat(r.amountPaid || 0).toLocaleString("en-IN")}
                </td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black p-1 italic text-gray-500 text-center" colSpan="3">
                  No receipts recorded
                </td>
              </tr>
            )}

            {/* Pad receipts to ensure consistent height */}
            {[...Array(Math.max(0, 3 - (receipts?.length || 0)))].map((_, i) => (
              <tr key={`pad3-${i}`}>
                <td className="border border-black p-1 h-5"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Section: Total Payment Received & Balance Receivable */}
        <div className="mt-auto pt-4 space-y-4">
          <table className="w-full border-collapse border border-black text-xs font-bold">
            <tbody>
              <tr className="bg-purple-800 text-white">
                <td className="border border-black p-2 pl-3 uppercase w-2/3 tracking-wider">
                  TOTAL PAYMENT RECEIVED
                </td>
                <td className="border border-black p-2 pr-3 text-right w-1/3 text-sm font-black">
                  ₹ {totalReceived.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className={balance > 0 ? "bg-red-50 text-red-950" : "bg-emerald-50 text-emerald-950"}>
                <td className="border border-black p-2 pl-3 uppercase w-2/3 tracking-wider">
                  BALANCE RECEIVABLE
                </td>
                <td className={`border border-black p-2 pr-3 text-right w-1/3 text-sm font-black ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>
                  ₹ {balance.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Approval & Customer Acknowledgement */}
          <div className="flex justify-between items-end pt-3 border-t border-gray-300 font-bold text-[10px] uppercase">
            <div className="text-left">
              <p className="text-gray-900 font-black tracking-wider">
                ✓ APPROVED &amp; COMPUTER GENERATED
              </p>
              <p className="text-gray-500 font-normal lowercase first-letter:uppercase text-[9px] mt-0.5">
                This document is approved and computer generated. No physical authorized signature is required.
              </p>
            </div>
            <div className="text-right">
              <div className="border-b border-black w-36 mb-1 ml-auto"></div>
              <p className="text-gray-700">CUSTOMER</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FinalSettlementSheet;
