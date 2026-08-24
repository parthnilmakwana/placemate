import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Search,
  Layers,
  FileText,
  Globe,
  Bookmark,
  Sparkles,
  Settings,
  CreditCard,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.googleId
    ? (`${user?.settings?.firstName || ''} ${user?.settings?.lastName || ''}`.trim() || 'User')
    : (user?.settings?.firstName 
        ? `${user.settings.firstName} ${user.settings.lastName || ''}`.trim() 
        : (user?.name || 'User'));
        


  const getActiveTab = () => {
    const path = location.pathname;
    const search = location.search;
    if (path === "/dashboard" || path === "/dashboard/") return "home";
    const sub = path.split("/")[2] || "home";
    if (sub === "jobs") {
      if (search.includes("tab=tracker")) return "applications";
      return "jobs";
    }
    return sub;
  };
  const activeTab = getActiveTab();

  const primaryNavItems = [
    { id: "home", label: "Dashboard", icon: LayoutGrid },
    { id: "resume", label: "Resume Builder", icon: FileText },
    { id: "ats-checker", label: "ATS Checker", icon: Activity },
    { id: "portfolio", label: "Portfolio", icon: Globe },
    { id: "jobs", label: "Find Jobs", icon: Search, badge: "Beta" },
    { id: "applications", label: "Applications", icon: Layers, targetTab: "jobs", badge: "Beta" },
  ];

  const secondaryNavItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "pricing", label: "Plan & Billing", icon: CreditCard },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    logout();
  };

  const handleTabClick = (item) => {
    if (item.id === "home") {
      navigate("/dashboard");
    } else if (item.id === "applications") {
      navigate("/dashboard/jobs?tab=tracker");
    } else if (item.id === "jobs") {
      navigate("/dashboard/jobs?tab=discover");
    } else {
      const tabId = item.targetTab || item.id;
      navigate(`/dashboard/${tabId}`);
    }
    setMobileOpen(false);
  };

  const renderNavGroup = (items, title) => {
    return (
      <div className="flex flex-col gap-1">
        {title && (!sidebarCollapsed || mobileOpen) && (
          <span className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
            {title}
          </span>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left relative
                ${
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-semibold"
                    : "text-text-secondary hover:text-text-main hover:bg-surface-elevated border border-transparent"
                }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-brand-primary"></div>
              )}
              <Icon
                size={16}
                className={`shrink-0 ${isActive ? "text-brand-primary" : "text-text-muted"}`}
                strokeWidth={1.75}
              />
              {(!sidebarCollapsed || mobileOpen) && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-px rounded bg-brand-primary/15 text-brand-primary border border-brand-primary/20 text-[9px] font-bold uppercase tracking-wider shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 left-0 bg-bg-sidebar border-r border-border-subtle py-5 px-3 transition-all duration-200 z-30 select-none
          ${sidebarCollapsed ? "w-16" : "w-60"}`}
      >
        <div className="flex flex-col gap-6">
          {/* Header & Toggle */}
          <div className="flex items-center justify-between px-2 h-9">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="PlaceMate"
                  width="32"
                  height="32"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-heading text-base font-bold text-text-main tracking-tight">
                  PlaceMate
                </span>
              </div>
            ) : (
              <img
                src="/logo.png"
                alt="PlaceMate"
                width="32"
                height="32"
                className="w-8 h-8 object-contain mx-auto"
              />
            )}

            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              variant="secondary"
              size="sm"
              className="p-1! hidden md:inline-flex"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-5">
            {renderNavGroup(primaryNavItems, "Workspace")}
            {renderNavGroup(secondaryNavItems, "Account")}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="relative">
          {showProfileMenu && (
            <div className="absolute bottom-14 left-0 right-0 bg-surface-primary border border-border-strong rounded-md p-2 flex flex-col gap-1 animate-slide-up z-40">
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <span className="block text-[10px] font-semibold uppercase text-text-muted tracking-wider">
                  Plan Tier
                </span>
                <span className="text-xs font-semibold text-brand-primary block mt-0.5">
                  {user?.plan || "Free Candidate"}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="danger"
                size="sm"
                fullWidth
              >
                <LogOut size={14} className="mr-1.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}

          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center justify-between p-2 rounded-md border border-border-subtle hover:border-border-strong bg-surface-primary hover:bg-surface-elevated cursor-pointer transition-colors
              ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center font-bold text-brand-primary text-xs shrink-0">
                {getInitials(displayName)}
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-medium text-text-main truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-text-muted truncate">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <Settings
                size={14}
                className="text-text-muted hover:text-text-main transition-colors"
              />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 flex animate-fade-in">
          <div className="w-[85vw] max-w-70 bg-bg-sidebar h-full p-5 flex flex-col justify-between border-r border-border-subtle">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="PlaceMate"
                    width="32"
                    height="32"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-heading text-base font-bold text-text-main tracking-tight">
                    PlaceMate
                  </span>
                </div>
                <Button
                  onClick={() => setMobileOpen(false)}
                  variant="secondary"
                  size="sm"
                  className="p-1!"
                >
                  <X size={16} />
                </Button>
              </div>

              <nav className="flex flex-col gap-5">
                {renderNavGroup(primaryNavItems, "Workspace")}
                {renderNavGroup(secondaryNavItems, "Account")}
              </nav>
            </div>

            <div className="flex flex-col gap-3 border-t border-border-subtle pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center font-bold text-brand-primary text-xs shrink-0">
                  {getInitials(displayName)}
                </div>
                <div className="flex flex-col max-w-70">
                  <span className="text-xs font-medium text-text-main truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-text-muted truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="danger"
                fullWidth
              >
                <LogOut size={14} className="mr-1.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          <div
            className="grow h-full"
            onClick={() => setMobileOpen(false)}
          ></div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

