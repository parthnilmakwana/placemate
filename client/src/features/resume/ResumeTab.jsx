import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, Download, CheckCircle, AlertCircle, 
  Sparkles, Settings, ArrowRight, BookOpen, Briefcase, Code, User, Compass
} from 'lucide-react';

function ResumeTab() {
  const { user } = useAuth();
  
  const [optimize, setOptimize] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate profile completeness and checklist
  const profile = user?.profile || {};
  
  const checklist = {
    bio: !!profile.bio,
    skills: profile.skills && profile.skills.length > 0,
    education: profile.education && profile.education.length > 0,
    experience: profile.experience && profile.experience.length > 0,
    projects: profile.projects && profile.projects.length > 0,
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const readinessScore = Math.round((completedCount / totalCount) * 100);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/resume/download?optimize=${optimize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      // Convert response stream to binary blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create hidden link to trigger native browser download save dialog
      const link = document.createElement('a');
      link.href = url;
      
      const safeName = user?.name ? user.name.replace(/\s+/g, '_') : 'My';
      link.download = `${safeName}_Resume.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up DOM objects
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Resume download failure:', err);
      setError('Could not download PDF resume. Please verify your profile fields and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-bold text-white">ATS-Optimized Resume</h2>
        <p className="text-sm text-slate-400">
          Generate and download a professional, single-page PDF resume optimized for Applicant Tracking Systems (ATS).
        </p>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg text-xs bg-brand-error/10 border border-brand-error/25 text-brand-error animate-shake">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 items-start">
        
        {/* Left Column: Stats, Checklist, Options */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Readiness Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="relative shrink-0 flex items-center justify-center">
              {/* Circular progress bar */}
              <svg className="w-20 h-20 transform -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  className="stroke-slate-800" 
                  strokeWidth="6" 
                  fill="transparent" 
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  className="stroke-brand-secondary transition-all duration-500" 
                  strokeWidth="6" 
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - readinessScore / 100)}
                />
              </svg>
              <span className="absolute text-sm font-bold text-white">{readinessScore}%</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">ATS Score Estimation</span>
              <h4 className="text-sm font-bold text-white">Resume Completeness</h4>
              <p className="text-xs text-slate-400 leading-normal">
                {readinessScore === 100 
                  ? 'Your profile is fully completed and ready for professional applications.'
                  : 'Fill in missing sections to maximize matching relevance for recruiters.'}
              </p>
            </div>
          </div>

          {/* Checklist Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={14} className="text-brand-secondary" />
              <span>Profile Integrity Checklist</span>
            </h3>

            <div className="flex flex-col gap-3.5 mt-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <User size={14} className="text-slate-500" />
                  <span className="text-slate-300">Personal Title & Bio</span>
                </div>
                {checklist.bio 
                  ? <span className="text-brand-secondary font-bold">Passed</span> 
                  : <span className="text-slate-500 italic">Empty</span>}
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <Code size={14} className="text-slate-500" />
                  <span className="text-slate-300">Core Expertise Skills</span>
                </div>
                {checklist.skills 
                  ? <span className="text-brand-secondary font-bold">Passed</span> 
                  : <span className="text-slate-500 italic">Empty</span>}
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <BookOpen size={14} className="text-slate-500" />
                  <span className="text-slate-300">Education Details</span>
                </div>
                {checklist.education 
                  ? <span className="text-brand-secondary font-bold">Passed</span> 
                  : <span className="text-slate-500 italic">Empty</span>}
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <Briefcase size={14} className="text-slate-500" />
                  <span className="text-slate-300">Work Experience Logs</span>
                </div>
                {checklist.experience 
                  ? <span className="text-brand-secondary font-bold">Passed</span> 
                  : <span className="text-amber-500/80 font-medium">Missing</span>}
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <Compass size={14} className="text-slate-500" />
                  <span className="text-slate-300">Portfolio Projects</span>
                </div>
                {checklist.projects 
                  ? <span className="text-brand-secondary font-bold">Passed</span> 
                  : <span className="text-slate-500 italic">Empty</span>}
              </div>
            </div>
          </div>

          {/* Phrasing Optimization Config */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-secondary" />
              <span>AI Formatting Engines</span>
            </h3>

            <div className="flex items-start justify-between gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-slate-300">ATS Verbs Enhancer</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Polishes bullet points to use strong action verbs (e.g. replaces "worked on" with "Architected and engineered").
                </p>
              </div>
              <button
                onClick={() => setOptimize(!optimize)}
                className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 outline-none
                  ${optimize ? 'bg-brand-secondary' : 'bg-slate-700'}`}
              >
                <div 
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                    ${optimize ? 'translate-x-4' : 'translate-x-0'}`}
                ></div>
              </button>
            </div>
          </div>

          {/* Trigger Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 disabled:opacity-75 active:scale-[0.98] mt-2"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download ATS Resume (PDF)</span>
              </>
            )}
          </button>

        </div>

        {/* Right Column: Visual Layout Mockup Outline */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl max-w-[480px] w-full bg-slate-950/20 pointer-events-none select-none">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visual Resume Preview Template</span>
            <FileText size={14} className="text-slate-500" />
          </div>

          {/* Styled resume structure mockup */}
          <div className="border border-white/5 rounded-xl p-4 bg-black/30 flex flex-col gap-4">
            
            {/* Header Block */}
            <div className="flex flex-col items-center gap-1.5 border-b border-white/5 pb-3">
              <div className="h-3 w-28 bg-slate-700 rounded"></div>
              <div className="h-2 w-36 bg-brand-secondary/40 rounded"></div>
              <div className="h-1.5 w-44 bg-slate-800 rounded"></div>
            </div>

            {/* Summary Block */}
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-20 bg-slate-700 rounded"></div>
              <div className="h-1.5 w-full bg-slate-800 rounded"></div>
              <div className="h-1.5 w-5/6 bg-slate-800 rounded"></div>
            </div>

            {/* Skills Block */}
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-16 bg-slate-700 rounded"></div>
              <div className="flex flex-wrap gap-1.5">
                <div className="h-4 w-12 bg-slate-800/80 rounded border border-white/5"></div>
                <div className="h-4 w-16 bg-slate-800/80 rounded border border-white/5"></div>
                <div className="h-4 w-14 bg-slate-800/80 rounded border border-white/5"></div>
                <div className="h-4 w-10 bg-slate-800/80 rounded border border-white/5"></div>
              </div>
            </div>

            {/* Experience Block */}
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-24 bg-slate-700 rounded"></div>
              <div className="flex justify-between">
                <div className="h-2 w-28 bg-slate-800 rounded"></div>
                <div className="h-2 w-16 bg-slate-800 rounded"></div>
              </div>
              <div className="h-1.5 w-11/12 bg-slate-900 rounded"></div>
              <div className="h-1.5 w-5/6 bg-slate-900 rounded"></div>
            </div>

            {/* Education Block */}
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-16 bg-slate-700 rounded"></div>
              <div className="flex justify-between">
                <div className="h-2 w-24 bg-slate-800 rounded"></div>
                <div className="h-2 w-12 bg-slate-800 rounded"></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default ResumeTab;
