import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { api } from '../../services/api';

function AIGeneratorModal({ isOpen, onClose, onDraftGenerated }) {
  const [profession, setProfession] = useState('');
  const [style, setStyle] = useState('minimal');
  const [color, setColor] = useState('');
  const [goals, setGoals] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usage, setUsage] = useState({ remaining: null, maxGenerations: 2 });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
      setError(null);
    }
  }, [isOpen]);

  const fetchUsage = async () => {
    try {
      const response = await api.get('/api/portfolio/usage');
      setUsage({
        remaining: response.data.remaining,
        maxGenerations: response.data.maxGenerations
      });
    } catch (err) {
      console.error('Failed to fetch AI usage:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (usage.remaining <= 0) {
      setError('You have reached your daily limit for AI generations.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.post('/api/portfolio/generate', {
        profession,
        style,
        color,
        goals
      });
      
      onDraftGenerated(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
      fetchUsage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-primary" size={20} />
            <h3 className="font-heading text-lg font-bold text-white">AI Portfolio Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleGenerate} className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-error/10 border border-brand-error/25 text-brand-error text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profession / Title</label>
            <input 
              type="text" 
              placeholder="e.g. Full Stack Developer, UX Designer"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/30 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-brand-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Preferred Style</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/30 border border-slate-700 rounded-lg text-sm text-white focus:border-brand-primary focus:outline-none appearance-none"
            >
              <option value="minimal">Minimal Slate</option>
              <option value="dark">Terminal Neon</option>
              <option value="bold">Mesh Gradient</option>
              <option value="startup">Startup Founder</option>
              <option value="creative">Creative Designer</option>
              <option value="corporate">Corporate Engineer</option>
              <option value="glassmorphism">Glassmorphism</option>
              <option value="neon">Dark Neon</option>
              <option value="personal">Personal Brand</option>
              <option value="student">Student Portfolio</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Color Preferences (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Ocean Blue, Monochome, Vibrant"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/30 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Portfolio Goals (Optional)</label>
            <textarea 
              placeholder="e.g. I want to highlight my backend skills and leadership experience..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/30 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-brand-primary focus:outline-none resize-none h-20"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-2 pt-5 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              {usage.remaining !== null ? (
                <span><strong className="text-white">{usage.remaining}</strong> / {usage.maxGenerations} generations left today</span>
              ) : (
                <span>Loading limit...</span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isGenerating || usage.remaining === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Generating Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AIGeneratorModal;
