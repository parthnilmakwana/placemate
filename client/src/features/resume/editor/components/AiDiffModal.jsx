import React from 'react';
import { Wand2, Check, X, RefreshCw, Zap, Scissors, Target, ShieldCheck } from 'lucide-react';

const AiDiffModal = ({ isOpen, onClose, originalText, suggestedText, mode, onAccept, onRegenerate, isLoading }) => {
  if (!isOpen) return null;

  const modeBadges = {
    professional: { label: 'AI Improve', icon: Wand2, color: 'text-purple-500 bg-purple-500/10' },
    action_verbs: { label: 'Verb Enhancer', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
    concise: { label: 'Make Concise', icon: Scissors, color: 'text-blue-500 bg-blue-500/10' },
    impact: { label: 'Improve Impact', icon: Target, color: 'text-emerald-500 bg-emerald-500/10' },
    grammar: { label: 'Fix Grammar', icon: Check, color: 'text-indigo-500 bg-indigo-500/10' },
    ats_optimize: { label: 'ATS Optimize', icon: ShieldCheck, color: 'text-teal-500 bg-teal-500/10' }
  };

  const currentBadge = modeBadges[mode] || modeBadges.professional;
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-md ${currentBadge.color}`}>
              <BadgeIcon size={16} />
            </span>
            <h3 className="font-heading font-semibold text-text-main text-sm">
              {currentBadge.label} Suggestion
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-main p-1 rounded-md hover:bg-brand-surface-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content - Original vs Suggested */}
        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Original */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Original Text</span>
            <div className="p-3 bg-brand-bg/70 border border-brand-border/60 rounded-lg text-sm text-text-secondary line-through opacity-80">
              {originalText}
            </div>
          </div>

          {/* Suggested AI Output */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">Suggested Enhancement</span>
              {isLoading && (
                <span className="text-xs text-brand-primary flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" /> Generating...
                </span>
              )}
            </div>
            <div className="p-3 bg-brand-primary/5 border border-brand-primary/30 rounded-lg text-sm text-text-main font-medium leading-relaxed">
              {suggestedText || (isLoading ? 'Crafting enhanced phrasing...' : 'No suggestion generated.')}
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 border-t border-brand-border bg-brand-bg/50 flex items-center justify-between gap-2">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-brand-surface-hover border border-brand-border rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-main rounded-lg transition-colors"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              disabled={isLoading || !suggestedText}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Check size={14} />
              <span>Accept</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiDiffModal;
