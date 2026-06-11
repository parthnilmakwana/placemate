import React, { useState } from 'react';
import { Activity, Layout } from 'lucide-react';
import ResumeScanner from './ResumeScanner';
import PortfolioDemo from './PortfolioDemo';

function DemoSection() {
  const [activeTab, setActiveTab] = useState('ats'); // 'ats' or 'portfolio'

  return (
    <section id="demos" className="max-w-6xl mx-auto w-full px-6 py-24 border-t border-white/5 z-10 flex flex-col gap-12">
      
      {/* Section Header & Tabs */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
          <Activity size={16} />
          <span>Interactive Demos</span>
        </div>
        
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Try our tools <span className="text-brand-primary">before you sign up</span>
        </h2>
        
        {/* Tab Toggle */}
        <div className="bg-slate-900/80 border border-white/10 p-1 rounded-xl flex items-center justify-center w-full max-w-sm mx-auto shadow-xl">
          <button
            onClick={() => setActiveTab('ats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'ats' 
                ? 'bg-brand-secondary text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={16} />
            ATS Checker
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'portfolio' 
                ? 'bg-brand-primary text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout size={16} />
            Portfolio Builder
          </button>
        </div>
      </div>

      {/* Demo Content Container */}
      <div className="w-full">
        {activeTab === 'ats' && (
          <div className="animate-fade-in">
            <ResumeScanner />
          </div>
        )}
        
        {activeTab === 'portfolio' && (
          <div className="animate-fade-in">
            <PortfolioDemo />
          </div>
        )}
      </div>
      
    </section>
  );
}

export default DemoSection;
