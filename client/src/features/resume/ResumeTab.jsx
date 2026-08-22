import React, { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Sparkles,
  User,
  Code,
  BookOpen,
  Briefcase,
  Compass,
  Loader2,
  Wand2,
  Save,
  Activity,
  ArrowRight,
  Sliders,
  Eye,
} from "lucide-react";
import ResumeCustomizer from "./components/ResumeCustomizer";
import { api } from "../../services/api";

// Lazy load the PDF components because @react-pdf/renderer is heavy
const ResumePreview = lazy(() => import("./components/ResumePreview"));

function ResumeTab() {
  const { user, checkUserSession } = useAuth();

  const [mobileTab, setMobileTab] = useState("editor"); // 'editor' | 'preview'
  const [optimize, setOptimize] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [draftProfile, setDraftProfile] = useState(null);
  const [settings, setSettings] = useState({
    themeId: "modern",
    fontFamily: "Inter",
    primaryColor: "#1e293b",
    secondaryColor: "#4f46e5",
    fontSize: 10,
  });

  // Calculate profile completeness and checklist
  const profile = draftProfile || user?.profile || {};

  const checklist = {
    bio: !!profile.bio,
    skills: !!(profile.skills && profile.skills.length > 0),
    education: !!(profile.education && profile.education.length > 0),
    experience: !!(profile.experience && profile.experience.length > 0),
    projects: !!(profile.projects && profile.projects.length > 0),
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const readinessScore = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl animate-fade-in text-left">
      {/* Header bar */}
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4 shrink-0">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main tracking-tight">
          Resume Studio
        </h2>
        <p className="text-sm text-text-muted">
          Design and download pixel-perfect, ATS-optimized developer resumes.
          Live rendering matches your selection immediately.
        </p>
      </div>

      {/* Mobile Mode Switcher (< lg screens) */}
      <div className="flex lg:hidden rounded-lg bg-brand-surface p-1 border border-brand-border">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === "editor"
              ? "bg-brand-primary text-text-main shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Sliders size={14} />
          <span>Editor & Settings</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === "preview"
              ? "bg-brand-primary text-text-main shadow-sm"
              : "text-text-muted hover:text-text-main"
          }`}
        >
          <Eye size={14} />
          <span>Live PDF Preview</span>
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start relative">
        {/* Left Column: Configuration Panels */}
        <div className={`flex-col gap-6 w-full lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto pr-1.5 pb-20 custom-scrollbar ${
          mobileTab === "editor" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Customizer */}
          <ResumeCustomizer settings={settings} setSettings={setSettings} />

          {/* AI Enhancement Section */}
          <div className="structured-panel rounded-lg p-6 border border-brand-border flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2 border-b border-brand-border pb-3">
              <Sparkles size={14} className="text-text-muted" />
              <span>AI Writing Assistant</span>
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Analyze your bio summaries and project logs. The assistant will rewrite
              your descriptions using high-impact professional phrasing.
            </p>

            <div className="flex flex-col gap-3 mt-1.5">
              <button
                onClick={async () => {
                  try {
                    setIsEnhancing(true);
                    const res = await api.post("/api/resume/enhance");
                    setDraftProfile(res.draft);
                  } catch (err) {
                    console.error("Enhancement failed:", err);
                    alert(err.message || "Failed to enhance resume");
                  } finally {
                    setIsEnhancing(false);
                  }
                }}
                disabled={isEnhancing || !!draftProfile}
                className="w-full py-2.5 rounded-md bg-brand-primary hover:bg-brand-hover text-text-main text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEnhancing ? (
                  <div className="w-4 h-4 border-2 border-text-main/20 border-t-text-main rounded-full animate-spin"></div>
                ) : (
                  <Sparkles size={14} />
                )}
                {isEnhancing
                  ? "Processing..."
                  : draftProfile
                    ? "Draft Applied"
                    : "Polish Resume Draft"}
              </button>

              {draftProfile && (
                <div className="flex gap-2.5 animate-slide-up">
                  <button
                    onClick={() => setDraftProfile(null)}
                    className="flex-1 py-2.5 rounded-md bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-text-secondary text-sm font-semibold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.put("/api/profile", {
                          profile: draftProfile,
                        });
                        await checkUserSession();
                        setDraftProfile(null);
                      } catch (err) {
                        console.error("Save failed:", err);
                        alert("Failed to save profile");
                      }
                    }}
                    className="flex-grow inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-brand-primary hover:bg-brand-hover text-text-main text-sm font-semibold transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phrasing Optimization Config */}
          <div className="structured-panel rounded-lg p-6 border border-brand-border flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2 border-b border-brand-border pb-3">
              <CheckCircle size={14} className="text-text-muted" />
              <span>ATS Optimizers</span>
            </h3>

            <div className="flex items-start justify-between gap-4 mt-1">
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-sm font-semibold text-text-main">
                  Active Verb Enhancer
                </h4>
                <p className="text-xs text-text-muted leading-normal">
                  Replaces generic verbs with high-impact action verbs (e.g., changing "worked on" to "architected") automatically before export.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptimize(!optimize)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  optimize ? 'bg-brand-primary' : 'bg-brand-surface border border-brand-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    optimize ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Integrity Checklist Card */}
          <div className="structured-panel rounded-lg p-6 border border-brand-border flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2 border-b border-brand-border pb-3">
              <CheckCircle size={14} className="text-text-muted" />
              <span>Document Integrity</span>
            </h3>

            <div className="flex flex-col gap-3 mt-1 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-muted">
                  <User size={14} />
                  <span>Personal Bio</span>
                </div>
                {checklist.bio ? (
                  <span className="text-text-main font-semibold">Ready</span>
                ) : (
                  <span className="text-text-disabled font-semibold">
                    Empty
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-muted">
                  <Code size={14} />
                  <span>Skills Set</span>
                </div>
                {checklist.skills ? (
                  <span className="text-text-main font-semibold">Ready</span>
                ) : (
                  <span className="text-text-disabled font-semibold">
                    Empty
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-muted">
                  <BookOpen size={14} />
                  <span>Education</span>
                </div>
                {checklist.education ? (
                  <span className="text-text-main font-semibold">Ready</span>
                ) : (
                  <span className="text-text-disabled font-semibold">
                    Empty
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-muted">
                  <Briefcase size={14} />
                  <span>Experience</span>
                </div>
                {checklist.experience ? (
                  <span className="text-text-main font-semibold">Ready</span>
                ) : (
                  <span className="text-status-warning font-semibold">Required</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-text-muted">
                  <Compass size={14} />
                  <span>Projects</span>
                </div>
                {checklist.projects ? (
                  <span className="text-text-main font-semibold">Ready</span>
                ) : (
                  <span className="text-text-disabled font-semibold">
                    Empty
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PDF Preview Document Panel */}
        <div className={`justify-center w-full min-h-[400px] lg:min-h-[520px] h-[calc(100dvh-12rem)] lg:h-[calc(100vh-10rem)] lg:sticky lg:top-0 bg-brand-surface rounded-lg border border-brand-border overflow-hidden relative ${
          mobileTab === "preview" ? "flex" : "hidden lg:flex"
        }`}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center w-full h-full min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-text-disabled font-semibold tracking-widest uppercase">
                    Initializing renderer...
                  </span>
                </div>
              </div>
            }
          >
            <ResumePreview
              user={user}
              profile={profile}
              settings={settings}
              optimize={optimize}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ResumeTab;
