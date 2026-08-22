import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { Moon, Sun, Monitor, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchSettings, updateAppearanceSettings } from '../../../services/settingsApi';
import { applyTheme } from '../../../utils/theme';

function AppearanceTab() {
  const { user, setUser } = useAuth();
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const labelClass = "text-sm font-semibold text-text-main";

  useEffect(() => {
    let isMounted = true;
    const loadAppearanceData = async () => {
      try {
        setLoading(true);
        const res = await fetchSettings();
        if (isMounted && res.data?.appearance) {
          setTheme(res.data.appearance.theme || 'system');
          setLanguage(res.data.appearance.language || 'en');
        }
      } catch (err) {
        if (isMounted && user?.settings?.appearance) {
          setTheme(user.settings.appearance.theme || 'system');
          setLanguage(user.settings.appearance.language || 'en');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAppearanceData();
    return () => { isMounted = false; };
  }, [user]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await updateAppearanceSettings({ theme, language });
      applyTheme(theme);

      // Update local auth user state
      if (user) {
        setUser({
          ...user,
          settings: {
            ...user.settings,
            appearance: res.data
          }
        });
      }

      setFeedback({ type: 'success', message: 'Appearance preferences saved successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save appearance preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
          <h2 className="font-heading text-2xl font-bold text-text-main">Appearance</h2>
          <p className="text-xs text-text-muted">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Appearance</h2>
        <p className="text-xs text-text-muted">
          Customize how PlaceMate looks on your device.
        </p>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-md text-xs font-medium flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <label className={labelClass}>Theme Preference</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="cursor-pointer">
              <input 
                type="radio" 
                name="theme" 
                value="light" 
                checked={theme === 'light'} 
                onChange={() => handleThemeChange('light')}
                className="peer sr-only" 
              />
              <div className="rounded-lg border border-brand-border bg-brand-surface p-4 flex flex-col items-center gap-3 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 transition-all">
                <Sun size={24} className={theme === 'light' ? 'text-brand-primary' : 'text-text-muted'} />
                <span className="text-sm font-semibold text-text-main">Light</span>
              </div>
            </label>

            <label className="cursor-pointer">
              <input 
                type="radio" 
                name="theme" 
                value="dark" 
                checked={theme === 'dark'} 
                onChange={() => handleThemeChange('dark')}
                className="peer sr-only" 
              />
              <div className="rounded-lg border border-brand-border bg-brand-surface p-4 flex flex-col items-center gap-3 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 transition-all">
                <Moon size={24} className={theme === 'dark' ? 'text-brand-primary' : 'text-text-muted'} />
                <span className="text-sm font-semibold text-text-main">Dark</span>
              </div>
            </label>

            <label className="cursor-pointer">
              <input 
                type="radio" 
                name="theme" 
                value="system" 
                checked={theme === 'system'} 
                onChange={() => handleThemeChange('system')}
                className="peer sr-only" 
              />
              <div className="rounded-lg border border-brand-border bg-brand-surface p-4 flex flex-col items-center gap-3 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 transition-all">
                <Monitor size={24} className={theme === 'system' ? 'text-brand-primary' : 'text-text-muted'} />
                <span className="text-sm font-semibold text-text-main">System</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-brand-border/50">
          <label className={labelClass}>Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main text-sm focus:border-white focus:outline-none transition-colors"
          >
            <option value="en">English (US)</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AppearanceTab;
