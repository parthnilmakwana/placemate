import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useLocation } from "react-router-dom";
import {
  Copy,
  Check,
  Globe,
  EyeOff,
  AlertCircle,
  Save,
  ExternalLink,
  Sparkles,
  Wand2,
  Search,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import AIGeneratorModal from "./AIGeneratorModal";
import Button from "../../components/Button";

const PORTFOLIO_THEMES = [
  {
    id: "developer",
    name: "Modern Developer",
    description:
      "A tech-inspired, code-editor layout featuring monospace accents and clean structured markdown grids.",
    bestFor: ["Full Stack Engineers", "DevOps Specialists"],
    tags: ["Technical", "Code-Inspired"],
    layoutType: "Sandbox Grid",
    colorStyle: "Deep Neutral & Blue Accent",
    category: "Developer",
    featured: true,
  },
  {
    id: "professional",
    name: "Premium Professional",
    description:
      "A sleek, professional showcase with crisp dark borders and structured panels, built for senior engineering roles.",
    bestFor: ["Senior Engineers", "Tech Leads"],
    tags: ["Sleek", "ATS Friendly"],
    layoutType: "Double Column",
    colorStyle: "Dark Charcoal & Crisp Borders",
    category: "Professional",
    featured: true,
  },
  {
    id: "creative",
    name: "Creative Engineering",
    description:
      "An elegant, restrained layout with strong typographic emphasis and structured card layouts.",
    bestFor: ["UI/UX Engineers", "Frontend Architects"],
    tags: ["Editorial", "High Contrast"],
    layoutType: "Editorial Grid",
    colorStyle: "Dark Surface & Muted Accents",
    category: "Creative",
    featured: true,
  },
  {
    id: "minimal",
    name: "Minimalist Clean",
    description:
      "A distraction-free, content-first template maximizing clarity with simple line-separators and clean typography.",
    bestFor: ["Researchers", "Academics"],
    tags: ["Text-First", "Ultra-Minimal"],
    layoutType: "Linear List",
    colorStyle: "Dark Slate & Neutral Borders",
    category: "Minimal",
    featured: false,
  },
  {
    id: "startup",
    name: "Product Engineer",
    description:
      "A modern developer showcase highlighting metrics, core focus areas, and shipped product releases.",
    bestFor: ["Founders", "Indie Hackers", "Product Builders"],
    tags: ["Metric-Driven", "Modern"],
    layoutType: "Grid Cards",
    colorStyle: "Solid Contrast & Dark Surfaces",
    category: "Professional",
    featured: true,
  },
  {
    id: "corporate",
    name: "Corporate Executive",
    description:
      "A clean, structured design focusing on technical leadership history, executive summary, and key outcomes.",
    bestFor: ["Executives", "Directors", "Consultants"],
    tags: ["ATS Friendly", "Traditional"],
    layoutType: "Split Column",
    colorStyle: "Dark Slate & Muted Gray",
    category: "Professional",
    featured: false,
  },
  {
    id: "dark",
    name: "Dark Mode Hub",
    description:
      "A developer command center emphasizing technical architecture, core projects, and technical stack alignment.",
    bestFor: ["Software Engineers", "Frontend Devs"],
    tags: ["Dark Mode", "High Contrast"],
    layoutType: "Double Column",
    colorStyle: "Deep Neutral & Crisp Slate",
    category: "Developer",
    featured: true,
  },
  {
    id: "futuristic",
    name: "Systems Architect",
    description:
      "A dark technical showcase focusing on infrastructure, code blocks, and system design specifications.",
    bestFor: ["Systems Engineers", "Cloud Architects"],
    tags: ["Architecture", "Structured"],
    layoutType: "Modular Panels",
    colorStyle: "Charcoal & Steel Blue",
    category: "Developer",
    featured: false,
  },
  {
    id: "personal",
    name: "Personal Engineering Journal",
    description:
      "An editorial-styled layout focusing on career story, open source contributions, and engineering notes.",
    bestFor: ["Writers", "Storytellers", "Content Creators"],
    tags: ["Story-First", "Clean Layout"],
    layoutType: "Centered Stack",
    colorStyle: "Dark Neutral Palette",
    category: "Creative",
    featured: false,
  },
  {
    id: "student",
    name: "Early Career",
    description:
      "A structured, clean template focusing on academic milestones, internship achievements, and early engineering projects.",
    bestFor: ["Students", "Recent Graduates", "Interns"],
    tags: ["Academic", "Education-First"],
    layoutType: "Card Blocks",
    colorStyle: "Dark Neutral & Subtle Accent",
    category: "Minimal",
    featured: false,
  },
  {
    id: "pm",
    name: "Product Manager",
    description:
      "A data-informed, strategic design focusing on product vision, roadmap items, core focuses, and shipped business outcomes.",
    bestFor: ["Product Managers", "Product Owners", "Scrum Masters"],
    tags: ["Strategy", "Roadmaps"],
    layoutType: "Split Cards",
    colorStyle: "Slate & Violet Accents",
    category: "Professional",
    featured: true,
  },
  {
    id: "agency",
    name: "Agency Bold",
    description:
      "A stark, high-contrast black and yellow editorial template with heavy borders, big headings, and bold case studies.",
    bestFor: ["Freelancers", "Agencies", "Creative Studios"],
    tags: ["Brutalism", "High Contrast"],
    layoutType: "Bordered Sections",
    colorStyle: "Pitch Black & Gold Accent",
    category: "Creative",
    featured: true,
  },
  {
    id: "bold",
    name: "Legacy Bold",
    description:
      "A colorful dark layout with soft radial background gradients and rounded modular cards.",
    bestFor: ["General Professionals"],
    tags: ["Soft Gradients", "Clean Dark"],
    layoutType: "Radial Panel",
    colorStyle: "Violet/Teal & Dark Slate",
    category: "Minimal",
    featured: false,
  },
];

function PortfolioTab() {
  const { user, checkUserSession } = useAuth();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("minimal");
  const [isPublic, setIsPublic] = useState(true);

  // Gallery search & category states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);

  // AI & Draft State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [isApplyingDraft, setIsApplyingDraft] = useState(false);

  // Pre-fill local state with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setTheme(user.profile?.theme || "minimal");
      setIsPublic(user.profile?.isPublic !== false);
    }
  }, [user]);

  // Handle scroll to settings
  useEffect(() => {
    if (location.hash === "#portfolio-settings") {
      setTimeout(() => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
          mainContainer.scrollTo({
            top: mainContainer.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 300);
    }
  }, [location.hash]);

  const handleCopyLink = () => {
    const liveLink = `${window.location.origin}/portfolio/${username}`;
    navigator.clipboard.writeText(liveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/api/portfolio/settings", {
        username,
        theme,
        isPublic,
      });
      await checkUserSession();
      setMessage({
        type: "success",
        text: "Portfolio settings updated successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.message || "An error occurred while saving portfolio settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftGenerated = (data) => {
    setDraftData(data);
    setMessage({
      type: "success",
      text: "AI Portfolio draft generated successfully! Review below before applying.",
    });
  };

  const handleApplyDraft = async () => {
    if (!draftData?.draftId) return;
    setIsApplyingDraft(true);
    try {
      await api.post(`/api/portfolio/draft/${draftData.draftId}/apply`);
      await checkUserSession();
      setDraftData(null);
      setMessage({
        type: "success",
        text: "AI generated draft applied successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to apply draft.",
      });
    } finally {
      setIsApplyingDraft(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!draftData?.draftId) {
      setDraftData(null);
      return;
    }
    try {
      await api.delete(`/api/portfolio/draft/${draftData.draftId}`);
      setDraftData(null);
      setMessage({ type: "", text: "" });
    } catch (err) {
      console.error("Failed to discard draft", err);
      setDraftData(null);
    }
  };

  const livePortfolioUrl = `${window.location.origin}/portfolio/${username}`;

  // Format check for slug
  const isSlugValid = username.length >= 3 && /^[a-z0-9-]+$/.test(username);

  // Render small abstract miniature drawings of templates to act as "Illustrations"
  const renderThemeMiniatureMockup = (themeId) => {
    switch (themeId) {
      case "developer":
        return (
          <div className="w-full h-20 rounded bg-bg-sidebar border border-white/5 flex flex-col p-2 gap-1.5 font-mono text-[6px] text-text-disabled overflow-hidden leading-normal">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-brand-primary text-[7px] font-bold">
                const developer = &#123;
              </span>
              <span className="text-slate-650">v1.0.0</span>
            </div>
            <div className="flex flex-col gap-1 pl-1">
              <div>
                <span className="text-brand-primary">name:</span>{" "}
                <span className="text-status-success">
                  "{user?.name || "Candidate"}"
                </span>
                ,
              </div>
              <div>
                <span className="text-brand-primary">skills:</span>{" "}
                <span className="text-slate-350">[ "React", "Node" ]</span>,
              </div>
              <div>
                <span className="text-brand-primary">projects:</span>{" "}
                <span className="text-slate-350">
                  &#123; active: true &#125;
                </span>
              </div>
            </div>
            <span className="text-brand-primary text-[7px] font-bold">
              &#125;;
            </span>
          </div>
        );
      case "professional":
        return (
          <div className="w-full h-20 rounded bg-[#0b0e17] border border-white/5 flex p-2.5 gap-2.5 overflow-hidden">
            {/* Left Col Mock */}
            <div className="w-12 border-r border-white/5 flex flex-col gap-1.5 shrink-0">
              <div className="w-4 h-4 rounded-full bg-brand-primary/20 mx-auto"></div>
              <div className="h-1.5 w-full bg-white/5 rounded"></div>
              <div className="h-1 w-[80%] bg-white/3 rounded"></div>
            </div>
            {/* Right Col Mock */}
            <div className="flex-grow flex flex-col gap-2">
              <div className="h-2 w-16 bg-white/10 rounded"></div>
              <div className="flex flex-col gap-1">
                <div className="h-1 w-full bg-white/5 rounded"></div>
                <div className="h-1 w-[90%] bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "creative":
        return (
          <div className="w-full h-20 rounded bg-[#0b0f19] border border-white/5 p-2 flex flex-col gap-2 overflow-hidden relative">
            <div className="absolute top-[-2px] right-[-2px] w-6 h-6 rounded-full bg-amber-500/10"></div>
            <div className="h-2 w-16 bg-amber-400/20 rounded"></div>
            <div className="grid grid-cols-2 gap-1.5 mt-0.5">
              <div className="h-8 rounded bg-gradient-to-tr from-amber-500/10 to-amber-500/3 border border-amber-500/15"></div>
              <div className="h-8 rounded bg-gradient-to-tr from-violet-500/10 to-violet-500/3 border border-white/5"></div>
            </div>
          </div>
        );
      case "startup":
        return (
          <div className="w-full h-20 rounded bg-[#fafafc] border border-slate-200 flex flex-col p-2 gap-1.5 overflow-hidden text-slate-800">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
              <div className="w-8 h-1 bg-slate-200 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-5 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                <span className="text-[4px] font-black text-brand-primary leading-none">
                  12+
                </span>
                <span className="text-[2px] text-text-muted uppercase font-bold">
                  Shipped
                </span>
              </div>
              <div className="h-5 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                <span className="text-[4px] font-black text-brand-primary leading-none">
                  5+
                </span>
                <span className="text-[2px] text-text-muted uppercase font-bold">
                  Orgs
                </span>
              </div>
              <div className="h-5 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                <span className="text-[4px] font-black text-brand-primary leading-none">
                  8+
                </span>
                <span className="text-[2px] text-text-muted uppercase font-bold">
                  Tools
                </span>
              </div>
            </div>
            <div className="h-2 w-14 bg-slate-200 rounded"></div>
          </div>
        );
      case "corporate":
        return (
          <div className="w-full h-20 rounded bg-[#f8fafc] border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-[#1e293b] p-1.5 flex justify-between items-center">
              <div className="w-8 h-1.5 bg-white/20 rounded"></div>
              <div className="w-4 h-1 bg-white/20 rounded"></div>
            </div>
            <div className="flex-grow p-2 gap-2 flex">
              <div className="w-10 border-r border-slate-200 pr-1 flex flex-col gap-1">
                <div className="h-1 w-full bg-slate-300 rounded"></div>
                <div className="h-1 w-[80%] bg-slate-200 rounded"></div>
              </div>
              <div className="flex-grow flex flex-col gap-1.5">
                <div className="h-1.5 w-12 bg-slate-400 rounded"></div>
                <div className="h-1 w-full bg-slate-200 rounded"></div>
                <div className="h-1 w-[90%] bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "dark":
        return (
          <div className="w-full h-20 rounded bg-[#080d1a] border border-cyan-500/20 p-2.5 flex flex-col gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <div className="px-1 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-[4px] font-extrabold text-cyan-400 uppercase tracking-widest">
                Dev Hub
              </div>
              <div className="w-8 h-1 bg-slate-850 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="col-span-1 border border-border-strong bg-[#11192e] rounded p-1 flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-slate-650 rounded"></div>
                <div className="w-3 h-0.5 bg-cyan-400 rounded"></div>
              </div>
              <div className="col-span-2 border border-border-strong bg-[#11192e]/40 rounded p-1 flex flex-col gap-1">
                <div className="w-8 h-1 bg-slate-200 rounded"></div>
                <div className="w-full h-0.5 bg-surface-elevated rounded"></div>
              </div>
            </div>
          </div>
        );
      case "futuristic":
        return (
          <div className="w-full h-20 rounded bg-[#03000a] border border-purple-500/20 p-2.5 flex flex-col gap-2 items-center justify-center overflow-hidden relative">
            <div className="absolute top-1/4 left-1/4 w-10 h-10 bg-purple-600/10 rounded-full blur-[15px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-10 h-10 bg-pink-500/10 rounded-full blur-[15px] pointer-events-none"></div>
            <div className="border border-white/10 rounded-lg p-1.5 w-full bg-white/5 flex flex-col items-center gap-1.5 relative z-10">
              <div className="text-[4.5px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                <Terminal size={6} /> NEXTGEN
              </div>
              <div className="w-12 h-1 bg-white/20 rounded"></div>
              <div className="w-8 h-0.5 bg-purple-300/30 rounded"></div>
            </div>
          </div>
        );
      case "personal":
        return (
          <div className="w-full h-20 rounded bg-[#fdfcf7] border border-[#ebdcc4] p-2 flex flex-col gap-2 items-center text-center overflow-hidden">
            <div className="h-1.5 w-12 bg-[#2d2a26] rounded mt-1"></div>
            <div className="w-4 h-0.5 bg-amber-600"></div>
            <div className="w-full bg-[#f5f0e6] p-1 border border-[#ebdcc4] rounded flex flex-col gap-1 items-start">
              <div className="h-1 w-6 bg-[#855e34] rounded"></div>
              <div className="h-1 w-[90%] bg-slate-400 rounded"></div>
            </div>
          </div>
        );
      case "student":
        return (
          <div className="w-full h-20 rounded bg-[#f3faf6] border border-emerald-100 flex flex-col overflow-hidden">
            <div className="bg-emerald-600 p-2 flex flex-col items-center gap-1">
              <div className="h-1.5 w-10 bg-white/35 rounded"></div>
              <div className="h-1 w-16 bg-white/20 rounded-full"></div>
            </div>
            <div className="flex-grow p-1.5 flex gap-1.5">
              <div className="flex-1 bg-white border border-emerald-500/10 rounded p-1 flex flex-col gap-0.5">
                <div className="w-5 h-1 bg-emerald-700/20 rounded"></div>
                <div className="w-4 h-0.5 bg-emerald-600/30 rounded"></div>
              </div>
              <div className="flex-1 bg-white border border-emerald-500/10 rounded p-1 flex flex-col gap-0.5">
                <div className="w-5 h-1 bg-emerald-700/20 rounded"></div>
                <div className="w-4 h-0.5 bg-emerald-600/30 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "pm":
        return (
          <div className="w-full h-20 rounded bg-[#f1f5f9] border border-slate-200 p-2 flex flex-col gap-1.5 overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[4px] px-1 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded">
                PM Strategy
              </span>
              <div className="w-8 h-1 bg-slate-300 rounded"></div>
            </div>
            <div className="flex-grow flex gap-1.5">
              <div className="w-12 bg-white p-1 rounded border border-slate-100 flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-slate-400 rounded"></div>
                <div className="w-5 h-0.5 bg-slate-200 rounded"></div>
              </div>
              <div className="flex-grow bg-white p-1 rounded border border-slate-100 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <div className="w-6 h-0.5 bg-surface-primary rounded"></div>
                  <span className="text-[2.5px] bg-emerald-50 text-emerald-600 px-0.5 py-0.2 rounded font-bold">
                    SHIPPED
                  </span>
                </div>
                <div className="w-full h-0.5 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "agency":
        return (
          <div className="w-full h-20 rounded bg-black border border-white/10 p-2 flex flex-col gap-1.5 overflow-hidden text-text-main font-body">
            <span className="text-[4px] bg-[#fbbf24] text-black px-1 py-0.2 font-black tracking-widest w-fit">
              AGENCY
            </span>
            <div className="text-[7px] font-black uppercase tracking-tighter leading-none mt-0.5">
              PORTFOLIO
            </div>
            <div className="grid grid-cols-2 gap-1 mt-0.5">
              <div className="border border-white p-1 bg-zinc-950 flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-white rounded"></div>
                <div className="w-full h-0.2 bg-zinc-700"></div>
              </div>
              <div className="border border-white p-1 bg-zinc-950 flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-white rounded"></div>
                <div className="w-full h-0.2 bg-zinc-700"></div>
              </div>
            </div>
          </div>
        );
      case "bold":
        return (
          <div className="w-full h-20 rounded bg-gradient-to-tr from-indigo-950 via-purple-900 to-slate-950 border border-white/5 p-2 flex flex-col gap-2 overflow-hidden relative justify-center items-center">
            <div className="absolute top-0 left-0 w-8 h-8 bg-teal-500/10 rounded-full blur-[10px] pointer-events-none"></div>
            <div className="border border-white/10 rounded-xl p-1 bg-white/5 w-[80%] flex flex-col items-center gap-1.5 relative z-10">
              <div className="w-10 h-1 bg-white/30 rounded"></div>
              <div className="w-6 h-0.5 bg-teal-300/30 rounded font-semibold"></div>
            </div>
          </div>
        );
      case "minimal":
      default:
        return (
          <div className="w-full h-20 rounded bg-brand-surface border border-brand-border p-3 flex flex-col gap-2 items-center justify-center text-center overflow-hidden">
            <div className="h-2 w-14 bg-white/10 rounded"></div>
            <div className="h-px w-10 bg-white/10"></div>
            <div className="h-1.5 w-20 bg-white/5 rounded"></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border pb-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main tracking-tight">
            Public Portfolio
          </h2>
          <p className="text-sm text-text-muted">
            Publish a custom developer webpage and select industry design
            templates.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAIModalOpen(true)}
          variant="primary"
          className="shrink-0"
        >
          <Sparkles size={16} className="mr-2" />
          <span>AI Generator Studio</span>
        </Button>
      </div>

      {/* Draft Preview Notification */}
      {draftData && (
        <div className="structured-panel rounded-lg p-5 border border-brand-primary flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-main font-bold text-sm">
            <Wand2 size={16} />
            <h3>AI Generated Portfolio Draft Active</h3>
          </div>
          <p className="text-sm text-text-muted leading-normal">
            We generated a custom profile draft showcasing{" "}
            <strong className="text-text-main">{draftData.draft?.projects?.length || 0} projects</strong> under the{" "}
            <span className="font-bold text-text-main uppercase tracking-wider">
              {draftData.draft?.theme}
            </span>{" "}
            template. Select apply to update your public details permanently.
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              onClick={handleApplyDraft}
              disabled={isApplyingDraft}
              variant="primary"
            >
              Apply Draft Details
            </Button>
            <Button
              onClick={handleDiscardDraft}
              disabled={isApplyingDraft}
              variant="secondary"
            >
              Discard Draft
            </Button>
          </div>
        </div>
      )}

      {/* Main Settings Panel */}
      <div id="portfolio-settings" className="structured-panel rounded-lg p-6 md:p-8 flex flex-col gap-8 border border-brand-border">
        {message.text && (
          <div
            className={`flex items-start gap-3 p-4 rounded-md text-sm
            ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-status-success"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-8">
          {/* URL Slug Input */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-text-secondary uppercase tracking-widest"
            >
              Portfolio URL Slug Prefix
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-grow flex items-center bg-brand-bg border border-brand-border rounded-md overflow-hidden focus-within:border-white transition-all w-full">
                <span className="pl-4 pr-1 text-text-disabled text-sm font-medium select-none font-mono">
                  placemate.tech/portfolio/
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="your-url-name"
                  className="flex-grow pr-4 py-3 bg-transparent text-text-main placeholder-slate-600 text-sm font-mono focus:outline-none"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .replace(/[^a-zA-Z0-9-]/g, "")
                        .toLowerCase(),
                    )
                  }
                  disabled={isSaving}
                  required
                />
              </div>

              {/* Real-time Validation Badge */}
              <div className="shrink-0 w-full sm:w-auto">
                {username ? (
                  isSlugValid ? (
                    <div className="flex items-center justify-center gap-2 px-3 py-3 sm:py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-status-success text-xs font-bold">
                      <CheckCircle2 size={14} />
                      <span>Valid Format</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-3 py-3 sm:py-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                      <AlertCircle size={14} />
                      <span>Invalid Format</span>
                    </div>
                  )
                ) : null}
              </div>
            </div>
            <p className="text-[11px] text-text-disabled font-medium">
              Only lowercase letters, numbers, and hyphens (-) are accepted.
              Minimum 3 characters. Must be unique.
            </p>
          </div>

          {/* Theme Gallery Picker */}
          <div className="flex flex-col gap-6 pt-4 border-t border-brand-border">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                Portfolio Theme Template
              </label>
              <p className="text-sm text-text-muted">
                Choose a design scheme matching your career focus. Preview cards
                adapt to screen parameters.
              </p>
            </div>

            {/* Category selection filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search template tags..."
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg border border-brand-border rounded-md text-sm text-text-main placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  "all",
                  "Developer",
                  "Professional",
                  "Creative",
                  "Minimal",
                ].map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? "primary" : "secondary"}
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <style>{`
              .theme-grid-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .theme-grid-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .theme-grid-scrollbar::-webkit-scrollbar-thumb {
                background: #333;
                border-radius: 9999px;
              }
              .theme-grid-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}</style>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-[500px] overflow-y-auto pr-3 theme-grid-scrollbar shrink-0 auto-rows-max content-start">
              {PORTFOLIO_THEMES.filter((t) => {
                const matchesSearch =
                  t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  t.bestFor.some((b) =>
                    b.toLowerCase().includes(searchQuery.toLowerCase()),
                  ) ||
                  t.tags.some((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase()),
                  );
                const matchesCategory =
                  selectedCategory === "all" || t.category === selectedCategory;
                return matchesSearch && matchesCategory;
              }).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col gap-4 p-5 rounded-lg border cursor-pointer hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group
                    ${
                      theme === t.id
                        ? "border-white bg-brand-bg shadow-lg shadow-white/5"
                        : "border-brand-border bg-brand-surface hover:border-slate-600"
                    }`}
                >
                  {/* Miniature Illustration Mockup */}
                  {renderThemeMiniatureMockup(t.id)}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-brand-bg border border-brand-border text-text-secondary uppercase tracking-widest">
                        {t.category}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                        ${theme === t.id ? "border-white bg-white" : "border-brand-border"}`}
                      >
                        {theme === t.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                        )}
                      </div>
                    </div>
                    <h5 className={`font-heading text-sm font-bold mt-2 transition-colors ${theme === t.id ? "text-text-main" : "text-text-main group-hover:text-white"}`}>
                      {t.name}
                    </h5>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-text-disabled pt-3 border-t border-brand-border mt-auto font-medium">
                    <span>Layout: {t.layoutType}</span>
                    <span>Accents: {t.colorStyle.split(" ")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-brand-border mt-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isPublic ? 'bg-brand-primary' : 'bg-brand-surface border border-brand-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm font-bold text-text-main flex items-center gap-2">
                  {isPublic ? (
                    <>
                      <Globe size={16} className="text-status-success" /> Public
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} className="text-text-disabled" /> Private
                    </>
                  )}
                </span>
              </label>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                as="a"
                href={livePortfolioUrl}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                className="flex-1 sm:flex-none"
                title="View Live Portfolio"
              >
                <ExternalLink size={16} className="mr-2" />
                <span className="sm:hidden">View</span>
              </Button>
              <Button
                type="button"
                onClick={handleCopyLink}
                variant="secondary"
                className="flex-1 sm:flex-none"
                title="Copy Link"
              >
                {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                <span className="sm:hidden">
                  {copied ? "Copied" : "Copy"}
                </span>
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                variant="primary"
                className="flex-1 sm:flex-none"
              >
                <Save size={16} className="mr-2" />
                <span>{isSaving ? "Saving..." : "Save Settings"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onDraftGenerated={handleDraftGenerated}
      />
    </div>
  );
}

export default PortfolioTab;
