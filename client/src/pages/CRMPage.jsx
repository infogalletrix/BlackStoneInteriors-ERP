import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  User, Briefcase, Calendar, Plus, Phone, MapPin, Search, DollarSign, Activity, CheckCircle, Clock, Mail, Tag, Percent, BarChart2, Download, Filter, PieChart, Trash2, List, Grid, Edit3, Settings, FileText, ChevronDown, Play, Pause, XCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDialog } from "../contexts/DialogContext";
import NotificationWidget from "../components/NotificationWidget";

// Light Premium Modal
function Modal({ open, onClose, children, size = "max-w-lg" }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`themed-modal rounded-[2rem] shadow-2xl p-8 w-full ${size} relative max-h-[90vh] overflow-y-auto custom-scrollbar`}>
          <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-red-400 text-3xl leading-none transition-colors">&times;</button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const CRMPage = () => {
  const { showDialog } = useDialog();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("leads");
  
  useEffect(() => {
    const p = location.pathname.split('/').pop();
    if (p === 'leads') setActiveTab('leads');
    else if (p === 'customers') setActiveTab('customers');
    else if (p === 'not-interested') setActiveTab('not_interested');
    else if (p === 'pipeline') setActiveTab('pipeline');
    else if (p === 'schedule') setActiveTab('schedule');
    else if (p === 'telecalling') setActiveTab('telecalling'); 
    else if (p === 'marketing') setActiveTab('campaigns'); 
    else if (p === 'document-vault') setActiveTab('document_vault');
    else if (p === 'crm') setActiveTab('site_surveys');
  }, [location.pathname]);

  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState("list");

  const [contacts, setContacts] = useState([]);
  const [pipeline, setPipeline] = useState({
    LEAD: { id: "LEAD", title: "LEADS", deals: [] },
    CONTACTED: { id: "CONTACTED", title: "CONTACTED", deals: [] },
    PROPOSAL: { id: "PROPOSAL", title: "PROPOSALS", deals: [] },
    NEGOTIATION: { id: "NEGOTIATION", title: "NEGOTIATING", deals: [] },
    WON: { id: "WON", title: "CLOSED WON", deals: [] },
    LOST: { id: "LOST", title: "CLOSED LOST", deals: [] },
  });
  const [activities, setActivities] = useState([]);
  const [sites, setSites] = useState([]);
  
  const [campaigns, setCampaigns] = useState([]);

  const [editCampaign, setEditCampaign] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [editDeal, setEditDeal] = useState(null);
  const [editActivity, setEditActivity] = useState(null);
  const [editSiteSurvey, setEditSiteSurvey] = useState(null);
  const [editSiteMode, setEditSiteMode] = useState('full');
  const [feedback, setFeedback] = useState("");

  const [telecalls, setTelecalls] = useState([]);
  const [selectedCallNote, setSelectedCallNote] = useState(null);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, dRes, aRes, sRes] = await Promise.all([
        fetch('/api/crm').then(res => res.json()),
        fetch('/api/crm/deals/all').then(res => res.json()),
        fetch('/api/crm/activities/all').then(res => res.json()),
        fetch('/api/sites').then(res => res.json()),
      ]);
      setContacts(cRes);
      setSites(sRes);
      
      const newPipe = {
        LEAD: { id: "LEAD", title: "LEADS", deals: [] },
        CONTACTED: { id: "CONTACTED", title: "CONTACTED", deals: [] },
        PROPOSAL: { id: "PROPOSAL", title: "PROPOSALS", deals: [] },
        NEGOTIATION: { id: "NEGOTIATION", title: "NEGOTIATING", deals: [] },
        WON: { id: "WON", title: "CLOSED WON", deals: [] }
      };
      dRes.forEach(d => {
        const stage = d.stage || "LEAD";
        if(newPipe[stage]) {
          newPipe[stage].deals.push({ id: d.id, contactId: d.contact_id, title: d.title, value: Number(d.value), closeDate: d.close_date ? d.close_date.split('T')[0] : '' });
        }
      });
      setPipeline(newPipe);
      setActivities(aRes.map(a => ({ id: a.id, type: a.type, date: a.date ? a.date.split('T')[0] : '', client: a.client, status: a.status, notes: a.notes || '' })));
    } catch(err) {
      console.error(err);
    }
  };

  React.useEffect(() => { loadData(); }, []);

  const showFeedback = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(""), 2500); };

  const handleContactSave = async (updated) => {
    try {
      if (!updated.id) {
        updated.date = new Date().toISOString().split('T')[0];
        const res = await fetch('/api/crm', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(updated) });
        if (res.ok) {
           const data = await res.json();
           const createdContactId = data.id;
           
           // Automatically create a deal for this new contact
           if (['Lead', 'Cold', 'Warm', 'Hot', 'Customer'].includes(updated.status || 'Lead')) {
             await fetch('/api/crm/deals', { 
               method: 'POST', 
               headers: {'Content-Type':'application/json'}, 
                body: JSON.stringify({
                 title: updated.project || `${updated.name} - Deal`,
                 contactId: String(createdContactId),
                 value: 0,
                 stage: 'LEAD',
                 closeDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
               }) 
             });
           }
        }
      } else {
        await fetch(`/api/crm/${updated.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(updated) });
      }
      await loadData();
      setEditContact(null); showFeedback("Client profile saved successfully");
    } catch(err) { showFeedback("Error saving"); }
  };

  const handleDealSave = async (updated) => {
    try {
      if (!updated.id) {
        updated.id = `deal-${Date.now()}`;
        updated.stage = "LEAD";
        await fetch('/api/crm/deals', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...updated, closeDate: updated.closeDate}) });
      } else {
        // Find existing stage to keep it
        let stage = "LEAD";
        for (const [key, col] of Object.entries(pipeline)) {
          if(col.deals.some(d => d.id === updated.id)) stage = key;
        }
        await fetch(`/api/crm/deals/${updated.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...updated, closeDate: updated.closeDate, stage}) });
      }
      loadData();
      setEditDeal(null); showFeedback("Project deal saved successfully");
    } catch(err) { showFeedback("Error saving"); }
  };

  const handleActivitySave = async (updated) => {
    try {
      if (!updated.id) {
        await fetch('/api/crm/activities', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(updated) });
      } else {
        await fetch(`/api/crm/activities/${updated.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(updated) });
      }
      loadData();
      setEditActivity(null); showFeedback("Activity tracked successfully");
    } catch(err) { showFeedback("Error saving"); }
  };

  const completeActivity = async (act) => {
    try {
      await fetch(`/api/crm/activities/${act.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...act, status: 'Completed'}) });
      loadData(); showFeedback("Activity marked as completed");
    } catch(err) { showFeedback("Error completing activity"); }
  };

  const handleCallNow = async (contact) => {
    try {
      await fetch('/api/crm/activities', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ type: 'Outbound Call', date: new Date().toISOString(), client: contact.id, status: 'Pending', notes: 'Call attempted from dashboard' }) });
      loadData();
      showFeedback(`Dialing ${contact.name}... (Activity logged)`);
    } catch(err) {}
  };

  const handleNoAnswer = async (contact) => {
    try {
      await fetch('/api/crm/activities', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ type: 'Outbound Call', date: new Date().toISOString(), client: contact.id, status: 'Completed', notes: 'No Answer' }) });
      if (contact.status === 'Cold' || !contact.status) {
         await fetch(`/api/crm/${contact.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...contact, status: 'Lead'}) });
      }
      loadData();
      showFeedback("Logged as No Answer.");
    } catch(err) {}
  };

  const handleMarkNotInterested = (contactOrDealId, isDeal = false) => {
    showDialog({
      title: "Mark Not Interested",
      message: "Are you sure you want to mark this lead as Not Interested? This will remove them from the active sales pipeline.",
      type: "confirm",
      onConfirm: async () => {
        try {
          let contactId = contactOrDealId;
          if (isDeal) {
             const pipelineDeals = Object.values(pipeline).flatMap(col => col.deals);
             const deal = pipelineDeals.find(d => d.id === contactOrDealId);
             if (deal) contactId = deal.contactId;
          }
          
          const contact = contacts.find(c => c.id == contactId);
          if (contact) {
            await fetch(`/api/crm/${contact.id}`, { 
              method: 'PUT', 
              headers: {'Content-Type':'application/json'}, 
              body: JSON.stringify({...contact, status: 'Not Interested'}) 
            });
          }

          const pipelineDeals = Object.values(pipeline).flatMap(col => col.deals);
          const dealsToUpdate = pipelineDeals.filter(d => d.contactId == contactId);
          for (const deal of dealsToUpdate) {
            await fetch(`/api/crm/deals/${deal.id}`, { 
              method: 'PUT', 
              headers: {'Content-Type':'application/json'}, 
              body: JSON.stringify({...deal, stage: 'LOST'}) 
            });
          }

          await loadData();
          showFeedback("Marked as Not Interested!");
        } catch(err) {
          showFeedback("Error updating status.");
        }
      }
    });
  };

  const handleCampaignSave = (savedCampaign) => {
    if (!savedCampaign.id) {
       setCampaigns([...campaigns, { ...savedCampaign, id: `C${Date.now()}`, reach: 0, engaged: 0, conversions: 0 }]);
    } else {
       setCampaigns(campaigns.map(c => c.id === savedCampaign.id ? savedCampaign : c));
    }
    setEditCampaign(null);
    showFeedback("Campaign saved successfully!");
  };

  const handleSiteSurveySave = async (updated) => {
    try {
      const payload = {
        ...updated,
        id: updated.id ? String(updated.id) : undefined,
        budget: Number(updated.budget) || 0
      };
      
      let res;
      if (!updated.id) {
        res = await fetch('/api/sites', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`/api/sites/${updated.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      }
      
      if (!res.ok) throw new Error("Failed to save site data");
      
      loadData();
      setEditSiteSurvey(null); showFeedback("Site & Survey Notes saved successfully");
    } catch(err) { showFeedback("Error saving site survey notes"); }
  };

  const deleteActivity = (id) => {
    showDialog({
      title: "Delete Activity",
      message: "Are you sure you want to delete this activity?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`/api/crm/activities/${id}`, { method: 'DELETE' });
          loadData(); showFeedback("Activity deleted");
        } catch(err) { showFeedback("Error deleting activity"); }
      }
    });
  };

  const deleteContact = (id) => {
    showDialog({
      title: "Delete Client",
      message: "Are you sure you want to delete this client profile? Associated data might be affected.",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`/api/crm/${id}`, { method: 'DELETE' });
          loadData(); showFeedback("Client profile deleted");
        } catch(err) { showFeedback("Error deleting client"); }
      }
    });
  };

  const handleConvertToCustomer = async (contact) => {
    try {
      const updatedContact = { ...contact, status: 'Customer' };
      await fetch(`/api/crm/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContact)
      });
      loadData();
      showFeedback(`${contact.name} is now a Customer!`);
    } catch (err) {
      showFeedback("Error converting to customer");
    }
  };

  const deleteDeal = (id) => {
    showDialog({
      title: "Delete Deal",
      message: "Are you sure you want to delete this deal? Quotations linked to this deal will also be removed.",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`/api/crm/deals/${id}`, { method: 'DELETE' });
          loadData(); showFeedback("Deal deleted successfully");
        } catch(err) { showFeedback("Error deleting deal"); }
      }
    });
  };

  const deleteSite = (id) => {
    showDialog({
      title: "Delete Site Survey",
      message: "Are you sure you want to delete this site survey? This action cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`/api/sites/${id}`, { method: 'DELETE' });
          loadData(); showFeedback("Site survey deleted successfully");
        } catch(err) { showFeedback("Error deleting site survey"); }
      }
    });
  };

  // --- ADVANCED METRICS (Removed Probability Weighted) ---
  const { totalValue, wonValue, activeCount } = useMemo(() => {
    let t = 0, won = 0, count = 0;
    Object.values(pipeline).forEach((col) => {
      col.deals.forEach((d) => {
        t += d.value;
        if (col.id === 'WON') won += d.value;
        else if (col.id !== 'LOST') { count++; }
      });
    });
    return { totalValue: t, wonValue: won, activeCount: count };
  }, [pipeline]);

  // --- EXPORT TO PDF ---
  const exportContactsToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.setFontSize(20);
    doc.text("Black Stone Interiorss - Client List", 14, 22);
    const tableColumn = ["Name", "Project", "Phone", "Status", "Source"];
    const tableRows = contacts.map(c => [c.name, c.project, c.phone, c.status, c.source || "N/A"]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30, theme: 'grid', headStyles: { fillColor: [41, 37, 36] } });
    doc.save("clients_report.pdf");
    showFeedback("PDF Report Exported!");
  };

  // Filters
  const checkMonth = (dateString) => {
    if (monthFilter === "All" || !dateString) return true;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return true;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const dMonth = date.getMonth();
    const dYear = date.getFullYear();

    if (monthFilter === "Current") {
      return dMonth === currentMonth && dYear === currentYear;
    }
    if (monthFilter === "Previous") {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return dMonth === prevMonth && dYear === prevYear;
    }
    if (monthFilter === "Next") {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      return dMonth === nextMonth && dYear === nextYear;
    }
    if (monthFilter === "Custom") {
      if (!customDateRange.start && !customDateRange.end) return true;
      const start = customDateRange.start ? new Date(customDateRange.start) : new Date('1970-01-01');
      const end = customDateRange.end ? new Date(customDateRange.end) : new Date('2099-12-31');
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return date >= start && date <= end;
    }
    return true;
  };

  const filteredContacts = contacts.filter((c) => {
    let tabMatch = true;
    if (activeTab === 'leads') {
      tabMatch = ['Lead', 'Cold'].includes(c.status) || !c.status;
    } else if (activeTab === 'customers') {
      tabMatch = c.status === 'Customer';
    } else if (activeTab === 'not_interested') {
      tabMatch = c.status === 'Not Interested';
    }

    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.project || "").toLowerCase().includes(searchTerm.toLowerCase()) || (c.tags && c.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase()));
    return searchMatch && checkMonth(c.date) && tabMatch;
  });

  const filteredActivities = activities.filter((a) => {
    const clientName = contacts.find(c => c.id === a.client)?.name || "";
    const searchMatch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch && checkMonth(a.date);
  });

  const filteredSites = sites.filter((s) => {
    const searchMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch && checkMonth(s.startDate);
  });

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sourceCol = pipeline[source.droppableId];
    const destCol = pipeline[destination.droppableId];
    const sourceDeals = [...sourceCol.deals];
    const destDeals = [...destCol.deals];
    const [movedDeal] = sourceDeals.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceDeals.splice(destination.index, 0, movedDeal);
      setPipeline({ ...pipeline, [source.droppableId]: { ...sourceCol, deals: sourceDeals } });
    } else {
      destDeals.splice(destination.index, 0, movedDeal);
      setPipeline({ ...pipeline, [source.droppableId]: { ...sourceCol, deals: sourceDeals }, [destination.droppableId]: { ...destCol, deals: destDeals } });
      
      // Update in DB
      try {
        await fetch(`/api/crm/deals/${movedDeal.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({...movedDeal, stage: destination.droppableId})
        });
      } catch (e) {
        console.error("Failed to update deal stage", e);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 page-wrapper">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full dark:bg-violet-600/15 bg-orange-300/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full dark:bg-indigo-600/10 bg-amber-200/10 blur-[120px]" />
      </div>

      {/* HEADER & TABS */}
      <div className="flex flex-col mb-4 gap-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row items-center justify-between gap-3 w-full relative z-10">
          
          {/* TABS (Left) */}
          <div className="flex w-full md:w-auto gap-1 p-1 rounded-xl border border-[var(--border-color)] themed-card shadow-sm overflow-x-auto order-2 lg:order-1">
            {[
              { id: "leads", label: "Leads", icon: <User size={14} /> },
              { id: "customers", label: "Customers", icon: <User size={14} /> },
              { id: "not_interested", label: "Not Interested", icon: <XCircle size={14} /> },
              { id: "pipeline", label: "Pipeline", icon: <Briefcase size={14} /> },
              { id: "site_surveys", label: "Site Surveys", icon: <MapPin size={14} /> },
              { id: "schedule", label: "Schedule", icon: <Calendar size={14} /> },
              { id: "telecalling", label: "Telecalling", icon: <Phone size={14} /> },
              { id: "campaigns", label: "Campaigns", icon: <BarChart2 size={14} /> },
            ].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }} className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? "dark:bg-violet-600 bg-accent text-white shadow-md" : "text-muted hover:text-themed hover:bg-[var(--bg-card-hover)]"}`}>
                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SEARCH BAR & FILTER (Middle) */}
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 order-1 lg:order-2 flex-1 items-center justify-center">
            <div className="relative w-full group shadow-sm rounded-xl max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-themed transition-colors" size={16} />
              <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-color)] themed-input text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select 
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full sm:w-40 py-2.5 px-3 rounded-xl border border-[var(--border-color)] themed-input text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all [&>option]:bg-[var(--modal-bg)]"
            >
              <option value="All">All Months</option>
              <option value="Previous">Previous Month</option>
              <option value="Current">Current Month</option>
              <option value="Next">Next Month</option>
              <option value="Custom">Custom Date Range</option>
            </select>
            {monthFilter === "Custom" && (
              <div className="flex gap-2 w-full sm:w-auto items-center">
                <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})} className="w-full sm:w-auto py-2.5 px-2 rounded-xl border border-[var(--border-color)] themed-input text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all" />
                <span className="text-muted text-xs font-bold uppercase">to</span>
                <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})} className="w-full sm:w-auto py-2.5 px-2 rounded-xl border border-[var(--border-color)] themed-input text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all" />
              </div>
            )}
          </div>

          {/* ADD BUTTON (Right) */}
          <div className="flex w-full md:w-auto order-3 gap-3 items-center">
            {activeTab !== "campaigns" && activeTab !== "telecalling" && activeTab !== "not_interested" && (
              <button onClick={() => { if (activeTab === "leads" || activeTab === "customers") setEditContact({ status: 'Cold', tags: [] }); else if (activeTab === "pipeline") setEditDeal({ value: 0, contactId: contacts[0]?.id || '' }); else if (activeTab === "site_surveys") { setEditSiteMode('full'); setEditSiteSurvey({ name: '', clientName: '', address: '', status: 'Pre-Construction', startDate: new Date().toISOString().split('T')[0], surveyNotes: '' }); } else setEditActivity({ type: '', date: new Date().toISOString().split('T')[0], client: contacts[0]?.id || '', status: 'Pending' }); }} className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 dark:bg-violet-700 bg-accent text-white shadow-lg dark:hover:bg-slate-800 hover:bg-accent-hover">
                <Plus size={16} /> <span className="hidden sm:inline">Add New</span>
              </button>
            )}
            <NotificationWidget />
          </div>

        </motion.div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="themed-card rounded-[2.5rem] shadow-2xl min-h-[500px] overflow-visible">
        
        {/* SECTION: DEALS (KANBAN) */}
        {activeTab === "pipeline" && (
          <div className="p-4 sm:p-5 overflow-x-auto w-full">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex flex-row gap-2 sm:gap-3 w-full min-w-[1200px]">
                {Object.values(pipeline).map((column) => (
                  <div key={column.id} className="flex-1 min-w-0 flex flex-col themed-card rounded-[1.25rem] p-2 sm:p-3">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-3 gap-1">
                      <h3 className="text-[9px] sm:text-[10px] font-black text-slate-500 tracking-widest uppercase truncate">{column.title}</h3>
                      <span className="themed-card text-muted border border-[var(--border-color)] text-[10px] font-black px-2 py-0.5 rounded-md self-start xl:self-auto">{column.deals.length}</span>
                    </div>
                    <Droppable droppableId={column.id} renderClone={(provided, snapshot, rubric) => {
                      const deal = column.deals[rubric.source.index];
                      const contact = contacts.find((c) => c.id === deal.contactId);
                      return (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{...provided.draggableProps.style, zIndex: 9999, margin: 0}} className="themed-card p-3 sm:p-4 rounded-xl border shadow-2xl border-violet-500/50 scale-[1.02] rotate-1 opacity-90">
                          <div className="mb-2">
                            <h4 className="font-black text-themed text-xs sm:text-sm leading-snug truncate">{deal.title}</h4>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                              {contact?.name.charAt(0).toUpperCase() || '?'}
                            </div>
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">{contact?.name || 'Unknown'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 mb-4">
                            <Phone size={12} className="text-slate-500" /> {contact?.phone || 'N/A'}
                          </div>
                          <div className="text-xs sm:text-sm font-black text-emerald-400 mb-3 bg-emerald-500/10 w-max px-2 py-0.5 rounded-md border border-emerald-500/20">₹{(deal.value/100000).toFixed(2)}L</div>
                          <div className="pt-2 border-t border-[var(--border-color)] flex justify-between items-center">
                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-500 truncate"><Clock size={10} /> {new Date(deal.closeDate).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</span>
                          </div>
                        </div>
                      );
                    }}>
                      {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 min-h-[300px] rounded-[1rem] transition-colors ${snapshot.isDraggingOver ? "bg-violet-500/10 border-2 border-dashed border-violet-500/40 p-1" : ""}`}>
                          {column.deals.filter((d) => d.title.toLowerCase().includes(searchTerm.toLowerCase()) && checkMonth(d.closeDate)).map((deal, index) => {
                            const contact = contacts.find((c) => c.id === deal.contactId);

                            return (
                              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{...provided.draggableProps.style, zIndex: snapshot.isDragging ? 9999 : "auto"}} className={`themed-card p-3 sm:p-4 rounded-xl border mb-3 ${snapshot.isDragging ? "shadow-2xl border-violet-500/50 scale-[1.02] rotate-1 opacity-90" : "shadow-sm hover:border-violet-500/30 hover:shadow-md hover:-translate-y-1 transition-all"}`}>
                                    <div className="mb-2">
                                      <h4 className="font-black text-themed text-xs sm:text-sm leading-snug truncate">{deal.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-5 h-5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                                        {contact?.name.charAt(0).toUpperCase() || '?'}
                                      </div>
                                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">{contact?.name || 'Unknown'}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 mb-4">
                                      <Phone size={12} className="text-slate-500" /> {contact?.phone || 'N/A'}
                                    </div>
                                    <div className="text-xs sm:text-sm font-black text-emerald-400 mb-3 bg-emerald-500/10 w-max px-2 py-0.5 rounded-md border border-emerald-500/20">₹{(deal.value/100000).toFixed(2)}L</div>
                                    
                                    <div className="pt-2 border-t border-[var(--border-color)] flex justify-between items-center">
                                      <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-500 truncate"><Clock size={10} /> {new Date(deal.closeDate).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</span>
                                      <div className="flex gap-1">
                                        <button className="text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-400 px-2 py-1 themed-card rounded-md transition-colors hover:bg-slate-500/20" onClick={() => handleMarkNotInterested(deal.id, true)}>Not Interested</button>
                                        <button className="text-[9px] sm:text-[10px] font-bold text-muted hover:text-themed px-2 py-1 themed-card rounded-md transition-colors hover:bg-violet-600/30" onClick={() => setEditDeal({ ...deal })}>Edit</button>
                                        <button className="text-[9px] sm:text-[10px] font-bold text-red-400 hover:text-red-300 px-1.5 py-1 themed-card rounded-md transition-colors hover:bg-red-500/20" onClick={() => deleteDeal(deal.id)}><Trash2 size={12}/></button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        )}

        {/* SECTION: CLIENTS */}
        {(activeTab === "leads" || activeTab === "customers" || activeTab === "not_interested") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto bg-transparent">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-black text-themed">
                {activeTab === "leads" ? "Pre-Sales Leads" : activeTab === "customers" ? "Active Customers" : "Not Interested Leads"}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-color)]">
                  <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-[var(--accent)] text-white shadow-sm" : "text-muted hover:text-themed"}`} title="List View"><List size={16}/></button>
                  <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "card" ? "bg-[var(--accent)] text-white shadow-sm" : "text-muted hover:text-themed"}`} title="Card View"><Grid size={16}/></button>
                </div>
                <button onClick={exportContactsToPDF} className="flex items-center gap-2 themed-card text-muted px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-colors border border-[var(--border-color)]"><Download size={16}/> <span className="hidden sm:inline">Export PDF</span></button>
              </div>
            </div>
            
            {viewMode === "list" ? (
            <table className="w-full text-left border-collapse" style={{background: 'transparent'}}>
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest" style={{color: 'var(--text-muted)', background: 'transparent'}}>
                  <th className="py-4 pl-8 pr-4">Client Profile</th>
                  <th className="py-4 px-4">Project Focus</th>
                  <th className="py-4 px-4">Tags / Source</th>
                  <th className="py-4 px-4">Contact Details</th>
                  <th className="py-4 pr-8 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c) => (
                  <tr key={c.id} className={`border-b border-[var(--border-color)] group transition-colors ${c.status === 'Not Interested' ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''}`} style={{background: 'transparent'}}>
                    <td className="py-4 pl-8 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm flex-shrink-0"
                          style={{background: 'var(--accent-soft)', color: 'var(--accent)'}}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black" style={{color: 'var(--text-primary)'}}>
                            {c.name}
                            {c.status === 'Not Interested' && <span className="ml-2 px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-widest text-slate-500 bg-slate-500/10 border border-slate-500/20 align-middle">Not Interested</span>}
                          </div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{color: 'var(--text-muted)'}}>ID: {c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border" style={{borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)'}}>{c.project}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {c.tags?.map(t => (
                          <span key={t} className="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                            style={{border: '1px solid var(--border-color)', color: 'var(--text-muted)'}}>
                            <Tag size={7} className="inline mr-0.5"/>{t}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] font-bold flex items-center gap-1" style={{color: 'var(--text-muted)'}}><Filter size={9}/> {c.source || 'Unknown'}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium space-y-1" style={{color: 'var(--text-muted)'}}>
                      <div className="flex items-center gap-2"><Phone size={11} style={{color: 'var(--text-muted)'}} /> {c.phone}</div>
                      <div className="flex items-center gap-2"><Mail size={11} style={{color: 'var(--text-muted)'}} /> {c.email || 'N/A'}</div>
                      {activities.find(a => a.client === c.id && a.status === 'Pending') && (
                        <div className="flex items-center gap-1 text-blue-500 font-bold mt-2 pt-1.5 border-t border-[var(--border-color)]">
                          <Clock size={10} /> {new Date(activities.find(a => a.client === c.id && a.status === 'Pending').date).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-8 pl-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {activeTab === "leads" && (
                          <>
                            {c.status !== 'Not Interested' && <button className="font-bold px-3 py-1.5 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100 border border-slate-500 text-slate-500 hover:bg-slate-500/10" onClick={() => handleMarkNotInterested(c.id, false)}>Not Interested</button>}
                            <button className="font-bold px-3 py-1.5 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100 border border-blue-500 text-blue-500 hover:bg-blue-500/10" onClick={() => setEditActivity({ type: 'Follow-up Call', date: new Date().toISOString().split('T')[0], client: c.id, status: 'Pending' })}>Schedule Follow-up</button>
                            <button className="font-bold px-3 py-1.5 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100 border border-accent text-accent hover:bg-accent/10" onClick={() => handleConvertToCustomer(c)}>Convert to Customer</button>
                          </>
                        )}
                        <button
                          className="font-bold px-3 py-1.5 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100"
                          style={{color: 'var(--text-muted)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)'}}
                          onClick={() => setEditContact(c)}>Edit</button>
                        <button
                          className="font-bold px-2 py-1.5 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100"
                          style={{color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)'}}
                          onClick={() => deleteContact(c.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{background: 'transparent'}}>
              {filteredContacts.map((c) => (
                <div key={c.id} className={`group relative p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg ${c.status === 'Not Interested' ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                  style={{background: 'var(--bg-card)', borderColor: 'var(--border-color)'}}>
                  {/* Accent top strip on hover */}
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))'}} />

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black shadow-sm flex-shrink-0"
                        style={{background: 'var(--accent-soft)', color: 'var(--accent)'}}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-base flex flex-col sm:flex-row sm:items-center gap-1" style={{color: 'var(--text-primary)'}}>
                          {c.name}
                          {c.status === 'Not Interested' && <span className="px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-widest text-slate-500 bg-slate-500/10 border border-slate-500/20 w-max">Not Interested</span>}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{color: 'var(--text-muted)'}}>ID: {c.id}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeTab === "leads" && (
                        <>
                          {c.status !== 'Not Interested' && <button className="font-bold px-2 py-1 rounded-lg text-xs transition-colors border border-slate-500 text-slate-500 hover:bg-slate-500/10" onClick={() => handleMarkNotInterested(c.id, false)} title="Not Interested"><XCircle size={12}/></button>}
                          <button className="font-bold px-2 py-1 rounded-lg text-xs transition-colors border border-blue-500 text-blue-500 hover:bg-blue-500/10" onClick={() => setEditActivity({ type: 'Follow-up Call', date: new Date().toISOString().split('T')[0], client: c.id, status: 'Pending' })} title="Schedule Follow-up"><Phone size={12}/></button>
                          <button className="font-bold px-2 py-1 rounded-lg text-xs transition-colors border border-accent text-accent hover:bg-accent/10" onClick={() => handleConvertToCustomer(c)}>Convert</button>
                        </>
                      )}
                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        style={{color: 'var(--text-muted)'}}
                        onMouseOver={e => e.currentTarget.style.background='var(--bg-surface)'}
                        onMouseOut={e => e.currentTarget.style.background='transparent'}
                        onClick={() => setEditContact(c)}><Edit3 size={14}/></button>
                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        style={{color: '#f87171'}}
                        onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background='transparent'}
                        onClick={() => deleteContact(c.id)}><Trash2 size={14}/></button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold inline-block mb-2"
                      style={{border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)'}}>
                      {c.project}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.map(t => (
                        <span key={t} className="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                          style={{background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid transparent'}}>
                          <Tag size={7} className="inline mr-0.5"/>{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 space-y-2" style={{borderTop: '1px solid var(--border-color)'}}>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold flex items-center gap-1.5" style={{color: 'var(--text-muted)'}}><Filter size={10}/> Source</div>
                      <div className="text-xs font-bold" style={{color: 'var(--text-primary)'}}>{c.source || 'Unknown'}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold flex items-center gap-1.5" style={{color: 'var(--text-muted)'}}><Phone size={10}/> Phone</div>
                      <div className="text-xs font-bold" style={{color: 'var(--text-primary)'}}>{c.phone}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold flex items-center gap-1.5" style={{color: 'var(--text-muted)'}}><Mail size={10}/> Email</div>
                      <div className="text-xs font-bold truncate max-w-[140px]" style={{color: 'var(--text-primary)'}}>{c.email || 'N/A'}</div>
                    </div>
                    {activities.find(a => a.client === c.id && a.status === 'Pending') && (
                      <div className="flex items-center justify-between pt-2 mt-1" style={{borderTop: '1px dashed var(--border-color)'}}>
                        <div className="text-[10px] font-bold flex items-center gap-1.5 text-blue-500"><Clock size={10}/> Scheduled</div>
                        <div className="text-xs font-bold text-blue-500">{new Date(activities.find(a => a.client === c.id && a.status === 'Pending').date).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {/* SECTION: ACTIVITIES */}
        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[{ type: "Follow-up Call", icon: <Phone size={18} />, color: "blue" }, { type: "Site Visit", icon: <MapPin size={18} />, color: "orange" }, { type: "Send Quotation", icon: <DollarSign size={18} />, color: "emerald" }].map(({ type, icon, color }) => (
                <button key={type} onClick={() => setEditActivity({ type: type, date: new Date().toISOString().split('T')[0], client: contacts[0]?.id || '', status: 'Pending' })} className="flex items-center justify-between p-4 themed-card rounded-2xl hover:border-violet-500/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`bg-${color}-50 text-${color}-600 p-2.5 rounded-xl border border-${color}-100 group-hover:scale-110 transition-transform`}>{icon}</div>
                    <span className="font-bold text-themed text-sm">{type}</span>
                  </div>
                  <Plus size={16} className="text-slate-500 group-hover:text-white" />
                </button>
              ))}
            </div>
            <div className="themed-card rounded-[2rem] p-6 lg:p-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock size={14} /> Upcoming Schedule</h3>
              <div className="space-y-3">
                {filteredActivities.sort((a,b) => new Date(a.date) - new Date(b.date)).map((act) => {
                  const contact = contacts.find(c => c.id === act.client);
                  const checkDate = new Date(act.date);
                  if (!act.date || !act.date.includes('T') || act.date.endsWith('00:00:00.000Z')) {
                    checkDate.setHours(23, 59, 59, 999);
                  }
                  const isOverdue = checkDate < new Date() && act.status !== 'Completed';
                  const displayStatus = isOverdue ? 'Overdue' : act.status;
                  const actDate = new Date(act.date);
                  return (
                    <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 themed-card rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="themed-card px-3 py-2 rounded-lg text-center min-w-[60px]">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{actDate.toLocaleString('default', { month: 'short' })}</p>
                          <p className="text-lg font-black text-themed">{actDate.getDate()}</p>
                        </div>
                        <div>
                          <p className="font-black text-white text-sm mb-0.5">{act.type}</p>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><User size={12} /> {contact ? contact.name : "Unknown Client"} <span className="ml-2 flex items-center gap-1 text-slate-500"><Clock size={12}/> {actDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 border-white/10 pt-3 sm:pt-0">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border rounded-md ${
                          displayStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          displayStatus === 'Overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {displayStatus === 'Completed' ? <CheckCircle size={12} /> : displayStatus === 'Pending' ? <Clock size={12} /> : <Calendar size={12} />}{displayStatus}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                           {act.status !== 'Completed' && (
                             <button title="Mark Completed" className="text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 text-xs flex items-center gap-1" onClick={() => completeActivity(act)}><CheckCircle size={14}/></button>
                           )}
                           <button className="text-muted hover:text-themed font-bold px-3 py-1.5 rounded-lg themed-card hover:bg-[var(--accent-soft)] transition-colors border border-[var(--border-color)] text-xs" onClick={() => setEditActivity(act)}>Edit</button>
                           <button title="Delete Activity" className="text-red-400 hover:text-red-300 font-bold px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20 text-xs flex items-center gap-1" onClick={() => deleteActivity(act.id)}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION: SITE SURVEYS */}
        {activeTab === "site_surveys" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-themed">Site Survey Notes</h2>
              <div className="flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-color)]">
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-[var(--accent)] text-white shadow-sm" : "text-muted hover:text-themed"}`} title="List View"><List size={16}/></button>
                <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "card" ? "bg-[var(--accent)] text-white shadow-sm" : "text-muted hover:text-themed"}`} title="Card View"><Grid size={16}/></button>
              </div>
            </div>
            
            {filteredSites.length === 0 ? (
              <div className="col-span-full p-12 text-center themed-card rounded-3xl border border-[var(--border-color)] shadow-sm">
                <MapPin size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
                <h3 className="text-xl font-black text-themed">No Sites Found</h3>
                <p className="text-muted text-sm mt-2 font-medium">Click Add New to create a Site and take Survey Notes.</p>
              </div>
            ) : viewMode === "list" ? (
              <div className="overflow-x-auto bg-transparent">
                <table className="w-full text-left border-collapse" style={{background: 'transparent'}}>
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="py-4 pl-6 pr-4">Site / Project</th>
                      <th className="py-4 px-4">Client Details</th>
                      <th className="py-4 px-4">Location</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSites.map(site => {
                      const sStatus = site.surveyStatus || 'Not Taken';
                      return (
                        <tr key={site.id} className="border-b border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                          <td className="py-4 pl-6 pr-4">
                            <div className="font-black text-sm text-themed">{site.name}</div>
                            <div className="text-[10px] text-muted font-bold mt-1">Added: {site.startDate}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-xs text-themed flex items-center gap-2"><User size={12}/> {site.clientName}</div>
                            {site.phone && <div className="text-[10px] text-muted flex items-center gap-2 mt-1"><Phone size={10}/> {site.phone}</div>}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-slate-400">
                            {site.address || "Address not provided"}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${sStatus === 'Taken' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : sStatus === 'Scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                              {sStatus === 'Taken' ? 'Survey Taken' : sStatus === 'Scheduled' ? 'Scheduled' : 'Not Taken'}
                            </span>
                            {sStatus === 'Scheduled' && site.surveyDate && (
                              <div className="text-[9px] font-bold text-blue-400 mt-2">{new Date(site.surveyDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                            )}
                          </td>
                          <td className="py-4 pl-4 pr-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button title="Edit Survey Notes" className="text-slate-400 hover:text-themed px-3 py-1.5 rounded-xl hover:bg-[var(--accent-soft)] transition-colors border border-[var(--border-color)] text-xs font-bold" onClick={() => { setEditSiteMode('notes'); setEditSiteSurvey(site); }}><FileText size={12} className="inline mr-1"/> Notes</button>
                              <button title="Edit Site Details" className="text-slate-400 hover:text-themed px-3 py-1.5 rounded-xl hover:bg-[var(--accent-soft)] transition-colors border border-[var(--border-color)] text-xs font-bold" onClick={() => { setEditSiteMode('full'); setEditSiteSurvey(site); }}><Settings size={12} className="inline mr-1"/> Edit</button>
                              <button title="Delete Site Survey" className="text-[#f87171] hover:text-red-400 px-2 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors border border-[var(--border-color)] hover:border-red-500/30 text-xs font-bold" onClick={() => deleteSite(site.id)}><Trash2 size={12}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredSites.map(site => {
                  const sStatus = site.surveyStatus || 'Not Taken';
                  return (
                    <div key={site.id} className="p-6 themed-card rounded-[2rem] border border-[var(--border-color)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${sStatus === 'Taken' ? 'bg-emerald-500' : sStatus === 'Scheduled' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                      
                      <div className="flex justify-between items-start mb-5 pl-2">
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${sStatus === 'Taken' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : sStatus === 'Scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                            {sStatus === 'Taken' ? 'Survey Taken' : sStatus === 'Scheduled' ? 'Survey Scheduled' : 'Survey Not Taken'}
                          </span>
                          <h3 className="font-black text-themed mt-3 text-lg leading-tight">{site.name}</h3>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            title="Edit Site Details" 
                            onClick={() => { setEditSiteMode('full'); setEditSiteSurvey(site); }}
                            className="p-2 rounded-xl text-slate-400 hover:text-themed hover:bg-[var(--accent-soft)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                          >
                            <Settings size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pl-2 pt-4 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-color)]"><User size={12} className="text-themed" /></div>
                          <span className="text-themed">{site.clientName || "Unknown Client"}</span>
                          {site.phone && (
                            <span className="text-[10px] text-slate-500 ml-1"><Phone size={10} className="inline mr-1" />{site.phone}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                          <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0"><MapPin size={12} className="text-themed" /></div>
                          <span className="truncate" title={site.address || "Address not provided"}>{site.address || "Address not provided"}</span>
                        </div>
                      </div>

                      {sStatus === 'Scheduled' && site.surveyDate && (
                        <div className="mt-4 pl-2">
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Scheduled For</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 w-fit">
                            <Clock size={12} />
                            {new Date(site.surveyDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pl-2">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Survey Notes</div>
                        {site.surveyNotes ? (
                          <ul className="text-xs font-medium text-slate-300 bg-white/5 p-4 rounded-lg border border-white/5 max-h-40 overflow-y-auto custom-scrollbar list-disc pl-5 space-y-1.5">
                            {site.surveyNotes.split('\n').filter(n => n.trim() !== '').map((note, idx) => (
                              <li key={idx} className="pl-1 marker:text-violet-500">{note}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs italic text-slate-500 p-2 border border-dashed border-[var(--border-color)] rounded-lg text-center">No survey notes added yet.</p>
                        )}
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-between items-center pl-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added on {site.startDate}</span>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="Edit Survey Notes" className="text-slate-400 hover:text-themed px-3 py-1.5 rounded-xl hover:bg-[var(--accent-soft)] transition-colors border border-[var(--border-color)] flex items-center gap-2 text-xs font-bold" onClick={() => { setEditSiteMode('notes'); setEditSiteSurvey(site); }}><Edit3 size={14}/> Edit Notes</button>
                          <button title="Delete Site Survey" className="text-[#f87171] hover:text-red-400 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors border border-[var(--border-color)] hover:border-red-500/30 flex items-center gap-2 text-xs font-bold" onClick={() => deleteSite(site.id)}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}


        {/* SECTION: TELECALLING */}
        {activeTab === "telecalling" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8 bg-transparent">
            {/* 4 KPIs: TOTAL CALLS TODAY, CONNECTED, FOLLOW-UPS SCHEDULED, MISSED */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={14} className="text-blue-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total Calls Today</span>
                </div>
                <div className="text-3xl font-black text-themed">0</div>
              </div>
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={14} className="text-emerald-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Connected</span>
                </div>
                <div className="text-3xl font-black text-themed">0</div>
              </div>
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-amber-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Follow-ups Scheduled</span>
                </div>
                <div className="text-3xl font-black text-themed">0</div>
              </div>
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={14} className="text-rose-500 rotate-90" /> <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Missed</span>
                </div>
                <div className="text-3xl font-black text-themed">0</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-themed">Recent Calls</h2>
              <button onClick={() => setIsLogCallOpen(true)} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2">
                <Plus size={14}/> Log New Call
              </button>
            </div>
            
            <div className="overflow-x-auto bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="py-4 pl-6 pr-4">Customer</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4">Date/Time</th>
                    <th className="py-4 px-4">Duration</th>
                    <th className="py-4 px-4">Outcome</th>
                    <th className="py-4 pl-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {telecalls.map((call) => (
                    <tr key={call.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="py-4 pl-6 pr-4 font-black text-sm text-themed">{call.customer}</td>
                      <td className="py-4 px-4 text-xs font-bold text-muted">{call.phone}</td>
                      <td className="py-4 px-4">
                        {call.type === 'outbound' ? <Phone size={14} className="text-blue-500" /> : call.type === 'inbound' ? <Phone size={14} className="text-emerald-500" /> : <Phone size={14} className="text-rose-500 rotate-90" />}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-muted">{call.date}</td>
                      <td className="py-4 px-4 text-xs font-bold text-muted">{call.duration}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          call.outcome === 'Interested' ? 'text-blue-500' :
                          call.outcome === 'Call Later' ? 'text-amber-500' :
                          call.outcome === 'Missed' ? 'text-rose-500' :
                          'text-emerald-500'
                        }`}>
                          {call.outcome}
                        </span>
                      </td>
                      <td className="py-4 pl-4 pr-6 flex justify-end">
                        <button onClick={() => setSelectedCallNote(call)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[10px] font-bold text-muted transition-colors">
                          <FileText size={12} /> View Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SECTION: CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8 bg-transparent">
            {/* 4 KPIs: ACTIVE CAMPAIGNS, TOTAL LEADS GENERATED, MARKETING BUDGET, TOTAL ROI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-blue-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Active Campaigns</span>
                </div>
                <div className="text-3xl font-black text-themed">0</div>
              </div>
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-emerald-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Total Leads Generated</span>
                </div>
                <div className="text-3xl font-black text-themed">0</div>
              </div>
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-500 font-black">₹</span> <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Marketing Budget</span>
                </div>
                <div className="text-3xl font-black text-themed">₹0</div>
              </div>
              <div className="themed-card border border-[var(--border-color)] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={14} className="text-purple-500" /> <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Total ROI</span>
                </div>
                <div className="text-3xl font-black text-themed">0%</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-themed">Marketing Campaigns</h2>
              <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2" onClick={() => setEditCampaign({ name: '', platform: 'Email', status: 'Scheduled', date: new Date().toISOString().split('T')[0] })}>
                <Plus size={14}/> Create Campaign
              </button>
            </div>
            
            <div className="overflow-x-auto bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="py-4 pl-6 pr-4">Campaign Name</th>
                    <th className="py-4 px-4 text-center">Channel</th>
                    <th className="py-4 px-4 text-center">Budget</th>
                    <th className="py-4 px-4 text-center">Leads</th>
                    <th className="py-4 px-4 text-center">Conversion</th>
                    <th className="py-4 px-4 text-center">Revenue Generated</th>
                    <th className="py-4 pl-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setEditCampaign(camp)}>
                      <td className="py-4 pl-6 pr-4 font-black text-sm text-themed">{camp.name}</td>
                      <td className="py-4 px-4 text-center text-xs font-bold text-muted">{camp.channel}</td>
                      <td className="py-4 px-4 text-center text-xs font-bold text-muted">{camp.budget}</td>
                      <td className="py-4 px-4 text-center font-black text-sm text-themed">{camp.leads}</td>
                      <td className="py-4 px-4 text-center text-xs font-bold text-emerald-500">{camp.conversion}</td>
                      <td className="py-4 px-4 text-center text-sm font-black text-blue-500">{camp.revenue}</td>
                      <td className="py-4 pl-4 pr-6 flex justify-end">
                        <span className={`text-[10px] flex items-center gap-1 font-black px-3 py-1.5 rounded-lg border ${
                          camp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          camp.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {camp.status}
                          <ChevronDown size={12} className="opacity-50" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-8 right-8 bg-violet-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 font-bold border border-stone-700">
            <CheckCircle size={20} className="text-emerald-400" />{feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <Modal open={!!editContact} onClose={() => setEditContact(null)}>
        {editContact && <EditContactForm contact={editContact} onSave={handleContactSave} onCancel={() => setEditContact(null)} />}
      </Modal>

      <Modal open={!!editDeal} onClose={() => setEditDeal(null)}>
        {editDeal && <EditDealForm deal={editDeal} contacts={contacts} onSave={handleDealSave} onCancel={() => setEditDeal(null)} />}
      </Modal>

      <Modal open={!!editActivity} onClose={() => setEditActivity(null)}>
        {editActivity && <EditActivityForm activity={editActivity} contacts={contacts} onSave={handleActivitySave} onCancel={() => setEditActivity(null)} />}
      </Modal>

      <Modal open={!!editSiteSurvey} onClose={() => setEditSiteSurvey(null)} size={editSiteMode === 'notes' ? "max-w-[95vw] min-h-[90vh]" : "max-w-2xl"}>
        {editSiteSurvey && <EditSiteSurveyForm site={editSiteSurvey} contacts={contacts} mode={editSiteMode} onSave={handleSiteSurveySave} onCancel={() => setEditSiteSurvey(null)} />}
      </Modal>

      <Modal open={!!editCampaign} onClose={() => setEditCampaign(null)}>
        {editCampaign && <EditCampaignForm campaign={editCampaign} onSave={handleCampaignSave} onCancel={() => setEditCampaign(null)} />}
      </Modal>

      <Modal open={!!selectedCallNote} onClose={() => setSelectedCallNote(null)}>
        {selectedCallNote && (
          <CallNotesModalContent note={selectedCallNote} onClose={() => setSelectedCallNote(null)} />
        )}
      </Modal>

      <Modal open={isLogCallOpen} onClose={() => setIsLogCallOpen(false)}>
        <LogCallForm 
          onSave={(newCall) => {
            setTelecalls([newCall, ...telecalls]);
            setIsLogCallOpen(false);
            setFeedback("Call logged successfully!");
            setTimeout(() => setFeedback(""), 3000);
          }} 
          onCancel={() => setIsLogCallOpen(false)} 
        />
      </Modal>
    </div>
  );
};

// --- CAMPAIGN FORM ---
function EditCampaignForm({ campaign, onSave, onCancel }) {
  const [form, setForm] = useState(campaign || { name: '', platform: 'Email', status: 'Scheduled', date: '' });
  
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...campaign, ...form }); }} className="space-y-6">
      <h2 className="font-black text-3xl mb-1 text-themed tracking-tight">Campaign Details</h2>
      <p className="text-muted font-medium text-sm mb-6 pb-4 border-b border-[var(--border-color)]">Configure your marketing blast.</p>
      
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Campaign Name</label>
        <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Platform</label>
          <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all [&>option]:bg-[var(--modal-bg)]" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Instagram Ads">Instagram Ads</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
          <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all [&>option]:bg-[var(--modal-bg)]" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Scheduled">Scheduled</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Target Date</label>
        <input type="date" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
      </div>

      <div className="flex gap-3 justify-end pt-5 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold dark:bg-violet-700 bg-accent text-white shadow-md dark:hover:bg-slate-800 hover:bg-accent-hover transition-all">Save Campaign</button>
      </div>
    </form>
  );
}

// --- EXTENDED FORMS ---
function EditContactForm({ contact, onSave, onCancel }) {
  const { showDialog } = useDialog();
  const [form, setForm] = useState(contact || { name: '', organizationName: '', project: '', phone: '', email: '', address: '', status: 'Cold', source: '', tags: [] });
  const [tagInput, setTagInput] = useState("");

  const addTag = () => { if (tagInput.trim() && !form.tags.includes(tagInput.trim())) { setForm({...form, tags: [...form.tags, tagInput.trim()]}); setTagInput(""); } };

  return (
    <form onSubmit={e => { 
      e.preventDefault(); 
      if (form.phone) {
        const cleanedPhone = form.phone.replace(/\D/g, "");
        if (cleanedPhone.length !== 10) {
          showDialog({ title: "Invalid Phone Number", message: "Phone number must be exactly 10 digits.", type: "alert" });
          return;
        }
      }
      onSave(form); 
    }} className="space-y-6">
      <h2 className="font-black text-3xl mb-1 text-themed tracking-tight">Client Profile</h2>
      <p className="text-muted font-medium text-sm mb-6 pb-4 border-b border-[var(--border-color)]">Comprehensive details for your design client.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Organization Name (Optional)</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.organizationName || ''} onChange={e => setForm({ ...form, organizationName: e.target.value })} placeholder="e.g. Acme Corp" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Phone Number</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Project Focus</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.project || ''} onChange={e => setForm({ ...form, project: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Physical Address</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          {/* Replaced fixed select with input + datalist so ANY lead source can be entered */}
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Lead Source</label>
          <input list="lead-sources" placeholder="e.g. Instagram" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
          <datalist id="lead-sources">
            <option value="Instagram" />
            <option value="Website" />
            <option value="Referral" />
            <option value="Direct Walk-in" />
          </datalist>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold dark:bg-violet-700 bg-accent text-white shadow-md dark:hover:bg-slate-800 hover:bg-accent-hover transition-all">Save Profile</button>
      </div>
    </form>
  );
}

function EditDealForm({ deal, contacts, onSave, onCancel }) {
  const initialContact = contacts.find(c => c.id == deal?.contactId);
  const [form, setForm] = useState({ 
    title: deal?.title || '', 
    value: deal?.value || 0, 
    contactName: initialContact?.name || '', 
    closeDate: deal?.closeDate || new Date().toISOString().split('T')[0],
    id: deal?.id
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const existing = contacts.find(c => c.name.toLowerCase() === form.contactName.trim().toLowerCase());
    onSave({
      id: form.id,
      title: form.title,
      value: form.value,
      closeDate: form.closeDate,
      contactId: existing ? existing.id.toString() : form.contactName.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-black text-3xl mb-1 text-themed tracking-tight">Project Deal</h2>
      <p className="text-muted font-medium text-sm mb-6 pb-4 border-b border-[var(--border-color)]">Track and update the estimated budget and assign to a client.</p>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Deal Title</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Client (Optional)</label>
          <input 
            list="client-list"
            placeholder="Type new or select existing..."
            className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" 
            value={form.contactName} 
            onChange={e => setForm({ ...form, contactName: e.target.value })} 
          />
          <datalist id="client-list">
            {contacts.map(c => <option key={c.id} value={c.name} />)}
          </datalist>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Est. Value (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
            <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 pl-9 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.value} onChange={e => setForm({ ...form, value: e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') })} type="text" inputMode="decimal" pattern="^\d*\.?\d*$" required min="0" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold dark:bg-violet-700 bg-accent text-white shadow-md dark:hover:bg-slate-800 hover:bg-accent-hover transition-all">Save Project</button>
      </div>
    </form>
  );
}

function EditActivityForm({ activity, contacts, onSave, onCancel }) {
  // We manage date and time separately in the form state, but combine them on save.
  const defaultDateStr = activity?.date || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const initialDate = defaultDateStr.split('T')[0];
  const initialTime = defaultDateStr.split('T')[1] || '12:00';
  const initialContact = contacts.find(c => c.id == activity?.client);

  const [form, setForm] = useState({ 
    id: activity?.id,
    type: activity?.type || '', 
    datePart: initialDate,
    timePart: initialTime,
    contactName: initialContact?.name || '', 
    status: activity?.status || 'Pending',
    notes: activity?.notes || ''
  });

  const isSiteSurvey = form.type.toLowerCase().includes('site');

  const handleSubmit = (e) => {
    e.preventDefault();
    const existing = contacts.find(c => c.name.toLowerCase() === form.contactName.trim().toLowerCase());
    
    onSave({
      id: form.id,
      type: form.type,
      date: `${form.datePart}T${form.timePart}`,
      client: existing ? existing.id.toString() : form.contactName.trim(),
      status: form.status || 'Pending',
      notes: form.notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-black text-3xl mb-1 text-themed tracking-tight">Schedule Activity</h2>
      <p className="text-muted font-medium text-sm mb-6 pb-4 border-b border-[var(--border-color)]">Plan your meetings, site visits, and calls.</p>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Activity Title/Type</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required placeholder="e.g. Discuss Floor Plan" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date</label>
            <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.datePart} onChange={e => setForm({ ...form, datePart: e.target.value })} type="date" required />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Time</label>
            <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.timePart} onChange={e => setForm({ ...form, timePart: e.target.value })} type="time" required />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Client (Optional)</label>
          <input 
            list="activity-client-list"
            placeholder="Type new or select existing..."
            className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" 
            value={form.contactName} 
            onChange={e => setForm({ ...form, contactName: e.target.value })} 
          />
          <datalist id="activity-client-list">
            {contacts.map(c => <option key={c.id} value={c.name} />)}
          </datalist>
        </div>
        
        {isSiteSurvey && (
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Meeting Notes</label>
            <textarea 
              className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all min-h-[100px] resize-y" 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })} 
              placeholder="Enter meeting notes..." 
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold dark:bg-violet-700 bg-accent text-white shadow-md dark:hover:bg-slate-800 hover:bg-accent-hover transition-all">Save Schedule</button>
      </div>
    </form>
  );
}

function EditSiteSurveyForm({ site, contacts, mode, onSave, onCancel }) {
  const { showDialog } = useDialog();
  const defaultSurveyDateStr = site?.surveyDate || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const initialSurveyDate = defaultSurveyDateStr.split('T')[0];
  const initialSurveyTime = defaultSurveyDateStr.split('T')[1] || '12:00';

  const [form, setForm] = useState({
    ...(site || {}),
    id: site?.id,
    name: site?.name || '',
    clientName: site?.clientName || '',
    phone: site?.phone || '',
    organizationName: site?.organizationName || '',
    assignedTeam: site?.assignedTeam || '',
    address: site?.address || '',
    status: site?.status || 'Pre-Construction',
    startDate: site?.startDate || new Date().toISOString().split('T')[0],
    budget: site?.budget || 0,
    description: site?.description || '',
    isNegotiated: site?.isNegotiated || false,
    negotiationDetails: site?.negotiationDetails || '',
    isArchived: site?.isArchived || false,
    surveyStatus: site?.surveyStatus || 'Not Taken',
    surveyDatePart: initialSurveyDate,
    surveyTimePart: initialSurveyTime
  });

  const [notesList, setNotesList] = useState(
    site?.surveyNotes ? site.surveyNotes.split('\n').filter(n => n.trim() !== '') : ['']
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.phone) {
      const cleanedPhone = form.phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        showDialog({ title: "Invalid Phone Number", message: "Client phone number must be exactly 10 digits.", type: "alert" });
        return;
      }
    }
    onSave({
      ...form,
      surveyDate: form.surveyStatus === 'Scheduled' ? `${form.surveyDatePart}T${form.surveyTimePart}` : '',
      surveyNotes: notesList.filter(n => n.trim() !== '').join('\n')
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col h-full ${mode === 'notes' ? 'min-h-[80vh]' : ''}`}>
      <h2 className="font-black text-3xl mb-1 text-themed tracking-tight">{mode === 'notes' ? 'Survey Notes' : 'Site Details'}</h2>
      <p className="text-muted font-medium text-sm mb-6 pb-4 border-b border-[var(--border-color)]">
        {mode === 'notes' ? `Log structural requirements for ${site?.name || 'this site'}.` : 'Create or edit site information.'}
      </p>
      
      <div className="space-y-4 flex-1">
        {mode === 'full' && (
          <>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Site Name</label>
              <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Skyline Apartment 4B" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Client</label>
                <input 
                  list="survey-client-list"
                  className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" 
                  value={form.clientName} 
                  onChange={e => {
                    const val = e.target.value;
                    const contact = contacts.find(c => c.name === val);
                    setForm({ ...form, clientName: val, phone: contact && contact.phone ? contact.phone : form.phone });
                  }} 
                  required
                />
                <datalist id="survey-client-list">
                  {contacts.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Client Phone Number</label>
                <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Survey Status</label>
                <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all [&>option]:bg-[var(--modal-bg)]" value={form.surveyStatus} onChange={e => setForm({ ...form, surveyStatus: e.target.value })}>
                  <option value="Not Taken">Not Taken</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Taken">Taken</option>
                </select>
              </div>
              
              {form.surveyStatus === 'Scheduled' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Schedule Date</label>
                    <input type="date" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.surveyDatePart} onChange={e => setForm({ ...form, surveyDatePart: e.target.value })} required />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Schedule Time</label>
                    <input type="time" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.surveyTimePart} onChange={e => setForm({ ...form, surveyTimePart: e.target.value })} required />
                  </div>
                </>
              ) : (
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Project Status</label>
                    <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all [&>option]:bg-[var(--modal-bg)]" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="Pre-Construction">Pre-Construction</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                 </div>
              )}
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Site Address</label>
              <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>
          </>
        )}

        {mode === 'notes' && (
          <>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Survey Status</label>
              <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all [&>option]:bg-[var(--modal-bg)] mb-2" value={form.surveyStatus} onChange={e => setForm({ ...form, surveyStatus: e.target.value })}>
                <option value="Not Taken">Not Taken</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Taken">Taken</option>
              </select>
            </div>
            
            {form.surveyStatus === 'Scheduled' && (
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Schedule Date</label>
                  <input type="date" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.surveyDatePart} onChange={e => setForm({ ...form, surveyDatePart: e.target.value })} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Schedule Time</label>
                  <input type="time" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-violet-500 transition-all" value={form.surveyTimePart} onChange={e => setForm({ ...form, surveyTimePart: e.target.value })} required />
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Survey Notes & Requirements</label>
          <div className="space-y-2">
            {notesList.map((note, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="mt-3.5 ml-2 text-violet-500 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                </div>
                <input 
                  className="themed-input w-full border border-[var(--border-color)] rounded-xl p-2.5 text-sm font-bold outline-none focus:border-violet-500 transition-all" 
                  value={note}
                  onChange={(e) => {
                    const newList = [...notesList];
                    newList[index] = e.target.value;
                    setNotesList(newList);
                  }}
                  placeholder={index === 0 ? "Ceiling height is 10ft..." : "Add another note..."}
                />
                <button 
                  type="button"
                  onClick={() => setNotesList(notesList.filter((_, i) => i !== index))}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors bg-[var(--bg-surface)] hover:bg-red-500/10 rounded-xl flex-shrink-0 border border-[var(--border-color)] hover:border-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <button 
                type="button" 
                onClick={() => setNotesList([...notesList, ''])}
                className="flex items-center gap-1.5 text-sm font-black text-violet-500 hover:text-white bg-violet-500/10 hover:bg-violet-600 px-6 py-3 rounded-2xl transition-all"
              >
                <Plus size={16} /> Add Bullet Point
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-8 pt-5 border-t border-[var(--border-color)] mt-auto">
        <button type="button" onClick={onCancel} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-8 py-3 rounded-xl text-sm font-bold dark:bg-violet-700 bg-accent text-white shadow-md dark:hover:bg-slate-800 hover:bg-accent-hover transition-all">Save Notes</button>
      </div>
    </form>
  );
}

// --- LOG CALL FORM ---
function LogCallForm({ onSave, onCancel }) {
  const { showDialog } = useDialog();
  const [form, setForm] = useState({
    customer: '',
    phone: '',
    type: 'outbound',
    outcome: 'Interested',
    duration: '00:00',
    note: ''
  });

  return (
    <form onSubmit={e => { 
      e.preventDefault(); 
      if (form.phone) {
        const cleanedPhone = form.phone.replace(/\D/g, "");
        if (cleanedPhone.length !== 10) {
          showDialog({ title: "Invalid Phone Number", message: "Phone number must be exactly 10 digits.", type: "alert" });
          return;
        }
      }
      onSave({ 
        ...form, 
        id: Date.now(), 
        date: `Today, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
      }); 
    }} className="space-y-6">
      <h2 className="font-black text-3xl mb-1 text-themed tracking-tight">Log Call</h2>
      <p className="text-muted font-medium text-sm mb-6 pb-4 border-b border-[var(--border-color)]">Record details of a customer interaction.</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Customer Name</label>
          <input className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Phone Number</label>
          <input type="tel" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Call Type</label>
          <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all [&>option]:bg-[var(--modal-bg)]" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="outbound">Outbound</option>
            <option value="inbound">Inbound</option>
            <option value="missed">Missed</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Outcome</label>
          <select className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all [&>option]:bg-[var(--modal-bg)]" value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}>
            <option value="Interested">Interested</option>
            <option value="Call Later">Call Later</option>
            <option value="Missed">Missed</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Duration</label>
          <input type="text" placeholder="MM:SS" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Call Notes</label>
        <textarea rows="4" className="themed-input w-full border border-[var(--border-color)] rounded-xl p-3 text-sm font-bold outline-none focus:border-accent transition-all" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Discussed pricing and availability..."></textarea>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Upload Recording</label>
        <div className="themed-input w-full border border-dashed border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden group">
          <input type="file" accept="audio/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => {
            if (e.target.files[0]) {
               setForm({...form, audioFileName: e.target.files[0].name});
            }
          }} />
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
            <Phone size={18} />
          </div>
          <span className="text-xs font-bold text-muted group-hover:text-themed transition-colors">
            {form.audioFileName ? form.audioFileName : "Click to select or drag and drop audio file"}
          </span>
        </div>
      </div>
      
      <div className="flex gap-3 justify-end mt-8 pt-5 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
        <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent text-white shadow-md hover:bg-accent-hover transition-all">Save Call</button>
      </div>
    </form>
  );
}

// --- CALL NOTES MODAL CONTENT ---
function CallNotesModalContent({ note, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setIsPlaying(false); return 0; }
          return p + 2;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="p-2 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-500/20">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="font-black text-2xl text-themed tracking-tight">Call Notes</h3>
          <p className="text-xs font-bold text-muted">{note.customer} • {note.date}</p>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Notes Summary</label>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 text-sm font-bold text-themed leading-relaxed">
          {note.note || 'No notes available for this call.'}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Call Recording</label>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center flex-shrink-0 shadow-md hover:bg-[#ea580c] transition-colors">
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <div className="flex-1">
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-1.5 relative">
              <div className="h-full bg-[#f97316] rounded-full relative transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm border-2 border-[#f97316]"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400">
              <span>{isPlaying ? 'Playing...' : '00:00'}</span>
              <span>{note.duration}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

export default CRMPage;
