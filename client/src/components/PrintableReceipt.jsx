import React, { forwardRef } from "react";

const PrintableReceipt = forwardRef(({ receipts = [], receipt = null }, ref) => {
  const dataList = receipt ? [receipt] : (Array.isArray(receipts) ? receipts : []);

  const renderSingleReceipt = (data) => (
    <div
      key={data.id || data.receiptNo}
      className="p-8 bg-white text-slate-900 font-sans border-b-2 border-gray-400 min-h-[142mm] flex flex-col mx-auto w-[210mm] relative box-border"
    >
      {/* Header */}
      <div className="flex justify-between border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-16 h-16 object-contain rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
              Black Stone Interiors
            </h1>
            <p className="font-bold text-gray-600 text-sm">Official Payment Receipt</p>
            <p className="text-xs text-gray-600 mt-0.5">Phone: +91 9599174996, +91 9315157200</p>
            <p className="text-[10px] text-gray-600 mt-0.5 max-w-[280px]">
              Email: Nakul.blackstoneinteriors@gmail.com | GSTIN: 06ABFFB6382G1ZF
            </p>
            <p className="text-[10px] text-gray-600 leading-tight mt-0.5 max-w-[280px]">
              Address: Plot No 72 sector 6 IMT Manesar, Gurgaon Haryana 122050
            </p>
            <div className="mt-2">
              <span className="px-2 py-0.5 rounded border border-gray-600 text-[10px] font-black uppercase tracking-widest text-gray-800">
                Status: {data.status || "Completed"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right mt-4">
          <h2 className="text-xl font-black text-gray-900">Receipt No: {data.receiptNo}</h2>
          <p className="font-bold mt-1 text-sm text-gray-700">
            Date: {data.date ? new Date(data.date).toLocaleDateString("en-IN") : "—"}
          </p>
          {data.siteId && (
            <p className="text-xs font-bold text-gray-500 mt-1">
              Work Order {data.siteId}
            </p>
          )}
        </div>
      </div>

      {/* Body Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mt-2">
        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-600 border-r border-gray-300 flex items-center">
            Received From
          </div>
          <div className="p-3 col-span-2">
            <div className="font-black text-gray-900">{data.clientName || "—"}</div>
            {data.organizationName && (
              <div className="text-sm font-bold text-gray-600">{data.organizationName}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-600 border-r border-gray-300 flex items-center">
            Amount Received
          </div>
          <div className="p-3 col-span-2 font-black text-gray-900 text-xl tracking-tight text-emerald-700">
            ₹ {parseFloat(data.amountPaid || data.totalAmount || 0).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-600 border-r border-gray-300 flex items-center">
            Payment Mode
          </div>
          <div className="p-3 col-span-2 font-bold text-gray-900">{data.paymentMode || "Cash"}</div>
        </div>

        <div className="grid grid-cols-3 border-b border-gray-300">
          <div className="p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-600 border-r border-gray-300 flex items-center">
            Towards
          </div>
          <div className="p-3 col-span-2 font-bold text-gray-900">
            {data.category || "Payment"} {data.description ? `— ${data.description}` : ""}
          </div>
        </div>

        {data.comments && (
          <div className="grid grid-cols-3">
            <div className="p-3 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-600 border-r border-gray-300 flex items-center">
              Remarks
            </div>
            <div className="p-3 col-span-2 text-sm text-gray-800 italic">{data.comments}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-300 text-center">
        <p className="text-[10px] text-gray-500 italic font-medium">
          This is a computer generated document and does not require a physical signature.
        </p>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="bg-white print-container">
      {dataList.map((data, idx) => (
        <React.Fragment key={data.id || idx}>
          {renderSingleReceipt(data)}
          {idx % 2 === 0 && idx !== dataList.length - 1 && (
            <div className="w-[210mm] mx-auto flex items-center justify-center relative overflow-hidden py-1 opacity-60">
              <div className="w-full border-t border-dashed border-gray-500"></div>
              <span className="absolute bg-white px-2 text-[10px] uppercase tracking-widest font-black text-gray-500">
                ✂ Cut Here
              </span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

PrintableReceipt.displayName = "PrintableReceipt";

export default PrintableReceipt;
