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
    <div className="min-h-screen bg-brand-bg text-text-main flex flex-col font-body relative overflow-hidden">
      <SEO 
        title="Free ATS Resume Builder & AI Scanner | PlaceMate"
        description="Create, scan, and optimize your tech resume. Our AI ATS resume builder ensures your software engineering application passes recruiter screening. Try it free."
        schema={schema}
      />
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Simplified Navigation for higher conversion */}
      <nav className="relative z-50 bg-[#090d16]/85 backdrop-blur-md border-b border-border-subtle py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigation('/')}>
            <img src="/logo.png" alt="PlaceMate" width="48" height="48" className="w-12 h-12 object-contain" />
            <span className="font-heading text-2xl font-extrabold tracking-tight text-text-main">PlaceMate</span>
          </div>
          <button 
            onClick={() => handleNavigation('/register')}
            className="px-5 py-2.5 rounded-md text-sm font-semibold bg-brand-primary hover:bg-brand-hover text-text-main shadow-sm transition-all cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto w-full px-6 pt-24 pb-16 z-10 flex flex-col items-center text-center gap-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
          <Activity size={13} className="text-brand-primary" />
          <span>The #1 Resume Builder for Developers</span>
        </div>

        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-text-main leading-tight">
          Build an <span className="text-brand-primary">ATS-Friendly</span> Software Engineering Resume
        </h1>
        
        <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Stop getting auto-rejected. Generate a pixel-perfect, recruiter-approved resume format that passes automated parsing engines with zero formatting errors.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
          <button 
            onClick={() => handleNavigation('/register')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main shadow-sm transition-all cursor-pointer"
          >
            <FileText size={16} />
            <span>Build Your Resume for Free</span>
          </button>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="structured-panel p-8 flex flex-col gap-4">
            <ShieldCheck className="text-status-success" size={28} />
            <h3 className="font-heading text-xl font-bold text-text-main">ATS-Optimized Templates</h3>
            <p className="text-sm text-text-secondary">Our templates strip away confusing dual-columns and graphics, ensuring standard PDF parsing by major Applicant Tracking Systems.</p>
          </div>
          
          <div className="structured-panel p-8 flex flex-col gap-4">
            <Activity className="text-brand-primary" size={28} />
            <h3 className="font-heading text-xl font-bold text-text-main">AI Content Polishing</h3>
            <p className="text-sm text-text-secondary">Our Gemini-powered engine rewrites your bullet points using professional action verbs tailored to software engineering roles.</p>
          </div>

          <div className="structured-panel p-8 flex flex-col gap-4">
            <CheckCircle className="text-brand-primary" size={28} />
            <h3 className="font-heading text-xl font-bold text-text-main">Instant Grammar Check</h3>
            <p className="text-sm text-text-secondary">Eliminate embarrassing typos and grammatical errors before they cost you the interview. Built-in proofreading.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border-subtle bg-bg-sidebar py-16 text-center z-10 mt-auto">
        <h2 className="font-heading text-2xl font-bold text-text-main mb-6">Ready to pass the ATS filter?</h2>
        <button 
          onClick={() => handleNavigation('/register')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer shadow-sm"
        >
          <span>Get Started Now</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

export default ResumeBuilderLanding;
