import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { lazy, Suspense } from "react";
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      if (
        error.message.includes("Failed to fetch dynamically imported module") ||
        error.name === "TypeError"
      ) {
        window.location.reload();
      }
      throw error;
    }
  });

const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const CRMPage = lazyWithRetry(() => import("./pages/CRMPage"));
const BillingPage = lazyWithRetry(() => import("./pages/BillingPage"));
const InvoicesPage = lazyWithRetry(() => import("./pages/InvoicesPage"));
const QuotationPage = lazyWithRetry(() => import("./pages/QuotationPage"));
const ExpensePage = lazyWithRetry(() => import("./pages/ExpensePage"));
const SitesPage = lazyWithRetry(() => import("./pages/SitesPage"));
const AccountsPage = lazyWithRetry(() => import("./pages/AccountsPage"));
const EmployeesPage = lazyWithRetry(() => import("./pages/EmployeesPage"));
const AttendancePage = lazyWithRetry(() => import("./pages/AttendancePage"));
const SalaryPage = lazyWithRetry(() => import("./pages/SalaryPage"));
const ReportsPage = lazyWithRetry(() => import("./pages/ReportsPage"));
const ReceiptPage = lazyWithRetry(() => import("./pages/ReceiptPage"));
const LoginPage = lazyWithRetry(() => import("./pages/LoginPage"));
import { DialogProvider } from "./contexts/DialogContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Removed sessionStorage persistence so it asks for login on refresh
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <DialogProvider>
        <Router>
          <div className="flex h-screen bg-[var(--bg)] dark:bg-slate-950 text-[var(--text-primary)] dark:text-white overflow-hidden transition-colors duration-300">
            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onLogout={handleLogout}
            />
            <main className="flex-1 overflow-y-auto relative flex flex-col items-center">
              {/* Mobile Header */}
              <div className="md:hidden flex items-center justify-between p-4 border-b border-black/5 dark:border-white/10 w-full bg-[var(--bg)] dark:bg-slate-950 z-30 sticky top-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                  <span className="font-black text-lg tracking-tight">Black Stone</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
              </div>
              <div className="w-full max-w-[1600px] 2xl:max-w-[1920px] mx-auto">
                <Suspense fallback={<div className="flex items-center justify-center h-full w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/crm" element={<CRMPage />} />
                    <Route path="/crm/*" element={<CRMPage />} />
                    <Route path="/quotations" element={<QuotationPage />} />

                    {/* Finance */}
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/expenses" element={<ExpensePage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/receipts" element={<ReceiptPage />} />

                    {/* Projects */}
                    <Route path="/sites" element={<SitesPage />} />
                    <Route path="/sites/*" element={<SitesPage />} />

                    {/* HR */}
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/salary" element={<SalaryPage />} />
                    <Route path="/reports" element={<ReportsPage />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </main>
          </div>
        </Router>
      </DialogProvider>
    </ThemeProvider>
  );
}

export default App;
