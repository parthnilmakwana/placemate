import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, ShieldCheck, ArrowRight, 
  User, FileText, Globe, Briefcase, CheckCircle2 
} from 'lucide-react';

function DashboardHome() {
  const navigate = useNavigate();
  const setActiveTab = (tabId) => {
    if (tabId === 'home') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tabId}`);
    }
  };
  const { user } = useAuth();

  // 1. Calculate profile completion score and missing parts
  const profile = user?.profile || {};
  
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

  const getSuggestions = () => {
    const suggestions = [];
    if (!checklist.bio) suggestions.push({ text: 'Add professional bio summary', tab: 'profile' });
    if (!checklist.skills) suggestions.push({ text: 'List your core engineering skills', tab: 'profile' });
    if (!checklist.education) suggestions.push({ text: 'Fill in your education history', tab: 'profile' });
    if (!checklist.experience) suggestions.push({ text: 'Log professional work history', tab: 'profile' });
    if (!checklist.projects) suggestions.push({ text: 'Add personal coding projects', tab: 'profile' });
    return suggestions;
  };

  const suggestions = getSuggestions();



  // SVG parameters for radial progress ring
  const radius = 36;
  const strokeWidth = 6.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fade-in w-full text-slate-200 text-left">
      
      {/* Welcome & Command Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="bg-gradient-to-r from-brand-primary to-indigo-400 bg-clip-text text-transparent">{user?.name || 'Candidate'}</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Your centralized recruitment campaign metrics and system statuses.
          </p>
        </div>
        

      </div>

      {/* Main Status & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Placement Readiness (Completeness Gauge) */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl justify-between md:col-span-2">
          <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Placement Readiness Score</h3>
            <p className="text-[10px] text-slate-500">Completing your profile unlocks higher AI matching precision.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Radial SVG Progress Gauge */}
            <div className="relative flex items-center justify-center shrink-0 w-24 h-24 select-none">
              <svg className="w-24 h-24 transform -rotate-90">
                {/* Background Track ring */}
                <circle 
                  cx="48" 
                  cy="48" 
                  r={radius} 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth={strokeWidth} 
                  fill="transparent" 
                />
                {/* Foreground Colored ring */}
                <circle 
                  cx="48" 
                  cy="48" 
                  r={radius} 
                  stroke="var(--color-brand-primary)" 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-white font-heading">{readinessScore}%</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Complete</span>
              </div>
            </div>

            {/* Suggestions Checklist */}
            <div className="flex-grow flex flex-col gap-2.5 w-full">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Actions:</h4>
              {suggestions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {suggestions.slice(0, 2).map((s, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveTab(s.tab)}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/2 hover:bg-brand-primary/5 border border-white/5 text-left text-xs text-slate-300 transition-colors cursor-pointer group"
                    >
                      <span>{s.text}</span>
                      <ArrowRight size={12} className="text-slate-500 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 size={16} />
                  <span>Profile fully complete! Excellent readiness.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Public Portfolio Status Summary */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Public Portfolio</h3>
            <p className="text-[10px] text-slate-500">Your live developer webpage details.</p>
          </div>

          <div className="flex flex-col gap-2 my-auto py-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Visibility:</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                profile.isPublic !== false 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}>
                {profile.isPublic !== false ? 'Live / Public' : 'Hidden'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Theme Style:</span>
              <span className="font-bold text-white uppercase text-[10px] tracking-wide bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {profile.theme || 'minimal'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('portfolio')}
            className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/8 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
          >
            <span>Portfolio Settings</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Grid: Actions, Resume, Job Hunting & Health Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 3. Resume Builder Status */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">ATS Resume Suite</h3>
            <p className="text-[10px] text-slate-500">Generate structured job application sheets.</p>
          </div>

          <div className="flex flex-col gap-2 my-auto py-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Resume Status:</span>
              <span className="font-bold text-slate-300">
                {completedCount >= 3 ? 'Ready for Download' : 'Incomplete Profile'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Checks:</span>
              <span className="text-slate-400 font-medium">{completedCount} / {totalCount} sections</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('resume')}
            className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/8 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
          >
            <span>Open Resume Editor</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* 4. Job Hunting Pipeline Status */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Job Discovery</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[8px] font-black uppercase tracking-wider scale-90 select-none">Beta</span>
            </h3>
            <p className="text-[10px] text-slate-500">Automated job indexing statistics.</p>
          </div>

          <div className="flex flex-col gap-2 my-auto py-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Recommendations:</span>
              <span className="font-bold text-slate-300">Active</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Daily Batch:</span>
              <span className="text-brand-primary font-bold">5 Matches Loaded</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('jobs')}
            className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/8 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
          >
            <span>Browse Recommendations</span>
            <ArrowRight size={12} />
          </button>
        </div>


      </div>

      {/* Quick Action Grid */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2.5">
          Quick Actions Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-4 rounded-xl border border-white/5 bg-[#0c101d]/50 hover:bg-[#0c101d] text-left flex flex-col gap-2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <User size={18} className="text-brand-primary" />
            <span className="text-xs font-bold text-white">Edit Profile</span>
            <span className="text-[10px] text-slate-500">Update education and skill pills</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('portfolio')}
            className="p-4 rounded-xl border border-white/5 bg-[#0c101d]/50 hover:bg-[#0c101d] text-left flex flex-col gap-2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Globe size={18} className="text-brand-secondary" />
            <span className="text-xs font-bold text-white">Manage Portfolio</span>
            <span className="text-[10px] text-slate-500">Modify themes or copy subdomains</span>
          </button>

          <button 
            onClick={() => setActiveTab('resume')}
            className="p-4 rounded-xl border border-white/5 bg-[#0c101d]/50 hover:bg-[#0c101d] text-left flex flex-col gap-2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <FileText size={18} className="text-indigo-400" />
            <span className="text-xs font-bold text-white">Download Resume</span>
            <span className="text-[10px] text-slate-500">Compile ATS sheet PDFs</span>
          </button>

          <button 
            onClick={() => setActiveTab('jobs')}
            className="p-4 rounded-xl border border-white/5 bg-[#0c101d]/50 hover:bg-[#0c101d] text-left flex flex-col gap-2 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Briefcase size={18} className="text-emerald-400" />
            <span className="text-xs font-bold text-white">Browse Job DB</span>
            <span className="text-[10px] text-slate-500">Search scraped active positions</span>
          </button>
        </div>
      </section>


      
    </div>
  );
}

export default DashboardHome;
