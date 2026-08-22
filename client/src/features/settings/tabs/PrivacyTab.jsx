import React from 'react';
import Button from '../../../components/Button';

function PrivacyTab() {
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
        <h2 className="font-heading text-2xl font-bold text-text-main">Privacy Controls</h2>
        <p className="text-xs text-text-muted">
          Manage who can see your profile and contact information.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border px-6 py-2 bg-brand-surface">
          {renderToggle(
            'privacy-profile', 
            'Public Profile Visibility', 
            'Allow your portfolio to be viewed by anyone with the link.'
          )}
          {renderToggle(
            'privacy-recruiter', 
            'Recruiter Visibility', 
            'Allow verified recruiters on PlaceMate to find your profile.',
            true
          )}
          {renderToggle(
            'privacy-contact', 
            'Contact Visibility', 
            'Show your email address on your public portfolio.',
            false
          )}
          {renderToggle(
            'privacy-search', 
            'Search Engine Visibility', 
            'Allow search engines like Google to index your public portfolio.',
            false
          )}
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary">
            Save Privacy Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PrivacyTab;
