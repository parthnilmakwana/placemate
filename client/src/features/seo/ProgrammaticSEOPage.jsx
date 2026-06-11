import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Layout, ArrowRight } from 'lucide-react';

const ProgrammaticSEOPage = ({ type }) => {
  // Extract dynamic parameters from the URL
  const { role, tech } = useParams();
  
  // Format the keyword properly based on the route type
  const rawKeyword = type === 'role' ? role : tech;
  const formattedKeyword = rawKeyword
    ? rawKeyword.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Developer';

  // Dynamic SEO Metadata
  const title = `Top 10 ${formattedKeyword} Portfolio Templates for 2026 | PlaceMate`;
  const description = `Discover the best ATS-friendly ${formattedKeyword} portfolio templates. Build your professional developer portfolio in 2 minutes with AI.`;

  // Mock templates dynamically branded based on the keyword
  const templates = [
    { id: 1, name: `${formattedKeyword} Minimalist`, color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: `${formattedKeyword} Dark Mode`, color: 'from-purple-500 to-pink-500' },
    { id: 3, name: `${formattedKeyword} Executive`, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-slate-200">
      {/* 
        Helmet manages the <head> of our document dynamically. 
        This is crucial for SEO because Google's crawlers look here first.
      */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>

      {/* Header Section */}
      <header className="border-b border-white/5 bg-[#0c101d] py-16 px-6 relative overflow-hidden">
        {/* Ambient glow for visual excellence */}
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            <span>AI-Powered Templates</span>
          </div>
          
          {/* Target keyword is placed inside the H1 tag for maximum SEO weight */}
          <h1 className="font-heading text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Top 10 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{formattedKeyword}</span> Portfolio Templates for 2026
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            {description} Stand out to recruiters and land your dream job faster.
          </p>
          
          {/* Strong Call-To-Action (CTA) */}
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg shadow-brand-primary/20"
          >
            Build your {formattedKeyword} portfolio in 2 minutes with AI
            <ArrowRight size={20} />
          </Link>
        </div>
      </header>

      {/* Template Gallery */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">Choose Your {formattedKeyword} Style</h2>
          <p className="text-slate-400">All templates are fully responsive, ATS-friendly, and optimized for conversions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div key={template.id} className="group relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-brand-primary/50 transition-all">
              {/* Mock Image Area - In the future, these would be actual template screenshots */}
              <div className={`aspect-video bg-gradient-to-br ${template.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                <Layout size={48} className="text-white/50" />
              </div>
              
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-slate-400 text-sm mb-6">Perfect for highlighting {formattedKeyword.toLowerCase()} skills and projects.</p>
                
                <Link to="/register" className="w-full inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-brand-primary/20 text-white py-3 rounded-lg font-medium transition-colors">
                  Use This Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProgrammaticSEOPage;
