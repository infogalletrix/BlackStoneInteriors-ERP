import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Receipt,
  Printer,
  User,
  Trash2,
  Save,
  Building,
  CheckCircle2,
  Search,
  MapPin,
  Pencil,
  Eye,
  Layers,
  ArrowLeft,
  Calendar,
  IndianRupee,
  CreditCard,
  Plus,
  ArrowUpDown
} from "lucide-react";
import { useDialog } from "../contexts/DialogContext";
import NotificationWidget from "../components/NotificationWidget";
import ReceiptPreviewModal from "../components/ReceiptPreviewModal";
import PrintableReceipt from "../components/PrintableReceipt";

export default function ReceiptPage() {
  const { showDialog } = useDialog();
  const location = useLocation();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("All");
  const [sites, setSites] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [previewReceipt, setPreviewReceipt] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generateAction, setGenerateAction] = useState(null); // 'generate' or 'print'

  const [receipts, setReceipts] = useState([]);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' (Recent transactions on top by default) | 'asc'

  const fetchNextNumber = async () => {
    try {
      const res = await fetch("/api/finance/receipts/next-number");
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, receiptNo: data.nextNumber }));
      }
    } catch (e) {}
  };

  const [formData, setFormData] = useState({
    receiptNo: "",
    date: new Date().toISOString().split("T")[0],
    siteId: "",
    clientName: "",
    organizationName: "",
    totalAmount: "",
    category: "Advance Payment",
    description: "",
    comments: "",
    paymentMode: "Cash"
  });

  const [printData, setPrintData] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch("/api/sites");
        if (res.ok) {
          const data = await res.json();
          setSites(data);
        }
      } catch (err) {
        console.error("Failed to fetch sites:", err);
      }
    };
    fetchSites();
    fetchNextNumber();
  }, []);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch("/api/finance/receipts");
        if (res.ok) {
          const data = await res.json();
          setReceipts(
            data.map((r) => ({
              ...r,
              totalAmount: r.totalAmount || "0",
              amountPaid: r.amountPaid !== undefined ? r.amountPaid : 0,
              remainingAmount: r.remainingAmount !== undefined ? r.remainingAmount : 0,
              status: r.status || "Completed"
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch receipts:", err);
      }
    };
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (location.state?.autoFill) {
      const { name, desc, siteId, organizationName, amountPaid, category } = location.state.autoFill;
      if (siteId) setSelectedSiteId(parseInt(siteId));
      setFormData((prev) => ({
        ...prev,
        siteId: siteId || "",
        clientName: name || "",
        organizationName: organizationName || "",
        description: desc || "",
        totalAmount: amountPaid ? amountPaid.toString() : prev.totalAmount,
        category: category || prev.category
      }));
      setShowHistory(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedSiteId && selectedSiteId !== "all") {
      const site = sites.find((s) => s.id === selectedSiteId);
      if (site) {
        let clientNm = site.clientName || "";
        let orgNm = site.organizationName || "";
        let desc = site.name;
        setFormData((prev) => ({
          ...prev,
          siteId: site.id,
          clientName: clientNm,
          organizationName: orgNm,
          description: desc
        }));
      }
    }
  }, [selectedSiteId, sites]);

  const componentRef = useRef();
  const handlePrintAction = useReactToPrint({ contentRef: componentRef });

  const validateForm = () => {
    if (!formData.siteId) {
      showDialog({ title: "Validation Error", message: "WO must be selected.", type: "error" });
      return false;
    }
    if (!formData.clientName || !formData.totalAmount || !formData.description) {
      showDialog({ title: "Validation Error", message: "Please fill all required fields.", type: "error" });
      return false;
    }
    return true;
  };

  const saveAsDraft = async () => {
    if (!validateForm()) return;
    const newReceipt = {
      ...formData,
      status: "Draft",
      receiptNo: formData.receiptNo === "" ? "DRAFT" : formData.receiptNo,
      amountPaid: 0,
      siteId: formData.siteId ? formData.siteId.toString() : "",
      totalAmount: parseFloat(formData.totalAmount) || 0,
      remainingAmount: parseFloat(formData.totalAmount) || 0
    };
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/finance/receipts/${formData.id}` : "/api/finance/receipts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReceipt)
      });
      if (res.ok) {
        const saved = await res.json();
        const finalReceipt = { ...newReceipt, id: formData.id || saved.id };
        setReceipts((prev) =>
          isEditing ? prev.map((r) => (r.id === finalReceipt.id ? finalReceipt : r)) : [finalReceipt, ...prev]
        );
        showDialog({
          title: isEditing ? "Draft Updated" : "Saved as Draft",
          message: isEditing ? "Draft updated successfully." : "Receipt draft saved successfully.",
          type: "success"
        });
        resetForm();
      }
    } catch (err) {
      console.error(err);
      showDialog({ title: "Error", message: "Failed to save draft.", type: "error" });
    }
  };

  const handleGenerateClick = (action) => {
    if (!validateForm()) return;
    confirmGenerate(action);
  };

  const confirmGenerate = async (action) => {
    const total = parseFloat(formData.totalAmount);
    let paid = total;
    let remaining = 0;

    const finalReceipt = {
      ...formData,
      status: "Completed",
      siteId: formData.siteId ? formData.siteId.toString() : "",
      totalAmount: parseFloat(formData.totalAmount) || 0,
      amountPaid: paid,
      remainingAmount: remaining
    };

    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/finance/receipts/${formData.id}` : "/api/finance/receipts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalReceipt)
      });
      if (res.ok) {
        const saved = await res.json();
        const storedReceipt = { ...finalReceipt, id: formData.id || saved.id };
        setReceipts((prev) =>
          isEditing ? prev.map((r) => (r.id === storedReceipt.id ? storedReceipt : r)) : [storedReceipt, ...prev]
        );

        if (action === "print") {
          setPrintData([storedReceipt]);
          setTimeout(() => {
            handlePrintAction();
            if (location.state?.returnToSites) {
              setTimeout(() => navigate("/sites"), 500);
            }
          }, 100);
        } else {
          showDialog({
            title: isEditing ? "Updated" : "Generated",
            message: isEditing ? "Receipt updated successfully." : "Receipt generated successfully.",
            type: "success"
          });
          if (location.state?.returnToSites) {
            navigate("/sites");
          } else {
            resetForm();
            setShowHistory(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
      showDialog({ title: "Error", message: "Failed to generate receipt.", type: "error" });
    }
  };

  const resetForm = () => {
    fetchNextNumber();
    setFormData((prev) => ({
      ...prev,
      id: undefined,
      date: new Date().toISOString().split("T")[0],
      totalAmount: "",
      category: "Advance Payment",
      comments: "",
      paymentMode: "Cash"
    }));
  };

  const handleEditReceipt = (receipt) => {
    const siteNum = receipt.siteId ? parseInt(receipt.siteId) : null;
    if (siteNum) setSelectedSiteId(siteNum);

    setFormData({
      id: receipt.id,
      receiptNo: receipt.receiptNo === "DRAFT" ? "" : receipt.receiptNo,
      date: receipt.date ? receipt.date.split("T")[0] : new Date().toISOString().split("T")[0],
      siteId: receipt.siteId || "",
      clientName: receipt.clientName || "",
      organizationName: receipt.organizationName || "",
      totalAmount: receipt.totalAmount ? receipt.totalAmount.toString() : "",
      category: receipt.category || "Advance Payment",
      description: receipt.description || "",
      comments: receipt.comments || "",
      paymentMode: receipt.paymentMode || "Cash",
      status: receipt.status
    });
    if (receipt.receiptNo === "DRAFT" || !receipt.receiptNo) fetchNextNumber();
    setShowHistory(false);
  };

  const deleteReceipt = (id) => {
    showDialog({
      title: "Delete Receipt",
      message: "Are you sure you want to delete this receipt?",
      type: "confirm",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/finance/receipts/${id}`, {
            method: "DELETE"
          });
          if (res.ok) {
            setReceipts(receipts.filter((r) => r.id !== id));
            showDialog({ title: "Deleted", message: "Receipt deleted successfully.", type: "success" });
          }
        } catch (err) {
          console.error(err);
          showDialog({ title: "Error", message: "Failed to delete receipt.", type: "error" });
        }
      }
    });
  };

  const printPastReceipt = (receipt) => {
    if (receipt.status === "Draft") {
      showDialog({
        title: "Cannot Print",
        message: "Drafts cannot be printed. Please generate the receipt first.",
        type: "alert"
      });
      return;
    }
    setPrintData([receipt]);
    setTimeout(() => {
      handlePrintAction();
    }, 100);
  };

  const printSelectedReceipts = () => {
    const toPrint = receipts.filter((r) => selectedReceipts.includes(r.id) && r.status !== "Draft");
    if (toPrint.length === 0) {
      showDialog({ title: "No Valid Receipts", message: "Please select completed receipts to print.", type: "alert" });
      return;
    }
    setPrintData(toPrint);
    setTimeout(() => {
      handlePrintAction();
    }, 100);
  };

  const toggleSelectReceipt = (id) => {
    setSelectedReceipts((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Partial":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "Pending":
        return "bg-rose-500/15 text-rose-500 border-rose-500/30";
      case "Draft":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-700/30 text-slate-300 border-slate-600/30";
    }
  };

  const isAllWorkOrders = !selectedSiteId || selectedSiteId === "all";

  const filteredReceipts = receipts
    .filter((r) => {
      const matchesFilter = historyFilter === "All" || r.status === historyFilter;
      const matchesSite =
        isAllWorkOrders || r.siteId === selectedSiteId?.toString() || r.siteId === selectedSiteId;
      const q = historySearchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        r.receiptNo?.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q) ||
        r.organizationName?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        (r.siteId && `wo: ${r.siteId}`.includes(q)) ||
        (r.siteId && `wo ${r.siteId}`.includes(q));

      return matchesFilter && matchesSite && matchesSearch;
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

  const totalCollectedAmount = receipts.reduce(
    (sum, r) => sum + parseFloat(r.amountPaid || r.totalAmount || 0),
    0
  );
  const completedReceiptsCount = receipts.filter((r) => r.status === "Completed").length;
  const draftReceiptsCount = receipts.filter((r) => r.status === "Draft").length;

  const currentSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="p-4 md:p-6 page-wrapper min-h-screen bg-white dark:bg-slate-950 h-full flex flex-col font-sans relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 shrink-0 relative z-10">
        <div>
          <h1 className="text-xl font-black text-themed flex items-center gap-2">
            <Receipt className="text-[var(--accent)]" size={20} />
            Payment Receipts
          </h1>
          <p className="text-muted text-xs mt-0.5 font-medium">
            Full history of all payment receipts with inline instant preview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* LEFT PANEL: WORK ORDERS LIST */}
        <div className="xl:col-span-4 h-[calc(100vh-160px)] flex flex-col bg-white dark:bg-slate-900 border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
          {/* Top Master Tab: All Work Orders (Full History) */}
          <div className="p-3 border-b border-[var(--border-color)] bg-white dark:bg-slate-900">
            <button
              onClick={() => {
                setSelectedSiteId("all");
                setShowHistory(true);
              }}
              className={`w-full text-left p-3.5 rounded-2xl transition border flex items-center justify-between ${
                isAllWorkOrders
                  ? "bg-amber-500/10 border-amber-500/40 shadow-sm text-themed"
                  : "bg-white dark:bg-slate-800 border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isAllWorkOrders ? "bg-[var(--accent)] text-white" : "bg-blue-500/10 text-blue-500"}`}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-black text-xs text-themed flex items-center gap-1.5">
                    All Work Orders
                    <span className="text-[10px] font-bold text-emerald-600">(Full History)</span>
                  </h3>
                  <p className="text-[10px] text-muted font-medium">View all receipts in one place</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/10 text-muted border border-[var(--border-color)]">
                {receipts.length}
              </span>
            </button>
          </div>

          <div className="p-3 border-b border-[var(--border-color)]">
            <div className="relative w-full shadow-sm rounded-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
              <input
                type="text"
                placeholder="Search Work Orders..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-800 text-themed text-xs font-bold outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-white dark:bg-slate-900">
            {sites
              .filter((s) => {
                if (
                  location.state?.restrictToSiteId &&
                  String(s.id) !== String(location.state.restrictToSiteId)
                )
                  return false;
                return (
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (s.organizationName && s.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
                );
              })
              .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
              .map((site) => {
                const countForSite = receipts.filter(
                  (r) => r.siteId === site.id?.toString() || r.siteId === site.id
                ).length;
                const isSelected = selectedSiteId === site.id;

                return (
                  <button
                    key={site.id}
                    onClick={() => {
                      setSelectedSiteId(site.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition border flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                        : "bg-white dark:bg-slate-800 border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-themed text-xs mb-1 truncate">
                        WO {site.id} - {site.name}
                      </h3>
                      <div className="text-[10px] text-muted flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 truncate font-medium">
                          <User size={10} /> {site.clientName}
                          {site.organizationName ? ` (${site.organizationName})` : ""}
                        </span>
                        {site.address && (
                          <span className="flex items-center gap-1 truncate opacity-75">
                            <MapPin size={10} /> {site.address}
                          </span>
                        )}
                      </div>
                    </div>
                    {countForSite > 0 && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                        {countForSite}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* RIGHT PANEL: RECEIPTS TABLE OR FORM */}
        <div className="xl:col-span-8 h-[calc(100vh-160px)] flex flex-col overflow-hidden">
          {isAllWorkOrders ? (
            /* ── FULL HISTORY VIEW (ALL WORK ORDERS) ── */
            <div className="h-full flex flex-col space-y-4">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                      Total Collected
                    </p>
                    <h3 className="text-xl font-black text-emerald-600 mt-0.5">
                      ₹ {totalCollectedAmount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <IndianRupee size={18} />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                      Total Receipts
                    </p>
                    <h3 className="text-xl font-black text-themed mt-0.5">
                      {receipts.length}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Receipt size={18} />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                      Completed / Draft
                    </p>
                    <h3 className="text-xl font-black text-themed mt-0.5">
                      <span className="text-emerald-600">{completedReceiptsCount}</span>
                      <span className="text-muted mx-1">/</span>
                      <span className="text-slate-400">{draftReceiptsCount}</span>
                    </h3>
                  </div>
                  <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
              </div>

              {/* Master Receipts Table */}
              <div className="bg-white dark:bg-slate-900 shadow-sm rounded-3xl overflow-hidden flex flex-col flex-1 border border-[var(--border-color)]">
                <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-themed mr-1">
                      Full History
                    </span>
                    {["All", "Completed", "Draft"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setHistoryFilter(filter)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
                          historyFilter === filter
                            ? "btn-accent shadow-sm"
                            : "bg-white dark:bg-slate-800 text-muted hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border-color)]"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                    {selectedReceipts.length > 0 && (
                      <button
                        onClick={printSelectedReceipts}
                        className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition btn-accent shadow flex items-center gap-1.5"
                      >
                        <Printer size={12} /> Print Selected ({selectedReceipts.length})
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                      <input
                        type="text"
                        placeholder="Search receipt, client, WO..."
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        className="w-full sm:w-56 lg:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-800 text-xs font-bold outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm shrink-0 ${
                        sortOrder === "desc"
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                      }`}
                      title={`Sort Receipts: Currently ${sortOrder === "desc" ? "Recent Transactions First" : "Oldest Transactions First"}. Click to switch.`}
                    >
                      <ArrowUpDown size={14} />
                      <span>{sortOrder === "desc" ? "Recent First" : "Oldest First"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-xs bg-white dark:bg-slate-900">
                    <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
                      <tr className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-[var(--border-color)] bg-white dark:bg-slate-900">
                        <th className="px-4 py-3 w-8 bg-white dark:bg-slate-900"></th>
                        <th className="px-4 py-3 bg-white dark:bg-slate-900">Receipt No</th>
                        <th className="px-4 py-3 bg-white dark:bg-slate-900">Date</th>
                        <th className="px-4 py-3 bg-white dark:bg-slate-900">Work Order</th>
                        <th className="px-4 py-3 bg-white dark:bg-slate-900">Client / Organization</th>
                        <th className="px-4 py-3 bg-white dark:bg-slate-900">Mode & Category</th>
                        <th className="px-4 py-3 text-right bg-white dark:bg-slate-900">Amount Received</th>
                        <th className="px-4 py-3 text-center bg-white dark:bg-slate-900">Status</th>
                        <th className="px-4 py-3 text-center bg-white dark:bg-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] bg-white dark:bg-slate-900">
                      {filteredReceipts.map((r) => {
                        const site = sites.find(
                          (s) => s.id?.toString() === r.siteId?.toString()
                        );
                        return (
                          <tr
                            key={r.id}
                            className="themed-row bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={(e) => {
                              if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                                setPreviewReceipt(r);
                              }
                            }}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedReceipts.includes(r.id)}
                                onChange={() => toggleSelectReceipt(r.id)}
                                className="rounded border-gray-400 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 font-bold text-blue-500">
                              {r.receiptNo}
                            </td>
                            <td className="px-4 py-3 text-[10px] text-muted font-medium whitespace-nowrap">
                              {r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {r.siteId ? (
                                <span className="inline-flex items-center gap-1 bg-slate-500/10 text-themed px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  WO {r.siteId}
                                  {site && <span className="opacity-75 font-normal truncate max-w-[100px]">{site.name}</span>}
                                </span>
                              ) : (
                                <span className="text-muted text-[10px]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-themed text-xs truncate max-w-[160px]">
                                {r.clientName || "—"}
                              </p>
                              {r.organizationName && (
                                <p className="text-[10px] text-muted truncate max-w-[160px]">
                                  {r.organizationName}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-themed text-[11px]">{r.paymentMode || "Cash"}</p>
                              <p className="text-[9px] text-muted truncate max-w-[120px]">{r.category || "Payment"}</p>
                            </td>
                            <td className="px-4 py-3 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                              ₹ {parseFloat(r.amountPaid || r.totalAmount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${getStatusColor(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setPreviewReceipt(r)}
                                  className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition"
                                  title="View Receipt (In-place)"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => printPastReceipt(r)}
                                  className={`p-1.5 rounded-lg transition ${
                                    r.status === "Draft"
                                      ? "bg-slate-500/10 text-slate-400 opacity-40 cursor-not-allowed"
                                      : "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20"
                                  }`}
                                  title="Print Receipt"
                                >
                                  <Printer size={13} />
                                </button>
                                <button
                                  onClick={() => handleEditReceipt(r)}
                                  className="p-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition"
                                  title="Edit Receipt"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => deleteReceipt(r.id)}
                                  className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition"
                                  title="Delete Receipt"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredReceipts.length === 0 && (
                        <tr>
                          <td colSpan="9" className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-wider bg-white dark:bg-slate-900">
                            {receipts.length === 0
                              ? "No payment receipts generated yet."
                              : "No receipts match your search."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ── SPECIFIC WORK ORDER VIEW ── */
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 shrink-0 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedSiteId("all");
                      setShowHistory(true);
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-[var(--border-color)] hover:bg-white/10 text-muted transition flex items-center gap-1.5 text-xs font-bold"
                    title="Back to All Receipts"
                  >
                    <ArrowLeft size={14} /> Full History
                  </button>
                  <div className="h-4 w-[1px] bg-[var(--border-color)]" />
                  <span className="text-xs font-black text-themed truncate max-w-[240px]">
                    WO {selectedSiteId} {currentSite ? `— ${currentSite.name}` : ""}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHistory(false)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                      !showHistory ? "btn-accent shadow-md" : "text-muted hover:bg-white/5"
                    }`}
                  >
                    New Receipt
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                      showHistory ? "btn-accent shadow-md" : "text-muted hover:bg-white/5"
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>

              {!showHistory ? (
                // New Receipt Form
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-3xl overflow-hidden p-5 flex-1 border border-[var(--border-color)] flex flex-col">
                  <h2 className="text-base font-black mb-3 flex items-center gap-2">
                    <Receipt size={16} className="text-[var(--accent)]" />
                    {formData.id ? "Edit Payment Receipt" : "New Payment Receipt"}
                  </h2>
                  <form className="flex flex-col justify-between flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Receipt No
                        </label>
                        <input
                          readOnly
                          value={formData.receiptNo}
                          className="w-full py-1.5 px-3 themed-input rounded-xl text-xs font-bold outline-none cursor-not-allowed opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full py-1.5 px-3 border border-[var(--border-color)] themed-input rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Client Name *
                        </label>
                        <input
                          required
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full py-1.5 px-3 border border-[var(--border-color)] themed-input rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Organization Name (Optional)
                        </label>
                        <input
                          value={formData.organizationName}
                          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          className="w-full py-1.5 px-3 border border-[var(--border-color)] themed-input rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Total Received (₹) *
                        </label>
                        <input
                          required
                          type="text"
                          inputMode="decimal"
                          pattern="^\d*\.?\d*$"
                          value={formData.totalAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              totalAmount: e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1")
                            })
                          }
                          placeholder="0.00"
                          className="w-full py-1.5 px-3 border border-[var(--border-color)] rounded-xl text-xs font-black text-emerald-500 themed-input outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full py-1.5 px-3 border border-[var(--border-color)] themed-input rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        >
                          <option>Advance Payment</option>
                          <option>Partial Payment</option>
                          <option>Closing Payment</option>
                          <option>Security Deposit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={formData.paymentMode}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                          className="w-full py-1.5 px-3 themed-input border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        >
                          <option>Cash</option>
                          <option>UPI / Online</option>
                          <option>Cheque</option>
                          <option>Bank Transfer</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Description *
                        </label>
                        <input
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="e.g. Master Bedroom Work"
                          className="w-full py-1.5 px-3 themed-input border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Comments (Optional)
                        </label>
                        <textarea
                          value={formData.comments}
                          rows={2}
                          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                          placeholder="Any additional details..."
                          className="w-full py-1.5 px-3 themed-input border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-[var(--border-color)] shrink-0">
                      <div className="flex flex-wrap md:flex-nowrap gap-3">
                        <button
                          type="button"
                          onClick={saveAsDraft}
                          className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] text-muted hover:bg-[var(--bg-card-hover)] py-2.5 rounded-xl font-black uppercase tracking-widest transition flex justify-center items-center gap-2 text-xs"
                        >
                          <Save size={15} /> Save Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateClick("generate")}
                          className="flex-1 btn-accent py-2.5 rounded-xl font-black uppercase tracking-widest transition flex justify-center items-center gap-2 text-xs"
                        >
                          <CheckCircle2 size={15} /> Generate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateClick("print")}
                          className="flex-1 btn-accent py-2.5 rounded-xl font-black uppercase tracking-widest transition flex justify-center items-center gap-2 text-xs"
                        >
                          <Printer size={15} /> Generate & Print
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                // History Table for Selected WO
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-3xl overflow-hidden flex flex-col flex-1 border border-[var(--border-color)]">
                  <div className="p-3 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-2 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex gap-2 overflow-x-auto">
                      {["All", "Completed", "Draft"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setHistoryFilter(filter)}
                          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
                            historyFilter === filter
                              ? "btn-accent shadow-sm"
                              : "bg-white dark:bg-slate-800 text-muted hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border-color)]"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                      {selectedReceipts.length > 0 && (
                        <button
                          onClick={printSelectedReceipts}
                          className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition btn-accent shadow flex items-center gap-2"
                        >
                          <Printer size={12} /> Print Selected ({selectedReceipts.length})
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                          type="text"
                          placeholder="Search Receipts..."
                          value={historySearchTerm}
                          onChange={(e) => setHistorySearchTerm(e.target.value)}
                          className="w-full sm:w-48 lg:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-800 text-xs font-bold outline-none transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm shrink-0 ${
                          sortOrder === "desc"
                            ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                            : "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                        }`}
                        title={`Sort Receipts: Currently ${sortOrder === "desc" ? "Recent Transactions First" : "Oldest Transactions First"}. Click to switch.`}
                      >
                        <ArrowUpDown size={14} />
                        <span>{sortOrder === "desc" ? "Recent First" : "Oldest First"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs bg-white dark:bg-slate-900">
                      <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
                        <tr className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-[var(--border-color)] bg-white dark:bg-slate-900">
                          <th className="px-4 py-3 w-8 bg-white dark:bg-slate-900"></th>
                          <th className="px-4 py-3 bg-white dark:bg-slate-900">Receipt No</th>
                          <th className="px-4 py-3 bg-white dark:bg-slate-900">Status</th>
                          <th className="px-4 py-3 text-right bg-white dark:bg-slate-900">Amount Received</th>
                          <th className="px-4 py-3 text-right bg-white dark:bg-slate-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] bg-white dark:bg-slate-900">
                        {filteredReceipts.map((r) => (
                          <tr
                            key={r.id}
                            className="themed-row bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={(e) => {
                              if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
                                setPreviewReceipt(r);
                              }
                            }}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedReceipts.includes(r.id)}
                                onChange={() => toggleSelectReceipt(r.id)}
                                className="rounded border-gray-400 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-themed">{r.receiptNo}</div>
                              <div className="text-[9px] text-muted">
                                {new Date(r.date).toLocaleDateString("en-IN")}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${getStatusColor(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-black text-emerald-500">
                              ₹ {parseFloat(r.amountPaid || r.totalAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setPreviewReceipt(r)}
                                  className="p-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition"
                                  title="View Receipt (In-place)"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => printPastReceipt(r)}
                                  className={`font-bold text-[9px] uppercase tracking-widest px-2 py-1 rounded-lg transition ${
                                    r.status === "Draft"
                                      ? "bg-[var(--accent-soft)] text-muted cursor-not-allowed opacity-50"
                                      : "bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                                  }`}
                                >
                                  Print
                                </button>
                                <button
                                  onClick={() => handleEditReceipt(r)}
                                  className="text-indigo-500 hover:text-indigo-400 p-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => deleteReceipt(r.id)}
                                  className="text-rose-500 hover:text-rose-400 p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredReceipts.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-20 text-center text-slate-300 font-bold uppercase text-xs bg-white dark:bg-slate-900">
                              No receipts found for this project
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── INLINE RECEIPT PREVIEW MODAL ("view that in that itself") ── */}
      {previewReceipt && (
        <ReceiptPreviewModal
          receipt={previewReceipt}
          onClose={() => setPreviewReceipt(null)}
          onPrint={printPastReceipt}
          onEdit={handleEditReceipt}
        />
      )}

      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        {printData.length > 0 && (
          <PrintableReceipt ref={componentRef} receipts={printData} />
        )}
      </div>
    </div>
  );
}

