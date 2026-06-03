import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import OnboardingWizard from './features/onboarding/OnboardingWizard';
import PortfolioPage from './features/portfolio/PortfolioPage';
import PortfolioTab from './features/portfolio/PortfolioTab';
import ProfileTab from './features/profile/ProfileTab';
import ResumeTab from './features/resume/ResumeTab';
import { ShieldCheck, Server, AlertCircle, ArrowRight, Compass, Sparkles, Code, Cpu, LogOut, User, LayoutGrid, FileText } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('diagnostics'); // 'diagnostics' or 'portfolio'
  
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });
  const navigate = useNavigate();

  const checkBackendHealth = async () => {
    setHealthStatus({ loading: true, data: null, error: null });
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus({ loading: false, data, error: null });
    } catch (err) {
      console.error('Error fetching health status:', err);
      setHealthStatus({
        loading: false,
        data: null,
        error: 'Unable to connect to backend server. Make sure the server is running on port 5000.'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'diagnostics') {
      checkBackendHealth();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 md:p-8 overflow-hidden z-10">
      
      {/* Background ambient glowing shapes */}
      <div className="absolute top-[-100px] right-[-50px] w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[140px] pointer-events-none z-[-1] animate-glow-float"></div>
      <div className="absolute bottom-[50px] left-[-50px] w-[400px] h-[400px] rounded-full bg-brand-secondary/10 blur-[140px] pointer-events-none z-[-1] animate-glow-float-reverse"></div>

      {/* Header / Navbar */}
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="text-3xl select-none">💼</div>
          <span className="font-heading text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PlaceMate
          </span>
        </div>
        
        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300">
            <User size={12} className="text-brand-secondary" />
            <span>{user?.name} ({user?.email})</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-error/10 hover:bg-brand-error/20 border border-brand-error/25 text-brand-error cursor-pointer transition-colors duration-150 active:scale-[0.98]"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Nav Tabs Bar */}
      <nav className="flex gap-2 max-w-6xl mx-auto w-full mb-8">
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer
            ${activeTab === 'diagnostics' 
              ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'}`}
        >
          <Cpu size={14} />
          <span>System Diagnostics</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer
            ${activeTab === 'profile' 
              ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'}`}
        >
          <User size={14} />
          <span>Edit Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer
            ${activeTab === 'portfolio' 
              ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'}`}
        >
          <LayoutGrid size={14} />
          <span>Public Portfolio</span>
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer
            ${activeTab === 'resume' 
              ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'}`}
        >
          <FileText size={14} />
          <span>ATS Resume</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full flex items-center justify-center">
        
        {/* Render Tab: System Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-16 w-full">
            {/* Left column: Hero Welcome */}
            <section className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/25 text-violet-300 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <Cpu size={14} />
                <span>Secure Dev Dashboard Active</span>
              </div>
              
              <h1 className="font-heading text-5xl md:text-6xl font-extrabold leading-none tracking-tight mb-6">
                Welcome back, <br />
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  {user?.name || 'Developer'}
                </span>
              </h1>
              
              <p className="text-lg leading-relaxed text-slate-400 mb-8 max-w-lg">
                Your credentials have been successfully authenticated with Mongoose & JWT. You are currently on the <strong>{user?.plan || 'free'}</strong> tier.
              </p>

              <div className="flex gap-4 flex-wrap">
                <button 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/40 active:scale-[0.97]"
                  onClick={checkBackendHealth}
                >
                  <span>Refresh Backend API</span>
                  <ArrowRight size={16} />
                </button>
                
                <a 
                  href="file:///c:/placeMate/roadmap.md" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border border-white/10 bg-white/5 hover:bg-white/8 text-white transition-all duration-200 active:scale-[0.97]"
                  target="_blank" 
                  rel="noreferrer"
                >
                  <span>Explore Roadmap</span>
                </a>
              </div>
            </section>

            {/* Right column: System Diagnostics Panel */}
            <section className="w-full max-w-[480px]">
              <div className="glass-panel rounded-2xl p-8 shadow-2xl hover:border-brand-primary/20 transition-all duration-300">
                
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <Server size={18} className="text-brand-primary" />
                  <h3 className="font-heading text-lg font-semibold tracking-wide text-slate-200">System Integrations Check</h3>
                </div>
                
                {/* Health Check Block */}
                <div className="bg-black/20 rounded-xl p-5 mb-6 border border-white/5">
                  {healthStatus.loading ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="custom-spinner"></div>
                      <span className="text-sm">Pinging API server...</span>
                    </div>
                  ) : healthStatus.error ? (
                    <div className="flex items-start gap-4 text-brand-error animate-shake">
                      <AlertCircle size={20} className="mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-100">Connection Failed</h4>
                        <p className="text-xs text-brand-error mt-1">{healthStatus.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 text-brand-success">
                      <ShieldCheck size={24} className="shrink-0 animate-bounce-slow" />
                      <div className="w-full">
                        <h4 className="font-semibold text-sm text-slate-100">Express Server Connected</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          API responds: <code>"{healthStatus.data.message}"</code>
                        </p>
                        <div className="flex gap-2 items-center text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
                          <span><strong>Env:</strong> {healthStatus.data.environment}</span>
                          <span>•</span>
                          <span><strong>Time:</strong> {new Date(healthStatus.data.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features Info list */}
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4 items-start">
                    <Compass className="shrink-0 w-[18px] h-[18px] text-brand-secondary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Protected Client Router</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                        Dashboard wrapped by <code>&lt;ProtectedRoute&gt;</code> checking session tokens.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Code className="shrink-0 w-[18px] h-[18px] text-brand-secondary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Tailwind CSS v4 Configuration</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                        CSS-first theme compiling. Responsive layouts, hover transitions, and animations.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* Render Tab: Edit Profile */}
        {activeTab === 'profile' && (
          <div className="w-full flex justify-center">
            <ProfileTab />
          </div>
        )}

        {/* Render Tab: Portfolio management settings */}
        {activeTab === 'portfolio' && (
          <div className="w-full flex justify-center">
            <PortfolioTab />
          </div>
        )}

        {/* Render Tab: ATS Resume */}
        {activeTab === 'resume' && (
          <div className="w-full flex justify-center">
            <ResumeTab />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500 border-t border-white/10 pt-6">
        <p>© 2026 PlaceMate Team. Pair programmed with Antigravity AI.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requireOnboarded={false}>
                <OnboardingWizard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireOnboarded={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Public standalone portfolio pages */}
          <Route path="/portfolio/:username" element={<PortfolioPage />} />
          
          {/* Default fallback redirects */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
