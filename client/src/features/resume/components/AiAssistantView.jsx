import React, { useState } from 'react';
import { Wand2, Zap, FileText, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';

const AiAssistantView = ({ profile }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState(null);

  const handleAction = async (actionType) => {
    setIsAnalyzing(true);
    setResponse(null);
    try {
      // Mocking AI response for now
      await new Promise(r => setTimeout(r, 1500));
      if (actionType === 'improve') {
        setResponse("Your resume looks strong! I suggest adding more quantifiable metrics to your Experience section (e.g. 'Improved efficiency by 20%').");
      } else if (actionType === 'analyze') {
        setResponse("Your experience highlights good technical skills. Consider adding a short summary of the specific technologies used in your recent role.");
      } else {
        setResponse("AI analysis complete.");
      }
    } catch (e) {
      setResponse("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg relative animate-fade-in">
      <div className="px-5 py-4 border-b border-brand-border bg-brand-surface shrink-0 flex items-center gap-2">
        <BrainCircuit size={18} className="text-brand-primary" />
        <h2 className="font-heading font-semibold text-text-main text-sm uppercase tracking-wider">
          Placemate AI
        </h2>
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        
        {/* Intro */}
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wand2 size={24} className="text-brand-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-2">How can I help?</h3>
          <p className="text-sm text-text-secondary max-w-62.5">
            Select text in the editor for contextual help, or choose a general action below.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-3">
          <button 
            onClick={() => handleAction('improve')}
            disabled={isAnalyzing}
            className="flex items-center gap-3 p-3 w-full bg-brand-surface border border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-lg text-left transition-all disabled:opacity-50"
          >
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-md shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <div className="font-semibold text-sm text-text-main">Improve Resume</div>
              <div className="text-xs text-text-muted">Get general improvement suggestions</div>
            </div>
          </button>

          <button 
            onClick={() => handleAction('analyze')}
            disabled={isAnalyzing}
            className="flex items-center gap-3 p-3 w-full bg-brand-surface border border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-lg text-left transition-all disabled:opacity-50"
          >
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="font-semibold text-sm text-text-main">Analyze Experience</div>
              <div className="text-xs text-text-muted">Identify missing impact and verbs</div>
            </div>
          </button>
        </div>

        {/* Results Area */}
        {isAnalyzing && (
          <div className="mt-4 p-4 bg-brand-surface rounded-lg border border-brand-border flex items-center justify-center gap-2 text-sm text-text-secondary">
            <Loader2 size={16} className="animate-spin text-brand-primary" /> Analyzing your resume...
          </div>
        )}

        {response && !isAnalyzing && (
          <div className="mt-4 p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
            <h4 className="font-semibold text-sm text-brand-primary mb-2 flex items-center gap-1">
              <CheckCircle size={14} /> AI Suggestions
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              {response}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiAssistantView;
