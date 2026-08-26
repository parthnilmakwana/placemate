import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../../components/Button';
import CustomSelect from '../../components/CustomSelect';

function AIGeneratorModal({ isOpen, onClose, onDraftGenerated }) {
  const [profession, setProfession] = useState('');
  const [style, setStyle] = useState('minimal');
  const [color, setColor] = useState('');
  const [goals, setGoals] = useState('');

  const styleOptions = [
    { value: 'minimal', label: 'Minimal Slate' },
    { value: 'dark', label: 'Terminal Neon' },
    { value: 'bold', label: 'Mesh Gradient' },
    { value: 'startup', label: 'Startup Founder' },
    { value: 'creative', label: 'Creative Designer' },
    { value: 'corporate', label: 'Corporate Engineer' },
    { value: 'glassmorphism', label: 'Glassmorphism' },
    { value: 'neon', label: 'Dark Neon' },
    { value: 'personal', label: 'Personal Brand' },
    { value: 'student', label: 'Student Portfolio' },
  ];
  
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
      <div className="bg-surface-primary border border-border-strong rounded-lg w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-sidebar">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-primary" size={20} />
            <h3 className="font-heading text-lg font-bold text-text-main">AI Portfolio Generator</h3>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-1!">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleGenerate} className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-status-error/10 border border-status-error/20 text-status-error text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Profession / Title</label>
            <input 
              type="text" 
              placeholder="e.g. Full Stack Developer, UX Designer"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-elevated border border-border-subtle rounded-md text-sm text-text-main placeholder-text-disabled focus:border-brand-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Preferred Style</label>
            <CustomSelect 
              options={styleOptions}
              value={style}
              onChange={(val) => setStyle(val)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Color Preferences (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Ocean Blue, Monochome, Vibrant"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-elevated border border-border-subtle rounded-md text-sm text-text-main placeholder-text-disabled focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Portfolio Goals (Optional)</label>
            <textarea 
              placeholder="e.g. I want to highlight my backend skills and leadership experience..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-elevated border border-border-subtle rounded-md text-sm text-text-main placeholder-text-disabled focus:border-brand-primary focus:outline-none resize-none h-20"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-2 pt-5 border-t border-border-subtle">
            <div className="text-xs text-text-muted">
              {usage.remaining !== null ? (
                <span><strong className="text-text-main">{usage.remaining}</strong> / {usage.maxGenerations} generations left today</span>
              ) : (
                <span>Loading limit...</span>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={isGenerating || usage.remaining === 0}
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  <span>Generating Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AIGeneratorModal;
