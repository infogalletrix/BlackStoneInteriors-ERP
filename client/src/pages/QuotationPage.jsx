import { useState, useRef, useEffect, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate, useLocation } from "react-router-dom";
import PrintableQuotation from "../components/PrintableQuotation";
import ManageOptionsModal, {
  DEFAULT_PRODUCTS,
  DEFAULT_SPECIFICATIONS
} from "../components/ManageOptionsModal";
import SectionInput from "../components/SectionInput";
import QuotationItemModal from "../components/QuotationItemModal";
import ClientDetailsModal from "../components/ClientDetailsModal";

const formatINR = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
import {
  Trash2,
  Printer,
  Save,
  RotateCcw,
  History,
  ArrowRight,
  FileText,
  Plus,
  X,
  Edit3,
  Settings,
  Building,
} from "lucide-react";
import { useDialog } from "../contexts/DialogContext";
import NotificationWidget from "../components/NotificationWidget";

export default function QuotationPage() {
  const { showDialog } = useDialog();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [clientName, setClientName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [billType, setBillType] = useState("GST"); // 'GST' | 'Non-GST'
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);

  const [quoteId, setQuoteId] = useState(null);
  const [quoteNo, setQuoteNo] = useState("");
  const [quoteDate, setQuoteDate] = useState("");

  const fetchInternetDate = async () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!quoteDate) {
      fetchInternetDate().then(setQuoteDate);
    }
  }, []);

  // New advanced fields
  const [emailId, setEmailId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("3 to 4 Weeks");
  const [installationMaterial, setInstallationMaterial] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(0);
  const [transportationCharges, setTransportationCharges] = useState(0);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [cgstPercent, setCgstPercent] = useState("9");
  const [sgstPercent, setSgstPercent] = useState("9");

  const [crmClients, setCrmClients] = useState([]);

  // Dropdown Options Management (Products, Specifications)
  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem("quote_products");
    let list = saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    if (Array.isArray(list)) {
      list = list.filter(p => p && typeof p === "string" && !p.toLowerCase().includes("product / category"));
    }
    return list;
  });

  const [specificationsList, setSpecificationsList] = useState(() => {
    const saved = localStorage.getItem("quote_specifications");
    return saved ? JSON.parse(saved) : DEFAULT_SPECIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem("quote_products", JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem("quote_specifications", JSON.stringify(specificationsList));
  }, [specificationsList]);

  // Derive suggestions for Section strictly from previously entered data (current items & saved history)
  const previouslyEnteredSections = useMemo(() => {
    const current = items.map(i => i.section?.trim()).filter(Boolean);
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem("bsi_entered_sections") || "[]");
    } catch {}
    return Array.from(new Set([...current, ...history]));
  }, [items]);

  const persistEnteredSections = (rows) => {
    try {
      const current = rows.map(i => i.section?.trim()).filter(Boolean);
      if (current.length > 0) {
        const history = JSON.parse(localStorage.getItem("bsi_entered_sections") || "[]");
        const merged = Array.from(new Set([...history, ...current]));
        localStorage.setItem("bsi_entered_sections", JSON.stringify(merged));
      }
    } catch {}
  };

  // Load historical sections from existing database records on mount
  useEffect(() => {
    const loadHistoricalSections = async () => {
      try {
        const [qRes, iRes] = await Promise.allSettled([
          fetch('/api/quotations').then(r => r.ok ? r.json() : []),
          fetch('/api/finance/invoices').then(r => r.ok ? r.json() : [])
        ]);
        const historical = [];
        if (qRes.status === 'fulfilled' && Array.isArray(qRes.value)) {
          const quotes = qRes.value;
          quotes.forEach(q => {
            let its = q.items;
            if (typeof its === 'string') { try { its = JSON.parse(its); } catch {} }
            if (Array.isArray(its)) {
              its.forEach(it => { if (it.section?.trim()) historical.push(it.section.trim()); });
            }
          });
          // Clean up stale quoteId in state and sessions if it no longer exists on server
          setQuoteId(prev => (prev && !quotes.some(q => String(q.id) === String(prev)) ? null : prev));
          setSessions(prev => prev.map(s => {
            if (s.data?.quoteId && !quotes.some(q => String(q.id) === String(s.data.quoteId))) {
              return { ...s, data: { ...s.data, quoteId: null } };
            }
            return s;
          }));
        }
        if (iRes.status === 'fulfilled' && Array.isArray(iRes.value)) {
          iRes.value.forEach(inv => {
            let its = inv.items;
            if (typeof its === 'string') { try { its = JSON.parse(its); } catch {} }
            if (Array.isArray(its)) {
              its.forEach(it => { if (it.section?.trim()) historical.push(it.section.trim()); });
            }
          });
        }
        if (historical.length > 0) {
          let existing = [];
          try {
            existing = JSON.parse(localStorage.getItem("bsi_entered_sections") || "[]");
          } catch {}
          const merged = Array.from(new Set([...existing, ...historical]));
          localStorage.setItem("bsi_entered_sections", JSON.stringify(merged));
        }
      } catch (e) {
        console.warn("Could not load historical sections", e);
      }
    };
    loadHistoricalSections();
  }, []);

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [activeOptionsTab, setActiveOptionsTab] = useState("products");

  const openOptionsModal = (tab = "products") => {
    setActiveOptionsTab(tab);
    setIsOptionsModalOpen(true);
  };

  const handleRenameOption = (type, oldVal, newVal) => {
    if (type === "products") {
      setItems(prev => prev.map(i => i.product === oldVal ? { ...i, product: newVal } : i));
    } else if (type === "specifications") {
      setItems(prev => prev.map(i => i.specification === oldVal ? { ...i, specification: newVal } : i));
    }
  };

  // Fetch CRM clients on mount
  useEffect(() => {
    fetch('/api/crm')
      .then(res => res.json())
      .then(data => setCrmClients(data))
      .catch(err => console.error("Failed to load CRM clients", err));
  }, []);

  // ── MULTI-SESSION LOGIC ──────────────────────────────────────
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("quotation_sessions");
    return saved ? JSON.parse(saved) : [{ id: 'default', title: 'New Quote', data: null }];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem("active_quotation_session") || 'default';
  });

  // Load session data when active session changes
  useEffect(() => {
    const session = sessions.find(s => s.id === activeSessionId);
    if (session && session.data) {
      const d = session.data;
      setItems(d.items || []);
      setClientName(d.clientName || "");
      setOrganizationName(d.organizationName || "");
      setClientAddress(d.clientAddress || "");
      setProjectTitle(d.projectTitle || "");
      setWorkDescription(d.workDescription || "");
      setBillType(d.billType || "GST");
      setQuoteId(d.quoteId || null);
      setEmailId(d.emailId || "");
      setMobileNo(d.mobileNo || "");
      setCustomerGst(d.customerGst || "");
      setDeliveryTimeline(d.deliveryTimeline || "3 to 4 Weeks");
      setInstallationMaterial(d.installationMaterial || 0);
      setDeliveryLoading(d.deliveryLoading || 0);
      setTransportationCharges(d.transportationCharges || 0);
      setAdditionalDiscount(d.additionalDiscount || 0);
      setCgstPercent(d.cgstPercent !== undefined ? d.cgstPercent : "9");
      setSgstPercent(d.sgstPercent !== undefined ? d.sgstPercent : "9");
      if (d.quoteDate) setQuoteDate(d.quoteDate);
      if (d.quoteNo) setQuoteNo(d.quoteNo);
    } else {
      // Clear for a new session if no data
      setItems([]);
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
      setTransportationCharges(0);
      setAdditionalDiscount(0);
      setCgstPercent("9");
      setSgstPercent("9");
      
      // Fetch the real internet date
      fetchInternetDate().then(realDate => {
        setQuoteDate(realDate);
        // Fetch the next quotation number from the backend with the internet date
        fetch(`/api/quotations/next-number?date=${realDate}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.nextNumber) {
              setQuoteNo(data.nextNumber);
            }
          })
          .catch(err => console.error("Failed to fetch next quote number:", err));
      });
    }
    localStorage.setItem("active_quotation_session", activeSessionId);
  }, [activeSessionId]);

  // Persist current state to sessions array
  useEffect(() => {
    const timer = setTimeout(() => {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        title: clientName || "New Quote",
        data: { items, clientName, organizationName, clientAddress, projectTitle, workDescription, billType, quoteNo, quoteId, quoteDate, emailId, mobileNo, customerGst, deliveryTimeline, installationMaterial, deliveryLoading, transportationCharges, additionalDiscount, cgstPercent, sgstPercent }
      } : s));
    }, 500);
    return () => clearTimeout(timer);
  }, [items, clientName, organizationName, clientAddress, projectTitle, workDescription, billType, quoteNo, quoteId, quoteDate, activeSessionId, emailId, mobileNo, customerGst, deliveryTimeline, installationMaterial, deliveryLoading, transportationCharges, additionalDiscount, cgstPercent, sgstPercent]);

  useEffect(() => {
    localStorage.setItem("quotation_sessions", JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession = { id: newId, title: 'New Quote', data: null };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const closeSession = (id, e) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      setSessions([{ id: 'default', title: 'New Quote', data: null }]);
      setActiveSessionId('default');
      return;
    }
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions[newSessions.length - 1].id);
    }
  };

  const componentRef = useRef();
  const descRef = useRef();
  const handlePrint = useReactToPrint({ contentRef: componentRef });

  useEffect(() => {
    if (location.state?.newSession) {
      createNewSession();
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }
    if (location.state?.editQuote) {
      const q = location.state.editQuote;
      const newId = `session-${Date.now()}`;
      const newSession = {
        id: newId,
        title: q.clientName || 'Edit Quote',
        data: {
          items: q.items || [],
          clientName: q.clientName || "",
          organizationName: q.organizationName || "",
          clientAddress: q.clientAddress || "",
          projectTitle: q.projectTitle || "",
          workDescription: q.workDescription || "",
          billType: q.billType || "GST",
          quoteNo: q.quoteNo || "",
          quoteId: q.id || null,
          quoteDate: q.date || new Date().toISOString().split('T')[0],
          emailId: q.emailId || "",
          mobileNo: q.mobileNo || "",
          customerGst: q.customerGst || "",
          deliveryTimeline: q.deliveryTimeline || "3 to 4 Weeks",
          installationMaterial: q.installationMaterial || 0,
          deliveryLoading: q.deliveryLoading || 0,
          transportationCharges: q.transportationCharges || 0,
          additionalDiscount: q.additionalDiscount || 0,
          cgstPercent: q.cgstPercent !== undefined ? q.cgstPercent : "9",
          sgstPercent: q.sgstPercent !== undefined ? q.sgstPercent : "9"
        }
      };
      setSessions(prev => [...prev, newSession]);
      setActiveSessionId(newId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  // Item modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);


  const openAddItemModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (savedItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === savedItem.id);
      if (exists) {
        return prev.map(i => i.id === savedItem.id ? savedItem : i);
      } else {
        return [...prev, savedItem];
      }
    });
    persistEnteredSections([savedItem]);
  };

  const removeItem = (id) => {
    showDialog({
      title: "Remove Item",
      message: "Are you sure you want to remove this item from the quotation?",
      type: "confirm",
      onConfirm: () => {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    });
  };

  const subTotal = items.reduce((s, i) => s + i.amount, 0);
  const delivery = parseFloat(deliveryLoading || 0);
  const transport = parseFloat(transportationCharges || 0);
  const installation = parseFloat(installationMaterial || 0);
  const discount = parseFloat(additionalDiscount || 0);
  const taxableAmount = Math.max(0, subTotal + delivery + transport + installation - discount);
  const cgstRate = billType === "GST" && cgstPercent !== "" ? parseFloat(cgstPercent || 0) : 0;
  const sgstRate = billType === "GST" && sgstPercent !== "" ? parseFloat(sgstPercent || 0) : 0;
  const cgstAmount = billType === "GST" ? (taxableAmount * cgstRate) / 100 : 0;
  const sgstAmount = billType === "GST" ? (taxableAmount * sgstRate) / 100 : 0;
  const grandTotal = taxableAmount + cgstAmount + sgstAmount;

  const totalArea = items.reduce(
    (s, i) => s + parseFloat(i.area || 0),
    0
  );

  const saveQuotation = async () => {
    if (!clientName || items.length === 0) {
      showDialog({ title: "Missing Information", message: "Add client name and at least one item.", type: "alert" });
      return;
    }
    
    if (mobileNo) {
      const cleanedPhone = mobileNo.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        showDialog({ title: "Invalid Phone Number", message: "Mobile number must be exactly 10 digits.", type: "alert" });
        return;
      }
    }

    const newQuote = {
      quoteNo: quoteNo || null, // Let backend assign the YY-MM-XXXX number atomically if empty
      clientName,
      organizationName,
      clientAddress,
      projectTitle,
      workDescription,
      items,
      date: quoteDate,
      total: grandTotal,
      billType,
      status: "Draft",
      emailId,
      mobileNo,
      customerGst,
      deliveryTimeline,
      installationMaterial,
      deliveryLoading,
      transportationCharges,
      additionalDiscount,
      cgstPercent,
      sgstPercent
    };
    try {
      persistEnteredSections(items);
      let res;
      if (quoteId) {
        res = await fetch(`/api/quotations/${quoteId}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(newQuote)
        });
        // If the quotation no longer exists on backend, create it as a fresh record
        if (res.status === 404) {
          setQuoteId(null);
          res = await fetch('/api/quotations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ...newQuote, quoteNo: null })
          });
        }
      } else {
        res = await fetch('/api/quotations', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(newQuote)
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to save quotation (${res.status})`);
      }
      
      const saved = await res.json();
      // Update displayed quote ID and quote number
      if (saved.id) {
        setQuoteId(saved.id);
      }
      if (saved.quoteNo) {
        setQuoteNo(saved.quoteNo);
        setSessions(prev => prev.map(s => s.id === activeSessionId
          ? { ...s, data: s.data ? { ...s.data, quoteNo: saved.quoteNo, quoteId: saved.id || quoteId } : s.data }
          : s
        ));
      }
      showDialog({ title: "Success", message: "Quotation Saved Successfully!", type: "success" });
      setTimeout(() => {
        if (!quoteId) {
          // Reset the form for the next quotation
          setItems([]);
          setClientName("");
          setOrganizationName("");
          setClientAddress("");
          setProjectTitle("");
          setWorkDescription("");
          setEmailId("");
          setMobileNo("");
          setCustomerGst("");
          setDeliveryTimeline("3 to 4 Weeks");
          setInstallationMaterial(0);
          setDeliveryLoading(0);
          setAdditionalDiscount(0);
          setQuoteId(null);
          fetch(`/api/quotations/next-number?date=${quoteDate}`)
            .then(res => res.json())
            .then(data => { if (data && data.nextNumber) setQuoteNo(data.nextNumber); })
            .catch(() => setQuoteNo(""));
        }
      }, 1500);
    } catch(err) { console.error(err); }
  };

  // ── CONVERT TO INVOICE ──────────────────────────────────────────
  const convertToInvoice = () => {
    if (!clientName || items.length === 0) {
      showDialog({ title: "Missing Information", message: "Add client name and at least one item before converting.", type: "alert" });
      return;
    }
    
    // Navigate to billing with quote data + billType in state
    navigate("/billing", {
      state: {
        convertQuote: {
          clientName,
          organizationName,
          clientAddress,
          projectTitle,
          workDescription,
          items,
          billType,
          installationMaterial,
          deliveryLoading,
          transportationCharges,
          additionalDiscount,
          cgstPercent,
          sgstPercent,
          totalAmount: grandTotal,
        },
      },
    });
  };

  const convertToWorkOrder = () => {
    if (!clientName || items.length === 0) {
      showDialog({ title: "Missing Information", message: "Add client name and at least one item before converting.", type: "alert" });
      return;
    }
    
    navigate("/sites", {
      state: {
        convertQuote: {
          id: quoteId,
          clientName,
          organizationName,
          clientAddress,
          projectTitle,
          workDescription,
          totalAmount: grandTotal,
        },
      },
    });
  };

  const clearForm = () => {
    showDialog({
      title: "Clear Form",
      message: "Clear all quotation data?",
      type: "confirm",
      onConfirm: () => {
        setItems([]);
        setClientName("");
        setOrganizationName("");
        setClientAddress("");
        setEmailId("");
        setMobileNo("");
        setCustomerGst("");
        setDeliveryTimeline("3 to 4 Weeks");
        setInstallationMaterial(0);
        setDeliveryLoading(0);
        setTransportationCharges(0);
        setAdditionalDiscount(0);
        setCgstPercent("9");
        setSgstPercent("9");
      }
    });
  };

  return (
    <div className="page-wrapper min-h-screen font-sans flex flex-col text-sm bg-white dark:bg-slate-950">
      {/* Sessions Tab Bar */}
      <div className="bg-white dark:bg-slate-900 px-4 pt-2.5 flex items-center justify-between border-b border-[var(--border-color)] relative z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeSessionId === s.id 
                ? "bg-white dark:bg-slate-800 text-[var(--text-primary)] border border-b-0 border-[var(--border-color)] shadow-sm" 
                : "bg-slate-100 dark:bg-slate-800/40 text-[var(--text-muted)] hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText size={14} className={activeSessionId === s.id ? "text-[var(--accent)]" : "opacity-40"} />
              <span className="max-w-[140px] truncate">{s.title}</span>
              <button 
                onClick={(e) => closeSession(s.id, e)}
                className={`p-1 rounded-full hover:bg-black/10 transition ${activeSessionId === s.id ? "text-slate-400 hover:text-red-500" : "text-slate-500 hover:text-white"}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button 
            onClick={createNewSession}
            className="p-2 text-[var(--accent)] hover:opacity-70 transition hover:bg-[var(--accent-soft)] rounded-full mb-1"
            title="New Quotation Session"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
        <div className="pb-1.5 pl-3 shrink-0 relative z-50">
          <NotificationWidget compact={true} />
        </div>
      </div>
      {/* ── TOP INFO BAR (Compact Single Row) ── */}
      <div className="themed-card p-3 md:p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 border-b border-[var(--border-color)] items-end">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Quote No</label>
          <input disabled value={quoteNo}
            className="w-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-amber-800 dark:text-[var(--accent)] px-3 py-1.5 text-xs sm:text-sm font-black outline-none rounded-lg" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Date</label>
          <input 
            type="date" 
            value={quoteDate}
            onChange={(e) => {
              const newDate = e.target.value;
              setQuoteDate(newDate);
              if (!quoteId) {
                 fetch(`/api/quotations/next-number?date=${newDate}`)
                  .then(res => res.json())
                  .then(data => { if (data && data.nextNumber) setQuoteNo(data.nextNumber); })
                  .catch(() => setQuoteNo(""));
              }
            }}
            className="w-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-amber-800 dark:text-[var(--accent)] px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg" />
        </div>

        {/* Bill Type Toggle */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Bill Type</label>
          <div className="flex bg-white/10 dark:bg-black/20 rounded-lg p-0.5 gap-1 border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setBillType("GST")}
              className={`flex-1 py-1 text-xs font-black uppercase rounded-md transition ${billType === "GST" ? "bg-amber-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >GST</button>
            <button
              type="button"
              onClick={() => setBillType("Non-GST")}
              className={`flex-1 py-1 text-xs font-black uppercase rounded-md transition ${billType === "Non-GST" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >Non-GST</button>
          </div>
        </div>

        {/* Client Name */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Client Name
          </label>
          <input
            list="crm-clients-list-quotation"
            placeholder="Enter client name..."
            value={clientName}
            onChange={(e) => {
              const val = e.target.value;
              setClientName(val);
              const matchedClient = crmClients.find(c => c.name.toLowerCase() === val.toLowerCase());
              if (matchedClient) {
                setOrganizationName(matchedClient.organizationName || "");
                setEmailId(matchedClient.email || "");
                setMobileNo(matchedClient.phone || "");
                setClientAddress(matchedClient.address || "");
              }
            }}
            className="w-full themed-input border border-[var(--border-color)] px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg outline-none focus:border-amber-400 transition"
          />
          <datalist id="crm-clients-list-quotation">
            {crmClients.map(c => (
              <option key={c.id} value={c.name}>{c.organizationName ? `${c.organizationName}` : ""}</option>
            ))}
          </datalist>
        </div>

        {/* Client Details Dialog Trigger Button */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Client Details
          </label>
          <button
            type="button"
            onClick={() => setIsClientDetailsModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-white dark:bg-slate-900 hover:border-amber-500 hover:bg-amber-500/5 transition group shadow-sm"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Building size={14} className="text-amber-600 dark:text-[var(--accent)] shrink-0" />
              <span className="truncate text-xs font-bold text-themed">
                {projectTitle || (mobileNo ? `Ph: ${mobileNo}` : "Client Details")}
              </span>
            </div>
            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-[var(--accent)] border border-amber-500/20 shrink-0 ml-1">
              {projectTitle || mobileNo || clientAddress ? "Edit" : "+ Add"}
            </span>
          </button>
        </div>

        {/* Sub Total */}
        <div className="md:col-span-1 flex flex-col md:items-end justify-center pb-0.5">
          <span className="text-[10px] font-bold text-amber-700 dark:text-[var(--accent)] uppercase tracking-wider">Sub Total</span>
          <span className="text-sm md:text-base font-black text-amber-700 dark:text-[var(--accent)] whitespace-nowrap">₹{formatINR(subTotal)}</span>
        </div>
      </div>


      {/* ── MAIN TABLE ── */}
      <div className="flex-grow bg-white dark:bg-slate-950 overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm min-w-[1050px] border-collapse">
          <thead className="border-b-2 border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
            <tr className="uppercase text-slate-900 dark:text-white font-black text-xs tracking-wider">
              <th className="px-3.5 py-3.5 text-center w-14 font-black">SI</th>
              <th className="px-3.5 py-3.5 text-left w-36 font-black">Section</th>
              <th className="px-3.5 py-3.5 text-left w-52 font-black">Product / Category</th>
              <th className="px-3.5 py-3.5 text-left font-black">Specification & Material</th>
              <th className="px-3.5 py-3.5 text-center w-16 font-black">Qty</th>
              <th className="px-3.5 py-3.5 text-center w-16 font-black">Unit</th>
              <th className="px-3.5 py-3.5 text-right w-28 font-black">Rate (₹)</th>
              <th className="px-3.5 py-3.5 text-right w-24 font-black">Discount</th>
              <th className="px-3.5 py-3.5 text-right w-32 font-black">Amount (₹)</th>
              <th className="px-3.5 py-3.5 text-center w-24 font-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {items.map((item, idx) => (
              <tr key={item.id} className="themed-row bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-3.5 py-3.5 text-center font-bold text-muted text-sm">
                  {idx + 1}
                </td>
                <td className="px-3.5 py-3.5">
                  {item.section ? (
                    <span className="font-bold text-black dark:text-white text-sm whitespace-pre-wrap">
                      {item.section}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-3.5 py-3.5 font-bold text-themed text-sm">
                  {item.product || "—"}
                </td>
                <td className="px-3.5 py-3.5 text-muted leading-relaxed whitespace-pre-wrap max-w-md text-sm">
                  {item.specification || "—"}
                </td>
                <td className="px-3.5 py-3.5 text-center font-black text-themed text-sm">
                  {item.qty}
                </td>
                <td className="px-3.5 py-3.5 text-center text-muted font-medium text-sm">
                  {item.unit || "Sq.Ft"}
                </td>
                <td className="px-3.5 py-3.5 text-right font-bold text-themed text-sm">
                  {formatINR(item.rate)}
                </td>
                <td className="px-3.5 py-3.5 text-right text-muted font-semibold text-sm">
                  {item.discountType === 'price' && item.discountPrice && parseFloat(item.discountPrice) > 0 ? (
                    <span className="text-amber-700 dark:text-[var(--accent)] font-bold">₹{formatINR(item.discountPrice)}</span>
                  ) : item.discountPercent && parseFloat(item.discountPercent) > 0 ? (
                    <span className="text-amber-600 dark:text-[var(--accent)] font-bold">{item.discountPercent}%</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3.5 py-3.5 text-right font-black text-amber-700 dark:text-[var(--accent)] text-base">
                  {formatINR(item.amount || 0)}
                </td>
                <td className="px-3.5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditItemModal(item)}
                      className="p-2 text-amber-700 hover:text-amber-800 dark:text-[var(--accent)] hover:bg-amber-500/10 rounded-lg transition"
                      title="Edit Item"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="py-16 text-center text-muted"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText size={38} className="opacity-30" />
                    <span className="text-sm font-bold uppercase tracking-wider">No items added to quotation</span>
                    <p className="text-xs text-muted font-medium">Click "Add Item" below to add your first item.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Action button below table */}
        <div className="p-4 border-t border-[var(--border-color)] bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddItemModal}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A227] hover:bg-[#B8911F] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg shadow-amber-900/15 transition-all"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Item
            </button>
            <button 
              onClick={() => openOptionsModal("products")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-[var(--border-color)]"
            >
              <Settings size={15} /> Manage Options
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className="font-bold text-muted">
              Total Items: <strong className="text-themed font-black text-base">{items.length}</strong>
            </span>
            <span className="font-bold text-muted">
              Sub Total: <strong className="text-amber-700 dark:text-[var(--accent)] font-black text-base">₹{formatINR(subTotal)}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div className="bg-white dark:bg-slate-900 p-4 border-t border-[var(--border-color)] flex flex-wrap justify-between items-center gap-4">
        {/* Stats and Extra Charges */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-4 py-2 flex gap-2.5 items-center rounded-xl">
            <span className="text-xs font-bold text-amber-800 dark:text-[var(--accent)] uppercase">Total Qty:</span>
            <span className="text-base font-black text-[var(--text-primary)]">{items.reduce((s, i) => s + parseFloat(i.qty || 0), 0)}</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Delivery (₹)</label>
             <input value={deliveryLoading} onChange={e=>setDeliveryLoading(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-28 themed-input px-3 py-1.5 text-sm text-right border border-[var(--border-color)] rounded-lg font-bold outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Transport (₹)</label>
             <input value={transportationCharges} onChange={e=>setTransportationCharges(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-28 themed-input px-3 py-1.5 text-sm text-right border border-[var(--border-color)] rounded-lg font-bold outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Discount (₹)</label>
             <input value={additionalDiscount} onChange={e=>setAdditionalDiscount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-28 themed-input px-3 py-1.5 text-sm text-right border border-[var(--border-color)] rounded-lg font-bold outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Instal. Mat. (₹)</label>
             <input value={installationMaterial} onChange={e=>setInstallationMaterial(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="w-28 themed-input px-3 py-1.5 text-sm text-right border border-[var(--border-color)] rounded-lg font-bold outline-none focus:border-amber-400" />
          </div>

          {/* CGST and SGST text boxes ONLY appear for GST */}
          {billType === 'GST' && (
            <>
              <div className="flex flex-col gap-1.5 bg-amber-500/5 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <label className="text-[11px] font-black text-amber-700 dark:text-[var(--accent)] uppercase flex items-center justify-between gap-2">
                  <span>CGST (%)</span>
                  <span className="text-[10px] opacity-80 font-bold">₹{formatINR(cgstAmount)}</span>
                </label>
                <input 
                  value={cgstPercent} 
                  onChange={e => setCgstPercent(e.target.value.replace(/[^0-9.]/g, ''))} 
                  placeholder="9" 
                  className="w-24 themed-input px-2.5 py-1.5 text-sm text-right border border-amber-500/30 rounded-lg font-bold text-amber-700 dark:text-[var(--accent)] outline-none focus:border-[#C9A227]" 
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-amber-500/5 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <label className="text-[11px] font-black text-amber-700 dark:text-[var(--accent)] uppercase flex items-center justify-between gap-2">
                  <span>SGST (%)</span>
                  <span className="text-[10px] opacity-80 font-bold">₹{formatINR(sgstAmount)}</span>
                </label>
                <input 
                  value={sgstPercent} 
                  onChange={e => setSgstPercent(e.target.value.replace(/[^0-9.]/g, ''))} 
                  placeholder="9" 
                  className="w-24 themed-input px-2.5 py-1.5 text-sm text-right border border-amber-500/30 rounded-lg font-bold text-amber-700 dark:text-[var(--accent)] outline-none focus:border-[#C9A227]" 
                />
              </div>
            </>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex items-center gap-4">
          <div className="text-4xl text-amber-700 dark:text-[var(--accent)] font-light">₹</div>
          <div className="themed-card border border-[var(--border-color)] px-8 py-3 rounded-2xl shadow-inner text-right min-w-[240px]">
            <div className="text-xs font-bold text-amber-700 dark:text-[var(--accent)] uppercase mb-0.5">
              {billType === 'GST' ? "Grand Total (incl. GST)" : "Estimated Total"}
            </div>
            <div className="text-4xl md:text-5xl font-black text-amber-700 dark:text-[var(--accent)] tracking-tight">
              {formatINR(grandTotal)}
            </div>
            {billType === 'GST' ? (
              <div className="text-[11px] font-bold text-amber-700 dark:text-[var(--accent)] mt-1">
                CGST ({cgstPercent || 0}%): ₹{formatINR(cgstAmount)} | SGST ({sgstPercent || 0}%): ₹{formatINR(sgstAmount)}
              </div>
            ) : (
              <div className="text-[11px] font-bold text-muted mt-1">
                Non-GST Quotation
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="bg-white dark:bg-slate-900 p-3.5 flex flex-wrap justify-center gap-3 border-t border-[var(--border-color)] shadow-md">
        <button
          onClick={clearForm}
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-sm hover:shadow"
        >
          <RotateCcw size={16} /> Clear
        </button>
        <button
          onClick={() => navigate("/invoices", { state: { activeTab: "quotations" } })}
          className="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-sm hover:shadow"
        >
          <History size={16} /> Quotations
        </button>
        <button
          onClick={async () => { await saveQuotation(); handlePrint(); }}
          disabled={items.length === 0}
          className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-sm hover:shadow"
        >
          <Printer size={16} /> Generate & Print
        </button>
        <button
          onClick={saveQuotation}
          className="bg-amber-600 hover:bg-amber-700 text-white px-7 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-sm hover:shadow"
        >
          <Save size={16} /> Generate
        </button>

        <button
          onClick={convertToWorkOrder}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-sm hover:shadow"
        >
          <ArrowRight size={16} /> Convert to Work Order
        </button>
      </div>

      <div className="opacity-0 fixed top-0 left-0 pointer-events-none">
        <PrintableQuotation
          ref={componentRef}
          data={{ customer: clientName, address: clientAddress, projectTitle, workDescription, items, quoteNo, date: quoteDate, billType, emailId, mobileNo, customerGst, deliveryTimeline, installationMaterial, deliveryLoading, transportationCharges, additionalDiscount, cgstPercent, sgstPercent }}
        />
      </div>
      {/* ── QUOTATION ITEM MODAL ── */}
      <QuotationItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
        productsList={productsList}
        specificationsList={specificationsList}
        sectionSuggestions={previouslyEnteredSections}
        onOpenManageOptions={openOptionsModal}
      />

      {/* ── MANAGE OPTIONS MODAL ── */}
      <ManageOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        activeTab={activeOptionsTab}
        setActiveTab={setActiveOptionsTab}
        productsList={productsList}
        setProductsList={setProductsList}
        specificationsList={specificationsList}
        setSpecificationsList={setSpecificationsList}
        onRenameOption={handleRenameOption}
      />

      {/* ── CLIENT & PROJECT DETAILS MODAL ── */}
      <ClientDetailsModal
        isOpen={isClientDetailsModalOpen}
        onClose={() => setIsClientDetailsModalOpen(false)}
        organizationName={organizationName}
        setOrganizationName={setOrganizationName}
        mobileNo={mobileNo}
        setMobileNo={setMobileNo}
        emailId={emailId}
        setEmailId={setEmailId}
        customerGst={customerGst}
        setCustomerGst={setCustomerGst}
        deliveryTimeline={deliveryTimeline}
        setDeliveryTimeline={setDeliveryTimeline}
        clientAddress={clientAddress}
        setClientAddress={setClientAddress}
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
      />

    </div>
  );
}
