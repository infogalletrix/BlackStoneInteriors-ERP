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
  const discount = parseFloat(safeData.additionalDiscount || 0);
  
  const taxableTotal = subTotal + installation + delivery - discount;
  
  const isGST = safeData.billType === "GST";
  const isInterState = safeData.isInterState;
  const sgst = (isGST && !isInterState) ? taxableTotal * 0.09 : 0;
  const cgst = (isGST && !isInterState) ? taxableTotal * 0.09 : 0;
  const igst = (isGST && isInterState) ? taxableTotal * 0.18 : 0;
  const grandTotal = taxableTotal + sgst + cgst + igst;

  return (
    <div
      ref={ref}
      className="p-8 bg-white text-black font-sans w-[210mm] min-h-[100vh] flex flex-col mx-auto text-[10px]"
    >
      <div className="border border-black">
        {/* Header Title */}
        <div className="flex border-b border-black">
          <div className="w-1/3 flex items-center justify-center p-2 border-r border-black">
            <img src="/logo.png" alt="Logo" className="w-full h-24 object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
          </div>
          <div className="w-2/3 flex flex-col items-center justify-center p-2 text-center">
            <h1 className="text-lg font-black tracking-widest uppercase mb-1">BLACK STONE INTERIORS</h1>
            <p className="font-semibold">Plot No 72 Sector 6 IMT Manesar 122050</p>
            <div className="mt-2 text-center text-[10px] font-bold">
              <p>Contact :- +91 9555174096</p>
              <p>E-Mail :- Nakul.blackstoneinterior@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Proforma Invoice Title */}
        <div className="border-b border-black text-center py-1 bg-gray-100 font-bold uppercase text-sm tracking-wider">
          Proforma Invoice
        </div>

        {/* Details Grid */}
        <div className="flex border-b border-black font-semibold">
          <div className="w-1/2 p-2 border-r border-black grid grid-cols-[100px_auto] gap-y-1">
            <span>Customer name</span><span className="font-bold">: {safeData.customer || ""}</span>
            <span>Customer Address</span><span className="font-bold">: {safeData.address || ""}</span>
            <span>Email ID</span><span className="font-bold">: {safeData.emailId || ""}</span>
            <span>Mobile no</span><span className="font-bold">: {safeData.mobileNo || ""}</span>
          </div>
          <div className="w-1/2 p-2 grid grid-cols-[100px_auto] gap-y-1">
            <span>Bill date</span><span className="font-bold">: {safeData.date ? new Date(safeData.date).toLocaleDateString("en-GB") : ""}</span>
            <span>Invoice Number</span><span className="font-bold">: {safeData.quoteNo || ""}</span>
            <span>Customer GST</span><span className="font-bold">: {safeData.customerGst || ""}</span>
            <span>Delivery Timeline</span><span className="font-bold">: {safeData.deliveryTimeline || ""}</span>
          </div>
        </div>

        {/* Tables */}
        <div className="min-h-[500px]">
          {Object.entries(groupedItems).map(([sectionName, secItems], sIdx) => (
            <table key={sIdx} className="w-full border-b border-black border-collapse text-[9px]">
              <thead>
                <tr>
                  <th colSpan="8" className="border-b border-black py-1 text-center font-bold bg-gray-100 uppercase">
                    {sectionName}
                  </th>
                </tr>
                <tr className="border-b border-black font-bold">
                  <th className="py-1 px-1 text-center w-8">S.No</th>
                  <th className="py-1 px-1 text-left w-32">Product</th>
                  <th className="py-1 px-1 text-left">Specification</th>
                  <th className="py-1 px-1 text-center w-12">Qty</th>
                  <th className="py-1 px-1 text-center w-12">UOM</th>
                  <th className="py-1 px-1 text-right w-20">Unit Price</th>
                  <th className="py-1 px-1 text-right w-20">Discounted Price</th>
                  <th className="py-1 px-1 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {secItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 px-1 text-center align-top">{idx + 1}</td>
                    <td className="py-1 px-1 align-top font-bold">{item.product}</td>
                    <td className="py-1 px-1 align-top whitespace-pre-wrap">{item.specification}</td>
                    <td className="py-1 px-1 text-center align-top">{item.qty}</td>
                    <td className="py-1 px-1 text-center align-top">{item.unit}</td>
                    <td className="py-1 px-1 text-right align-top">
                      {item.rate ? "INR " + parseFloat(item.rate).toLocaleString("en-IN", {minimumFractionDigits: 2}) : "Including"}
                    </td>
                    <td className="py-1 px-1 text-right align-top">
                      {item.discountPrice ? "INR " + parseFloat(item.discountPrice).toLocaleString("en-IN", {minimumFractionDigits: 2}) : "Including"}
                    </td>
                    <td className="py-1 px-1 text-right align-top font-bold">
                      {item.amount ? "INR " + parseFloat(item.amount).toLocaleString("en-IN", {minimumFractionDigits: 2}) : "Including"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="6"></td>
                  <td className="py-1 px-1 text-right font-bold border-t border-black">Sub Total</td>
                  <td className="py-1 px-1 text-right font-bold border-t border-black">
                    INR {secItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString("en-IN", {minimumFractionDigits: 2})}
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="w-1/2 flex flex-col gap-4">
          <div className="border border-black font-semibold text-[9px] p-2">
            <h4 className="font-bold underline mb-1">Fund Transfer Information :</h4>
            <div className="grid grid-cols-[120px_auto] gap-y-1">
              <span>Bank Name</span><span className="font-bold">YES BANK</span>
              <span>Account Holder Name</span><span className="font-bold">BLACK STONE INTERIOR</span>
              <span>Account No</span><span className="font-bold">072261900003797</span>
              <span>IFSC Code</span><span className="font-bold">YESB0000722</span>
            </div>
          </div>
          <div className="border border-black p-2 font-semibold text-[9px]">
            <h4 className="font-bold underline mb-1">Terms & Conditions :</h4>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>The above estimate is valid for 30 days from the date of issue.</li>
              <li>Inclusive of GST 18%</li>
              <li>Delivery Time 3 to 4 Weeks.</li>
              <li>Warranty 7 Years on woodwork and manufacturer warranty on hardware and accessories.</li>
              <li>All Payments to be made in the favour of "Black Stone Interiors".</li>
            </ol>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-4">
          <div className="border border-black p-0 text-[10px] font-bold">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="p-1">Sub Total</td>
                  <td className="p-1 text-right">INR {subTotal.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                </tr>
                <tr>
                  <td className="p-1">Installation Material</td>
                  <td className="p-1 text-right">{installation ? `INR ${installation.toLocaleString("en-IN", {minimumFractionDigits:2})}` : "Including"}</td>
                </tr>
                <tr>
                  <td className="p-1">Delivery, Loading & Unloading</td>
                  <td className="p-1 text-right">{delivery ? `INR ${delivery.toLocaleString("en-IN", {minimumFractionDigits:2})}` : "Including"}</td>
                </tr>
                <tr>
                  <td className="p-1">Additional Discount</td>
                  <td className="p-1 text-right">{discount ? `- INR ${discount.toLocaleString("en-IN", {minimumFractionDigits:2})}` : "0.00"}</td>
                </tr>
                <tr className="border-t border-black bg-gray-50">
                  <td className="p-1 text-blue-600">Total</td>
                  <td className="p-1 text-right text-blue-600">INR {taxableTotal.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                </tr>
                {isGST && !isInterState && (
                  <>
                    <tr>
                      <td className="p-1 text-blue-600">SGST@9%</td>
                      <td className="p-1 text-right text-blue-600">INR {sgst.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                    </tr>
                    <tr>
                      <td className="p-1 text-blue-600">CGST@9%</td>
                      <td className="p-1 text-right text-blue-600">INR {cgst.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                    </tr>
                  </>
                )}
                {isGST && isInterState && (
                  <tr>
                    <td className="p-1 text-blue-600">IGST@18%</td>
                    <td className="p-1 text-right text-blue-600">INR {igst.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                  </tr>
                )}
                <tr className="border-t border-black bg-gray-100 font-black text-sm">
                  <td className="p-1">Grand Total</td>
                  <td className="p-1 text-right">INR {grandTotal.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border border-black p-0 text-[9px] font-bold">
            <div className="text-center bg-gray-100 border-b border-black py-1 uppercase">Payment Plan</div>
            <table className="w-full">
              <tbody>
                <tr><td className="p-1">1. 10% FOR BOOKING</td><td className="p-1 text-right">INR {(grandTotal * 0.1).toLocaleString("en-IN", {minimumFractionDigits:2})}</td></tr>
                <tr><td className="p-1">2. 40% For PRODUCTION</td><td className="p-1 text-right">INR {(grandTotal * 0.4).toLocaleString("en-IN", {minimumFractionDigits:2})}</td></tr>
                <tr><td className="p-1">3. 40% BEFORE DISPATCH</td><td className="p-1 text-right">INR {(grandTotal * 0.4).toLocaleString("en-IN", {minimumFractionDigits:2})}</td></tr>
                <tr><td className="p-1">4. 10% AT HANDOVER</td><td className="p-1 text-right">INR {(grandTotal * 0.1).toLocaleString("en-IN", {minimumFractionDigits:2})}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintableQuotation;
