import React from 'react';
import { Sparkles, Wand2, Edit3, ArrowRight } from 'lucide-react';
import Button from '../../../components/Button';

function ResumeEditorTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 md:min-h-125 w-full max-w-3xl mx-auto text-center animate-fade-in p-6">
      {/* Icon and Badge */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
          <Wand2 className="text-brand-primary w-8 h-8" />
        </div>
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 border border-brand-primary/20 rounded-full">
          Coming Soon
        </span>
      </div>

      {/* Text Content */}
      <h2 className="text-3xl font-heading font-bold text-text-main mb-4 tracking-tight">
        AI-Powered Resume Editor
      </h2>
      <p className="text-text-secondary text-base leading-relaxed max-w-xl mb-10">
        We're building the ultimate intelligent editor. Soon, you'll be able to rewrite bullet points, optimize action verbs, format content on the fly, and tailor your resume for specific job descriptions—all powered by AI.
      </p>

      {/* Feature Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mb-10">
        <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-main font-semibold">
            <Sparkles size={16} className="text-status-success" />
            <span>AI Bullet Enhancer</span>
          </div>
          <p className="text-xs text-text-secondary">Automatically rewrite weak bullet points into high-impact achievements.</p>
        </div>
        <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-main font-semibold">
            <Edit3 size={16} className="text-status-warning" />
            <span>Active Verb Optimization</span>
          </div>
          <p className="text-xs text-text-secondary">Swap passive verbs for strong action words that recruiters love.</p>
        </div>
      </div>

      {/* Disabled CTA */}
      <div className="flex flex-col items-center gap-3">
        <Button 
          variant="primary" 
          disabled 
          className="opacity-70 cursor-not-allowed px-8 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <span>Notify me when it's ready</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

export default ResumeEditorTab;
