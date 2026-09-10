import { useState, useEffect, useMemo } from "react";
import { 
  FileText, FileSpreadsheet, Download, 
  TrendingUp, Users, CheckCircle2, Award, PieChart as PieChartIcon, Activity, Clock
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDialog } from "../contexts/DialogContext";
import { useThemeClasses } from "../hooks/useThemeClasses";
import NotificationWidget from "../components/NotificationWidget";

const DARK_COLORS  = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4'];
const LIGHT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const formatINR = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ReportsPage = () => {
  const { showDialog } = useDialog();
  const t = useThemeClasses();
  const COLORS = t.isDark ? DARK_COLORS : LIGHT_COLORS;

  const [selectedReport, setSelectedReport] = useState("sales_growth");
  const [dashboardData, setDashboardData] = useState({ 
    quotations: [], 
    crm: [], 
    loading: true 
  });
  const [viewReportData, setViewReportData] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [qRes, crmRes] = await Promise.all([
          fetch('/api/quotations').then(r => r.ok ? r.json() : []),
          fetch('/api/crm').then(r => r.ok ? r.json() : [])
        ]);
        setDashboardData({ 
          quotations: Array.isArray(qRes) ? qRes : [], 
          crm: Array.isArray(crmRes) ? crmRes : [], 
          loading: false 
        });
      } catch (err) {
        console.error("Failed to load report insights", err);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchInsights();
  }, []);

  // Compute Sales Insights, KPIs and Graphs
  const { 
    totalQuoteValue, 
    approvedQuoteValue, 
    approvedCount, 
    totalQuotesCount,
    customersCount, 
    leadsCount, 
    conversionRate,
    leadSources, 
    salesTrend 
  } = useMemo(() => {
    const quotes = dashboardData.quotations;
    const crm = dashboardData.crm;

    let totalQVal = 0;
    let approvedQVal = 0;
    let appCount = 0;

    quotes.forEach(q => {
      const val = Number(q.total) || 0;
      totalQVal += val;
      if (q.status === "Approved") {
        approvedQVal += val;
        appCount += 1;
      }
    });

    const customers = crm.filter(c => c.status === "Customer");
    const leads = crm.filter(c => c.status !== "Customer");

    const convRate = quotes.length > 0 ? ((appCount / quotes.length) * 100).toFixed(1) : "0";

    // Lead Sources Distribution
    const sourcesMap = {};
    crm.forEach(c => { 
      const s = c.source || 'Other'; 
      sourcesMap[s] = (sourcesMap[s] || 0) + 1; 
    });
    const sources = Object.keys(sourcesMap).map(k => ({ name: k, value: sourcesMap[k] }));

    // Monthly Sales & Quotations Trend (last 6 months)
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const currentMonthIndex = new Date().getMonth();
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIndex - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      trendMap[key] = { 
        name: months[d.getMonth()], 
        quotesValue: 0, 
        approvedValue: 0, 
        sortDate: new Date(d.getFullYear(), d.getMonth(), 1) 
      };
    }

    quotes.forEach(q => {
      const d = new Date(q.date || Date.now());
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (trendMap[key]) {
        const val = Number(q.total) || 0;
        trendMap[key].quotesValue += val;
        if (q.status === "Approved") {
          trendMap[key].approvedValue += val;
        }
      }
    });

    const trend = Object.values(trendMap).sort((a,b) => a.sortDate - b.sortDate);

    return {
      totalQuoteValue: totalQVal,
      approvedQuoteValue: approvedQVal,
      approvedCount: appCount,
      totalQuotesCount: quotes.length,
      customersCount: customers.length,
      leadsCount: leads.length,
      conversionRate: convRate,
      leadSources: sources.length > 0 ? sources : [{ name: "Direct", value: 1 }],
      salesTrend: trend
    };
  }, [dashboardData]);

  // Report Generator logic for the requested datasets
  const fetchReportData = async (reportId) => {
    let header = [], rows = [], title = "Report";
    const quotes = dashboardData.quotations;
    const crm = dashboardData.crm;

    try {
      switch(reportId) {
        case 'sales_growth': {
          title = "Sales Performance & Growth Report";
          header = ["Month", "Quotations Sent", "Total Quote Value (₹)", "Approved Value (₹)", "Approval Rate"];
          
          const monthly = {};
          quotes.forEach(q => {
            const d = new Date(q.date || Date.now());
            const m = d.toISOString().slice(0, 7);
            if (!monthly[m]) {
              monthly[m] = { count: 0, total: 0, approved: 0, approvedCount: 0 };
            }
            monthly[m].count++;
            const amt = Number(q.total) || 0;
            monthly[m].total += amt;
            if (q.status === "Approved") {
              monthly[m].approved += amt;
              monthly[m].approvedCount++;
            }
          });

          const sortedMonths = Object.keys(monthly).sort().reverse();
          sortedMonths.forEach(m => {
            const item = monthly[m];
            const rate = item.count > 0 ? `${((item.approvedCount / item.count) * 100).toFixed(1)}%` : "0%";
            rows.push([
              m,
              item.count,
              `₹${formatINR(item.total)}`,
              `₹${formatINR(item.approved)}`,
              rate
            ]);
          });
          break;
        }

        case 'quotations': {
          title = "Quotations Directory (Approval Status)";
          header = ["Quote No", "Date", "Client Name", "Project Title", "Total Amount (₹)", "Status"];
          quotes.forEach(q => {
            rows.push([
              q.quoteNo || `BSI-${q.id}`,
              q.date ? new Date(q.date).toLocaleDateString('en-IN') : "-",
              q.clientName || "Valued Client",
              q.projectTitle || "Interior Project",
              `₹${formatINR(q.total)}`,
              q.status || "Pending"
            ]);
          });
          break;
        }

        case 'customers': {
          title = "Customers Directory";
          header = ["ID", "Customer Name", "Phone", "Email", "Project / Address", "Source", "Status"];
          const customers = crm.filter(c => c.status === "Customer");
          customers.forEach(c => {
            rows.push([
              `CUST-${c.id}`,
              c.name,
              c.phone || "-",
              c.email || "-",
              c.project || c.address || "-",
              c.source || "Direct",
              "Customer"
            ]);
          });
          break;
        }

        case 'leads': {
          title = "Leads Directory";
          header = ["ID", "Lead Name", "Phone", "Email", "Interest Status", "Source", "Date Created"];
          const leads = crm.filter(c => c.status !== "Customer");
          leads.forEach(c => {
            rows.push([
              `LEAD-${c.id}`,
              c.name,
              c.phone || "-",
              c.email || "-",
              c.status || "Interested",
              c.source || "Website",
              c.date ? new Date(c.date).toLocaleDateString('en-IN') : "-"
            ]);
          });
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error(err);
      showDialog({ title: "Error", message: "Failed to compile report data.", type: "error" });
    }

    return { title, header, rows: rows.map(r => r.map(c => c != null ? String(c) : "-")) };
  };

  const viewReport = async () => {
    const data = await fetchReportData(selectedReport);
    if(data.rows.length === 0) { 
      showDialog({ title: "No Data", message: "No data available for this report.", type: "alert" }); 
      return; 
    }
    setViewReportData(data);
  };

  const exportPDF = async () => {
    try {
      const { title, header, rows } = await fetchReportData(selectedReport);
      if(rows.length === 0) { 
        showDialog({ title: "No Data", message: "No data available for this report.", type: "alert" }); 
        return; 
      }
      const doc = new jsPDF('landscape');
      doc.setFontSize(16); 
      doc.text(title, 14, 18);
      doc.setFontSize(10); 
      doc.setTextColor(100); 
      doc.text(`Black Stone Interiors • Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 25);
      autoTable(doc, { 
        startY: 30, 
        head: [header], 
        body: rows, 
        theme: 'grid', 
        headStyles: { fillColor: t.isDark ? [99, 102, 241] : [37, 99, 235] } 
      });
      doc.save(`${title.replace(/\s+/g,'_')}_${Date.now()}.pdf`);
    } catch (err) { 
      showDialog({ title: "Export Error", message: "PDF Export Error: " + err.message, type: "error" }); 
    }
  };

  const exportExcel = async () => {
    try {
      const { title, header, rows } = await fetchReportData(selectedReport);
      if(rows.length === 0) { 
        showDialog({ title: "No Data", message: "No data available for this report.", type: "alert" }); 
        return; 
      }
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Report Data");
      XLSX.writeFile(wb, `${title.replace(/\s+/g,'_')}_${Date.now()}.xlsx`);
    } catch (err) { 
      showDialog({ title: "Export Error", message: "Excel Export Error: " + err.message, type: "error" }); 
    }
  };

  const reportOptions = [
    { id: "sales_growth", label: "📈 Sales Performance & Growth Report" },
    { id: "quotations", label: "📋 Quotations Directory (Approval Status)" },
    { id: "customers", label: "👥 Customers Directory" },
    { id: "leads", label: "🎯 Leads Directory" },
  ];

  const generatorPanel = t.isDark
    ? "themed-card border border-[var(--border-color)]"
    : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white";

  return (
    <div className={`p-4 md:p-6 ${t.page} min-h-screen`}>

      {/* HEADER */}
      <div className="relative z-30 mb-6 flex justify-between items-start">
        <div>
          <motion.h1 initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
            className={`text-xl font-black tracking-tight flex items-center gap-2 ${t.heading}`}>
            <Activity className={t.isDark ? "text-violet-400" : "text-blue-600"} size={22} />
            Sales &amp; Business Intelligence Reports
          </motion.h1>
          <p className={`mt-0.5 text-xs font-medium ${t.muted}`}>
            Executive sales insights, quotation approval metrics, and customer &amp; lead directories.
          </p>
        </div>
        <NotificationWidget />
      </div>

      {!dashboardData.loading && (
        <div className="relative z-0 space-y-6">
          {/* KPI ROW */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                label: "Total Quotations Value", 
                value: `₹${(totalQuoteValue/100000).toFixed(2)}L`, 
                sub: `${totalQuotesCount} quotes generated`,
                icon: FileText, 
                color: t.isDark ? "text-blue-400" : "text-blue-600" 
              },
              { 
                label: "Approved Sales Value", 
                value: `₹${(approvedQuoteValue/100000).toFixed(2)}L`, 
                sub: `${approvedCount} approved (${conversionRate}%)`,
                icon: CheckCircle2, 
                color: t.isDark ? "text-emerald-400" : "text-emerald-600" 
              },
              { 
                label: "Converted Customers", 
                value: customersCount, 
                sub: "Active verified clients",
                icon: Award, 
                color: t.isDark ? "text-amber-400" : "text-amber-600" 
              },
              { 
                label: "Active Sales Leads", 
                value: leadsCount, 
                sub: "In sales pipeline",
                icon: Users, 
                color: t.isDark ? "text-indigo-400" : "text-indigo-600" 
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className={`${t.card} ${t.cardHover} p-5 rounded-2xl border border-[var(--border-color)] shadow-sm`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</span>
                  <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 ${color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className={`text-2xl font-black ${t.heading}`}>{value}</div>
                <p className="text-[11px] text-muted font-medium mt-1">{sub}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* CHARTS — LEFT 2 COLS */}
            <div className="xl:col-span-2 space-y-6">
              {/* Sales & Quotations Trend Chart */}
              <div className={`${t.card} rounded-2xl p-6 border border-[var(--border-color)] shadow-sm`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className={`text-sm font-black flex items-center gap-2 uppercase tracking-wider ${t.heading}`}>
                      <TrendingUp size={16} className={t.isDark ? "text-violet-400" : "text-blue-600"}/> 
                      Monthly Sales &amp; Quotations Trend (6 Months)
                    </h3>
                    <p className="text-[11px] text-muted">Total quotation value vs approved sales</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Total Quotes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Approved
                    </span>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height={256} minWidth={1}>
                    <BarChart data={salesTrend} margin={{ top:5, right:10, left:0, bottom:5 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:700, fill:t.chartTickColor }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:700, fill:t.chartTickColor }} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} width={55} />
                      <RechartsTooltip cursor={{ fill: t.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.06)' }} contentStyle={t.chartTooltip} formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Bar dataKey="quotesValue" name="Total Quotes" fill={t.isDark ? "#3b82f6" : "#2563eb"} radius={[4,4,0,0]} />
                      <Bar dataKey="approvedValue" name="Approved Value" fill={t.isDark ? "#10b981" : "#059669"} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lead Sources Pie Chart */}
              <div className={`${t.card} rounded-2xl p-6 border border-[var(--border-color)] shadow-sm`}>
                <h3 className={`text-sm font-black mb-1 flex items-center gap-2 uppercase tracking-wider ${t.heading}`}>
                  <PieChartIcon size={16} className={t.isDark ? "text-violet-400" : "text-blue-600"}/> 
                  Lead Acquisition Sources
                </h3>
                <p className="text-[11px] text-muted mb-4">Origin of leads entering the sales pipeline</p>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height={240} minWidth={1}>
                    <PieChart>
                      <Pie data={leadSources} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                        {leadSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={t.chartTooltip} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"
                        wrapperStyle={{ fontSize:'11px', fontWeight:700, color: t.chartTickColor }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* REPORT GENERATOR — RIGHT COL */}
            <div className="xl:col-span-1">
              <div className={`${generatorPanel} rounded-2xl p-6 shadow-xl sticky top-8 relative overflow-hidden`}>
                <h3 className="text-lg font-black mb-1 flex items-center gap-2 tracking-tight text-white">
                  Report Directory
                </h3>
                <p className="text-xs font-medium mb-6 text-white/80">
                  Select a directory or sales report to view and export.
                </p>

                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 block">
                      Select Report / Directory
                    </label>
                    <select
                      className={`w-full rounded-xl p-3 text-xs font-bold outline-none transition-all cursor-pointer appearance-none ${
                        t.isDark
                          ? "bg-slate-800/90 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 [&_option]:bg-slate-900"
                          : "bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-white/50 [&_option]:bg-blue-800 [&_option]:text-white"
                      }`}
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                    >
                      {reportOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-3 border-t border-white/20 space-y-2.5">
                    <button onClick={viewReport}
                      className="w-full flex justify-center items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white py-3 rounded-xl font-black text-xs transition-all shadow-sm">
                      <FileText size={15}/> View Directory / Report
                    </button>
                    <button onClick={exportPDF}
                      className="w-full flex justify-center items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white py-3 rounded-xl font-black text-xs transition-all shadow-sm">
                      <Download size={15}/> Export to PDF
                    </button>
                    <button onClick={exportExcel}
                      className="w-full flex justify-center items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white py-3 rounded-xl font-black text-xs transition-all shadow-sm">
                      <FileSpreadsheet size={15}/> Export to Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REPORT MODAL */}
      {viewReportData && (
        <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60`}>
          <div className={`${t.modalBg} rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[var(--border-color)]`}>
            <div className={`p-5 ${t.modalHeader} flex justify-between items-center border-b border-[var(--border-color)]`}>
              <div>
                <h2 className={`text-lg font-black ${t.heading}`}>{viewReportData.title}</h2>
                <p className="text-xs text-muted">Showing {viewReportData.rows.length} total records</p>
              </div>
              <button onClick={() => setViewReportData(null)}
                className={`text-2xl leading-none transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${t.isDark ? "text-slate-400 hover:text-rose-400" : "text-slate-500 hover:text-red-600"}`}>
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <table className="w-full text-left border-collapse text-xs">
                <thead className={`${t.tableHead} sticky top-0 shadow-sm`}>
                  <tr className="border-b border-[var(--border-color)] font-bold uppercase text-[10px] tracking-wider text-muted">
                    {viewReportData.header.map((h,i) => <th key={i} className="p-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {viewReportData.rows.map((row,i) => (
                    <tr key={i} className={`${t.tableRow} hover:bg-black/5 dark:hover:bg-white/5 transition`}>
                      {row.map((cell,j) => (
                        <td key={j} className="p-3 font-medium">
                          {/* Badge for approval status */}
                          {j === row.length - 1 && (cell === "Approved" || cell === "Pending" || cell === "Rejected" || cell === "Negotiating") ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              cell === "Approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                              cell === "Rejected" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                              cell === "Negotiating" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}>
                              {cell}
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`p-4 ${t.modalHeader} flex justify-between items-center border-t border-[var(--border-color)] bg-[var(--bg-surface)]`}>
              <span className="text-xs text-muted font-bold">Total: {viewReportData.rows.length} rows</span>
              <div className="flex gap-2.5">
                <button onClick={exportPDF}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center gap-1.5">
                  <Download size={14}/> Download PDF
                </button>
                <button onClick={exportExcel}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5">
                  <FileSpreadsheet size={14}/> Download Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
