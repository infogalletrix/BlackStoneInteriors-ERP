import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Wallet,
  FileText, Building, ChevronDown, ArrowRight,
  HardHat, ClipboardCheck, Banknote, CalendarCheck, IndianRupee,
  Users, Award, CheckCircle2, FileCheck
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

import { useThemeClasses } from "../hooks/useThemeClasses";
import NotificationWidget from "../components/NotificationWidget";
import KpiCard from "../components/KpiCard";

// Brand Palette: Black Stone Gold (#C9A227), Deep Navy (#1C2B4B), Sapphire (#2563EB), Emerald (#10B981), Amber (#F59E0B), Violet (#7C3AED)
const CHART_COLORS_LIGHT = ['#C9A227', '#1C2B4B', '#2563EB', '#10B981', '#F59E0B', '#7C3AED'];
const CHART_COLORS_DARK  = ['#C9A227', '#8B5CF6', '#38BDF8', '#10B981', '#F59E0B', '#EC4899'];

const Dashboard = () => {
  const navigate = useNavigate();
  const t = useThemeClasses();
  const d = t.isDark;
  const COLORS = d ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;

  // Accent colors aligned with Black Stone brand design system
  const accentMain   = '#C9A227';
  const accentSecond = d ? '#38bdf8' : '#1C2B4B';
  const incomeColor  = '#10b981';
  const expenseColor = d ? '#f43f5e' : '#ef4444';

  const getIsoDate = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const now = new Date();
  const today = getIsoDate(now);
  const firstOfMonth = getIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));

  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo,   setDateTo]   = useState(today);
  const [activePreset, setActivePreset] = useState("this_month");

  const handlePresetChange = (e) => {
    const p = e.target.value;
    setActivePreset(p);
    const c = new Date();
    if (p === "this_month") {
      setDateFrom(getIsoDate(new Date(c.getFullYear(), c.getMonth(), 1)));
      setDateTo(getIsoDate(c));
    } else if (p === "last_month") {
      setDateFrom(getIsoDate(new Date(c.getFullYear(), c.getMonth() - 1, 1)));
      setDateTo(getIsoDate(new Date(c.getFullYear(), c.getMonth(), 0)));
    } else if (p === "last_6_months") {
      setDateFrom(getIsoDate(new Date(c.getFullYear(), c.getMonth() - 6, c.getDate())));
      setDateTo(getIsoDate(c));
    } else if (p === "financial_year") {
      const sy = c.getMonth() >= 3 ? c.getFullYear() : c.getFullYear() - 1;
      setDateFrom(getIsoDate(new Date(sy, 3, 1)));
      setDateTo(getIsoDate(new Date(sy + 1, 2, 31)));
    }
  };

  const handleDateChange = (type, val) => {
    if (type === "from") setDateFrom(val); else setDateTo(val);
    setActivePreset("custom");
  };

  const [receipts,   setReceipts]   = useState([]);
  const [expenses,   setExpenses]   = useState([]);
  const [sites,      setSites]      = useState([]);
  const [payroll,    setPayroll]    = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [crm,        setCrm]        = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [rR, eR, sR, pR, emR, qR, aR, crmR] = await Promise.all([
          fetch('/api/finance/receipts').then(r => r.ok ? r.json() : []),
          fetch('/api/finance/expenses').then(r => r.ok ? r.json() : []),
          fetch('/api/sites').then(r => r.ok ? r.json() : []),
          fetch('/api/finance/payroll').then(r => r.ok ? r.json() : []),
          fetch('/api/employees').then(r => r.ok ? r.json() : []),
          fetch('/api/quotations').then(r => r.ok ? r.json() : []),
          fetch('/api/attendance').then(r => r.ok ? r.json() : {}),
          fetch('/api/crm').then(r => r.ok ? r.json() : []),
        ]);
        setReceipts(Array.isArray(rR) ? rR.map(i => ({ ...i, date: (i.date||'').split('T')[0] })) : []);
        setExpenses(Array.isArray(eR) ? eR.map(i => ({ ...i, date: (i.date||'').split('T')[0] })) : []);
        setSites(Array.isArray(sR) ? sR : []);
        setPayroll(Array.isArray(pR) ? pR : []);
        setEmployees(Array.isArray(emR) ? emR : []);
        setQuotations(Array.isArray(qR) ? qR : []);
        setAttendance(aR || {});
        setCrm(Array.isArray(crmR) ? crmR : []);
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const inRange = (ds) => ds && ds >= dateFrom && ds <= dateTo;

  // ── KPI Calculations ──
  // Calculate credits and debits from expenses properly
  const creditExpenses = expenses.filter(e => inRange(e.date) && (e.type === "Bank Credit" || e.type === "Credit")).reduce((s,e) => s+(Number(e.amount)||0), 0);
  const debitExpenses = expenses.filter(e => inRange(e.date) && e.type !== "Bank Credit" && e.type !== "Credit").reduce((s,e) => s+(Number(e.amount)||0), 0);

  const receiptIncome     = receipts.filter(r => inRange(r.date)).reduce((s,r) => s+(Number(r.amountPaid || r.amount)||0), 0);
  const totalPayroll      = payroll.filter(p => inRange(p.paymentDate||p.date||dateFrom)).reduce((s,p) => s+(Number(p.netPay||p.amount)||0), 0);

  const totalIncome       = receiptIncome + creditExpenses;
  const totalSpent        = debitExpenses + totalPayroll;
  const totalWOValue      = sites.reduce((s,st) => s+(Number(st.budget)||0), 0);
  const approvedQuotes    = quotations.filter(q => (q.status || "").trim().toLowerCase() === "approved").length;
  const pendingQuotes     = quotations.filter(q => {
    const s = (q.status || "Pending").trim().toLowerCase();
    return s === "pending" || s === "draft" || s === "negotiating";
  }).length;
  const inProcessSites    = sites.filter(s => s.status === "In Progress" || s.status === "Currently working" || s.status === "Active").length;
  const totalAdvances     = employees.reduce((s,e) => s+(Number(e.advanceBalance)||0), 0);
  const pendingWO         = sites.filter(s => s.status === "Pre-Construction" || s.status === "Pending").length;
  const presentToday      = attendance[today] ? Object.values(attendance[today]).filter(s => s==="Present"||s==="Half-Day").length : 0;
  const totalLeadsCount   = crm.filter(c => c.status !== "Customer").length;
  const activeLeadsCount  = crm.filter(c => c.status !== "Customer" && c.status !== "Not Interested").length;
  const customersCount    = crm.filter(c => c.status === "Customer").length;
  const netProfit         = totalIncome - totalSpent;
  const profitPositive    = netProfit >= 0;

  const fmt = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

  // ── Chart data ──
  const cashFlowData = (() => {
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth()-i);
      const key = dt.toISOString().slice(0,7);
      months[key] = { name: dt.toLocaleString("default",{month:"short"}), Income: 0, Expenses: 0 };
    }
    receipts.forEach(r => { const m=r.date?.slice(0,7); if(months[m]) months[m].Income+=(Number(r.amountPaid||r.amount)||0); });
    expenses.forEach(e => {
      const m = e.date?.slice(0,7);
      if(months[m]) {
        if (e.type === "Bank Credit" || e.type === "Credit") months[m].Income += (Number(e.amount)||0);
        else months[m].Expenses += (Number(e.amount)||0);
      }
    });
    payroll.forEach(p => {
      const m = (p.paymentDate||p.date||'').slice(0,7);
      if(months[m]) months[m].Expenses += (Number(p.netPay||p.amount)||0);
    });
    return Object.values(months);
  })();

  const expenseBreakdown = (() => {
    const cats = {};
    expenses.filter(e=>inRange(e.date) && e.type !== "Bank Credit" && e.type !== "Credit").forEach(e => {
      const c = e.category||"Other";
      cats[c] = (cats[c]||0)+(Number(e.amount)||0);
    });
    payroll.filter(p=>inRange(p.paymentDate||p.date||dateFrom)).forEach(p => {
      cats["Payroll"] = (cats["Payroll"]||0) + (Number(p.netPay||p.amount)||0);
    });
    return Object.keys(cats).map(k=>({name:k,value:cats[k]})).sort((a,b)=>b.value-a.value).slice(0,6);
  })();

  const siteStatusData = [
    { name: "In Progress", value: inProcessSites },
    { name: "Pre-Construction", value: pendingWO },
    { name: "Completed", value: sites.filter(s=>s.status==="Completed").length },
  ].filter(s=>s.value>0);

  // ── Tooltip ──
  const Tooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={t.chartTooltip} className="p-3 rounded-xl shadow-xl min-w-[120px]">
        <p className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-70">{label}</p>
        {payload.map((e,i) => (
          <p key={i} className="text-xs font-bold flex items-center gap-2" style={{color:e.color}}>
            <span className="w-2 h-2 rounded-full inline-block" style={{background:e.color}}/>
            {e.name}: {typeof e.value==='number' ? fmt(e.value) : e.value}
          </p>
        ))}
      </div>
    );
  };

  const fade = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{type:"spring",stiffness:90}} };
  const stagger = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.08}} };

  // ── KPI Card component ──

  if (loading) return (
    <div className={`p-6 min-h-screen ${t.page} flex items-center justify-center`}>
      <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:`${accentMain}33`, borderTopColor:accentMain}}/>
    </div>
  );

  return (
    <div className={`p-4 md:p-6 ${t.page}`}>

      {/* ── Header ── */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-30">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${d?"text-white":"text-[var(--text-primary)]"}`}>
            Executive Dashboard
          </h1>
          <p className={`${t.muted} mt-0.5 uppercase tracking-widest text-xs font-bold`}>Real-time Business Intelligence</p>
        </div>

        {/* Date filter pill */}
        <div className={`${t.card} rounded-2xl px-3 py-2 flex flex-wrap items-center gap-3 border border-[var(--border-color)] shadow-sm`}>
          <div className="flex flex-col relative">
            <span className={`${t.label} mb-0.5`}>Period</span>
            <div className="flex items-center gap-1">
              <select value={activePreset} onChange={handlePresetChange}
                className={`text-xs font-black bg-transparent outline-none cursor-pointer w-28 appearance-none ${d?"text-slate-200":"text-[var(--text-primary)]"}`}>
                <option value="custom">Custom</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="financial_year">Financial Year</option>
              </select>
              <ChevronDown size={12} className="opacity-40"/>
            </div>
          </div>
          <div className={`hidden sm:block w-px h-5 ${t.divider}`}/>
          <input type="date" value={dateFrom} max={dateTo} onChange={e=>handleDateChange("from",e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer ${d?"text-slate-200":"text-[var(--text-primary)]"}`}/>
          <span className={`text-xs font-black ${t.muted}`}>→</span>
          <input type="date" value={dateTo} min={dateFrom} onChange={e=>handleDateChange("to",e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer ${d?"text-slate-200":"text-[var(--text-primary)]"}`}/>
          <NotificationWidget/>
        </div>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

        {/* ── Executive KPI Cards (Balanced 4x2 Grid) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            label="Work Order Revenue" 
            value={fmt(totalWOValue)} 
            icon={IndianRupee} 
            color="#C9A227"
            badge="Revenue"
            sub={`${sites.length} total contracted projects`}
            onClick={() => navigate("/sites")}
          />
          <KpiCard 
            label="In-Process Sites" 
            value={inProcessSites} 
            icon={HardHat} 
            color={d ? "#38bdf8" : "#2563EB"}
            badge="In Progress"
            sub="Active site execution"
            onClick={() => navigate("/sites")}
          />
          <KpiCard 
            label="Completed Sites" 
            value={sites.filter(s => s.status === "Completed").length} 
            icon={CheckCircle2} 
            color={d ? "#10b981" : "#059669"}
            badge="Delivered"
            sub={`${sites.length > 0 ? Math.round((sites.filter(s => s.status === "Completed").length / sites.length) * 100) : 0}% completion rate`}
            onClick={() => navigate("/sites")}
          />
          <KpiCard 
            label="Pending Work Orders" 
            value={pendingWO} 
            icon={ClipboardCheck} 
            color={d ? "#a855f7" : "#7C3AED"}
            badge="Pre-Site"
            sub="Pre-construction kickoff"
            onClick={() => navigate("/sites")}
          />
          <KpiCard 
            label="Approved Quotations" 
            value={approvedQuotes} 
            icon={FileCheck} 
            color={d ? "#10b981" : "#10B981"}
            badge="Approved"
            sub={`${quotations.length > 0 ? Math.round((approvedQuotes / quotations.length) * 100) : 0}% of all quotations`}
            onClick={() => navigate("/invoices", { state: { activeTab: "quotations" } })}
          />
          <KpiCard 
            label="Pending Quotations" 
            value={pendingQuotes} 
            icon={FileText} 
            color={d ? "#f59e0b" : "#D97706"}
            badge="Quotations"
            sub="Awaiting client decision"
            onClick={() => navigate("/invoices", { state: { activeTab: "quotations" } })}
          />
          <KpiCard 
            label="Active Leads" 
            value={totalLeadsCount} 
            icon={Users} 
            color={d ? "#38bdf8" : "#0284C7"}
            badge="Pipeline"
            sub={`${activeLeadsCount} active in sales pipeline`}
            onClick={() => navigate("/crm/leads")}
          />
          <KpiCard 
            label="Verified Customers" 
            value={customersCount} 
            icon={Award} 
            color={d ? "#ec4899" : "#C9A227"}
            badge="Customers"
            sub="Active verified clients"
            onClick={() => navigate("/crm/customers")}
          />
        </div>

        {/* ── Main Operations Section ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Site Status Breakdown – 7 cols */}
          <motion.div variants={fade} className={`xl:col-span-7 ${t.card} rounded-2xl p-6 flex flex-col border border-[var(--border-color)] shadow-sm`}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className={`font-black text-base ${d?"text-white":"text-[var(--text-primary)]"}`}>Project Status & Work Orders</h3>
                <p className={`${t.muted} mt-0.5 text-xs font-medium`}>Active sites and operational delivery breakdown</p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[var(--accent-soft)] text-amber-800 dark:text-[var(--accent)] border border-[var(--accent)]/30">
                {sites.length} Total Projects
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center flex-1">
              <div className="sm:col-span-5 h-52 w-full relative flex items-center justify-center">
                {siteStatusData.length > 0 ? (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <span className={`${t.label} text-[10px]`}>TOTAL</span>
                      <span className={`text-2xl font-black ${d?"text-white":"text-[var(--text-primary)]"}`}>{sites.length}</span>
                      <span className="text-[10px] text-slate-400 font-bold">PROJECTS</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie data={siteStatusData} cx="50%" cy="50%" innerRadius={58} outerRadius={78}
                          paddingAngle={4} dataKey="value" stroke="none">
                          {siteStatusData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                        </Pie>
                        <RechartsTooltip content={<Tooltip/>}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${t.muted} font-bold text-xs`}>No site data</div>
                )}
              </div>

              <div className="sm:col-span-7 space-y-3">
                {siteStatusData.map((s,i) => {
                  const pct = sites.length > 0 ? Math.round((s.value / sites.length) * 100) : 0;
                  const col = COLORS[i % COLORS.length];
                  return (
                    <div 
                      key={i} 
                      onClick={() => navigate("/sites")}
                      className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: col }}/>
                          <span className={`text-xs font-bold ${d?"text-slate-200":"text-slate-700"}`}>{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${d?"text-white":"text-[var(--text-primary)]"}`}>{s.value}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-500">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: col }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions – 5 cols */}
          <motion.div variants={fade} className="xl:col-span-5 flex flex-col gap-3">
            <h3 className={`font-black text-base ${d?"text-white":"text-[var(--text-primary)]"}`}>Quick Actions</h3>
            {[
              { label:"New Quotation",  sub:"Create & customize quotation", path:"/quotations", color: "#C9A227" },
              { label:"Work Orders",    sub:"Manage projects & sites",      path:"/sites",      color: d?"#38bdf8":"#2563EB" },
              { label:"Payment Receipts",sub:"View & print receipts",       path:"/receipts",   color: incomeColor },
              { label:"Leads & Customers",sub:"Manage CRM pipeline",        path:"/crm/leads",  color: d?"#a855f7":"#7C3AED" },
              { label:"Quotation History",sub:"Review quotations & status", path:"/invoices",   color: d?"#f59e0b":"#D97706" },
            ].map((btn,i) => (
              <motion.button key={i} variants={fade} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={()=>navigate(btn.path)}
                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between group transition-all ${t.card} ${t.cardHover} border border-[var(--border-color)]`}
                style={{borderLeft:`4px solid ${btn.color}`}}>
                <div>
                  <p className={`font-black text-xs ${d?"text-white":"text-[var(--text-primary)]"}`}>{btn.label}</p>
                  <p className={`${t.muted} text-[11px]`}>{btn.sub}</p>
                </div>
                <ArrowRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{color:btn.color}}/>
              </motion.button>
            ))}
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
