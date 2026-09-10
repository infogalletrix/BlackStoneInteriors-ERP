import { useState, useEffect, useMemo, useRef } from "react";
import { 
  FileText, FileSpreadsheet, Download, 
  TrendingUp, Users, CheckCircle2, Award, PieChart as PieChartIcon, Activity, Search
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

// Original Amber / Gold / Warm theme colors
const DARK_COLORS  = ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];
const LIGHT_COLORS = ['#f97316', '#10b981', '#eab308', '#ef4444', '#3b82f6', '#ec4899'];

const formatINR = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to convert SVG chart element to high-res PNG data URL for jsPDF
const captureChartImage = (elementId, width = 700, height = 350) => {
  return new Promise((resolve) => {
    try {
      const container = document.getElementById(elementId);
      if (!container) return resolve(null);
      const svg = container.querySelector("svg.recharts-surface") || container.querySelector("svg");
      if (!svg) return resolve(null);

      const clonedSvg = svg.cloneNode(true);
      clonedSvg.setAttribute("width", width);
      clonedSvg.setAttribute("height", height);

      // Inject clean white background into SVG
      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("fill", "#ffffff");
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobUrl);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      };
      img.src = blobUrl;
    } catch (err) {
      console.warn("Chart capture failed", err);
      resolve(null);
    }
  });
};

const ReportsPage = () => {
  const { showDialog } = useDialog();
  const t = useThemeClasses();
  const COLORS = t.isDark ? DARK_COLORS : LIGHT_COLORS;

  const [selectedReport, setSelectedReport] = useState("sales_growth");
  const [modalSearch, setModalSearch] = useState("");
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
    salesTrend,
    monthlyBreakdown 
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
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        quotesValue: 0, 
        approvedValue: 0, 
        quotesCount: 0,
        approvedCount: 0,
        sortDate: new Date(d.getFullYear(), d.getMonth(), 1) 
      };
    }

    quotes.forEach(q => {
      const d = new Date(q.date || Date.now());
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (trendMap[key]) {
        const val = Number(q.total) || 0;
        trendMap[key].quotesValue += val;
        trendMap[key].quotesCount++;
        if (q.status === "Approved") {
          trendMap[key].approvedValue += val;
          trendMap[key].approvedCount++;
        }
      }
    });

    const trend = Object.values(trendMap).sort((a,b) => a.sortDate - b.sortDate);

    // Monthly breakdown table rows
    const breakdown = trend.slice().reverse().map(item => ({
      month: item.name,
      monthKey: item.monthKey,
      sent: item.quotesCount,
      quoteValue: item.quotesValue,
      approvedValue: item.approvedValue,
      approvalRate: item.quotesCount > 0 ? ((item.approvedCount / item.quotesCount) * 100).toFixed(1) + "%" : "0%"
    }));

    return {
      totalQuoteValue: totalQVal,
      approvedQuoteValue: approvedQVal,
      approvedCount: appCount,
      totalQuotesCount: quotes.length,
      customersCount: customers.length,
      leadsCount: leads.length,
      conversionRate: convRate,
      leadSources: sources.length > 0 ? sources : [{ name: "Direct", value: 1 }],
      salesTrend: trend,
      monthlyBreakdown: breakdown
    };
  }, [dashboardData]);

  // Report Generator logic for the requested datasets
  const fetchReportData = async (reportId) => {
    let header = [], rows = [], foot = null, title = "Report", isSalesReport = false;
    const quotes = dashboardData.quotations;
    const crm = dashboardData.crm;

    try {
      switch(reportId) {
        case 'sales_growth': {
          title = "Sales Performance & Growth Report";
          isSalesReport = true;
          // Use (Rs.) instead of unicode rupee to guarantee clean rendering in jsPDF
          header = ["Month", "Quotations Sent", "Total Quote Value (Rs.)", "Approved Value (Rs.)", "Approval Rate"];
          
          const monthly = {};
          let grandTotal = 0;
          let grandApproved = 0;
          let totalCount = 0;
          let totalApprovedCount = 0;

          quotes.forEach(q => {
            const d = new Date(q.date || Date.now());
            const m = d.toISOString().slice(0, 7);
            if (!monthly[m]) {
              monthly[m] = { count: 0, total: 0, approved: 0, approvedCount: 0 };
            }
            monthly[m].count++;
            totalCount++;
            const amt = Number(q.total) || 0;
            monthly[m].total += amt;
            grandTotal += amt;
            if (q.status === "Approved") {
              monthly[m].approved += amt;
              grandApproved += amt;
              monthly[m].approvedCount++;
              totalApprovedCount++;
            }
          });

          const sortedMonths = Object.keys(monthly).sort().reverse();
          sortedMonths.forEach(m => {
            const item = monthly[m];
            const rate = item.count > 0 ? `${((item.approvedCount / item.count) * 100).toFixed(1)}%` : "0%";
            rows.push([
              m,
              item.count,
              `Rs. ${formatINR(item.total)}`,
              `Rs. ${formatINR(item.approved)}`,
              rate
            ]);
          });

          const overallRate = totalCount > 0 ? `${((totalApprovedCount / totalCount) * 100).toFixed(1)}%` : "0%";
          foot = [
            "TOTAL",
            `${totalCount} Quotes`,
            `Rs. ${formatINR(grandTotal)}`,
            `Rs. ${formatINR(grandApproved)}`,
            `${overallRate} Win Rate`
          ];
          break;
        }

        case 'quotations': {
          title = "Quotations Directory (Approval Status)";
          // Clear column headers without unicode characters that break PDF rendering
          header = ["Quote No", "Date", "Client Name", "Project Title", "Total Amount (Rs.)", "Status"];
          
          let totalVal = 0;
          let approvedVal = 0;
          let appCount = 0;

          quotes.forEach(q => {
            const val = Number(q.total) || 0;
            totalVal += val;
            if (q.status === "Approved") {
              approvedVal += val;
              appCount++;
            }
            rows.push([
              q.quoteNo || `BSI-${q.id}`,
              q.date ? new Date(q.date).toLocaleDateString('en-IN') : "-",
              q.clientName || "Valued Client",
              q.projectTitle || "Interior Project",
              `Rs. ${formatINR(val)}`,
              q.status || "Pending"
            ]);
          });

          // Explicit Grand Total Summary Row
          foot = [
            "TOTAL",
            `${quotes.length} Quotes`,
            `Approved: ${appCount}`,
            "-",
            `Rs. ${formatINR(totalVal)}`,
            `Approved: Rs. ${formatINR(approvedVal)}`
          ];
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
          foot = [
            "TOTAL",
            `${customers.length} Verified Clients`,
            "-",
            "-",
            "-",
            "-",
            "Active Customer Base"
          ];
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
          foot = [
            "TOTAL",
            `${leads.length} Active Leads`,
            "-",
            "-",
            "-",
            "-",
            "Sales Pipeline"
          ];
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error(err);
      showDialog({ title: "Error", message: "Failed to compile report data.", type: "error" });
    }

    return { 
      title, 
      header, 
      rows: rows.map(r => r.map(c => c != null ? String(c) : "-")), 
      foot,
      isSalesReport 
    };
  };

  const viewReport = async () => {
    setModalSearch("");
    const data = await fetchReportData(selectedReport);
    if(data.rows.length === 0) { 
      showDialog({ title: "No Data", message: "No data available for this report.", type: "alert" }); 
      return; 
    }
    setViewReportData(data);
  };

  const exportPDF = async () => {
    try {
      const { title, header, rows, foot, isSalesReport } = await fetchReportData(selectedReport);
      if(rows.length === 0) { 
        showDialog({ title: "No Data", message: "No data available for this report.", type: "alert" }); 
        return; 
      }
      
      const doc = new jsPDF('landscape');
      // Original Amber / Orange theme: [249, 115, 22] in light mode, [79, 70, 229] in dark mode
      const primaryColor = t.isDark ? [79, 70, 229] : [249, 115, 22];

      // Top Company Accent Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("BLACK STONE INTERIORS", 14, 11);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Executive Sales & Operations Intelligence", 283, 11, { align: "right" });

      // Document Title & Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, 26);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}  •  Confidential Internal Report`, 14, 32);

      let currentY = 38;

      // When exporting Sales Report: Embed Executive KPIs and Visual Charts!
      if (isSalesReport) {
        // Executive Summary Metrics Box
        doc.setFillColor(254, 243, 199); // warm amber-50 background
        doc.setDrawColor(245, 158, 11);
        doc.roundedRect(14, currentY, 269, 19, 2, 2, 'FD');

        const kpis = [
          { label: "TOTAL QUOTES VALUE", val: `Rs. ${formatINR(totalQuoteValue)}`, sub: `${totalQuotesCount} quotes generated` },
          { label: "APPROVED REVENUE", val: `Rs. ${formatINR(approvedQuoteValue)}`, sub: `${approvedCount} approved (${conversionRate}%)` },
          { label: "CONVERTED CUSTOMERS", val: `${customersCount} Clients`, sub: "CRM active database" },
          { label: "ACTIVE SALES LEADS", val: `${leadsCount} Leads`, sub: "Pipeline opportunities" }
        ];

        kpis.forEach((kpi, idx) => {
          const x = 20 + idx * 67;
          doc.setFontSize(7.5);
          doc.setTextColor(180, 83, 9); // amber-700
          doc.setFont("helvetica", "bold");
          doc.text(kpi.label, x, currentY + 5.5);

          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          doc.text(kpi.val, x, currentY + 11.5);

          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.setFont("helvetica", "normal");
          doc.text(kpi.sub, x, currentY + 15.5);
        });

        currentY += 24;

        // Capture visual charts from the rendered page
        const trendImg = await captureChartImage("sales-trend-chart-container", 580, 260);
        const pieImg = await captureChartImage("lead-sources-chart-container", 380, 260);

        if (trendImg || pieImg) {
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          doc.setFont("helvetica", "bold");
          doc.text("EXECUTIVE VISUAL INSIGHTS (TRENDS & SOURCES)", 14, currentY + 2);

          const chartY = currentY + 4;
          const chartH = 58;

          if (trendImg && pieImg) {
            doc.addImage(trendImg, 'PNG', 14, chartY, 172, chartH);
            doc.addImage(pieImg, 'PNG', 190, chartY, 93, chartH);
            currentY = chartY + chartH + 8;
          } else if (trendImg) {
            doc.addImage(trendImg, 'PNG', 14, chartY, 269, chartH + 8);
            currentY = chartY + chartH + 16;
          }
        }
      }

      // Render the Data Table with Amber theme
      autoTable(doc, { 
        startY: currentY, 
        head: [header], 
        body: rows, 
        foot: foot ? [foot] : undefined,
        theme: 'grid', 
        headStyles: { 
          fillColor: primaryColor, // Amber/Orange [249, 115, 22]
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59]
        },
        footStyles: {
          fillColor: [254, 243, 199], // amber-100
          textColor: [146, 64, 14], // amber-900
          fontStyle: 'bold',
          fontSize: 8.5
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 }
      });

      doc.save(`${title.replace(/\s+/g,'_')}_${Date.now()}.pdf`);
    } catch (err) { 
      showDialog({ title: "Export Error", message: "PDF Export Error: " + err.message, type: "error" }); 
    }
  };

  const exportExcel = async () => {
    try {
      const { title, header, rows, foot } = await fetchReportData(selectedReport);
      if(rows.length === 0) { 
        showDialog({ title: "No Data", message: "No data available for this report.", type: "alert" }); 
        return; 
      }
      const wb = XLSX.utils.book_new();
      const sheetData = foot ? [header, ...rows, foot] : [header, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
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

  // Original Amber / Golden Gradient Panel
  const generatorPanel = t.isDark
    ? "bg-gradient-to-br from-violet-900 to-slate-900 border border-violet-500/20 shadow-xl"
    : "bg-gradient-to-br from-[#d97706] to-[#b45309] shadow-amber-900/20 shadow-xl";

  // Filtered rows in modal
  const filteredModalRows = useMemo(() => {
    if (!viewReportData) return [];
    if (!modalSearch.trim()) return viewReportData.rows;
    const term = modalSearch.toLowerCase();
    return viewReportData.rows.filter(row => 
      row.some(cell => String(cell).toLowerCase().includes(term))
    );
  }, [viewReportData, modalSearch]);

  return (
    <div className={`p-4 md:p-6 ${t.page} min-h-screen`}>

      {/* HEADER */}
      <div className="relative z-30 mb-6 flex justify-between items-start">
        <div>
          <motion.h1 initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
            className={`text-xl font-black tracking-tight flex items-center gap-2 ${t.heading}`}>
            <Activity className={t.isDark ? "text-violet-400" : "text-amber-600"} size={22} />
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
          {/* TOP KPI ROW - Styled in Original Amber & Gold Theme */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                label: "Total Quotations Value", 
                value: `₹${(totalQuoteValue/100000).toFixed(2)}L`, 
                sub: `${totalQuotesCount} quotes generated`,
                icon: FileText, 
                color: t.isDark ? "text-violet-400" : "text-amber-600" 
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
                sub: "Verified client accounts",
                icon: Award, 
                color: t.isDark ? "text-amber-400" : "text-amber-600" 
              },
              { 
                label: "Active Sales Leads", 
                value: leadsCount, 
                sub: "Opportunities in pipeline",
                icon: Users, 
                color: t.isDark ? "text-violet-400" : "text-amber-700" 
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className={`${t.card} ${t.cardHover} p-5 rounded-2xl border border-[var(--border-color)] shadow-sm`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</span>
                  <div className={`p-2 rounded-xl bg-amber-500/10 dark:bg-white/5 ${color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className={`text-2xl font-black ${t.heading}`}>{value}</div>
                <p className="text-[11px] text-muted font-medium mt-1">{sub}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* CHARTS & SALES BREAKDOWN — LEFT 2 COLS */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Monthly Sales & Quotations Trend Chart */}
              <div className={`${t.card} rounded-2xl p-6 border border-[var(--border-color)] shadow-sm`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className={`text-sm font-black flex items-center gap-2 uppercase tracking-wider ${t.heading}`}>
                      <TrendingUp size={16} className={t.isDark ? "text-violet-400" : "text-amber-600"}/> 
                      Monthly Sales &amp; Quotations Trend (6 Months)
                    </h3>
                    <p className="text-[11px] text-muted">Comparison of total quotation pipeline vs approved sales</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Total Quotes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Approved
                    </span>
                  </div>
                </div>
                <div id="sales-trend-chart-container" className="h-64 w-full">
                  <ResponsiveContainer width="100%" height={256} minWidth={1}>
                    <BarChart data={salesTrend} margin={{ top:5, right:10, left:0, bottom:5 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:700, fill:t.chartTickColor }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:700, fill:t.chartTickColor }} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} width={55} />
                      <RechartsTooltip cursor={{ fill: t.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(217,119,6,0.08)' }} contentStyle={t.chartTooltip} formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Bar dataKey="quotesValue" name="Total Quotes" fill={t.isDark ? "#f59e0b" : "#d97706"} radius={[4,4,0,0]} />
                      <Bar dataKey="approvedValue" name="Approved Value" fill={t.isDark ? "#10b981" : "#059669"} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lead Sources Pie Chart */}
              <div className={`${t.card} rounded-2xl p-6 border border-[var(--border-color)] shadow-sm`}>
                <h3 className={`text-sm font-black mb-1 flex items-center gap-2 uppercase tracking-wider ${t.heading}`}>
                  <PieChartIcon size={16} className={t.isDark ? "text-violet-400" : "text-amber-600"}/> 
                  CRM Lead Acquisition Sources
                </h3>
                <p className="text-[11px] text-muted mb-4">Origin channels for customer leads entering the pipeline</p>
                <div id="lead-sources-chart-container" className="h-60 w-full">
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

              {/* Monthly Performance Data Table on Screen */}
              <div className={`${t.card} rounded-2xl p-6 border border-[var(--border-color)] shadow-sm`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-wider ${t.heading}`}>
                      Monthly Performance &amp; Approval Breakdown
                    </h3>
                    <p className="text-[11px] text-muted">Consolidated sales and quote volume history</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] font-bold text-muted uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3 text-center">Quotes Sent</th>
                        <th className="py-2.5 px-3 text-right">Total Quote Value (₹)</th>
                        <th className="py-2.5 px-3 text-right">Approved Value (₹)</th>
                        <th className="py-2.5 px-3 text-right">Approval Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {monthlyBreakdown.map((row, i) => (
                        <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition font-medium">
                          <td className="py-2.5 px-3 font-bold">{row.month} ({row.monthKey})</td>
                          <td className="py-2.5 px-3 text-center font-bold">{row.sent}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">₹{formatINR(row.quoteValue)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{formatINR(row.approvedValue)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">{row.approvalRate}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-[var(--border-color)] font-bold bg-amber-500/10 dark:bg-amber-500/5">
                      <tr>
                        <td className="py-2.5 px-3 uppercase text-amber-900 dark:text-amber-300">Total (6 Months)</td>
                        <td className="py-2.5 px-3 text-center text-amber-900 dark:text-amber-300">{totalQuotesCount} Quotes</td>
                        <td className="py-2.5 px-3 text-right text-amber-900 dark:text-amber-300">₹{formatINR(totalQuoteValue)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">₹{formatINR(approvedQuoteValue)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-900 dark:text-amber-300">{conversionRate}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            {/* REPORT GENERATOR — RIGHT COL (Amber / Gold theme) */}
            <div className="xl:col-span-1">
              <div className={`${generatorPanel} rounded-2xl p-6 shadow-xl sticky top-8 relative overflow-hidden`}>
                <h3 className="text-lg font-black mb-1 flex items-center gap-2 tracking-tight text-white">
                  Report Directory
                </h3>
                <p className="text-xs font-medium mb-6 text-white/80">
                  Select a directory or sales report to inspect and export.
                </p>

                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 block">
                      Select Report / Directory
                    </label>
                    <select
                      className={`w-full rounded-xl p-3 text-xs font-bold outline-none transition-all cursor-pointer appearance-none ${
                        t.isDark
                          ? "bg-slate-800/90 border border-white/10 text-white focus:ring-2 focus:ring-violet-500 [&_option]:bg-slate-900"
                          : "bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-white/50 [&_option]:bg-amber-800 [&_option]:text-white"
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

      {/* VIEW REPORT MODAL - Enhanced with Search & Clean Totals */}
      {viewReportData && (
        <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60`}>
          <div className={`${t.modalBg} rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[var(--border-color)]`}>
            
            {/* Modal Header */}
            <div className={`p-5 ${t.modalHeader} flex justify-between items-center border-b border-[var(--border-color)]`}>
              <div>
                <h2 className={`text-lg font-black ${t.heading}`}>{viewReportData.title}</h2>
                <p className="text-xs text-muted">
                  Showing {filteredModalRows.length} of {viewReportData.rows.length} total records
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] outline-none focus:border-amber-500 w-44 sm:w-56"
                  />
                </div>
                <button onClick={() => setViewReportData(null)}
                  className={`text-2xl leading-none transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${t.isDark ? "text-slate-400 hover:text-rose-400" : "text-slate-500 hover:text-red-600"}`}>
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="flex-1 overflow-auto p-5">
              <table className="w-full text-left border-collapse text-xs">
                <thead className={`${t.tableHead} sticky top-0 shadow-sm`}>
                  <tr className="border-b border-[var(--border-color)] font-bold uppercase text-[10px] tracking-wider text-muted bg-[var(--bg-surface)]">
                    {viewReportData.header.map((h,i) => <th key={i} className="p-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredModalRows.map((row,i) => (
                    <tr key={i} className={`${t.tableRow} hover:bg-black/5 dark:hover:bg-white/5 transition`}>
                      {row.map((cell,j) => (
                        <td key={j} className="p-3 font-medium">
                          {/* Approval Status Badge */}
                          {j === row.length - 1 && (cell === "Approved" || cell === "Pending" || cell === "Rejected" || cell === "Draft" || cell === "Revised" || cell === "Customer") ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              cell === "Approved" || cell === "Customer" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                              cell === "Rejected" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                              cell === "Draft" ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20" :
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}>
                              {cell}
                            </span>
                          ) : (
                            <span className={cell.startsWith("Rs.") ? "font-bold text-slate-900 dark:text-white" : ""}>
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredModalRows.length === 0 && (
                    <tr>
                      <td colSpan={viewReportData.header.length} className="p-8 text-center text-muted font-bold">
                        No records match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Clear Grand Total Footer Row */}
                {viewReportData.foot && (
                  <tfoot className="border-t-2 border-[var(--border-color)] bg-amber-500/10 dark:bg-amber-500/5 font-bold">
                    <tr>
                      {viewReportData.foot.map((fCell, fIdx) => (
                        <td key={fIdx} className="p-3 text-xs text-amber-900 dark:text-amber-300">
                          {fCell}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Modal Actions Footer */}
            <div className={`p-4 ${t.modalHeader} flex justify-between items-center border-t border-[var(--border-color)] bg-[var(--bg-surface)]`}>
              <span className="text-xs text-muted font-bold">
                Total Records: {viewReportData.rows.length}
              </span>
              <div className="flex gap-2.5">
                <button onClick={exportPDF}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center gap-1.5">
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
