import React, { useState, Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import SkeletonLoader from "./components/SkeletonLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import { Menu } from "lucide-react";
// Lazy load feature components for performance code-splitting
const LandingPage = lazy(() => import("./features/landing/LandingPage"));
const Login = lazy(() => import("./features/auth/Login"));
const Register = lazy(() => import("./features/auth/Register"));
const OnboardingWizard = lazy(
  () => import("./features/onboarding/OnboardingWizard"),
);
const PortfolioPage = lazy(() => import("./features/portfolio/PortfolioPage"));

// Lazy load SEO and Tool components
const ProgrammaticSEOPage = lazy(
  () => import("./features/seo/ProgrammaticSEOPage"),
);
const ResumeBuilderLanding = lazy(
  () => import("./features/landing/seo-pages/ResumeBuilderLanding"),
);
const PortfolioBuilderLanding = lazy(
  () => import("./features/landing/seo-pages/PortfolioBuilderLanding"),
);

// Lazy load Dashboard tab views
const DashboardHome = lazy(() => import("./features/dashboard/DashboardHome"));
const ProfileTab = lazy(() => import("./features/profile/ProfileTab"));
const PortfolioTab = lazy(() => import("./features/portfolio/PortfolioTab"));
const ResumeWorkspace = lazy(() => import("./features/resume/ResumeWorkspace"));
const ResumeTab = lazy(() => import("./features/resume/ResumeTab"));
const ResumeEditorTab = lazy(() => import("./features/resume/tabs/ResumeEditorTab"));
const AtsChecker = lazy(() => import("./features/ats/AtsChecker"));
const JobDashboardTab = lazy(() => import("./features/jobs/JobDashboardTab"));
const PricingTab = lazy(() => import("./features/pricing/PricingTab"));
const FeedbackTab = lazy(() => import("./features/feedback/FeedbackTab"));

// Lazy load Settings modules
const SettingsLayout = lazy(() => import("./features/settings/SettingsLayout"));
const AccountTab = lazy(() => import("./features/settings/tabs/AccountTab"));
const JobPreferencesTab = lazy(() => import("./features/settings/tabs/JobPreferencesTab"));
const NotificationsTab = lazy(() => import("./features/settings/tabs/NotificationsTab"));
const PrivacyTab = lazy(() => import("./features/settings/tabs/PrivacyTab"));
const SecurityTab = lazy(() => import("./features/settings/tabs/SecurityTab"));
const AppearanceTab = lazy(() => import("./features/settings/tabs/AppearanceTab"));
const DataAccountTab = lazy(() => import("./features/settings/tabs/DataAccountTab"));

// Loader spinner shown when loading main JS files
function GlobalLoading() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center text-text-main p-8">
      <div className="custom-spinner mb-4"></div>
      <span className="font-heading text-xs text-text-muted font-semibold tracking-widest uppercase">
        Loading PlaceMate…
      </span>
    </div>
  );
}

// Master private layout wrapper containing left Sidebar and scrollable Content panel
function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Helper mapping current URL to tab ID for loading spinner and sidebar state logic
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") return "home";
    return path.split("/")[2] || "home";
  };
  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen flex bg-brand-bg relative overflow-hidden">
      {/* Persistent Left Sidebar Navigation */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area Container */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden z-10 w-full pb-[30px]">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between bg-brand-sidebar border-b border-brand-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="PlaceMate"
              width="40"
              height="40"
              className="w-10 h-10 object-contain"
            />
            <span className="font-heading text-lg font-black text-text-main tracking-tight">
              PlaceMate
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-lg focus:outline-none"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Scrollable Work Viewport */}
        <main className={`flex-grow custom-scrollbar flex justify-center text-left ${location.pathname.includes('/dashboard/resume/editor') ? 'p-0 overflow-hidden' : 'overflow-y-auto px-6 pt-8 md:px-10 md:pt-10'}`}>
          <div className={`w-full flex flex-col ${location.pathname.includes('/dashboard/resume/editor') ? 'max-w-full h-full pb-0' : 'max-w-5xl pb-[25px]'}`}>
            <Suspense
              fallback={
                <SkeletonLoader
                  type={activeTab === "jobs" ? "jobs" : "dashboard"}
                />
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<GlobalLoading />}>
              <Routes>
                {/* Public Marketing Portal */}
                <Route path="/" element={<LandingPage />} />

                {/* SEO Landing Pages & Tools */}
                <Route
                  path="/resume-builder"
                  element={<ResumeBuilderLanding />}
                />
                <Route
                  path="/portfolio-builder"
                  element={<PortfolioBuilderLanding />}
                />
                <Route
                  path="/roles/:role"
                  element={<ProgrammaticSEOPage type="role" />}
                />
                <Route
                  path="/tech/:tech"
                  element={<ProgrammaticSEOPage type="tech" />}
                />

                {/* Authentication routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected candidate onboarding wizard */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute requireOnboarded={false}>
                      <OnboardingWizard />
                    </ProtectedRoute>
                  }
                />

                {/* Private user dashboard command center */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireOnboarded={true}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<ProfileTab />} />
                  <Route path="portfolio" element={<PortfolioTab />} />
                  
                  {/* Resume Workspace with Nested Routes */}
                  <Route path="resume" element={<ResumeWorkspace />}>
                    <Route index element={<Navigate to="builder" replace />} />
                    <Route path="builder" element={<ResumeTab />} />
                    <Route path="editor" element={<ResumeEditorTab />} />
                    <Route path="ats-checker" element={<AtsChecker />} />
                  </Route>
                  {/* Redirect legacy ats-checker route */}
                  <Route path="ats-checker" element={<Navigate to="/dashboard/resume/ats-checker" replace />} />
                  
                  <Route path="jobs" element={<JobDashboardTab />} />
                  <Route path="pricing" element={<PricingTab />} />
                  <Route path="feedback" element={<FeedbackTab />} />
                  
                  {/* Settings Module with Nested Routes */}
                  <Route path="settings" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="account" replace />} />
                    <Route path="account" element={<AccountTab />} />
                    <Route path="job-preferences" element={<JobPreferencesTab />} />
                    <Route path="notifications" element={<NotificationsTab />} />
                    <Route path="privacy" element={<PrivacyTab />} />
                    <Route path="security" element={<SecurityTab />} />
                    <Route path="appearance" element={<AppearanceTab />} />
                    <Route path="data" element={<DataAccountTab />} />
                  </Route>
                </Route>

                {/* Public live portfolio web templates */}
                <Route
                  path="/portfolio/:username"
                  element={<PortfolioPage />}
                />

                {/* Unresolved path fallback redirects */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
