import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Bell, 
  Shield, 
  Lock, 
  Palette, 
  Database 
} from 'lucide-react';

function SettingsLayout() {
  const navItems = [
    { id: 'account', label: 'Account', icon: User, path: '/dashboard/settings/account' },
    { id: 'job-preferences', label: 'Job Preferences', icon: Briefcase, path: '/dashboard/settings/job-preferences' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/settings/notifications' },
    { id: 'privacy', label: 'Privacy', icon: Shield, path: '/dashboard/settings/privacy' },
    { id: 'security', label: 'Security', icon: Lock, path: '/dashboard/settings/security' },
    { id: 'appearance', label: 'Appearance', icon: Palette, path: '/dashboard/settings/appearance' },
    { id: 'data', label: 'Data & Account', icon: Database, path: '/dashboard/settings/data' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl animate-fade-in text-left">
      {/* Secondary Settings Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1">
        <div className="mb-4 px-3">
          <h2 className="font-heading text-2xl font-bold text-text-main tracking-tight">Settings</h2>
          <p className="text-xs text-text-muted mt-1">Manage your account preferences</p>
        </div>
        
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left
                  ${isActive 
                    ? "bg-brand-surface border border-brand-border text-text-main font-semibold shadow-sm" 
                    : "text-text-secondary hover:text-text-main hover:bg-brand-surface/50 border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      className={`shrink-0 ${isActive ? "text-brand-primary" : "text-text-muted"}`}
                      strokeWidth={1.75}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Settings Tab Content Area */}
      <main className="flex-grow min-w-0">
        <div className="bg-brand-bg rounded-lg">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;
