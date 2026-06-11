import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';
import { 
  Briefcase, Sparkles, ShieldCheck, FileText, 
  LayoutGrid, Wand2, TrendingUp, Menu, X, ArrowRight, Check, Activity 
} from 'lucide-react';
import DemoSection from '../tools/DemoSection';

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
        "@id": "https://www.placemate.me/#website",
        "url": "https://www.placemate.me/",
        "name": "PlaceMate",
        "description": "AI Resume Builder & Developer Portfolio Generator"
      },
      {
        "@type": "Organization",
        "@id": "https://www.placemate.me/#organization",
        "name": "PlaceMate",
        "url": "https://www.placemate.me",
        "logo": "https://www.placemate.me/logo.png"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is PlaceMate's ATS Resume Builder free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, PlaceMate offers a free tier that allows students and developers to create ATS-optimized resumes and track applications."
            }
          },
          {
            "@type": "Question",
            "name": "How does the Kanban Job Tracker work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our integrated Kanban board lets you visually track applications from Saved, to Applied, Interviewing, and Offer stages in one unified dashboard."
            }
          }
        ]
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
            <button onClick={() => scrollToSection('demos')} className="hover:text-brand-secondary transition-colors cursor-pointer flex items-center gap-1.5"><Activity size={14} /> Live Demos</button>
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
              <button onClick={() => scrollToSection('demos')} className="py-2 hover:text-brand-secondary border-b border-white/5 text-left flex items-center justify-between">
                <span>Live Demos</span>
                <span className="text-[10px] font-black tracking-widest bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded uppercase">Try It</span>
              </button>
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
            Supercharge your job search with our <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-brand-primary to-indigo-400 bg-clip-text text-transparent">
              ATS Resume Builder & Portfolio Platform
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

      {/* Embedded Live Demos Section */}
      <DemoSection />

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
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 text-left text-sm text-slate-500">
          
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="PlaceMate" width="40" height="40" loading="lazy" className="w-10 h-10 object-contain" />
              <span className="font-heading text-lg font-bold text-white tracking-tight">PlaceMate</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supercharging student developers by integrating portfolios, resume builders, and job boards.
            </p>
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-2">Connect</span>
              <p className="text-xs text-slate-600 mb-1">Have inquiries or recommendations?</p>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=parthnilmakwana@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-xs text-brand-secondary transition-colors font-semibold">parthnilmakwana@gmail.com</a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform</h4>
            <button onClick={() => scrollToSection('home')} className="hover:text-white text-xs transition-colors text-left cursor-pointer">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white text-xs transition-colors text-left cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white text-xs transition-colors text-left cursor-pointer">Pricing</button>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">By Role</h4>
            <a href="/roles/front-end-developer" className="hover:text-white text-xs transition-colors">Front-End Developer</a>
            <a href="/roles/back-end-developer" className="hover:text-white text-xs transition-colors">Back-End Developer</a>
            <a href="/roles/full-stack-developer" className="hover:text-white text-xs transition-colors">Full-Stack Developer</a>
            <a href="/roles/data-scientist" className="hover:text-white text-xs transition-colors">Data Scientist</a>
            <a href="/roles/devops-engineer" className="hover:text-white text-xs transition-colors">DevOps Engineer</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">By Tech</h4>
            <a href="/tech/react" className="hover:text-white text-xs transition-colors">React Portfolios</a>
            <a href="/tech/node-js" className="hover:text-white text-xs transition-colors">Node.js Portfolios</a>
            <a href="/tech/python" className="hover:text-white text-xs transition-colors">Python Portfolios</a>
            <a href="/tech/java" className="hover:text-white text-xs transition-colors">Java Portfolios</a>
            <a href="/tech/typescript" className="hover:text-white text-xs transition-colors">TypeScript Portfolios</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Legal</h4>
            <a href="#" className="hover:text-white text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white text-xs transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white text-xs transition-colors">Candidate Honor Code</a>
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
