const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../client/src/pages/BillingPage.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace components
content = content.replace(/PrintableQuotation/g, 'PrintableInvoice');
content = content.replace(/QuotationPage/g, 'BillingPage');

// Replace states
content = content.replace(/quoteId/g, 'invoiceId');
content = content.replace(/setQuoteId/g, 'setInvoiceId');
content = content.replace(/quoteNo/g, 'invoiceNo');
content = content.replace(/setQuoteNo/g, 'setInvoiceNo');
content = content.replace(/quoteDate/g, 'invoiceDate');
content = content.replace(/setQuoteDate/g, 'setInvoiceDate');
content = content.replace(/saveQuotation/g, 'saveInvoice');
content = content.replace(/editQuote/g, 'editInvoice');

// Replace sessions
content = content.replace(/quotation_sessions/g, 'invoice_sessions');
content = content.replace(/active_quotation_session/g, 'active_invoice_session');
content = content.replace(/New Quote/g, 'New Invoice');
content = content.replace(/Quotation Session/g, 'Invoice Session');

// Replace API
content = content.replace(/\/api\/quotations\/next-number\?date=\$\{invoiceDate\}/g, '/api/finance/invoices/next-number');
content = content.replace(/\/api\/quotations/g, '/api/finance/invoices');

// Replace texts
content = content.replace(/Quotation Number/g, 'Invoice Number');
content = content.replace(/Quotation Saved/g, 'Invoice Saved');
content = content.replace(/quotation/g, 'invoice');
content = content.replace(/Quotation/g, 'Invoice');

// Remove extra buttons (Convert to Invoice / Convert to Work Order)
content = content.replace(/<button[^>]*>\s*<ArrowRight[^>]*\/>\s*Convert to Invoice\s*<\/button>/g, '');
content = content.replace(/<button[^>]*>\s*<ArrowRight[^>]*\/>\s*Convert to Work Order\s*<\/button>/g, '');

// Also we need to fix the printable invoice props.
// data={{ ... invoiceNo, date: invoiceDate ... }}
// The original was: data={{ customer: clientName, address: clientAddress, projectTitle, workDescription, items, invoiceNo, date: invoiceDate, billType, emailId, mobileNo, customerGst, deliveryTimeline, installationMaterial, deliveryLoading, additionalDiscount }}
// This is already automatically handled because quoteNo -> invoiceNo and quoteDate -> invoiceDate.

// Ensure navigate("/invoices", { state: { activeTab: "quotations" } }) is just navigate("/invoices")
content = content.replace(/navigate\("\/invoices", \{ state: \{ activeTab: "invoices" \} \}\)/g, 'navigate("/invoices")');

fs.writeFileSync(file, content);
console.log("Replacement complete.");
