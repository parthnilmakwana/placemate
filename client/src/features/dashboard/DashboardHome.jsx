import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  User,
  FileText,
  Globe,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";

function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (tabId) => {
    if (tabId === "home") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard/${tabId}`);
    }
  };

  const profile = user?.profile || {};

  const checklist = [
    { key: "bio", label: "Professional Bio", complete: !!profile.bio, tab: "profile", hint: "Summary of engineering background" },
    { key: "skills", label: "Core Skills", complete: !!(profile.skills && profile.skills.length > 0), tab: "profile", hint: "Technical stack & domain expertise" },
    { key: "experience", label: "Work History", complete: !!(profile.experience && profile.experience.length > 0), tab: "profile", hint: "Roles, dates & achievements" },
    { key: "education", label: "Education", complete: !!(profile.education && profile.education.length > 0), tab: "profile", hint: "Degrees & certifications" },
    { key: "projects", label: "Featured Projects", complete: !!(profile.projects && profile.projects.length > 0), tab: "profile", hint: "Repositories & live demos" },
  ];

  const completedCount = checklist.filter((item) => item.complete).length;
  const readinessScore = Math.round((completedCount / checklist.length) * 100);
  const pendingActions = checklist.filter((item) => !item.complete);



  return (
    <div className="flex flex-col gap-8 animate-fade-in w-full text-left text-text-main">
      {/* 1. Header & Greeting Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-5 border-b border-border-subtle gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-main">
            Overview
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome back, <span className="text-text-main font-medium">
              {user?.googleId 
                ? (`${user?.settings?.firstName || ''} ${user?.settings?.lastName || ''}`.trim() || "Candidate")
                : (user?.settings?.firstName 
                    ? `${user.settings.firstName} ${user.settings.lastName || ''}`.trim() 
                    : (user?.name || "Candidate"))}
            </span>. Here is your placement campaign summary.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-status-success"></span>
          <span>Profile active & ready</span>
        </div>
      </div>

      {/* 2. Career Readiness Progress Bar & Status */}
      <div className="structured-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Profile Completeness
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {readinessScore}% Complete
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Completing your profile sections ensures accurate ATS resume generation and recruiter portfolio visibility.
          </p>
          <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden mt-1 border border-border-subtle">
            <div
              className="bg-brand-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${readinessScore}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-text-main font-semibold">{completedCount} of {checklist.length} Sections</span>
            <span className="text-text-muted">Verified data points</span>
          </div>
          <button
            onClick={() => handleNavigate("profile")}
            className="px-4 py-2 bg-surface-elevated hover:bg-border-subtle text-text-main border border-border-strong rounded-md font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Update Profile</span>
            <ArrowRight size={14} className="text-text-muted" />
          </button>
        </div>
      </div>

      {/* 3. Action Queue & Next Steps */}
      {pendingActions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Action Queue ({pendingActions.length} Pending)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingActions.map((action) => (
              <div
                key={action.key}
                className="structured-panel p-4 flex items-center justify-between hover:border-border-strong transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-elevated border border-border-subtle flex items-center justify-center text-status-warning shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text-main">
                      {action.label}
                    </h3>
                    <p className="text-[11px] text-text-muted">{action.hint}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNavigate(action.tab)}
                  className="px-3 py-1.5 bg-surface-elevated hover:bg-border-subtle text-text-main text-xs font-medium border border-border-subtle rounded transition-colors cursor-pointer shrink-0"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Split Section: Job Recommendations & Application Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Job Discovery Highlights */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Recommended Roles
            </h2>
            <button
              onClick={() => handleNavigate("jobs")}
              className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>View all jobs</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="structured-panel p-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted">
              <Briefcase size={18} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-text-main">Discover matching roles</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-sm">
                Complete your profile to receive tailored job recommendations based on your skills and experience.
              </p>
            </div>
            <button
              onClick={() => handleNavigate("jobs")}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-text-main rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 mt-1"
            >
              <span>Browse Jobs</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Col: Application Activity Summary */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Application Tracker
            </h2>
            <button
              onClick={() => navigate("/dashboard/jobs?tab=tracker")}
              className="text-xs text-brand-primary hover:underline font-medium"
            >
              Pipeline
            </button>
          </div>

          <div className="structured-panel p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-elevated border border-border-subtle rounded flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">Saved Roles</span>
                <span className="text-lg font-bold text-text-main">0</span>
              </div>
              <div className="p-3 bg-surface-elevated border border-border-subtle rounded flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">Applied</span>
                <span className="text-lg font-bold text-brand-primary">0</span>
              </div>
              <div className="p-3 bg-surface-elevated border border-border-subtle rounded flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">Interviewing</span>
                <span className="text-lg font-bold text-status-warning">0</span>
              </div>
              <div className="p-3 bg-surface-elevated border border-border-subtle rounded flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">Offers</span>
                <span className="text-lg font-bold text-status-success">0</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex flex-col gap-2">
              <p className="text-[11px] text-text-secondary">
                Track all job applications, response dates, and interview stages in one central workspace.
              </p>
              <button
                onClick={() => navigate("/dashboard/jobs?tab=tracker")}
                className="w-full py-2 bg-surface-elevated hover:bg-border-subtle text-text-main text-xs font-medium border border-border-subtle rounded transition-colors text-center cursor-pointer mt-1"
              >
                Open Application Kanban
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Document & Public Profile Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* ATS Resume Suite */}
        <div className="structured-panel p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-1 border-b border-border-subtle pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-brand-primary" />
                <span>ATS Resume Suite</span>
              </h3>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-status-success/10 text-status-success border border-status-success/20 font-semibold">
                PDF Ready
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Generate structured, ATS-parsed resume documents directly from your profile history.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Profile Data Sync:</span>
            <span className="text-text-main font-medium">{completedCount} of {checklist.length} fields filled</span>
          </div>

          <button
            onClick={() => handleNavigate("resume")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-text-main rounded font-medium text-xs transition-colors cursor-pointer"
          >
            <span>Open Resume Builder</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Developer Portfolio */}
        <div className="structured-panel p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-1 border-b border-border-subtle pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} className="text-brand-primary" />
                <span>Public Portfolio</span>
              </h3>
              <span
                className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold border ${
                  profile.isPublic !== false
                    ? "bg-status-success/10 text-status-success border-status-success/20"
                    : "bg-status-error/10 text-status-error border-status-error/20"
                }`}
              >
                {profile.isPublic !== false ? "Live Online" : "Draft Mode"}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Your personal developer page showcase with customizable themes and clean typography.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Active Template:</span>
            <span className="text-text-main font-medium uppercase">{profile.theme || "Minimal Standard"}</span>
          </div>

          <button
            onClick={() => navigate("/dashboard/portfolio#portfolio-settings")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-border-subtle text-text-main border border-border-strong rounded font-medium text-xs transition-colors cursor-pointer"
          >
            <span>Manage Portfolio Settings</span>
            <ArrowRight size={14} className="text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;

