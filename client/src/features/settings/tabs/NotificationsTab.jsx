import React from 'react';
import Button from '../../../components/Button';

function NotificationsTab() {
  const labelClass = "text-sm font-semibold text-text-main";
  const descClass = "text-xs text-text-muted mt-1";

  const renderToggle = (id, title, description, defaultChecked = true) => (
    <div className="flex items-start justify-between py-4 border-b border-brand-border/50 last:border-0">
      <div className="flex flex-col pr-4">
        <label htmlFor={id} className={labelClass}>{title}</label>
        <span className={descClass}>{description}</span>
      </div>
      <div className="shrink-0 mt-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id={id} className="sr-only peer" defaultChecked={defaultChecked} />
          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Notification Settings</h2>
        <p className="text-xs text-text-muted">
          Manage how you receive alerts and emails from PlaceMate.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border px-6 py-2 bg-brand-surface">
          {renderToggle(
            'notif-jobs', 
            'Job Recommendations', 
            'Receive weekly emails with tailored job opportunities.'
          )}
          {renderToggle(
            'notif-apps', 
            'Application Updates', 
            'Get notified when employers view or update your applications.',
            true
          )}
          {renderToggle(
            'notif-interviews', 
            'Interview Reminders', 
            'Receive reminders 24 hours before your scheduled interviews.',
            true
          )}
          {renderToggle(
            'notif-product', 
            'Product Updates', 
            'Hear about new features, updates, and PlaceMate news.',
            false
          )}
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary">
            Save Notification Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NotificationsTab;
