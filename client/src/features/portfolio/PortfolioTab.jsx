import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Copy, Check, Globe, EyeOff, LayoutGrid, AlertCircle, Save, ExternalLink } from 'lucide-react';

function PortfolioTab() {
  const { user, checkUserSession } = useAuth();
  
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('minimal');
  const [isPublic, setIsPublic] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);

  // Pre-fill local state with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setTheme(user.profile?.theme || 'minimal');
      setIsPublic(user.profile?.isPublic !== false);
    }
  }, [user]);

  const handleCopyLink = () => {
    const liveLink = `${window.location.origin}/portfolio/${username}`;
    navigator.clipboard.writeText(liveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/api/portfolio/settings', {
        username,
        theme,
        isPublic
      });
      
      // Reload user details in AuthContext
      await checkUserSession();
      setMessage({ type: 'success', text: 'Portfolio settings saved successfully!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred while saving portfolio settings.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const livePortfolioUrl = `${window.location.origin}/portfolio/${username}`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-bold text-white">Public Portfolio Settings</h2>
        <p className="text-sm text-slate-400">
          Customize your unique URL link, choose a portfolio template, and toggle visibility.
        </p>
      </div>

      {/* Main Glass Settings Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
        
        {/* Status Messages */}
        {message.text && (
          <div className={`flex items-start gap-3 p-3 rounded-lg text-xs animate-shake
            ${message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
              : 'bg-brand-error/10 border border-brand-error/25 text-brand-error'}`}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          
          {/* Custom Username Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Portfolio URL Slug
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-grow flex items-center bg-black/30 border border-white/10 rounded-lg overflow-hidden focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all duration-200">
                <span className="pl-4 pr-1 text-slate-500 text-sm select-none">
                  placemate.tech/portfolio/
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="your-name"
                  className="flex-grow pr-4 py-3 bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                  disabled={isSaving}
                  required
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Only lowercase letters, numbers, and hypens allowed. Must be unique.
            </p>
          </div>

          {/* Theme selection template picker */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Portfolio Template Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Theme 1: Minimal */}
              <div 
                onClick={() => setTheme('minimal')}
                className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-white/5
                  ${theme === 'minimal' 
                    ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10' 
                    : 'border-white/10 bg-black/20'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Theme 1</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
                    ${theme === 'minimal' ? 'border-brand-primary bg-brand-primary' : 'border-white/20'}`}
                  >
                    {theme === 'minimal' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>
                <h4 className="font-heading text-sm font-semibold text-slate-200">Minimal Slate</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Clean light-dark typography, slate tones, grid content structures.
                </p>
              </div>

              {/* Theme 2: Developer-Dark */}
              <div 
                onClick={() => setTheme('dark')}
                className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-white/5
                  ${theme === 'dark' 
                    ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10' 
                    : 'border-white/10 bg-black/20'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Theme 2</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
                    ${theme === 'dark' ? 'border-brand-primary bg-brand-primary' : 'border-white/20'}`}
                  >
                    {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>
                <h4 className="font-heading text-sm font-semibold text-slate-200">Terminal Neon</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Cyberpunk tech-inspired styling, glowing neon outlines, code block tags.
                </p>
              </div>

              {/* Theme 3: Bold */}
              <div 
                onClick={() => setTheme('bold')}
                className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-white/5
                  ${theme === 'bold' 
                    ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10' 
                    : 'border-white/10 bg-black/20'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Theme 3</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
                    ${theme === 'bold' ? 'border-brand-primary bg-brand-primary' : 'border-white/20'}`}
                  >
                    {theme === 'bold' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>
                <h4 className="font-heading text-sm font-semibold text-slate-200">Mesh Gradient</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Rich background color meshes, large typography, creative layouts.
                </p>
              </div>

            </div>
          </div>

          {/* Visibility toggle switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="text-brand-secondary shrink-0" size={20} />
              ) : (
                <EyeOff className="text-brand-error shrink-0" size={20} />
              )}
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Portfolio Visibility</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                  {isPublic 
                    ? 'Anyone with the link can view your portfolio.' 
                    : 'Your portfolio is hidden and return a 404 error page.'}
                </p>
              </div>
            </div>
            
            {/* Custom Toggle slider switch */}
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out outline-none
                ${isPublic ? 'bg-brand-secondary' : 'bg-slate-700'}`}
            >
              <div 
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                  ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
              ></div>
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 disabled:opacity-75 self-start active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* Copy Portfolio URL widget */}
      {isPublic && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Your Live Portfolio is Active</span>
            <span className="text-sm font-semibold text-white break-all">{livePortfolioUrl}</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/8 text-white transition-colors duration-150 cursor-pointer active:scale-[0.97]"
            >
              {copied ? <Check size={14} className="text-brand-secondary" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={`/portfolio/${username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary border border-brand-secondary/30 transition-colors duration-150 cursor-pointer text-decoration-none active:scale-[0.97]"
            >
              <ExternalLink size={14} />
              <span>View Portfolio</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioTab;
