import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { fetchSettings, updatePrivacySettings } from '../../../services/settingsApi';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function PrivacyTab() {
  const { user, setUser } = useAuth();
  const [recruiterVisibility, setRecruiterVisibility] = useState(true);
  const [contactVisibility, setContactVisibility] = useState(false);
  const [searchEngineVisibility, setSearchEngineVisibility] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const labelClass = "text-sm font-semibold text-text-main";
  const descClass = "text-xs text-text-muted mt-1";

  useEffect(() => {
    let isMounted = true;
    const loadPrivacy = async () => {
      try {
        setLoading(true);
        const res = await fetchSettings();
        if (isMounted && res.data?.privacy) {
          const priv = res.data.privacy;
          setRecruiterVisibility(Boolean(priv.recruiterVisibility));
          setSearchEngineVisibility(Boolean(priv.searchEngineVisibility));
          setContactVisibility(Boolean(priv.contactVisibility));
        }
      } catch (err) {
        if (isMounted && user?.settings?.privacy) {
          const priv = user.settings.privacy;
          setRecruiterVisibility(Boolean(priv.recruiterVisibility));
          setSearchEngineVisibility(Boolean(priv.searchEngineVisibility));
          setContactVisibility(Boolean(priv.contactVisibility));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPrivacy();
    return () => { isMounted = false; };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    const payload = {
      recruiterVisibility,
      searchEngineVisibility,
      contactVisibility
    };

    try {
      const res = await updatePrivacySettings(payload);

      if (user) {
        setUser({
          ...user,
          settings: {
            ...user.settings,
            privacy: res.data
          }
        });
      }

      setFeedback({ type: 'success', message: 'Privacy settings saved.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save privacy settings.' });
    } finally {
      setSaving(false);
    }
  };

  const renderToggle = (id, title, description, checked, onChange) => (
    <div className="flex items-start justify-between py-4 border-b border-brand-border/50 last:border-0">
      <div className="flex flex-col pr-4">
        <label htmlFor={id} className={labelClass}>{title}</label>
        <span className={descClass}>{description}</span>
      </div>
      <div className="shrink-0 mt-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            id={id} 
            className="sr-only peer" 
            checked={checked} 
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
          <h2 className="font-heading text-2xl font-bold text-text-main">Privacy Controls</h2>
          <p className="text-xs text-text-muted">Loading privacy controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Privacy Controls</h2>
        <p className="text-xs text-text-muted">
          Manage who can see your profile and contact information.
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

      {/* Notice about Portfolio Visibility */}
      <div className="p-4 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-text-main">Portfolio Public / Private Status</span>
          <span className="text-xs text-text-muted mt-0.5">
            Public portfolio accessibility is managed in Portfolio Settings.
          </span>
        </div>
        <Link 
          to="/dashboard/portfolio" 
          className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
        >
          Manage Portfolio <ExternalLink size={12} />
        </Link>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border px-6 py-2 bg-brand-surface">
          {renderToggle(
            'privacy-recruiter', 
            'Recruiter Visibility', 
            'Allow verified recruiters on PlaceMate to find your profile.',
            recruiterVisibility,
            setRecruiterVisibility
          )}
          {renderToggle(
            'privacy-contact', 
            'Contact Visibility', 
            'Show your contact email on your public portfolio.',
            contactVisibility,
            setContactVisibility
          )}
          {renderToggle(
            'privacy-search', 
            'Search Engine Visibility', 
            'Allow search engines like Google to index your public portfolio.',
            searchEngineVisibility,
            setSearchEngineVisibility
          )}
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PrivacyTab;
