import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CRMPage = lazy(() => import("./pages/CRMPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));
const QuotationPage = lazy(() => import("./pages/QuotationPage"));
const ExpensePage = lazy(() => import("./pages/ExpensePage"));
const SitesPage = lazy(() => import("./pages/SitesPage"));
const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const SalaryPage = lazy(() => import("./pages/SalaryPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ReceiptPage = lazy(() => import("./pages/ReceiptPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
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
