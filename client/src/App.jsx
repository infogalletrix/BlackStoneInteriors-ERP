import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isAuthenticated") === "true"
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("isAuthenticated");
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
