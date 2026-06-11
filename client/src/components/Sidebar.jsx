import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, User, Globe, FileText, Briefcase, 
  MessageSquare, LogOut, Settings, ChevronLeft, ChevronRight, 
  Menu, X, Server, CreditCard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Sidebar({ sidebarCollapsed, setSidebarCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'home';
    return path.split('/')[2] || 'home';
  };
  const activeTab = getActiveTab();

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutGrid },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'portfolio', label: 'Public Portfolio', icon: Globe },
    { id: 'resume', label: 'ATS Resume', icon: FileText },
    { id: 'jobs', label: 'Job Hunting', icon: Briefcase, badge: 'Beta' },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare }
  ];

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    logout();
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'home') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tabId}`);
    }
    setMobileOpen(false); // Close mobile drawer on selection
  };

  const renderNavLinks = () => {
    return navItems.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => handleTabClick(item.id)}
          className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-left relative focus:outline-none focus:ring-1 focus:ring-brand-primary/50
            ${isActive 
              ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm shadow-brand-primary/5' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          title={sidebarCollapsed ? (item.badge ? `${item.label} (${item.badge})` : item.label) : undefined}
        >
          {isActive && (
            <div className="absolute left-0 w-1 h-5 rounded-r bg-brand-primary"></div>
          )}
          <Icon size={16} className={`shrink-0 ${isActive ? 'text-brand-primary' : 'text-slate-400'}`} />
          {(!sidebarCollapsed || mobileOpen) && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[8px] font-black uppercase tracking-wider scale-90 select-none">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </button>
      );
    });
  };

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside 
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 left-0 bg-[#0c101d] border-r border-white/5 py-6 px-4 transition-all duration-300 z-30 select-none
          ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col gap-8">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between px-2 h-10">
            {(!sidebarCollapsed) ? (
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="PlaceMate" width="40" height="40" className="w-10 h-10 object-contain" />
                <span className="font-heading text-lg font-black text-white tracking-tight">PlaceMate</span>
              </div>
            ) : (
              <img src="/logo.png" alt="PlaceMate" width="40" height="40" className="w-10 h-10 object-contain mx-auto" />
            )}
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer hidden md:inline-flex"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation Links Grid */}
          <nav className="flex flex-col gap-1.5">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Bottom User Card Widget */}
        <div className="relative">
          {/* Settings Context Popover */}
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 right-0 glass-panel rounded-xl p-2 border border-white/10 shadow-2xl flex flex-col gap-1 animate-slide-up z-40">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Account Tier</span>
                <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5 mt-0.5">
                  ✨ {user?.plan || 'Free Candidate'}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-brand-error hover:bg-brand-error/10 transition-colors font-bold cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* User Card */}
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer transition-all duration-200
              ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center font-bold text-brand-primary text-xs shrink-0">
                {getInitials(user?.name)}
              </div>
              {(!sidebarCollapsed) && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                </div>
              )}
            </div>
            
            {(!sidebarCollapsed) && (
              <Settings size={13} className="text-slate-500 hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (Slide out overlay) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex animate-fade-in">
          {/* Menu Drawer */}
          <div className="w-[85vw] max-w-[288px] bg-[#0c101d] h-full p-6 flex flex-col justify-between border-r border-white/5 animate-slide-in-left">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="PlaceMate" width="40" height="40" className="w-10 h-10 object-contain" />
                  <span className="font-heading text-lg font-black text-white tracking-tight">PlaceMate</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 hover:bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                {renderNavLinks()}
              </nav>
            </div>

            {/* Bottom Profile info */}
            <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center font-bold text-brand-primary text-xs shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-brand-error/10 hover:bg-brand-error/20 border border-brand-error/25 text-brand-error transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Click outside to close area */}
          <div className="flex-grow h-full" onClick={() => setMobileOpen(false)}></div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
