import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Palette, ArrowRight, Github, Linkedin, Mail, Code2, Terminal, ExternalLink } from 'lucide-react';
import Button from '../../components/Button';

function PortfolioDemo() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Alex Developer');
  const [jobTitle, setJobTitle] = useState('Full Stack Engineer');
  const [theme, setTheme] = useState('developer'); // 'developer' or 'professional'

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start animate-fade-in text-left">
      
      {/* Left Column: Controls */}
      <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        <div className="structured-panel p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 border-b border-border-subtle pb-4">
            <h3 className="font-heading text-lg font-bold text-text-main flex items-center gap-2">
              <Layout size={18} className="text-brand-primary" />
              Live Editor
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Edit the fields below to see your portfolio update instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-surface-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-main placeholder-text-disabled focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Job Title</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full bg-surface-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-main placeholder-text-disabled focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-border-subtle">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} className="text-brand-primary" />
              Select Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => setTheme('developer')}
                variant={theme === 'developer' ? 'primary' : 'secondary'}
                size="sm"
              >
                Modern Developer
              </Button>
              <Button 
                onClick={() => setTheme('professional')}
                variant={theme === 'professional' ? 'primary' : 'secondary'}
                size="sm"
              >
                Premium Professional
              </Button>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/register')}
          variant="primary"
          fullWidth
          className="py-3.5 shadow-sm"
        >
          <span>Build Full Portfolio Free</span>
          <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>

      {/* Right Column: Live Preview */}
      <div className="flex-grow w-full border border-border-strong rounded-lg overflow-hidden bg-bg-base shadow-2xl relative flex flex-col h-[520px]">
        {/* Mock Browser Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-bg-sidebar shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-error/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-status-success/80"></span>
          </div>
          <div className="flex-grow flex justify-center">
            <div className="bg-surface-primary border border-border-subtle rounded px-3 py-1 text-[10px] text-text-muted font-mono flex items-center justify-center min-w-[220px] overflow-hidden truncate">
              {username.toLowerCase().replace(/\s+/g, '') || 'username'}.placemate.me
            </div>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="flex-grow overflow-hidden relative">
          
          {/* Theme 1: Modern Developer (Code-inspired Grid Layout) */}
          {theme === 'developer' && (
            <div className="absolute inset-0 bg-bg-base text-text-main flex flex-col p-6 animate-fade-in font-body overflow-y-auto custom-scrollbar gap-6">
              {/* Header block */}
              <div className="structured-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand-primary shrink-0">
                    <Terminal size={26} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-text-main tracking-tight font-heading">
                        {username || 'Your Name'}
                      </h1>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-mono font-semibold">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-text-muted font-mono">
                      {jobTitle || 'Full Stack Engineer'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted hover:text-text-main cursor-pointer p-1.5 bg-surface-elevated rounded border border-border-subtle"><Github size={16} /></span>
                  <span className="text-xs text-text-muted hover:text-text-main cursor-pointer p-1.5 bg-surface-elevated rounded border border-border-subtle"><Linkedin size={16} /></span>
                  <span className="text-xs text-text-muted hover:text-text-main cursor-pointer p-1.5 bg-surface-elevated rounded border border-border-subtle"><Mail size={16} /></span>
                </div>
              </div>

              {/* Technical Bio Card */}
              <div className="structured-panel p-6 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-mono">
                  // About & Background
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Specializing in clean software architecture, scalable frontend systems, and high-performance backend APIs. Passionate about product engineer workflows and minimal UI design.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[11px] px-2.5 py-1 rounded bg-surface-elevated text-text-secondary border border-border-subtle font-mono">React</span>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-surface-elevated text-text-secondary border border-border-subtle font-mono">TypeScript</span>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-surface-elevated text-text-secondary border border-border-subtle font-mono">Node.js</span>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-surface-elevated text-text-secondary border border-border-subtle font-mono">TailwindCSS</span>
                </div>
              </div>

              {/* Sample Project Showcase */}
              <div className="structured-panel p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-mono">
                    // Featured Repositories
                  </h3>
                  <span className="text-[11px] text-brand-primary font-medium flex items-center gap-1">
                    View GitHub <ExternalLink size={12} />
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-surface-elevated border border-border-subtle rounded-md flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-text-main">distributed-cache</h4>
                    <p className="text-[11px] text-text-muted">In-memory key-value cache engine built with Rust and Raft consensus.</p>
                  </div>
                  <div className="p-4 bg-surface-elevated border border-border-subtle rounded-md flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-text-main">placemate-ui-system</h4>
                    <p className="text-[11px] text-text-muted">Editorial design system & accessible component primitives.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme 2: Premium Professional (Executive Structured Layout) */}
          {theme === 'professional' && (
            <div className="absolute inset-0 bg-surface-primary text-text-main flex flex-col p-6 animate-fade-in font-body overflow-y-auto custom-scrollbar gap-6">
              
              {/* Profile Overview Banner */}
              <div className="structured-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-elevated border-border-strong">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-lg font-bold font-heading shrink-0">
                    {(username || 'AD').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-extrabold text-text-main tracking-tight font-heading">
                      {username || 'Your Name'}
                    </h1>
                    <p className="text-xs text-text-secondary font-medium">
                      {jobTitle || 'Full Stack Engineer'}
                    </p>
                  </div>
                </div>
                
                <Button variant="primary" size="sm">
                  <span>Contact Candidate</span>
                  <Mail size={14} className="ml-1.5" />
                </Button>
              </div>

              {/* Core Competencies & Experience Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="structured-panel p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Experience Level</span>
                  <span className="text-sm font-bold text-text-main">Senior Engineer</span>
                </div>
                <div className="structured-panel p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Primary Stack</span>
                  <span className="text-sm font-bold text-text-main">Full-Stack / Cloud</span>
                </div>
                <div className="structured-panel p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Location</span>
                  <span className="text-sm font-bold text-text-main">San Francisco / Remote</span>
                </div>
              </div>

              {/* Career Highlights */}
              <div className="structured-panel p-6 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Executive Summary
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Engineering leader focused on building resilient distributed systems, driving high-impact product features, and mentoring engineering teams. Proven track record in rapid product iterations.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default PortfolioDemo;
