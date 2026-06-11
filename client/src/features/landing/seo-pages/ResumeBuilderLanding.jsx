import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../components/SEO';
import { FileText, CheckCircle, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

function ResumeBuilderLanding() {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PlaceMate Resume Builder",
    "url": "https://www.placemate.me/resume-builder",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Free ATS Resume Builder and AI Resume Scanner designed specifically for software engineers and tech students.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex flex-col font-body relative overflow-hidden">
      <SEO 
        title="Free ATS Resume Builder & AI Scanner | PlaceMate"
        description="Create, scan, and optimize your tech resume. Our AI ATS resume builder ensures your software engineering application passes recruiter screening. Try it free."
        schema={schema}
      />
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Simplified Navigation for higher conversion */}
      <nav className="relative z-50 bg-[#090d16]/85 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigation('/')}>
            <img src="/logo.png" alt="PlaceMate" width="48" height="48" className="w-12 h-12 object-contain" />
            <span className="font-heading text-2xl font-extrabold tracking-tight text-white">PlaceMate</span>
          </div>
          <button 
            onClick={() => handleNavigation('/register')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg transition-all cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto w-full px-6 pt-24 pb-16 z-10 flex flex-col items-center text-center gap-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
          <Activity size={13} className="text-indigo-400" />
          <span>The #1 Resume Builder for Developers</span>
        </div>

        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Build an <span className="text-brand-primary">ATS-Friendly</span> Software Engineering Resume
        </h1>
        
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop getting auto-rejected. Generate a pixel-perfect, recruiter-approved resume format that passes automated parsing engines with zero formatting errors.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
          <button 
            onClick={() => handleNavigation('/register')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xl transition-all cursor-pointer"
          >
            <FileText size={16} />
            <span>Build Your Resume for Free</span>
          </button>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-slate-900/30 flex flex-col gap-4">
            <ShieldCheck className="text-emerald-400" size={28} />
            <h3 className="font-heading text-xl font-bold text-white">ATS-Optimized Templates</h3>
            <p className="text-sm text-slate-400">Our templates strip away confusing dual-columns and graphics, ensuring standard PDF parsing by major Applicant Tracking Systems.</p>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-slate-900/30 flex flex-col gap-4">
            <Activity className="text-brand-primary" size={28} />
            <h3 className="font-heading text-xl font-bold text-white">AI Content Polishing</h3>
            <p className="text-sm text-slate-400">Our Gemini-powered engine rewrites your bullet points using professional action verbs tailored to software engineering roles.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-slate-900/30 flex flex-col gap-4">
            <CheckCircle className="text-indigo-400" size={28} />
            <h3 className="font-heading text-xl font-bold text-white">Instant Grammar Check</h3>
            <p className="text-sm text-slate-400">Eliminate embarrassing typos and grammatical errors before they cost you the interview. Built-in proofreading.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/5 bg-[#05080f]/90 py-16 text-center z-10 mt-auto">
        <h2 className="font-heading text-2xl font-bold text-white mb-6">Ready to pass the ATS filter?</h2>
        <button 
          onClick={() => handleNavigation('/register')}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
        >
          <span>Get Started Now</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

export default ResumeBuilderLanding;
