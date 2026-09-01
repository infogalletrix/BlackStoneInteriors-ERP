const fs = require('fs');

const path = 'c:/Users/avber/Desktop/Projects/Black Stone Interiors/Black-stone/client/src/pages/QuotationPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add states
content = content.replace(
  /const \[quoteNo, setQuoteNo\] = useState\(\"\"\);\n  const \[quoteDate, setQuoteDate\] = useState\(new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/,
  `const [quoteNo, setQuoteNo] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);

  // New states
  const [emailId, setEmailId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("3 to 4 Weeks");
  const [installationMaterial, setInstallationMaterial] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(0);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);`
);

// 2. Update session loading
content = content.replace(
  /setBillType\(d\.billType \|\| \"GST\"\);\n      setQuoteId\(d\.quoteId \|\| null\);/,
  `setBillType(d.billType || "GST");
      setQuoteId(d.quoteId || null);
      setEmailId(d.emailId || "");
      setMobileNo(d.mobileNo || "");
      setCustomerGst(d.customerGst || "");
      setDeliveryTimeline(d.deliveryTimeline || "3 to 4 Weeks");
      setInstallationMaterial(d.installationMaterial || 0);
      setDeliveryLoading(d.deliveryLoading || 0);
      setAdditionalDiscount(d.additionalDiscount || 0);`
);

// 3. Update session clearing
content = content.replace(
  /setItems\(\[\{ id: Date\.now\(\), description: \"\", unit: \"Sq\.Ft\", area: \"\", rate: \"\", amount: 0 \}\]\);\n      setClientName\(\"\"\);\n      setOrganizationName\(\"\"\);\n      setClientAddress\(\"\"\);\n      setProjectTitle\(\"\"\);\n      setWorkDescription\(\"\"\);\n      setBillType\(\"GST\"\);\n      setQuoteId\(null\);/,
  `setItems([{ id: Date.now(), section: "General", product: "", specification: "", qty: "", unit: "Sq.Ft", rate: "", discountPrice: "", amount: 0 }]);
      setClientName("");
      setOrganizationName("");
      setClientAddress("");
      setProjectTitle("");
      setWorkDescription("");
      setBillType("GST");
      setQuoteId(null);
      setEmailId("");
      setMobileNo("");
      setCustomerGst("");
      setDeliveryTimeline("3 to 4 Weeks");
      setInstallationMaterial(0);
      setDeliveryLoading(0);
      setAdditionalDiscount(0);`
);

// 4. Update session data
content = content.replace(
  /data: \{ items, clientName, organizationName, clientAddress, projectTitle, workDescription, billType, quoteNo, quoteId, quoteDate \}/g,
  `data: { items, clientName, organizationName, clientAddress, projectTitle, workDescription, billType, quoteNo, quoteId, quoteDate, emailId, mobileNo, customerGst, deliveryTimeline, installationMaterial, deliveryLoading, additionalDiscount }`
);

// 5. Update saveQuotation payload
content = content.replace(
  /billType,\n      status: \"Draft\"\n    \};/,
  `billType,
      status: "Draft",
      emailId,
      mobileNo,
      customerGst,
      deliveryTimeline,
      installationMaterial,
      deliveryLoading,
      additionalDiscount
    };`
);

// 6. Update printable quotation data prop
content = content.replace(
  /data=\{\{ customer: clientName, address: clientAddress, projectTitle, workDescription, items, quoteNo, date: quoteDate, billType \}\}/,
  `data={{ customer: clientName, address: clientAddress, projectTitle, workDescription, items, quoteNo, date: quoteDate, billType, emailId, mobileNo, customerGst, deliveryTimeline, installationMaterial, deliveryLoading, additionalDiscount }}`
);

// 7. Update Item Change logic (qty * discountPrice)
content = content.replace(
  /const area = parseFloat\(updatedItem\.area \|\| 0\);\n          const rate = parseFloat\(updatedItem\.rate \|\| 0\);\n          const amount = area \* rate;\n          return \{ \.\.\.updatedItem, amount \};/,
  `const qty = parseFloat(updatedItem.qty || 0);
          const rateToUse = updatedItem.discountPrice ? parseFloat(updatedItem.discountPrice) : parseFloat(updatedItem.rate || 0);
          const amount = qty * rateToUse;
          return { ...updatedItem, amount };`
);

// 8. Update Top Inputs (Adding Customer GST, Mobile, etc.)
content = content.replace(
  /<div className="col-span-3">\n          <label className="block text-\[10px\] font-bold text-slate-500 uppercase">\n            Organization Name \(Optional\)\n          <\/label>/,
  `<div className="col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Mobile No</label>
          <input value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="w-full themed-input border border-[var(--border-color)] px-2 py-1 text-sm outline-none focus:border-amber-400" />
        </div>
        <div className="col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Email ID</label>
          <input value={emailId} onChange={e => setEmailId(e.target.value)} className="w-full themed-input border border-[var(--border-color)] px-2 py-1 text-sm outline-none focus:border-amber-400" />
        </div>
        <div className="col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Customer GST</label>
          <input value={customerGst} onChange={e => setCustomerGst(e.target.value)} className="w-full themed-input border border-[var(--border-color)] px-2 py-1 text-sm outline-none focus:border-amber-400" />
        </div>
        <div className="col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Delivery Timeline</label>
          <input value={deliveryTimeline} onChange={e => setDeliveryTimeline(e.target.value)} className="w-full themed-input border border-[var(--border-color)] px-2 py-1 text-sm outline-none focus:border-amber-400" />
        </div>
        <div className="col-span-3 hidden">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Organization Name (Optional)</label>`
);

// 9. Fix table headers
content = content.replace(
  /Work Description\n              <\/th>\n              <th className="px-2 py-1 border-r border-gray-300 text-center w-16">\n                Unit\n              <\/th>\n              <th className="px-2 py-1 border-r border-gray-300 text-center w-20">\n                Area \/ Qty\n              <\/th>\n              <th className="px-2 py-1 border-r border-gray-300 text-right w-28">\n                Rate \/ Unit \(₹\)/,
  `Section</th>
              <th className="px-2 py-1 border-r border-gray-300 text-left">Product</th>
              <th className="px-2 py-1 border-r border-gray-300 text-left">Specification</th>
              <th className="px-2 py-1 border-r border-gray-300 text-center w-16">Unit</th>
              <th className="px-2 py-1 border-r border-gray-300 text-center w-16">Qty</th>
              <th className="px-2 py-1 border-r border-gray-300 text-right w-24">Unit Price</th>
              <th className="px-2 py-1 border-r border-gray-300 text-right w-24">Disc. Price`
);

// 10. Fix table rows
content = content.replace(
  /<td className="px-1 py-1 border-r border-white\/10">\n                  <input\n                    id={`input-\$\{idx\}-description`}\n                    type="text"\n                    placeholder=\{idx === 0 \? \"Work description\.\.\.\" : \"\"\}\n                    value=\{item\.description \|\| \"\"\}\n                    onChange=\{\(e\) => handleItemChange\(item\.id, \"description\", e\.target\.value\)\}\n                    onKeyDown=\{\(e\) => handleKeyDown\(e, idx, \"description\"\)\}\n                    className=\"w-full bg-transparent border-none outline-none text-themed font-medium px-1 placeholder-slate-600\"\n                  \/>\n                <\/td>\n                <td className="px-1 py-1 border-r border-white\/10">\n                  <select\n                    id={`input-\$\{idx\}-unit`}\n                    tabIndex="-1"\n                    value=\{item\.unit \|\| \"Sq\.Ft\"\}\n                    onChange=\{\(e\) => handleItemChange\(item\.id, \"unit\", e\.target\.value\)\}\n                    onKeyDown=\{\(e\) => handleKeyDown\(e, idx, \"unit\"\)\}\n                    className="w-full bg-transparent border-none outline-none text-slate-400 text-center appearance-none cursor-pointer"\n                  >\n                    <option className="bg-slate-800 text-white">Sq.Ft<\/option>\n                    <option className="bg-slate-800 text-white">L.Ft<\/option>\n                    <option className="bg-slate-800 text-white">Nos<\/option>\n                    <option className="bg-slate-800 text-white">LS<\/option>\n                    <option className="bg-slate-800 text-white">Rmt<\/option>\n                  <\/select>\n                <\/td>\n                <td className="px-1 py-1 border-r border-white\/10">\n                  <input\n                    id={`input-\$\{idx\}-area`}\n                    type="text"\n                    inputMode="decimal"\n                    placeholder="0"\n                    value=\{item\.area \|\| \"\"\}\n                    onChange=\{\(e\) => handleItemChange\(item\.id, \"area\", e\.target\.value\.replace\(\/\[\^0-9\.\]\/g, ''\)\.replace\(\/\(\\.\.\*\?\)\\.\.\*\/g, '\$1'\)\)\}\n                    onKeyDown=\{\(e\) => handleKeyDown\(e, idx, \"area\"\)\}\n                    className="w-full bg-transparent border-none outline-none text-center text-themed px-1"\n                  \/>\n                <\/td>\n                <td className="px-1 py-1 border-r border-white\/10">\n                  <input\n                    id={`input-\$\{idx\}-rate`}\n                    type="text"\n                    inputMode="decimal"\n                    placeholder="0.00"\n                    value=\{item\.rate \|\| \"\"\}\n                    onChange=\{\(e\) => handleItemChange\(item\.id, \"rate\", e\.target\.value\.replace\(\/\[\^0-9\.\]\/g, ''\)\.replace\(\/\(\\.\.\*\?\)\\.\.\*\/g, '\$1'\)\)\}\n                    onKeyDown=\{\(e\) => handleKeyDown\(e, idx, \"rate\"\)\}\n                    className="w-full bg-transparent border-none outline-none text-right text-themed px-1"\n                  \/>\n                <\/td>/g,
  `<td className="px-1 py-1 border-r border-white/10">
                  <input value={item.section || ""} onChange={e => handleItemChange(item.id, "section", e.target.value)} placeholder="Section (e.g. Kitchen)" className="w-full bg-transparent border-none outline-none text-themed text-xs px-1" />
                </td>
                <td className="px-1 py-1 border-r border-white/10">
                  <input value={item.product || ""} onChange={e => handleItemChange(item.id, "product", e.target.value)} placeholder="Product" className="w-full bg-transparent border-none outline-none text-themed font-bold text-xs px-1" />
                </td>
                <td className="px-1 py-1 border-r border-white/10">
                  <textarea value={item.specification || ""} onChange={e => handleItemChange(item.id, "specification", e.target.value)} placeholder="Specification" className="w-full bg-transparent border-none outline-none text-themed text-xs px-1 h-8 resize-none" />
                </td>
                <td className="px-1 py-1 border-r border-white/10">
                  <select value={item.unit || "Sq.Ft"} onChange={e => handleItemChange(item.id, "unit", e.target.value)} className="w-full bg-transparent border-none outline-none text-slate-400 text-center appearance-none">
                    <option className="bg-slate-800 text-white">Sq.Ft</option><option className="bg-slate-800 text-white">L.Ft</option><option className="bg-slate-800 text-white">Nos</option><option className="bg-slate-800 text-white">Pcs</option><option className="bg-slate-800 text-white">Set</option><option className="bg-slate-800 text-white">LS</option><option className="bg-slate-800 text-white">Rmt</option>
                  </select>
                </td>
                <td className="px-1 py-1 border-r border-white/10">
                  <input value={item.qty || ""} onChange={e => handleItemChange(item.id, "qty", e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" className="w-full bg-transparent border-none outline-none text-center text-themed px-1" />
                </td>
                <td className="px-1 py-1 border-r border-white/10">
                  <input value={item.rate || ""} onChange={e => handleItemChange(item.id, "rate", e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-full bg-transparent border-none outline-none text-right text-themed px-1" />
                </td>
                <td className="px-1 py-1 border-r border-white/10">
                  <input value={item.discountPrice || ""} onChange={e => handleItemChange(item.id, "discountPrice", e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-full bg-transparent border-none outline-none text-right text-themed px-1" />
                </td>`
);


// 11. Replace area with qty in addNewRow
content = content.replace(
  /description: \"\",\n        unit: \"Sq\.Ft\",\n        area: \"\",\n        rate: \"\",\n        amount: 0/,
  `section: "General", product: "", specification: "", unit: "Sq.Ft", qty: "", rate: "", discountPrice: "", amount: 0`
);

// 12. Update Footer Stats area and add extra fields
content = content.replace(
  /Total Area:<\/span>\n            <span className="text-sm font-bold text-\[var\(--text-primary\)\]">\{totalArea\.toFixed\(1\)\} Sq\.Ft<\/span>\n          <\/div>\n        <\/div>\n\n        \{\/\* Grand Total \*\/\}/,
  `Total Qty:</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{items.reduce((s, i) => s + parseFloat(i.qty || 0), 0)}</span>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1">
             <label className="text-[9px] font-bold text-slate-500 uppercase">Instal. Mat. (₹)</label>
             <input value={installationMaterial} onChange={e=>setInstallationMaterial(e.target.value)} className="w-20 themed-input px-1 py-0.5 text-xs text-right" />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[9px] font-bold text-slate-500 uppercase">Delivery (₹)</label>
             <input value={deliveryLoading} onChange={e=>setDeliveryLoading(e.target.value)} className="w-20 themed-input px-1 py-0.5 text-xs text-right" />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-[9px] font-bold text-slate-500 uppercase">Discount (₹)</label>
             <input value={additionalDiscount} onChange={e=>setAdditionalDiscount(e.target.value)} className="w-20 themed-input px-1 py-0.5 text-xs text-right" />
          </div>
        </div>

        {/* Grand Total */}`
);


// 13. Update bottom subtotal visual calculation
content = content.replace(
  /\{subTotal\.toFixed\(2\)\}<\/div>/,
  `{(subTotal + parseFloat(installationMaterial || 0) + parseFloat(deliveryLoading || 0) - parseFloat(additionalDiscount || 0)).toFixed(2)}</div>`
);


fs.writeFileSync(path, content, 'utf8');
