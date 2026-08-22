import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";
import {
  Briefcase,
  ShieldCheck,
  FileText,
  LayoutGrid,
  Menu,
  X,
  ArrowRight,
  Check,
  Activity,
} from "lucide-react";
import DemoSection from "../tools/DemoSection";

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to style navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (route) => {
    setMobileMenuOpen(false);
    navigate(route);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const landingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.placemate.me/#website",
        url: "https://www.placemate.me/",
        name: "PlaceMate",
        description: "Professional career platform for software engineers.",
      },
      {
        "@type": "Organization",
        "@id": "https://www.placemate.me/#organization",
        name: "PlaceMate",
        url: "https://www.placemate.me",
        logo: "https://www.placemate.me/logo.png",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-brand-bg text-text-main flex flex-col font-body selection:bg-brand-primary selection:text-brand-bg relative overflow-x-hidden">
      <SEO
        title="PlaceMate | The Career Platform for Developers"
        description="Manage job applications, build ATS-friendly resumes, and deploy your developer portfolio from a single professional command center."
        schema={landingSchema}
      />

      {/* Structured Sticky Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-brand-bg border-b border-brand-border py-4"
            : "bg-brand-bg py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => scrollToSection("home")}
          >
            <img
              src="/logo.png"
              alt="PlaceMate"
              width="36"
              height="36"
              loading="eager"
              className="w-9 h-9 object-contain"
            />
            <span className="font-heading text-xl font-bold tracking-tight text-text-main">
              PlaceMate
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-text-main transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button
              onClick={() => scrollToSection("demos")}
              className="hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Activity size={14} /> Interactive Preview
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="hover:text-text-main transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer shadow-sm"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-main transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="px-5 py-2.5 rounded-md text-sm font-semibold bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburguer Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-main rounded-md cursor-pointer border border-brand-border"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-[70px] left-0 right-0 bottom-0 bg-brand-bg border-t border-brand-border px-6 py-8 flex flex-col gap-6 z-40 animate-fade-in">
            <div className="flex flex-col gap-4 text-left font-medium text-lg text-text-secondary">
              <button
                onClick={() => scrollToSection("features")}
                className="py-3 hover:text-text-main border-b border-brand-border text-left"
              >
                Platform
              </button>
              <button
                onClick={() => scrollToSection("demos")}
                className="py-3 hover:text-text-main border-b border-brand-border text-left"
              >
                Interactive Preview
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="py-3 hover:text-text-main border-b border-brand-border text-left"
              >
                Pricing
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {user ? (
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md font-semibold text-sm bg-white text-black"
                >
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full py-3 rounded-md text-sm font-medium text-text-secondary border border-brand-border"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleNavigation("/register")}
                    className="w-full py-3 rounded-md text-sm font-semibold bg-white text-black"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Redesigned Asymmetric Hero Section */}
      <section
        id="home"
        className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-40 pb-24 z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-fade-in"
      >
        <div className="flex flex-col gap-8 text-left">
          <div className="inline-flex items-center gap-2 border border-brand-border px-3 py-1 rounded-sm text-xs font-semibold tracking-wide text-text-muted w-max">
            <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
            PlaceMate 1.0 is live
          </div>
          
          <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight text-text-main leading-[1.1]">
            The complete career platform for developers.
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-lg">
            Manage your entire application pipeline, build ATS-optimized resumes, and deploy a professional portfolio from a single, unified command center.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            {user ? (
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer shadow-sm"
              >
                <span>Open Dashboard</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer shadow-sm"
                >
                  <span>Start Building</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-surface-elevated hover:bg-border-subtle text-text-main border border-border-strong transition-all cursor-pointer"
                >
                  Explore Platform
                </button>
              </>
            )}
          </div>
        </div>

        {/* Abstract Product UI Representation */}
        <div className="relative w-full h-[400px] lg:h-[500px] structured-panel rounded-lg overflow-hidden flex flex-col bg-brand-surface border border-brand-border hidden md:flex">
          {/* Header */}
          <div className="h-12 border-b border-brand-border flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-border"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-border"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-border"></div>
          </div>
          {/* Main Body */}
          <div className="flex-1 flex">
            {/* Sidebar mock */}
            <div className="w-48 border-r border-brand-border p-4 flex flex-col gap-3">
              <div className="w-full h-3 bg-brand-border rounded-sm"></div>
              <div className="w-3/4 h-3 bg-brand-border rounded-sm"></div>
              <div className="w-5/6 h-3 bg-brand-border rounded-sm"></div>
            </div>
            {/* Content mock - Kanban board */}
            <div className="flex-1 p-6 flex gap-4 overflow-hidden">
              <div className="flex-1 flex flex-col gap-3">
                <div className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider">Applied</div>
                <div className="h-24 bg-brand-bg border border-brand-border rounded-md p-3">
                  <div className="w-1/2 h-3 bg-brand-border rounded-sm mb-2"></div>
                  <div className="w-1/3 h-2 bg-brand-border/60 rounded-sm"></div>
                </div>
                <div className="h-24 bg-brand-bg border border-brand-border rounded-md p-3">
                  <div className="w-2/3 h-3 bg-brand-border rounded-sm mb-2"></div>
                  <div className="w-1/2 h-2 bg-brand-border/60 rounded-sm"></div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="text-[10px] font-semibold text-text-disabled uppercase tracking-wider">Interviewing</div>
                <div className="h-24 bg-brand-surface border border-brand-primary/40 rounded-md p-3">
                  <div className="w-3/4 h-3 bg-brand-primary rounded-sm mb-2"></div>
                  <div className="w-1/2 h-2 bg-brand-primary/30 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Features Section - Editorial Layout */}
      <section
        id="features"
        className="max-w-7xl mx-auto w-full px-6 md:px-12 py-24 border-t border-brand-border z-10 text-left"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4 flex flex-col gap-4">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-text-main">
              A unified system for your career progression.
            </h2>
            <p className="text-text-muted leading-relaxed">
              We replaced isolated tools and spreadsheets with a single, tightly integrated workflow designed for modern software engineering hiring.
            </p>
          </div>
          
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {/* Feature 1 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 flex items-center justify-center border border-brand-border rounded-md text-text-main bg-brand-surface mb-2">
                <Briefcase size={16} />
              </div>
              <h3 className="font-bold text-text-main text-lg">Application Tracker</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                A visual Kanban board specifically built for job hunting. Move applications from screening to offer, log interview notes, and track dates without the clutter of generic spreadsheet templates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 flex items-center justify-center border border-brand-border rounded-md text-text-main bg-brand-surface mb-2">
                <FileText size={16} />
              </div>
              <h3 className="font-bold text-text-main text-lg">ATS-Optimized Resumes</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Generate clean, strictly structured resumes that pass automated parsing engines. Focus on your content; the platform handles the typography, margins, and PDF export mechanics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 flex items-center justify-center border border-brand-border rounded-md text-text-main bg-brand-surface mb-2">
                <LayoutGrid size={16} />
              </div>
              <h3 className="font-bold text-text-main text-lg">Public Portfolio</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Your data powers a live, highly-performant developer portfolio. Publish your projects and experience with a single click, using clean layouts that highlight your technical capabilities.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 flex items-center justify-center border border-brand-border rounded-md text-text-main bg-brand-surface mb-2">
                <ShieldCheck size={16} />
              </div>
              <h3 className="font-bold text-text-main text-lg">Job Discovery</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Browse curated technical roles tailored for early-career developers. Save opportunities directly to your tracker and tailor your resume for specific positions instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Live Demos Section */}
      <DemoSection />

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto w-full px-6 md:px-12 py-24 border-t border-brand-border z-10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm flex flex-col gap-4">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-text-main">
              Simple, transparent pricing.
            </h2>
            <p className="text-text-muted leading-relaxed">
              Start building your profile for free. Upgrade only when you need advanced capabilities for active recruiting cycles.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {/* Plan 1 */}
            <div className="structured-panel p-8 flex flex-col gap-6 relative">
              <h3 className="text-lg font-bold text-text-main">Core</h3>
              <div className="flex items-baseline gap-1 py-4 border-y border-brand-border">
                <span className="text-3xl font-bold text-text-main font-heading">$0</span>
                <span className="text-sm text-text-disabled">/ forever</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm text-text-muted flex-grow">
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>Public Portfolio Link</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>1 ATS Resume Format</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>Application Tracking Board</span>
                </li>
              </ul>
              <button
                onClick={() => handleNavigation("/register")}
                className="w-full py-2.5 rounded-md text-sm font-semibold bg-surface-elevated hover:bg-border-subtle text-text-main border border-border-strong transition-all cursor-pointer text-center mt-4"
              >
                Create Account
              </button>
            </div>

            {/* Plan 2 */}
            <div className="structured-panel p-8 flex flex-col gap-6 relative border-border-strong">
              <div className="absolute top-0 right-0 bg-brand-primary text-text-main text-[10px] font-bold tracking-wider px-3 py-1 rounded-bl-lg uppercase">
                Pro
              </div>
              <h3 className="text-lg font-bold text-text-main">Professional</h3>
              <div className="flex items-baseline gap-1 py-4 border-y border-border-subtle">
                <span className="text-3xl font-bold text-text-main font-heading">$19</span>
                <span className="text-sm text-text-muted">/ month</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm text-text-secondary flex-grow">
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>All Core features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>Custom Portfolio Domains</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>Unlimited Resume Exports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-text-main shrink-0" />
                  <span>AI Writing Assistant</span>
                </li>
              </ul>
              <button
                onClick={() => handleNavigation("/register")}
                className="w-full py-2.5 rounded-md text-sm font-semibold bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer text-center mt-4 shadow-sm"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="mt-auto border-t border-brand-border bg-brand-bg py-16 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 text-sm text-text-disabled">
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="PlaceMate"
                width="32"
                height="32"
                loading="lazy"
                className="w-8 h-8 object-contain"
              />
              <span className="font-heading text-lg font-bold text-text-main tracking-tight">
                PlaceMate
              </span>
            </div>
            <p className="text-text-muted leading-relaxed max-w-xs">
              The unified career platform built specifically for software engineers.
            </p>
            <div className="mt-2">
              <span className="font-semibold text-text-secondary block mb-2">Support</span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=parthnilmakwana@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-main transition-colors underline underline-offset-4"
              >
                parthnilmakwana@gmail.com
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-text-main">Platform</h4>
            <button onClick={() => scrollToSection("home")} className="hover:text-text-main transition-colors text-left w-max">Home</button>
            <button onClick={() => scrollToSection("features")} className="hover:text-text-main transition-colors text-left w-max">Features</button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-text-main transition-colors text-left w-max">Pricing</button>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-text-main">Roles</h4>
            <a href="/roles/front-end-developer" className="hover:text-text-main transition-colors w-max">Frontend</a>
            <a href="/roles/back-end-developer" className="hover:text-text-main transition-colors w-max">Backend</a>
            <a href="/roles/full-stack-developer" className="hover:text-text-main transition-colors w-max">Full Stack</a>
            <a href="/roles/data-scientist" className="hover:text-text-main transition-colors w-max">Data Science</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-text-main">Legal</h4>
            <a href="#" className="hover:text-text-main transition-colors w-max">Privacy</a>
            <a href="#" className="hover:text-text-main transition-colors w-max">Terms</a>
            <a href="#" className="hover:text-text-main transition-colors w-max">Security</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-brand-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-disabled">
          <span>© 2026 PlaceMate. All rights reserved.</span>
          <span>Engineered by Parthnil Makwana.</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
