import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../components/SEO';
import { LayoutGrid, Globe, ArrowRight, Code2, MonitorSmartphone } from 'lucide-react';

function PortfolioBuilderLanding() {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PlaceMate Portfolio Builder",
    "url": "https://www.placemate.me/portfolio-builder",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Generate a stunning, mobile-responsive developer portfolio website in seconds. Choose from premium templates and host for free.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-text-main flex flex-col font-body relative overflow-hidden">
      <SEO 
        title="Developer Portfolio Generator & Builder | PlaceMate"
        description="Generate a stunning, mobile-responsive developer portfolio website in seconds. Choose from premium templates and host for free."
        schema={schema}
      />
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-brand-secondary/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Simplified Navigation */}
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
          <Code2 size={13} />
          <span>The #1 Portfolio Generator for Devs</span>
        </div>

        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-text-main leading-tight">
          Generate a Stunning <br className="hidden md:inline" />
          <span className="text-brand-primary">Developer Portfolio</span> in 1-Click
        </h1>
        
        <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Don't waste hours coding a portfolio from scratch. Instantly auto-generate a premium, hosted portfolio website from your PlaceMate profile.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
          <button 
            onClick={() => handleNavigation('/register')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main shadow-sm transition-all cursor-pointer"
          >
            <LayoutGrid size={16} />
            <span>Deploy Portfolio Free</span>
          </button>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="structured-panel p-8 flex flex-col gap-4">
            <LayoutGrid className="text-brand-primary" size={28} />
            <h3 className="font-heading text-xl font-bold text-text-main">Premium Templates</h3>
            <p className="text-sm text-text-secondary">Choose from carefully crafted themes designed specifically for modern developers, including Tech-Dark, Minimal, and Creative layouts.</p>
          </div>
          
          <div className="structured-panel p-8 flex flex-col gap-4">
            <Globe className="text-brand-primary" size={28} />
            <h3 className="font-heading text-xl font-bold text-text-main">Instant Free Hosting</h3>
            <p className="text-sm text-text-secondary">Every portfolio comes with a free dynamic subdomain link. Share your work with recruiters instantly without wrestling with DNS settings.</p>
          </div>

          <div className="structured-panel p-8 flex flex-col gap-4">
            <MonitorSmartphone className="text-status-success" size={28} />
            <h3 className="font-heading text-xl font-bold text-text-main">100% Responsive</h3>
            <p className="text-sm text-text-secondary">Your portfolio looks flawless on every device. Recruiters reviewing your application on their phones will have a seamless experience.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border-subtle bg-bg-sidebar py-16 text-center z-10 mt-auto">
        <h2 className="font-heading text-2xl font-bold text-text-main mb-6">Ready to showcase your projects?</h2>
        <button 
          onClick={() => handleNavigation('/register')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-brand-primary hover:bg-brand-hover text-text-main transition-all cursor-pointer shadow-sm"
        >
          <span>Claim Your Subdomain Now</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

export default PortfolioBuilderLanding;
