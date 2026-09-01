import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Briefcase,
  BarChart2,
  ChevronLeft,
  Wallet,
  MapPin,
  Receipt,
  Landmark,
  FileStack,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useThemeClasses } from "../hooks/useThemeClasses";
import SettingsModal from "./SettingsModal";

const Sidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const t = useThemeClasses();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [expandedMenus, setExpandedMenus] = useState({
    CRM: false,
    HR: false,
  });

  const toggleMenu = (name) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "s") toggleSidebar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const menuItems = [
    { path: "/", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    {
      name: "CRM",
      icon: <Users size={20} />,
      subItems: [
        { path: "/crm/leads", name: "Leads" },
        { path: "/crm/customers", name: "Customers" },
        { path: "/crm/pipeline", name: "Sales Pipeline" },
        { path: "/crm", name: "Site Surveys" },
        { path: "/crm/schedule", name: "Schedule" },
        { path: "/crm/telecalling", name: "Telecalling" },
        { path: "/crm/marketing", name: "Marketing Campaigns" }
      ],
    },
    {
      path: "/quotations",
      name: "Quotations",
      icon: <ClipboardList size={20} />,
      canAdd: true,
    },


    {
      name: "Projects",
      icon: <MapPin size={20} />,
      subItems: [
        { path: "/sites", name: "Work Orders" },
        { path: "/sites/waiting-floor", name: "Waiting Floor" }
      ]
    },


    {
      path: "/billing",
      name: "Billing",
      icon: <FileText size={20} />,
      canAdd: true,
    },
    { path: "/invoices", name: "History", icon: <FileStack size={20} /> },
    {
      path: "/receipts",
      name: "Payment Receipts",
      icon: <Receipt size={20} />,
    },
    { path: "/expenses", name: "Expenses & credits", icon: <Receipt size={20} /> },
    { path: "/accounts", name: "Accounts", icon: <Landmark size={20} /> },

    {
      name: "HR",
      icon: <Briefcase size={20} />,
      subItems: [
        { path: "/employees", name: "Employees" },
        { path: "/attendance", name: "Attendance" },
        { path: "/salary", name: "Payroll" }
      ],
    },
    { path: "/reports", name: "Reports", icon: <BarChart2 size={20} /> },
  ];

  return (
    <nav
      className={`${
        isOpen ? "w-64" : "w-20"
      } ${ t.isDark
        ? "bg-slate-900/80 backdrop-blur-xl border-r border-white/10 text-slate-200"
        : "bg-[#111827] border-r border-slate-800 text-slate-100"
      } flex flex-col h-screen transition-all duration-300 relative shadow-2xl flex-shrink-0 z-20`}
    >
      {/* Header */}
      <div
        onClick={toggleSidebar}
        className={`py-5 px-4 flex items-center cursor-pointer group transition ${ t.isDark ? "hover:bg-white/5 border-b border-white/10" : "hover:bg-slate-800 border-b border-slate-800"}`}
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <div className={`flex items-center gap-3 ${!isOpen ? "justify-center w-full" : ""}`}>
          <div className={`flex-shrink-0 ${ t.isDark ? "text-violet-400" : "text-[#D4AF37]"}`}>
            {isOpen ? <ChevronLeft size={22} /> : <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md object-cover shadow-md" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />}
          </div>
          {isOpen && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Black Stone Interiorss" className="w-10 h-10 rounded-md object-cover shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
              <div>
                <h2 className={`text-base font-black leading-tight ${ t.isDark ? "bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent" : "text-white"}`}>
                  Black Stone <br /> Interiors
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ul className="space-y-0.5 flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
        {menuItems.map((item, index) => {
          if (item.type === "header") {
            return isOpen ? (
              <li key={index} className="px-3 pt-5 pb-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${ t.isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {item.name}
                </span>
              </li>
            ) : (
              <li key={index} className={`h-px my-3 mx-2 ${ t.isDark ? "bg-white/10" : "bg-slate-800"}`} />
            );
          }

          if (item.subItems) {
            const isExpanded = expandedMenus[item.name];
            const isChildActive = item.subItems.some(sub => location.pathname === sub.path);
            
            return (
              <li key={item.name} className="relative group/nav-item">
                <button
                  onClick={() => toggleMenu(item.name)}
                  title={!isOpen ? item.name : ""}
                  className={`w-full flex items-center justify-between px-2 py-2.5 rounded-xl transition-all duration-200 ${
                    t.isDark
                      ? "text-slate-300 hover:text-white hover:bg-white/5"
                      : "text-slate-200 hover:text-white hover:bg-white/10"
                  } ${isOpen ? "px-3" : "justify-center"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isOpen && (
                      <span className="whitespace-nowrap text-[15px]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: '0.01em' }}>
                        {item.name}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>
                
                {isOpen && isExpanded && (
                  <ul className="mt-1 mb-2 space-y-0.5">
                    {item.subItems.map(sub => {
                      const isActive = location.pathname === sub.path;
                      return (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`block pl-[44px] pr-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium ${
                              isActive
                                ? t.isDark
                                  ? "bg-white/10 text-[#D4AF37]"
                                  : "bg-white/20 text-[#D4AF37]"
                                : t.isDark
                                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                  : "text-slate-300 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <li key={item.path || item.name} className="relative group/nav-item">
              <Link
                to={item.path}
                title={!isOpen ? item.name : ""}
                className={`flex items-center ${
                  isOpen ? "justify-start gap-3 px-3" : "justify-center px-2"
                } py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? t.isDark
                      ? "bg-violet-600/80 text-white shadow-lg shadow-violet-900/40"
                      : "bg-white/10 text-[#D4AF37] shadow-lg shadow-black/20"
                    : t.isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && (
                  <span className="whitespace-nowrap text-[15px]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: '0.01em' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className={`p-4 flex flex-col items-center gap-2 border-t ${ t.isDark ? "border-white/10" : "border-slate-800"}`}>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${ t.isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-300 hover:text-white hover:bg-white/10"} ${isOpen ? "w-full gap-3" : "w-10 h-10"}`}
          title="Settings"
        >
          <Settings size={20} />
          {isOpen && <span className="font-semibold text-sm">Settings</span>}
        </button>
        {isOpen && (
          <div className="flex flex-col items-center mt-2 gap-1 opacity-80 hover:opacity-100 transition-opacity">
            <p className={`text-[10px] text-center font-bold uppercase tracking-widest ${ t.isDark ? "text-slate-500" : "text-slate-400"}`}>
              © 2026 Black Stone Interiors
            </p>
            <p className={`text-[8px] text-center font-bold uppercase tracking-[0.15em] ${ t.isDark ? "text-slate-600" : "text-slate-500"}`}>
              Developed by <span className="text-[#D4AF37] font-black tracking-widest">Galletrix Innovations</span>
            </p>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onLogout={onLogout} 
      />
    </nav>
  );
};

export default Sidebar;
