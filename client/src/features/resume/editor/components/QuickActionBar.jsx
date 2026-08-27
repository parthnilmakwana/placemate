import React from 'react';
import { Wand2, Zap, CheckSquare, Target, Palette } from 'lucide-react';

const QuickActionBar = ({ onAIImprove, onVerbEnhancer, onATS, onTargetJob, onTemplate }) => {
  return (
    <div className="sticky bottom-16 xl:bottom-4 mx-auto max-w-[92vw] sm:max-w-fit z-20 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-brand-surface/95 border border-brand-border rounded-full shadow-lg backdrop-blur-md overflow-x-auto hide-scrollbar flex-nowrap shrink-0">
      
      <button 
        onClick={onAIImprove}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary transition-colors shrink-0"
        title="AI Improve Selection"
      >
        <Wand2 size={13} />
        <span className="inline">AI Improve</span>
      </button>

      <button 
        onClick={onVerbEnhancer}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full hover:bg-brand-surface-hover text-text-main transition-colors shrink-0"
        title="Enhance Action Verbs"
      >
        <Zap size={13} className="text-amber-500" />
        <span className="inline">Verb</span>
      </button>

      <div className="w-px h-3 sm:h-4 bg-brand-border mx-0.5 shrink-0"></div>

      <button 
        onClick={onATS}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full hover:bg-brand-surface-hover text-text-main transition-colors shrink-0"
        title="Check ATS Score"
      >
        <CheckSquare size={13} className="text-status-success" />
        <span className="hidden xs:inline">ATS</span>
      </button>

      <button 
        onClick={onTargetJob}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full hover:bg-brand-surface-hover text-text-main transition-colors shrink-0"
        title="Target Job Match"
      >
        <Target size={13} className="text-blue-500" />
        <span className="hidden xs:inline">Job Match</span>
      </button>

      <button 
        onClick={onTemplate}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-full hover:bg-brand-surface-hover text-text-main transition-colors shrink-0"
        title="Change Template"
      >
        <Palette size={13} className="text-purple-500" />
        <span className="hidden sm:inline">Template</span>
      </button>

    </div>
  );
};

export default QuickActionBar;
