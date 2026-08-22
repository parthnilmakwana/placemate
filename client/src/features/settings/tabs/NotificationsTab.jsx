import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { fetchSettings, updateNotificationSettings } from '../../../services/settingsApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function NotificationsTab() {
  const { user, setUser } = useAuth();
  const [jobRecommendations, setJobRecommendations] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const labelClass = "text-sm font-semibold text-text-main";
  const descClass = "text-xs text-text-muted mt-1";

  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetchSettings();
        if (isMounted && res.data?.notifications) {
          const notif = res.data.notifications;
          setJobRecommendations(Boolean(notif.jobRecommendations));
          setApplicationUpdates(Boolean(notif.applicationUpdates));
          setInterviewReminders(Boolean(notif.interviewReminders));
          setProductUpdates(Boolean(notif.productUpdates));
        }
      } catch (err) {
        if (isMounted && user?.settings?.notifications) {
          const notif = user.settings.notifications;
          setJobRecommendations(Boolean(notif.jobRecommendations));
          setApplicationUpdates(Boolean(notif.applicationUpdates));
          setInterviewReminders(Boolean(notif.interviewReminders));
          setProductUpdates(Boolean(notif.productUpdates));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNotifications();
    return () => { isMounted = false; };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    const payload = {
      jobRecommendations,
      applicationUpdates,
      interviewReminders,
      productUpdates
    };

    try {
      const res = await updateNotificationSettings(payload);

      if (user) {
        setUser({
          ...user,
          settings: {
            ...user.settings,
            notifications: res.data
          }
        });
      }

      setFeedback({ type: 'success', message: 'Notification preferences saved.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save notification preferences.' });
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
          <h2 className="font-heading text-2xl font-bold text-text-main">Notification Settings</h2>
          <p className="text-xs text-text-muted">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Notification Settings</h2>
        <p className="text-xs text-text-muted">
          Manage how you receive alerts and emails from PlaceMate.
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
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border px-6 py-2 bg-brand-surface">
          {renderToggle(
            'notif-jobs', 
            'Job Recommendations', 
            'Receive weekly emails with tailored job opportunities.',
            jobRecommendations,
            setJobRecommendations
          )}
          {renderToggle(
            'notif-apps', 
            'Application Updates', 
            'Get notified when employers view or update your applications.',
            applicationUpdates,
            setApplicationUpdates
          )}
          {renderToggle(
            'notif-interviews', 
            'Interview Reminders', 
            'Receive reminders 24 hours before your scheduled interviews.',
            interviewReminders,
            setInterviewReminders
          )}
          {renderToggle(
            'notif-product', 
            'Product Updates', 
            'Hear about new features, updates, and PlaceMate news.',
            productUpdates,
            setProductUpdates
          )}
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Notification Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NotificationsTab;
