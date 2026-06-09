import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Copy, Check, Globe, EyeOff, AlertCircle, Save, 
  ExternalLink, Sparkles, Wand2, Search, CheckCircle2,
  Terminal
} from 'lucide-react';
import AIGeneratorModal from './AIGeneratorModal';

const PORTFOLIO_THEMES = [
  {
    id: 'developer',
    name: 'Modern Developer',
    description: 'A tech-inspired, code-editor layout featuring monospace accents, curly brace details, and clean markdown grids.',
    bestFor: ['Full Stack Engineers', 'DevOps Specialists'],
    tags: ['Technical', 'Code-Inspired'],
    layoutType: 'Sandbox Grid',
    colorStyle: 'Deep Slate & Indigo Accent',
    category: 'Developer',
    featured: true
  },
  {
    id: 'professional',
    name: 'Premium Professional',
    description: 'A sleek, premium and modern showcase with refined indigo gradients and clean borders, built for senior roles.',
    bestFor: ['Senior Engineers', 'Tech Leads'],
    tags: ['Sleek', 'ATS Friendly'],
    layoutType: 'Double Column',
    colorStyle: 'Charcoal & Violet Mono',
    category: 'Professional',
    featured: true
  },
  {
    id: 'creative',
    name: 'Creative Designer',
    description: 'An elegant, asymmetrical layout with bold typography, custom geometric card designs, and vibrant warm color balances.',
    bestFor: ['UI/UX Designers', 'Creative Writers'],
    tags: ['Asymmetric', 'Serif Font'],
    layoutType: 'Editorial Grid',
    colorStyle: 'Amber Glow Accent',
    category: 'Creative',
    featured: true
  },
  {
    id: 'minimal',
    name: 'Minimalist Clean',
    description: 'A distraction-free, content-first template maximizing whitespace, utilizing simple line-separators and elite typography.',
    bestFor: ['Researchers', 'Academics'],
    tags: ['Text-First', 'Ultra-Minimal'],
    layoutType: 'Linear List',
    colorStyle: 'Pure White & Soft Slate',
    category: 'Minimal',
    featured: false
  },
  {
    id: 'startup',
    name: 'Startup Founder',
    description: 'A modern, high-energy startup showcase with visual counter stats, highlight metrics, and product grids.',
    bestFor: ['Founders', 'Indie Hackers', 'Product Builders'],
    tags: ['Metric-Driven', 'Modern'],
    layoutType: 'Grid Cards',
    colorStyle: 'Blue Glow & White Contrast',
    category: 'Professional',
    featured: true
  },
  {
    id: 'corporate',
    name: 'Corporate Executive',
    description: 'A clean, structured corporate design focusing on leadership history, executive summary, and key assets.',
    bestFor: ['Executives', 'Directors', 'Consultants'],
    tags: ['ATS Friendly', 'Traditional'],
    layoutType: 'Split Column',
    colorStyle: 'Slate Gray & Dark Navy',
    category: 'Professional',
    featured: false
  },
  {
    id: 'dark',
    name: 'Dark Mode Tech',
    description: 'A sleek developer hub themed in deep blue and glowing cyan accents, emphasizing product shipping and core tech stacks.',
    bestFor: ['Software Engineers', 'Frontend Devs'],
    tags: ['Dark Mode', 'Cyan Glow'],
    layoutType: 'Double Column',
    colorStyle: 'Cyan & Deep Navy',
    category: 'Developer',
    featured: true
  },
  {
    id: 'futuristic',
    name: 'Futuristic Tech',
    description: 'A next-gen tech template with pink/purple radial gradients, blur effects, and terminal-inspired section elements.',
    bestFor: ['Web3 Engineers', 'AI Researchers'],
    tags: ['Experimental', 'Gradients'],
    layoutType: 'Modular Panels',
    colorStyle: 'Violet & Pink Blur',
    category: 'Developer',
    featured: false
  },
  {
    id: 'personal',
    name: 'Personal Brand',
    description: 'A warm, editor-styled personal journal design utilizing serif typography, focusing on your unique journey and writings.',
    bestFor: ['Writers', 'Storytellers', 'Content Creators'],
    tags: ['Story-First', 'Warm Accent'],
    layoutType: 'Centered Stack',
    colorStyle: 'Beige & Amber Accent',
    category: 'Creative',
    featured: false
  },
  {
    id: 'student',
    name: 'Student Portfolio',
    description: 'A friendly, clean template in fresh emerald tones focusing on educational milestones, achievements, and early academic projects.',
    bestFor: ['Students', 'Recent Graduates', 'Interns'],
    tags: ['Fresh', 'Education-First'],
    layoutType: 'Card Blocks',
    colorStyle: 'Emerald & Soft Green',
    category: 'Minimal',
    featured: false
  },
  {
    id: 'pm',
    name: 'Product Manager',
    description: 'A data-informed, strategic design focusing on product vision, roadmap items, core focuses, and shipped business outcomes.',
    bestFor: ['Product Managers', 'Product Owners', 'Scrum Masters'],
    tags: ['Strategy', 'Roadmaps'],
    layoutType: 'Split Cards',
    colorStyle: 'Slate & Violet Accents',
    category: 'Professional',
    featured: true
  },
  {
    id: 'agency',
    name: 'Agency Bold',
    description: 'A stark, high-contrast black and yellow editorial template with heavy borders, big headings, and bold case studies.',
    bestFor: ['Freelancers', 'Agencies', 'Creative Studios'],
    tags: ['Brutalism', 'High Contrast'],
    layoutType: 'Bordered Sections',
    colorStyle: 'Pitch Black & Gold Accent',
    category: 'Creative',
    featured: true
  },
  {
    id: 'bold',
    name: 'Legacy Bold',
    description: 'A colorful dark layout with soft radial background gradients and rounded modular cards.',
    bestFor: ['General Professionals'],
    tags: ['Soft Gradients', 'Clean Dark'],
    layoutType: 'Radial Panel',
    colorStyle: 'Violet/Teal & Dark Slate',
    category: 'Minimal',
    featured: false
  }
];

function PortfolioTab() {
  const { user, checkUserSession } = useAuth();
  
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('minimal');
  const [isPublic, setIsPublic] = useState(true);
  
  // Gallery search & category states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);

  // AI & Draft State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [isApplyingDraft, setIsApplyingDraft] = useState(false);

  // Pre-fill local state with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setTheme(user.profile?.theme || 'minimal');
      setIsPublic(user.profile?.isPublic !== false);
    }
  }, [user]);

  const handleCopyLink = () => {
    const liveLink = `${window.location.origin}/portfolio/${username}`;
    navigator.clipboard.writeText(liveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/api/portfolio/settings', {
        username,
        theme,
        isPublic
      });
      await checkUserSession();
      setMessage({ type: 'success', text: 'Portfolio settings updated successfully!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred while saving portfolio settings.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftGenerated = (data) => {
    setDraftData(data);
    setMessage({ type: 'success', text: 'AI Portfolio draft generated successfully! Review below before applying.' });
  };

  const handleApplyDraft = async () => {
    if (!draftData?.draftId) return;
    setIsApplyingDraft(true);
    try {
      await api.post(`/api/portfolio/draft/${draftData.draftId}/apply`);
      await checkUserSession();
      setDraftData(null);
      setMessage({ type: 'success', text: 'AI generated draft applied successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to apply draft.' });
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
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error('Failed to discard draft', err);
      setDraftData(null);
    }
  };

  const livePortfolioUrl = `${window.location.origin}/portfolio/${username}`;
  
  // Format check for slug
  const isSlugValid = username.length >= 3 && /^[a-z0-9-]+$/.test(username);

  // Render small abstract miniature drawings of templates to act as "Illustrations"
  const renderThemeMiniatureMockup = (themeId) => {
    switch (themeId) {
      case 'developer':
        return (
          <div className="w-full h-20 rounded bg-slate-900 border border-white/5 flex flex-col p-2 gap-1.5 font-mono text-[6px] text-slate-500 overflow-hidden leading-normal">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-brand-primary text-[7px] font-bold">const developer = &#123;</span>
              <span className="text-slate-650">v1.0.0</span>
            </div>
            <div className="flex flex-col gap-1 pl-1">
              <div><span className="text-indigo-400">name:</span> <span className="text-emerald-400">"{user?.name || 'Candidate'}"</span>,</div>
              <div><span className="text-indigo-400">skills:</span> <span className="text-slate-350">[ "React", "Node" ]</span>,</div>
              <div><span className="text-indigo-400">projects:</span> <span className="text-slate-350">&#123; active: true &#125;</span></div>
            </div>
            <span className="text-brand-primary text-[7px] font-bold">&#125;;</span>
          </div>
        );
      case 'professional':
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
      case 'creative':
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
      case 'startup':
        return (
          <div className="w-full h-20 rounded bg-[#fafafc] border border-slate-200 flex flex-col p-2 gap-1.5 overflow-hidden text-slate-800">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <div className="w-8 h-1 bg-slate-200 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-5 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                <span className="text-[4px] font-black text-blue-600 leading-none">12+</span>
                <span className="text-[2px] text-slate-400 uppercase font-bold">Shipped</span>
              </div>
              <div className="h-5 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                <span className="text-[4px] font-black text-blue-600 leading-none">5+</span>
                <span className="text-[2px] text-slate-400 uppercase font-bold">Orgs</span>
              </div>
              <div className="h-5 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                <span className="text-[4px] font-black text-blue-600 leading-none">8+</span>
                <span className="text-[2px] text-slate-400 uppercase font-bold">Tools</span>
              </div>
            </div>
            <div className="h-2 w-14 bg-slate-200 rounded"></div>
          </div>
        );
      case 'corporate':
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
      case 'dark':
        return (
          <div className="w-full h-20 rounded bg-[#080d1a] border border-cyan-500/20 p-2.5 flex flex-col gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <div className="px-1 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-[4px] font-extrabold text-cyan-400 uppercase tracking-widest">Dev Hub</div>
              <div className="w-8 h-1 bg-slate-850 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="col-span-1 border border-slate-800 bg-[#11192e] rounded p-1 flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-slate-650 rounded"></div>
                <div className="w-3 h-0.5 bg-cyan-400 rounded"></div>
              </div>
              <div className="col-span-2 border border-slate-800 bg-[#11192e]/40 rounded p-1 flex flex-col gap-1">
                <div className="w-8 h-1 bg-slate-200 rounded"></div>
                <div className="w-full h-0.5 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        );
      case 'futuristic':
        return (
          <div className="w-full h-20 rounded bg-[#03000a] border border-purple-500/20 p-2.5 flex flex-col gap-2 items-center justify-center overflow-hidden relative">
            <div className="absolute top-1/4 left-1/4 w-10 h-10 bg-purple-600/10 rounded-full blur-[15px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-10 h-10 bg-pink-500/10 rounded-full blur-[15px] pointer-events-none"></div>
            <div className="border border-white/10 rounded-lg p-1.5 w-full bg-white/5 flex flex-col items-center gap-1.5 relative z-10">
              <div className="text-[4.5px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-0.5"><Terminal size={6}/> NEXTGEN</div>
              <div className="w-12 h-1 bg-white/20 rounded"></div>
              <div className="w-8 h-0.5 bg-purple-300/30 rounded"></div>
            </div>
          </div>
        );
      case 'personal':
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
      case 'student':
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
      case 'pm':
        return (
          <div className="w-full h-20 rounded bg-[#f1f5f9] border border-slate-200 p-2 flex flex-col gap-1.5 overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[4px] px-1 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded">PM Strategy</span>
              <div className="w-8 h-1 bg-slate-300 rounded"></div>
            </div>
            <div className="flex-grow flex gap-1.5">
              <div className="w-12 bg-white p-1 rounded border border-slate-100 flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-slate-400 rounded"></div>
                <div className="w-5 h-0.5 bg-slate-200 rounded"></div>
              </div>
              <div className="flex-grow bg-white p-1 rounded border border-slate-100 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <div className="w-6 h-0.5 bg-slate-800 rounded"></div>
                  <span className="text-[2.5px] bg-emerald-50 text-emerald-600 px-0.5 py-0.2 rounded font-bold">SHIPPED</span>
                </div>
                <div className="w-full h-0.5 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        );
      case 'agency':
        return (
          <div className="w-full h-20 rounded bg-black border border-white/10 p-2 flex flex-col gap-1.5 overflow-hidden text-white font-sans">
            <span className="text-[4px] bg-[#fbbf24] text-black px-1 py-0.2 font-black tracking-widest w-fit">AGENCY</span>
            <div className="text-[7px] font-black uppercase tracking-tighter leading-none mt-0.5">PORTFOLIO</div>
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
      case 'bold':
        return (
          <div className="w-full h-20 rounded bg-gradient-to-tr from-indigo-950 via-purple-900 to-slate-950 border border-white/5 p-2 flex flex-col gap-2 overflow-hidden relative justify-center items-center">
            <div className="absolute top-0 left-0 w-8 h-8 bg-teal-500/10 rounded-full blur-[10px] pointer-events-none"></div>
            <div className="border border-white/10 rounded-xl p-1 bg-white/5 w-[80%] flex flex-col items-center gap-1.5 relative z-10">
              <div className="w-10 h-1 bg-white/30 rounded"></div>
              <div className="w-6 h-0.5 bg-teal-300/30 rounded font-semibold"></div>
            </div>
          </div>
        );
      case 'minimal':
      default:
        return (
          <div className="w-full h-20 rounded bg-slate-900/40 border border-white/5 p-3 flex flex-col gap-2 items-center justify-center text-center overflow-hidden">
            <div className="h-2 w-14 bg-white/10 rounded"></div>
            <div className="h-px w-10 bg-white/10"></div>
            <div className="h-1.5 w-20 bg-white/5 rounded"></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-3xl animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white">Public Portfolio</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Publish a custom developer webpage and select industry design templates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAIModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/15 transition-all duration-200 active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <Sparkles size={14} />
          <span>AI Generator Studio</span>
        </button>
      </div>

      {/* Draft Preview Notification */}
      {draftData && (
        <div className="glass-panel rounded-2xl p-5 border border-brand-primary/30 flex flex-col gap-3 shadow-xl bg-brand-primary/5 animate-slide-up">
          <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
            <Wand2 size={16} />
            <h3>AI Generated Portfolio Draft Active</h3>
          </div>
          <p className="text-xs text-slate-300 leading-normal">
            We generated a custom profile draft showcasing {draftData.draft?.projects?.length || 0} projects under the <span className="font-bold text-white uppercase">{draftData.draft?.theme}</span> template. Select apply to update your public details permanently.
          </p>
          <div className="flex gap-2.5 mt-1">
            <button
              onClick={handleApplyDraft}
              disabled={isApplyingDraft}
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Apply Draft Details
            </button>
            <button
              onClick={handleDiscardDraft}
              disabled={isApplyingDraft}
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-black/30 border border-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      {/* Main Settings Panel */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 bg-slate-950/10">
        
        {message.text && (
          <div className={`flex items-start gap-3 p-3.5 rounded-xl text-xs animate-shake
            ${message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
              : 'bg-brand-error/10 border border-brand-error/25 text-brand-error'}`}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          
          {/* URL Slug Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Portfolio URL Slug Prefix
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex-grow flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all duration-200">
                <span className="pl-4 pr-1 text-slate-600 text-xs font-semibold select-none font-mono">
                  placemate.tech/portfolio/
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="your-url-name"
                  className="flex-grow pr-4 py-3 bg-transparent text-white placeholder-slate-650 text-sm focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                  disabled={isSaving}
                  required
                />
              </div>

              {/* Real-time Validation Badge */}
              <div className="shrink-0">
                {username ? (
                  isSlugValid ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 size={12} />
                      <span>Valid Format</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold">
                      <AlertCircle size={12} />
                      <span>Invalid Format</span>
                    </div>
                  )
                ) : null}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Only lowercase letters, numbers, and hyphens (-) are accepted. Minimum 3 characters. Must be unique.
            </p>
          </div>

          {/* Theme Gallery Picker */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Portfolio Theme Template
              </label>
              <p className="text-[11px] text-slate-500">
                Choose a design scheme matching your career focus. Preview cards adapt to screen parameters.
              </p>
            </div>

            {/* Category selection filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search template tags..."
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'Developer', 'Professional', 'Creative', 'Minimal'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide border transition-all duration-150 cursor-pointer
                      ${selectedCategory === cat
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                        : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-350 hover:bg-white/8'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <style>{`
              .theme-grid-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .theme-grid-scrollbar::-webkit-scrollbar-track {
                background: rgba(15, 23, 42, 0.4);
                border-radius: 9999px;
              }
              .theme-grid-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.5);
                border-radius: 9999px;
                border: 2px solid rgba(15, 23, 42, 0.4);
                background-clip: padding-box;
              }
              .theme-grid-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.75);
              }
            `}</style>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[480px] overflow-y-auto pr-2 theme-grid-scrollbar shrink-0 auto-rows-max content-start">
              {PORTFOLIO_THEMES.filter(t => {
                const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.bestFor.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
                return matchesSearch && matchesCategory;
              }).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border cursor-pointer hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group
                    ${theme === t.id
                      ? 'border-brand-primary bg-brand-primary/5 shadow-md shadow-brand-primary/5'
                      : 'border-white/5 bg-black/30 hover:border-white/10'}`}
                >
                  {/* Miniature Illustration Mockup */}
                  {renderThemeMiniatureMockup(t.id)}

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-450 uppercase tracking-widest">{t.category}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors
                        ${theme === t.id ? 'border-brand-primary bg-brand-primary' : 'border-white/15'}`}
                      >
                        {theme === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                    <h5 className="font-heading text-xs font-extrabold text-white mt-1 group-hover:text-brand-primary transition-colors">{t.name}</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">{t.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] text-slate-500 pt-2 border-t border-white/5 mt-1">
                    <span>Layout: {t.layoutType}</span>
                    <span>Accents: {t.colorStyle.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility Toggle Switch */}
          <div className="flex items-center justify-between p-4.5 rounded-2xl bg-black/20 border border-white/5 shadow-sm">
            <div className="flex items-center gap-3.5">
              {isPublic ? (
                <Globe className="text-brand-primary shrink-0" size={18} />
              ) : (
                <EyeOff className="text-brand-error shrink-0" size={18} />
              )}
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-200">Portfolio Live Status</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                  {isPublic 
                    ? 'Your public portfolio page is active and indexable by recruiters.' 
                    : 'Your portfolio page returns a clean 404 block page.'}
                </p>
              </div>
            </div>
            
            {/* Custom Toggle Switch Slider */}
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-10 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors duration-250 ease-in-out outline-none shrink-0
                ${isPublic ? 'bg-brand-primary' : 'bg-slate-700'}`}
            >
              <div 
                className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                  ${isPublic ? 'translate-x-4.5' : 'translate-x-0'}`}
              ></div>
            </button>
          </div>

          {/* Save Settings Submit Button */}
          <button
            type="submit"
            disabled={isSaving || !isSlugValid}
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed self-start active:scale-[0.98] mt-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/45"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Portfolio Settings</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* Copy Link / Action Widget */}
      {isPublic && isSlugValid && (
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl bg-slate-900/10">
          <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
            <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest">Live Portfolio Address Active</span>
            <span className="text-xs font-bold text-white truncate max-w-sm font-mono">{livePortfolioUrl}</span>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/8 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-brand-secondary" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <a
              href={`/portfolio/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-secondary/10 hover:bg-brand-secondary/20 border border-brand-secondary/20 text-brand-secondary text-decoration-none transition-colors cursor-pointer"
            >
              <ExternalLink size={12} />
              <span>Visit Link</span>
            </a>
          </div>
        </div>
      )}

      <AIGeneratorModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onDraftGenerated={handleDraftGenerated}
      />
    </div>
  );
}

export default PortfolioTab;
