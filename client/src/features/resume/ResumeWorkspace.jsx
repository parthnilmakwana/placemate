import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FileText, Wand2, Activity } from 'lucide-react';

function ResumeWorkspace() {
  const location = useLocation();

  const navItems = [
    { id: 'builder', label: 'Builder', icon: FileText, path: '/dashboard/resume/builder' },
    { id: 'editor', label: 'Editor', icon: Wand2, path: '/dashboard/resume/editor' },
    { id: 'ats-checker', label: 'ATS Checker', icon: Activity, path: '/dashboard/resume/ats-checker' },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl animate-fade-in text-left">
      {/* Workspace Header - Centered Layout */}
      <div className="flex flex-col items-center justify-center text-center gap-5 border-b border-brand-border pb-6 shrink-0 w-full">
        <div className="flex flex-col items-center gap-1.5 max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main tracking-tight">
            Resume Workspace
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Build, edit, and optimize your ATS-ready developer resume in one place.
          </p>
        </div>

        {/* Secondary Navigation (Tabs) - Top & Centered / Segmented on Mobile */}
        <nav 
          aria-label="Resume Workspace Navigation"
          className="flex w-full sm:w-auto bg-brand-surface p-1 sm:p-1.5 rounded-xl border border-brand-border overflow-x-auto hide-scrollbar justify-start md:justify-center max-w-full shadow-inner"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.path);
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-medium tracking-tight transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap min-w-0 sm:min-w-28 select-none
                    ${isActive 
                      ? "bg-brand-primary text-text-main font-semibold shadow-md shadow-brand-primary/20 scale-[1.02]" 
                      : "text-text-secondary hover:text-text-main hover:bg-brand-surface-hover"
                    }`
                  }
                >
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors duration-300 w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-text-main" : "text-text-muted"}`}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Content Area with smooth fade-in transition on route switch */}
      <main key={location.pathname} className="w-full flex-1 animate-fade-in transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
}

export default ResumeWorkspace;

