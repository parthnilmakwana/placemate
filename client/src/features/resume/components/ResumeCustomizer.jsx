import React from 'react';
import { Palette, Type, LayoutTemplate } from 'lucide-react';

const ResumeCustomizer = ({ settings, setSettings }) => {
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const colors = [
    { name: 'Slate', value: '#1e293b', secondary: '#4f46e5' },
    { name: 'Navy', value: '#0f172a', secondary: '#3b82f6' },
    { name: 'Forest', value: '#14532d', secondary: '#16a34a' },
    { name: 'Burgundy', value: '#4c0519', secondary: '#e11d48' },
    { name: 'Teal', value: '#134e4a', secondary: '#0d9488' },
  ];

  const fonts = [
    { name: 'Inter (Modern)', value: 'Inter' },
    { name: 'Roboto (Classic)', value: 'Roboto' },
    { name: 'Merriweather (Serif)', value: 'Merriweather' },
  ];

  const themes = [
    { id: 'modern', name: 'Modern Professional' },
    { id: 'minimal', name: 'Minimal Clean' },
    { id: 'executive', name: 'Executive Corporate' },
    { id: 'software', name: 'Software Engineer' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-5 shadow-xl">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
        <LayoutTemplate size={14} className="text-brand-secondary" />
        <span>Resume Customization</span>
      </h3>

      {/* Theme Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Style</label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => updateSetting('themeId', t.id)}
              className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-colors border
                ${settings.themeId === t.id 
                  ? 'bg-brand-primary/20 border-brand-primary text-white' 
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Type size={12} /> Typography
        </label>
        <div className="flex flex-wrap gap-2">
          {fonts.map(f => (
            <button
              key={f.value}
              onClick={() => updateSetting('fontFamily', f.value)}
              style={{ fontFamily: f.value }}
              className={`py-1.5 px-3 rounded-md text-xs transition-colors border
                ${settings.fontFamily === f.value 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={12} /> Color Scheme
        </label>
        <div className="flex flex-wrap gap-3 mt-1">
          {colors.map(c => (
            <button
              key={c.value}
              onClick={() => {
                updateSetting('primaryColor', c.value);
                updateSetting('secondaryColor', c.secondary);
              }}
              title={c.name}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform border-2
                ${settings.primaryColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: c.value }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.secondary }} />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ResumeCustomizer;
