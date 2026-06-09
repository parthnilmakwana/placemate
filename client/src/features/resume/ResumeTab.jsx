import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, AlertCircle, Sparkles, User, Code, BookOpen, Briefcase, Compass, Loader2, Wand2, Save } from 'lucide-react';
import ResumeCustomizer from './components/ResumeCustomizer';
import { api } from '../../services/api';

// Lazy load the PDF components because @react-pdf/renderer is heavy
const ResumePreview = lazy(() => import('./components/ResumePreview'));

function ResumeTab() {
  const { user, checkUserSession } = useAuth();
  
  const [optimize, setOptimize] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [draftProfile, setDraftProfile] = useState(null);
  const [settings, setSettings] = useState({
    themeId: 'modern',
    fontFamily: 'Inter',
    primaryColor: '#1e293b',
    secondaryColor: '#4f46e5',
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
    <div className="flex flex-col gap-6 md:gap-8 w-full animate-fade-in text-left">
      
      {/* Header bar */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4 shrink-0">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white">Resume Studio</h2>
        <p className="text-xs md:text-sm text-slate-400">
          Design and download pixel-perfect, ATS-optimized developer resumes. Live rendering outputs matches your selection immediately.
        </p>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start relative">
        
        {/* Left Column: Configuration Panels */}
        <div className="flex flex-col gap-6 w-full lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto pr-1.5 pb-20 custom-scrollbar">
          
          {/* Customizer */}
          <ResumeCustomizer settings={settings} setSettings={setSettings} />

          {/* AI Enhancement Section */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl bg-purple-500/2">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Wand2 size={13} className="text-purple-400" />
              <span>Gemini AI Writing Assistant</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Analyze your bio summaries and project logs. Gemini will rewrite your descriptions using high-impact professional phrasing.
            </p>
            
            <div className="flex flex-col gap-3 mt-1.5">
              <button
                onClick={async () => {
                  try {
                    setIsEnhancing(true);
                    const res = await api.post('/api/resume/enhance');
                    setDraftProfile(res.draft);
                  } catch (err) {
                    console.error('Enhancement failed:', err);
                    alert(err.message || 'Failed to enhance resume');
                  } finally {
                    setIsEnhancing(false);
                  }
                }}
                disabled={isEnhancing || !!draftProfile}
                className="w-full py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 text-purple-300 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEnhancing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {isEnhancing ? 'Thinking...' : (draftProfile ? 'AI Draft Applied' : 'Polish Resume Draft')}
              </button>

              {draftProfile && (
                <div className="flex gap-2.5 animate-slide-up">
                  <button
                    onClick={() => setDraftProfile(null)}
                    className="flex-1 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.put('/api/profile', { profile: draftProfile });
                        await checkUserSession();
                        setDraftProfile(null);
                      } catch (err) {
                        console.error('Save failed:', err);
                        alert('Failed to save profile');
                      }
                    }}
                    className="flex-grow inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-brand-primary/10"
                  >
                    <Save size={12} />
                    <span>Save Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phrasing Optimization Config */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
              <CheckCircle size={13} className="text-brand-secondary" />
              <span>ATS Optimizers</span>
            </h3>

            <div className="flex items-start justify-between gap-4 mt-1">
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-xs font-bold text-slate-200">Active Verb Enhancer</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Renders standard action verbs (e.g. replacing "worked on" with "designed and deployed") automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptimize(!optimize)}
                className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-250 ease-in-out shrink-0 outline-none
                  ${optimize ? 'bg-brand-secondary' : 'bg-slate-700'}`}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-250 ease-in-out
                    ${optimize ? 'translate-x-4' : 'translate-x-0'}`}
                ></div>
              </button>
            </div>
          </div>

          {/* Integrity Checklist Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
              <CheckCircle size={13} className="text-brand-primary" />
              <span>Document Integrity Checklist</span>
            </h3>

            <div className="flex flex-col gap-3 mt-1 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={13} />
                  <span>Personal Bio</span>
                </div>
                {checklist.bio 
                  ? <span className="text-emerald-400">PASSED</span> 
                  : <span className="text-slate-550 italic font-medium">EMPTY</span>}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <Code size={13} />
                  <span>Expertise Skills</span>
                </div>
                {checklist.skills 
                  ? <span className="text-emerald-400">PASSED</span> 
                  : <span className="text-slate-550 italic font-medium">EMPTY</span>}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={13} />
                  <span>Education Logs</span>
                </div>
                {checklist.education 
                  ? <span className="text-emerald-400">PASSED</span> 
                  : <span className="text-slate-550 italic font-medium">EMPTY</span>}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <Briefcase size={13} />
                  <span>Work Experiences</span>
                </div>
                {checklist.experience 
                  ? <span className="text-emerald-400">PASSED</span> 
                  : <span className="text-amber-500/80 font-bold">MISSING</span>}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <Compass size={13} />
                  <span>Project Portfolios</span>
                </div>
                {checklist.projects 
                  ? <span className="text-emerald-400">PASSED</span> 
                  : <span className="text-slate-550 italic font-medium">EMPTY</span>}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: PDF Preview Document Panel */}
        <div className="flex justify-center w-full lg:sticky lg:top-0 lg:h-[calc(100vh-10rem)] bg-slate-950/20 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
          <Suspense fallback={
            <div className="flex items-center justify-center w-full h-full min-h-[500px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                <span className="text-xs text-slate-500 font-bold tracking-widest uppercase animate-pulse">Loading Document Canvas...</span>
              </div>
            </div>
          }>
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
