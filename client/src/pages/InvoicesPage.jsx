import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableQuotation from "../components/PrintableQuotation";
import PrintableReceipt from "../components/PrintableReceipt";
import ReceiptPreviewModal from "../components/ReceiptPreviewModal";
import {
  FileText, Search, Eye, Printer, CheckCircle2, Clock, AlertCircle,
  IndianRupee, TrendingUp, Calendar, X, Filter, Edit2, Trash2,
  History, FileCheck, Receipt, Plus, ArrowUpDown
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDialog } from "../contexts/DialogContext";
import NotificationWidget from "../components/NotificationWidget";

// Removed getStatusInfo for invoices as requested

function getQuoteStatus(q) {
  const s = q.status || "Pending";
  if (s === "Approved") return { label: "Approved", color: "emerald", icon: CheckCircle2 };
  if (s === "Rejected") return { label: "Rejected", color: "red", icon: AlertCircle };
  if (s === "Negotiating") return { label: "Negotiating", color: "blue", icon: Clock };
  return { label: "Pending", color: "amber", icon: Clock };
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showDialog } = useDialog();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "quotations");
  const [quotations, setQuotations] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [sites, setSites] = useState([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true);
  const [receiptsFilter, setReceiptsFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' (Recent transactions on top by default) | 'asc'
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [receiptPrintData, setReceiptPrintData] = useState([]);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({ contentRef: componentRef });

  const receiptComponentRef = useRef();
  const handleReceiptPrint = useReactToPrint({ contentRef: receiptComponentRef });

  const fetchQuotations = async () => {
    setIsLoadingQuotes(true);
    try {
      const res = await fetch("/api/quotations");
      const data = await res.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setIsLoadingQuotes(false); }
  };

  const fetchReceipts = async () => {
    setIsLoadingReceipts(true);
    try {
      const res = await fetch("/api/finance/receipts");
      const data = await res.json();
      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setIsLoadingReceipts(false); }
  };

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) {
        const data = await res.json();
        setSites(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); }
  };

  const updateQuotationStatus = async (q, newStatus) => {
    try {
      await fetch(`/api/quotations/${q.id || q.quoteNo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...q, status: newStatus })
      });
      fetchQuotations();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchReceipts();
    fetchSites();
  }, []);

  const deleteQuotation = async (id) => {
    showDialog({
      title: "Delete Quotation",
      message: "Delete this quotation permanently?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`/api/quotations/${id}`, { method: "DELETE" });
          fetchQuotations();
        } catch (err) { console.error(err); }
      }
    });
  };

  const deleteReceipt = async (id) => {
    showDialog({
      title: "Delete Payment Receipt",
      message: "Are you sure you want to delete this payment receipt?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`/api/finance/receipts/${id}`, { method: "DELETE" });
          fetchReceipts();
        } catch (err) { console.error(err); }
      }
    });
  };

  const printPastReceipt = (receipt) => {
    if (receipt.status === "Draft") {
      showDialog({
        title: "Cannot Print",
        message: "Drafts cannot be printed. Please complete the receipt first.",
        type: "alert"
      });
      return;
    }
    setReceiptPrintData([receipt]);
    setTimeout(() => {
      handleReceiptPrint();
    }, 100);
  };

  const filteredQuotations = quotations
    .filter((q) => {
      const s = searchTerm.toLowerCase();
      return (
        !s ||
        q.clientName?.toLowerCase().includes(s) ||
        q.quoteNo?.toLowerCase().includes(s) ||
        q.projectTitle?.toLowerCase().includes(s) ||
        q.organizationName?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      if (timeA !== timeB) {
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      }
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return sortOrder === "desc" ? idB - idA : idA - idB;
    });

  const filteredReceipts = receipts
    .filter((r) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        r.clientName?.toLowerCase().includes(s) ||
        r.organizationName?.toLowerCase().includes(s) ||
        r.receiptNo?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s) ||
        (r.siteId && `wo: ${r.siteId}`.includes(s)) ||
        (r.siteId && `wo ${r.siteId}`.includes(s));

      const matchFilter = receiptsFilter === "All" || r.status === receiptsFilter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      if (timeA !== timeB) {
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      }
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return sortOrder === "desc" ? idB - idA : idA - idB;
    });

  const totalReceiptsAmount = receipts.reduce(
    (sum, r) => sum + parseFloat(r.amountPaid || r.totalAmount || 0),
    0
  );
  const completedReceiptsCount = receipts.filter((r) => r.status === "Completed").length;
  const draftReceiptsCount = receipts.filter((r) => r.status === "Draft").length;

  return (
    <div className="p-4 md:p-6 page-wrapper min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div>
          <h1 className="text-xl font-black text-themed flex items-center gap-2">
            <History className="text-accent" size={18} /> Transaction History
          </h1>
          <p className="text-muted text-xs mt-0.5 font-medium">All quotations and payment receipts in one place.</p>
        </div>
        {/* Tab Buttons */}
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("quotations"); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-sm ${
                activeTab === "quotations"
                  ? "bg-amber-500 text-white shadow-amber-200 shadow-md"
                  : "bg-white dark:bg-slate-800 text-muted border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <FileCheck size={16} /> Quotations
            </button>
            <button
              onClick={() => { setActiveTab("receipts"); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-sm ${
                activeTab === "receipts"
                  ? "bg-emerald-600 text-white shadow-emerald-200 shadow-md"
                  : "bg-white dark:bg-slate-800 text-muted border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Receipt size={16} /> Payment Receipts
            </button>
          </div>
          <NotificationWidget />
        </div>
      </div>

      {/* ── QUOTATIONS TAB ── */}
      {activeTab === "quotations" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <div className="bg-amber-600 text-white p-7 rounded-3xl shadow-xl">
              <p className="text-amber-200 text-[10px] font-black uppercase tracking-widest mb-2">Total Quotations</p>
              <h2 className="text-4xl font-black tracking-tighter">{quotations.length}</h2>
              <p className="text-amber-300 text-xs mt-2 font-medium">All time</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] p-7 rounded-3xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Value</p>
                <h2 className="text-3xl font-black text-amber-600">₹{quotations.reduce((s, q) => s + parseFloat(q.total || 0), 0).toLocaleString()}</h2>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-3xl text-amber-500"><FileCheck size={28} /></div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] p-7 rounded-3xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Pending/Negotiating</p>
                <h2 className="text-3xl font-black text-themed">{quotations.filter(q => (q.status || "Pending") === "Pending" || q.status === "Negotiating").length}</h2>
              </div>
              <div className="p-4 bg-[var(--accent-soft)] rounded-3xl text-muted"><Clock size={28} /></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] shadow-sm rounded-[32px] overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div className="text-xs font-black text-themed uppercase tracking-wider">
                Quotations Directory ({filteredQuotations.length})
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input type="text" placeholder="Search by client or quote no..."
                    className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-[var(--border-color)] text-themed rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400 font-medium w-full sm:w-72"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-sm shrink-0 ${
                    sortOrder === "desc"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                  title={`Sort Quotations: Currently ${sortOrder === "desc" ? "Recent First (Descending)" : "Oldest First (Ascending)"}. Click to switch.`}
                >
                  <ArrowUpDown size={14} />
                  <span>{sortOrder === "desc" ? "Recent First" : "Oldest First"}</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-slate-900">
              <table className="w-full text-left bg-white dark:bg-slate-900">
                <thead className="bg-white dark:bg-slate-900">
                  <tr className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-[var(--border-color)] bg-white dark:bg-slate-900">
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Quote No.</th>
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Date</th>
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Client</th>
                    <th className="px-8 py-4 text-right bg-white dark:bg-slate-900">Total</th>
                    <th className="px-8 py-4 text-center bg-white dark:bg-slate-900">Status</th>
                    <th className="px-8 py-4 text-center bg-white dark:bg-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] bg-white dark:bg-slate-900">
                  {filteredQuotations.map((q) => {
                    const { label, color, icon: StatusIcon } = getQuoteStatus(q);
                    return (
                      <tr key={q.id || q.quoteNo} className="themed-row bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-8 py-5"><span className="font-black text-amber-500 text-sm">{q.quoteNo}</span></td>
                        <td className="px-8 py-5 text-sm text-muted font-medium">
                          <span className="flex items-center gap-2"><Calendar size={13} className="text-muted" />{q.date}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-themed text-sm">{q.clientName}</p>
                          <p className="text-xs text-muted font-medium mt-0.5">{q.clientAddress}</p>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-themed text-base">₹{parseFloat(q.total || 0).toLocaleString()}</td>
                        <td className="px-8 py-5 text-center">
                          <div className="relative inline-block w-full max-w-[120px]">
                            <select 
                              value={q.status || "Pending"}
                              onChange={(e) => updateQuotationStatus(q, e.target.value)}
                              className={`appearance-none w-full border border-transparent hover:border-${color}-200 cursor-pointer outline-none pl-8 pr-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-400 transition-colors`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Negotiating">Negotiating</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <StatusIcon size={10} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => navigate("/quotations", { state: { editQuote: q } })} className="p-2 bg-violet-500/10 text-violet-500 rounded-xl hover:bg-violet-500/20 transition" title="Edit"><Edit2 size={16} /></button>
                            <button onClick={() => setPreviewInvoice(q)} className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition" title="Preview"><Eye size={16} /></button>
                            <button onClick={() => { setPreviewInvoice(q); setTimeout(() => handlePrint(), 400); }} className="p-2 bg-teal-500/10 text-teal-500 rounded-xl hover:bg-teal-500/20 transition" title="Print"><Printer size={16} /></button>
                            <button onClick={() => deleteQuotation(q.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {isLoadingQuotes ? (
              <div className="py-20 flex justify-center items-center bg-white dark:bg-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : filteredQuotations.length === 0 && (
              <div className="py-20 text-center bg-white dark:bg-slate-900">
                <Filter className="mx-auto text-slate-200 mb-3" size={40} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                  {quotations.length === 0 ? "No quotations yet. Generate from the Quotation page." : "No quotations match your search."}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PAYMENT RECEIPTS TAB ── */}
      {activeTab === "receipts" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <div className="bg-emerald-600 text-white p-7 rounded-3xl shadow-xl">
              <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <IndianRupee size={12} /> Total Received
              </p>
              <h2 className="text-4xl font-black tracking-tighter">₹{totalReceiptsAmount.toLocaleString()}</h2>
              <p className="text-emerald-200 text-xs mt-2 font-medium">{receipts.length} receipt{receipts.length !== 1 ? "s" : ""} recorded</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] p-7 rounded-3xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Completed Receipts</p>
                <h2 className="text-3xl font-black text-emerald-600">{completedReceiptsCount}</h2>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-3xl text-emerald-500"><CheckCircle2 size={28} /></div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] p-7 rounded-3xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Draft Receipts</p>
                <h2 className="text-3xl font-black text-themed">{draftReceiptsCount}</h2>
              </div>
              <div className="p-4 bg-[var(--accent-soft)] rounded-3xl text-muted"><Clock size={28} /></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[var(--border-color)] shadow-sm rounded-[32px] overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900">
              <div className="flex gap-2">
                {["All", "Completed", "Draft"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReceiptsFilter(filter)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
                      receiptsFilter === filter
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-white dark:bg-slate-800 text-muted border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Search receipts, client, WO..."
                    className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-[var(--border-color)] text-themed rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-sm shrink-0 ${
                    sortOrder === "desc"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                  title={`Sort Receipts: Currently ${sortOrder === "desc" ? "Recent First (Descending)" : "Oldest First (Ascending)"}. Click to switch.`}
                >
                  <ArrowUpDown size={14} />
                  <span>{sortOrder === "desc" ? "Recent First" : "Oldest First"}</span>
                </button>
                <button
                  onClick={() => navigate("/receipts")}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Plus size={14} /> New
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-900">
              <table className="w-full text-left bg-white dark:bg-slate-900">
                <thead className="bg-white dark:bg-slate-900">
                  <tr className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-[var(--border-color)] bg-white dark:bg-slate-900">
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Receipt No.</th>
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Date</th>
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Work Order</th>
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Client</th>
                    <th className="px-8 py-4 bg-white dark:bg-slate-900">Category & Mode</th>
                    <th className="px-8 py-4 text-right bg-white dark:bg-slate-900">Amount Received</th>
                    <th className="px-8 py-4 text-center bg-white dark:bg-slate-900">Status</th>
                    <th className="px-8 py-4 text-center bg-white dark:bg-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] bg-white dark:bg-slate-900">
                  {filteredReceipts.map((r) => {
                    const site = sites.find((s) => s.id?.toString() === r.siteId?.toString());
                    return (
                      <tr
                        key={r.id}
                        className="themed-row bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={(e) => {
                          if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                            setPreviewReceipt(r);
                          }
                        }}
                      >
                        <td className="px-8 py-5">
                          <span className="font-black text-emerald-600 text-sm">{r.receiptNo}</span>
                        </td>
                        <td className="px-8 py-5 text-sm text-muted font-medium">
                          <span className="flex items-center gap-2">
                            <Calendar size={13} className="text-muted" />
                            {r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {r.siteId ? (
                            <div>
                              <span className="inline-flex items-center gap-1 bg-slate-500/10 text-themed px-2 py-0.5 rounded-md font-bold text-xs">
                                WO {r.siteId}
                              </span>
                              {site && <p className="text-xs text-muted font-medium mt-0.5 truncate max-w-[140px]">{site.name}</p>}
                            </div>
                          ) : (
                            <span className="text-muted text-xs">—</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-themed text-sm">{r.clientName || "—"}</p>
                          {r.organizationName && (
                            <p className="text-xs text-muted font-medium mt-0.5">{r.organizationName}</p>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-bold text-themed text-xs">{r.category || "Payment"}</p>
                          <p className="text-[11px] text-muted font-medium mt-0.5">{r.paymentMode || "Cash"}</p>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-emerald-600 text-base whitespace-nowrap">
                          ₹ {parseFloat(r.amountPaid || r.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            r.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                          }`}>
                            {r.status || "Completed"}
                          </span>
                        </td>
                        <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setPreviewReceipt(r)}
                              className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition"
                              title="View Receipt (In-place)"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => printPastReceipt(r)}
                              className={`p-2 rounded-xl transition ${
                                r.status === "Draft"
                                  ? "bg-slate-500/10 text-slate-400 opacity-40 cursor-not-allowed"
                                  : "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20"
                              }`}
                              title="Print Receipt"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() =>
                                navigate("/receipts", {
                                  state: {
                                    autoFill: {
                                      siteId: r.siteId,
                                      name: r.clientName,
                                      organizationName: r.organizationName,
                                      amountPaid: r.amountPaid || r.totalAmount,
                                      category: r.category,
                                      desc: r.description
                                    }
                                  }
                                })
                              }
                              className="p-2 bg-violet-500/10 text-violet-500 rounded-xl hover:bg-violet-500/20 transition"
                              title="Edit in Receipts"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteReceipt(r.id)}
                              className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isLoadingReceipts ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredReceipts.length === 0 && (
              <div className="py-20 text-center">
                <Filter className="mx-auto text-slate-200 mb-3" size={40} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                  {receipts.length === 0
                    ? "No payment receipts yet. Generate from the Payment Receipts page."
                    : "No receipts match your search."}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewInvoice && (() => {
        const isQuote = !!previewInvoice.quoteNo;
        const docTypeName = isQuote ? "Quotation" : "Invoice";
        const docNo = isQuote ? previewInvoice.quoteNo : previewInvoice.invoiceNo;
        const docDate = isQuote ? previewInvoice.date : previewInvoice.invoiceDate;

        let quoteSubTotal = 0;
        let quoteGst = 0;
        let quoteTotal = 0;
        if (isQuote) {
          quoteSubTotal = (previewInvoice.items || []).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
          quoteGst = previewInvoice.billType === "Non-GST" ? 0 : quoteSubTotal * 0.18;
          quoteTotal = quoteSubTotal + quoteGst;
        }

        const displaySubTotal = isQuote ? quoteSubTotal : parseFloat(previewInvoice.subTotal || 0);
        const displayGst = isQuote ? quoteGst : parseFloat(previewInvoice.totalGst || 0);
        const displayTotal = isQuote ? quoteTotal : parseFloat(previewInvoice.grandTotal || previewInvoice.total || 0);

        return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="themed-modal rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">{docNo}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <span>{previewInvoice.billType === "GST" ? (previewInvoice.organizationName || "GST Invoice") : previewInvoice.clientName}</span>
                  {previewInvoice.workOrderId && (
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-bold">WO: {previewInvoice.workOrderId}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition"><Printer size={16} /> Print</button>
                <button onClick={() => setPreviewInvoice(null)} className="text-slate-400 hover:text-white transition p-2"><X size={24} /></button>
              </div>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                      {previewInvoice.billType === "GST" ? "Billed To (Org)" : "Client"}
                    </p>
                    {previewInvoice.billType !== "GST" && (
                      <p className="font-black text-themed mt-1">{previewInvoice.clientName}</p>
                    )}
                    {previewInvoice.organizationName && (
                      <p className="font-bold text-themed text-xs mt-0.5">{previewInvoice.organizationName}</p>
                    )}
                    {previewInvoice.billType === "GST" && previewInvoice.gstNumber && (
                      <p className="text-blue-600 font-mono text-[11px] font-semibold mt-0.5">GSTIN: {previewInvoice.gstNumber}</p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">{previewInvoice.clientAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{docTypeName} Date</p>
                    <p className="font-bold text-themed mt-1">{docDate}</p>
                  </div>
                </div>
                <table className="w-full text-sm border border-slate-100 rounded-2xl overflow-hidden mt-4">
                  <thead className="bg-white/5">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-4 py-3 text-left">Work</th>
                      <th className="px-4 py-3 text-center">Area</th>
                      <th className="px-4 py-3 text-right">{isQuote ? "Rate" : "Taxable"}</th>
                      {!isQuote && parseFloat(previewInvoice.totalGst || 0) > 0 && <th className="px-4 py-3 text-right">GST</th>}
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.items?.map((item, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium">{isQuote ? item.description : item.work}</td>
                        <td className="px-4 py-3 text-center">{item.area} {item.unit}</td>
                        <td className="px-4 py-3 text-right">₹{parseFloat(isQuote ? item.rate : (item.taxableAmount || 0)).toLocaleString()}</td>
                        {!isQuote && parseFloat(previewInvoice.totalGst || 0) > 0 && <td className="px-4 py-3 text-right text-blue-600">₹{parseFloat(item.gstAmount || 0).toLocaleString()}</td>}
                        <td className="px-4 py-3 text-right font-black">₹{parseFloat(item.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold">₹{displaySubTotal.toLocaleString()}</span></div>
                  {displayGst > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Total GST</span><span className="font-bold text-blue-600">₹{displayGst.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-lg font-black border-t border-slate-200 pt-2 mt-2"><span>Grand Total</span><span className="text-emerald-600">₹{displayTotal.toLocaleString()}</span></div>
                  {!isQuote && (
                    <>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Advance Paid</span><span className="font-bold">₹{parseFloat(previewInvoice.advanceAmount || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Received</span><span className="font-bold">₹{parseFloat(previewInvoice.receivedAmount || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-base font-black text-red-600 border-t border-slate-200 pt-2"><span>Balance Due</span><span>₹{Math.max(0, parseFloat(previewInvoice.balanceAmount || 0)).toLocaleString()}</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── INLINE RECEIPT PREVIEW MODAL ("view that in that itself") ── */}
      {previewReceipt && (
        <ReceiptPreviewModal
          receipt={previewReceipt}
          onClose={() => setPreviewReceipt(null)}
          onPrint={printPastReceipt}
          onEdit={(r) =>
            navigate("/receipts", {
              state: {
                autoFill: {
                  siteId: r.siteId,
                  name: r.clientName,
                  organizationName: r.organizationName,
                  amountPaid: r.amountPaid || r.totalAmount,
                  category: r.category,
                  desc: r.description
                }
              }
            })
          }
        />
      )}

      {/* Hidden Quotation Print Content */}
      {previewInvoice && (
        <div className="opacity-0 fixed top-0 left-0 pointer-events-none">
          <PrintableQuotation ref={componentRef} data={{
            customer: previewInvoice.clientName,
            organizationName: previewInvoice.organizationName,
            address: previewInvoice.clientAddress,
            projectTitle: previewInvoice.projectTitle,
            workDescription: previewInvoice.workDescription,
            items: previewInvoice.items || [],
            quoteNo: previewInvoice.quoteNo,
            date: previewInvoice.date,
            billType: previewInvoice.billType,
            emailId: previewInvoice.emailId,
            mobileNo: previewInvoice.mobileNo,
            customerGst: previewInvoice.customerGst,
            deliveryTimeline: previewInvoice.deliveryTimeline,
            installationMaterial: previewInvoice.installationMaterial,
            deliveryLoading: previewInvoice.deliveryLoading,
            transportationCharges: previewInvoice.transportationCharges,
            additionalDiscount: previewInvoice.additionalDiscount,
            cgstPercent: previewInvoice.cgstPercent,
            sgstPercent: previewInvoice.sgstPercent
          }} />
        </div>
      )}

      {/* Hidden Receipt Print Content */}
      <div style={{ display: "none" }}>
        {receiptPrintData.length > 0 && (
          <PrintableReceipt ref={receiptComponentRef} receipts={receiptPrintData} />
        )}
      </div>
    </div>
  );
}
