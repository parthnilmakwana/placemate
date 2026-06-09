import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';
import { 
  Briefcase, Sparkles, ShieldCheck, FileText, 
  LayoutGrid, Wand2, TrendingUp, Menu, X, ArrowRight, Check 
} from 'lucide-react';

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to style navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (route) => {
    setMobileMenuOpen(false);
    navigate(route);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const landingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://placemate.com/#website",
        "url": "https://placemate.com/",
        "name": "PlaceMate",
        "description": "AI Resume Builder & Developer Portfolio Generator"
      },
      {
        "@type": "Organization",
        "@id": "https://placemate.com/#organization",
        "name": "PlaceMate",
        "url": "https://placemate.com",
        "logo": "https://placemate.com/logo.png"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex flex-col font-body selection:bg-brand-primary selection:text-white relative overflow-hidden">
      <SEO 
        title="PlaceMate | Best AI Resume Builder & Developer Portfolio Generator"
        description="Auto-generate custom portfolio sites, compile pixel-perfect ATS-optimized resumes, discover daily AI-matched developer jobs, and track your interview pipelines — all in one platform."
        schema={landingSchema}
      />
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full bg-brand-primary/5 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[-150px] w-[500px] h-[500px] rounded-full bg-brand-secondary/5 blur-[150px] pointer-events-none z-0"></div>

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#090d16]/85 backdrop-blur-md border-b border-white/5 py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src="/logo.png" alt="PlaceMate" width="48" height="48" loading="eager" className="w-12 h-12 object-contain" />
            <span className="font-heading text-2xl font-extrabold tracking-tight text-white">
              PlaceMate
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</button>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 transition-all cursor-pointer hover:shadow-brand-primary/30 active:scale-[0.98]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/25 transition-all cursor-pointer hover:shadow-brand-primary/35 active:scale-[0.98]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburguer Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-[73px] left-0 right-0 bottom-0 bg-[#090d16] border-t border-white/5 px-6 py-8 flex flex-col gap-6 z-40 animate-fade-in">
            <div className="flex flex-col gap-4 text-left font-semibold text-lg text-slate-300">
              <button onClick={() => scrollToSection('home')} className="py-2 hover:text-white border-b border-white/5 text-left">Home</button>
              <button onClick={() => scrollToSection('features')} className="py-2 hover:text-white border-b border-white/5 text-left">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="py-2 hover:text-white border-b border-white/5 text-left">Pricing</button>
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              {user ? (
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl font-bold text-sm bg-brand-primary text-white"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    className="w-full py-3 rounded-lg text-sm font-bold text-slate-300 border border-white/10 hover:bg-white/5"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-brand-primary text-white shadow-lg"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="max-w-6xl mx-auto w-full px-6 pt-36 pb-20 z-10 flex flex-col items-center text-center gap-8 md:gap-12 animate-fade-in">
        
        {/* Floating AI Notification */}
        <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
          <Sparkles size={13} className="text-brand-primary" />
          <span>Generative AI-Powered Placement Ecosystem</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl flex flex-col gap-4 md:gap-6">
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Supercharge your job search with <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-brand-primary to-indigo-400 bg-clip-text text-transparent">
              Unified Placement Readiness
            </span>
          </h1>
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Auto-generate custom portfolio sites, compile pixel-perfect ATS-optimized resumes, discover daily AI-matched developer jobs, and track your interview pipelines — all in one platform.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
          {user ? (
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xl shadow-brand-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <span>Go to Command Center</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleNavigation('/register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xl shadow-brand-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <span>Build Your Profile Free</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm border border-white/10 bg-white/5 hover:bg-white/8 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Explore Features
              </button>
            </>
          )}
        </div>

        {/* Interactive Dashboard Preview Mockup */}
        <div className="w-full max-w-5xl rounded-2xl border border-white/5 bg-slate-950/45 p-3 md:p-4 shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 via-transparent to-transparent pointer-events-none"></div>
          {/* Mockup Title bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono tracking-wider">placemate.tech/dashboard</span>
            <div className="w-8"></div>
          </div>
          {/* Simulated App Screen */}
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] md:grid-cols-[200px_1fr] h-[280px] md:h-[400px] bg-brand-bg rounded-xl overflow-hidden border border-white/5 select-none text-left">
            {/* Sidebar Mock */}
            <div className="hidden sm:flex border-r border-white/5 bg-[#0b0e1a]/80 p-4 flex-col gap-6">
              <span className="font-heading text-xs font-black text-slate-400 tracking-wider">PlaceMate</span>
              <div className="flex flex-col gap-2.5">
                <div className="h-6 w-full rounded bg-brand-primary/10 border border-brand-primary/15 text-[10px] font-bold text-indigo-300 flex items-center px-2 gap-1.5"><span>🏠</span>Dashboard</div>
                <div className="h-6 w-full rounded hover:bg-white/5 text-[10px] font-medium text-slate-500 flex items-center px-2 gap-1.5"><span>👤</span>Edit Profile</div>
                <div className="h-6 w-full rounded hover:bg-white/5 text-[10px] font-medium text-slate-500 flex items-center px-2 gap-1.5"><span>🌐</span>Public Portfolio</div>
                <div className="h-6 w-full rounded hover:bg-white/5 text-[10px] font-medium text-slate-500 flex items-center px-2 gap-1.5"><span>📄</span>ATS Resume</div>
                <div className="h-6 w-full rounded hover:bg-white/5 text-[10px] font-medium text-slate-500 flex items-center px-2 gap-1.5"><span>💼</span>Job Hunting</div>
              </div>
            </div>
            {/* Main Area Mock */}
            <div className="p-5 md:p-8 flex flex-col gap-6 overflow-hidden">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-lg md:text-xl font-bold text-white font-heading">Command Center</span>
                  <span className="text-[10px] text-slate-500">Live placement indicators & active tracking</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-black border border-emerald-500/20 uppercase">Connected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Profile Status</span>
                  <span className="text-lg font-extrabold text-white font-heading">85% Complete</span>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden"><div className="w-[85%] bg-indigo-500 h-full rounded-full"></div></div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Portfolio Template</span>
                  <span className="text-lg font-extrabold text-white font-heading">Minimal Slate</span>
                  <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><span>●</span> Live Public Link</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Job Tracker</span>
                  <span className="text-lg font-extrabold text-white font-heading">12 Applications</span>
                  <span className="text-[9px] text-slate-500">5 Interviews Active</span>
                </div>
              </div>
              <div className="border border-brand-primary/15 bg-brand-primary/5 rounded-xl p-4 flex justify-between items-center gap-4">
                <div className="flex flex-col gap-1 text-[10px]">
                  <span className="font-bold text-indigo-300">Ready to boost your placement rate?</span>
                  <span className="text-slate-400 leading-normal">Our system has processed 8 new jobs matching your target stack this morning.</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[9px] font-bold shrink-0">Review Matches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators / Stats */}
        <div className="w-full max-w-4xl border-t border-white/5 pt-12 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-brand-primary font-heading">85%+</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Average Match Score</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-white font-heading">10K+</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Developer Jobs</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-brand-secondary font-heading">1 Click</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">AI Theme Generator</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-white font-heading">Pixel-Perfect</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">ATS-Friendly Resumes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto w-full px-6 py-24 border-t border-white/5 z-10 text-left flex flex-col gap-16">
        
        {/* Section Header */}
        <div className="max-w-2xl flex flex-col gap-3">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Built for Action</span>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Four pillars, one unified dashboard
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Stop juggling builder tabs, PDF downloads, job scrapers, and spreadsheets. PlaceMate combines the complete job application pipeline under a single command center.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-600/25 text-indigo-400 flex items-center justify-center">
              <LayoutGrid size={20} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">AI Portfolio Builder</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Publish a premium public portfolio webpage with custom theme styles (Modern, Tech-Dark, Creative). Instantly query and verify subdomain links to share with recruiters.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-teal-600/10 border border-teal-600/25 text-brand-secondary flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">ATS-Optimized Resumes</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Design structured, single-page developer resumes complying with automated parsing engines. Side-by-side editing panel featuring instant rendering previews.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-600/25 text-violet-400 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Job Hunting Engine</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Tap into our global developer database, populated daily from real job APIs. Normalize fields and search categories, locations, or key tags instantly.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-600/25 text-emerald-400 flex items-center justify-center">
              <Wand2 size={20} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Gemini AI Enhancer</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Polishes your experience descriptions using professional vocabulary, corrects grammar issues, and crafts bullet points using strong action verbs.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-amber-600/10 border border-amber-600/25 text-amber-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Application Tracker</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Track your hiring stages using an integrated Kanban board (Saved, Applied, Interviewing, Offer). Maintain history logs synced to discovered jobs.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-600/25 text-purple-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Subdomain Routing</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Secure subdomains link your candidate profile dynamically. Switch templates in the app and check changes reflect live on public portfolios instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto w-full px-6 py-24 border-t border-white/5 z-10 text-center flex flex-col items-center gap-16">
        
        {/* Section Header */}
        <div className="max-w-2xl flex flex-col gap-3">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Pricing Plans</span>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Designed for developer growth
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Get started for free and build your readiness profile. Unlock premium automation tools as you scale your search.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
          {/* Plan 1: Free */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 text-left border border-white/5 bg-slate-950/20 hover:border-white/10 transition-all duration-300">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Free Candidate</h3>
              <p className="text-xs text-slate-500">Core placement tools for student candidates</p>
            </div>
            <div className="flex items-baseline gap-1 py-2 border-y border-white/5">
              <span className="text-4xl font-black text-white font-heading">$0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>
            <ul className="flex flex-col gap-3 text-xs text-slate-400 flex-grow">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-secondary shrink-0" />
                <span>1 Dynamic Portfolio Link</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-secondary shrink-0" />
                <span>1 Standard ATS Resume template</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-secondary shrink-0" />
                <span>Standard Job Discovery search access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-secondary shrink-0" />
                <span>Kanban Application Tracker board</span>
              </li>
            </ul>
            <button 
              onClick={() => handleNavigation('/register')}
              className="w-full py-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer text-center"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2: Premium */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 text-left border border-brand-primary/30 bg-brand-primary/5 hover:border-brand-primary/45 transition-all duration-300 relative">
            <div className="absolute top-4 right-4 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
              RECOMMENDED
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Premium Pro</h3>
              <p className="text-xs text-slate-400">Complete AI automated placement suite</p>
            </div>
            <div className="flex items-baseline gap-1 py-2 border-y border-white/10">
              <span className="text-4xl font-black text-white font-heading">$19</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="flex flex-col gap-3 text-xs text-slate-300 flex-grow">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-primary shrink-0" />
                <strong>All Free features included</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-primary shrink-0" />
                <span>Unlimited Premium portfolio themes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-primary shrink-0" />
                <span>AI theme generation using prompts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-primary shrink-0" />
                <span>Unlimited Resume downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-primary shrink-0" />
                <span>Gemini AI powered phrasing polishing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-brand-primary shrink-0" />
                <span>Daily tailored resumes matching jobs</span>
              </li>
            </ul>
            <button 
              onClick={() => handleNavigation('/register')}
              className="w-full py-3 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/25 transition-all hover:shadow-brand-primary/35 cursor-pointer text-center"
            >
              Unlock Premium Access
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#05080f]/90 py-12 z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-sm text-slate-500">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="PlaceMate" width="40" height="40" loading="lazy" className="w-10 h-10 object-contain" />
              <span className="font-heading text-lg font-bold text-white tracking-tight">PlaceMate</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supercharging student developers by integrating portfolios, resume builders, and job boards.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform</h4>
            <button onClick={() => scrollToSection('home')} className="hover:text-white text-xs transition-colors text-left cursor-pointer">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white text-xs transition-colors text-left cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white text-xs transition-colors text-left cursor-pointer">Pricing</button>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Legal</h4>
            <a href="#" className="hover:text-white text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white text-xs transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white text-xs transition-colors">Candidate Honor Code</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Connect</h4>
            <span className="text-xs text-slate-600 leading-normal">Have inquiries or recommendations? Send us a line.</span>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=parthnilmakwana@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white text-xs text-brand-secondary transition-colors font-semibold"
            >
              parthnilmakwana@gmail.com
            </a>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 border-t border-white/5 mt-8 pt-6 text-center text-xs text-slate-600 font-medium">
          © 2026 PlaceMate Team. All rights reserved. Built by Parthnil Makwana. Pair programmed with Antigravity AI.
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
