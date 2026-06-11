import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Palette, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

function PortfolioDemo() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Alex Developer');
  const [jobTitle, setJobTitle] = useState('Full Stack Engineer');
  const [theme, setTheme] = useState('minimalist'); // 'minimalist' or 'legacy'

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start animate-fade-in">
      
      {/* Left Column: Controls */}
      <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Layout size={18} className="text-brand-primary" />
              Live Editor
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edit the fields below to see your portfolio update instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Job Title</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} className="text-brand-secondary" />
              Select Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setTheme('minimalist')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${theme === 'minimalist' ? 'bg-slate-800 text-white border-slate-600' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
              >
                Minimalist Clean
              </button>
              <button 
                onClick={() => setTheme('legacy')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${theme === 'legacy' ? 'bg-gradient-to-r from-violet-600/30 to-teal-600/30 text-white border-violet-500/50' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
              >
                Legacy Bold
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/register')}
          className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
        >
          Build Full Portfolio Free
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Right Column: Live Preview */}
      <div className="flex-grow w-full border border-white/10 rounded-2xl overflow-hidden bg-[#0c101d] shadow-2xl relative flex flex-col h-[500px]">
        {/* Mock Browser Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#090d16] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          </div>
          <div className="flex-grow flex justify-center">
            <div className="bg-white/5 border border-white/5 rounded-md px-3 py-1 text-[10px] text-slate-500 font-mono flex items-center justify-center min-w-[200px] overflow-hidden truncate">
              {username.toLowerCase().replace(/\s+/g, '') || 'username'}.placemate.me
            </div>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="flex-grow overflow-hidden relative">
          
          {/* Theme: Minimalist Clean */}
          {theme === 'minimalist' && (
            <div className="absolute inset-0 bg-white text-slate-900 flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-3">
                {username || 'Your Name'}
              </h1>
              <h2 className="text-sm md:text-base text-slate-500 font-medium tracking-widest uppercase mb-8">
                {jobTitle || 'Your Job Title'}
              </h2>
              <div className="w-12 h-1 bg-slate-900 mb-8 mx-auto"></div>
              <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto leading-relaxed mb-10">
                I build pixel-perfect, engaging, and accessible digital experiences. Passionate about clean architecture and minimalist design.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-slate-900 hover:text-slate-500 transition-colors cursor-pointer"><Github size={20} /></div>
                <div className="text-slate-900 hover:text-slate-500 transition-colors cursor-pointer"><Linkedin size={20} /></div>
                <div className="text-slate-900 hover:text-slate-500 transition-colors cursor-pointer"><Mail size={20} /></div>
              </div>
            </div>
          )}

          {/* Theme: Legacy Bold (Radial Panel, Violet/Teal) */}
          {theme === 'legacy' && (
            <div className="absolute inset-0 bg-[#0f111a] text-white flex flex-col items-center justify-center p-6 animate-fade-in font-sans overflow-hidden">
              {/* Radial Gradients */}
              <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-violet-600/20 blur-[80px]"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-teal-500/20 blur-[80px]"></div>
              
              {/* Modular Card */}
              <div className="relative z-10 w-full max-w-sm bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 to-teal-400 rounded-full mb-6 p-1">
                  <div className="w-full h-full bg-[#0f111a] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-black bg-gradient-to-br from-violet-400 to-teal-300 bg-clip-text text-transparent">
                      {(username || 'YN').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1 tracking-tight">
                  {username || 'Your Name'}
                </h1>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  {jobTitle || 'Your Job Title'}
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                  Specializing in colorful dark layouts, soft radial background gradients, and engineering robust rounded modular cards.
                </p>
                
                <div className="flex items-center gap-3 w-full">
                  <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 hover:opacity-90 text-white text-xs font-bold shadow-lg transition-all">
                    View Work
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
                    <Github size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default PortfolioDemo;
