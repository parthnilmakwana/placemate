import React from 'react';
import Button from '../../../components/Button';

function JobPreferencesTab() {
  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Job Preferences</h2>
        <p className="text-xs text-text-muted">
          Set your career goals to get better recommendations.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border p-6 flex flex-col gap-5 bg-brand-surface">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Preferred Roles</label>
              <input type="text" placeholder="e.g. Frontend Engineer, Full Stack" className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Preferred Locations</label>
              <input type="text" placeholder="e.g. New York, Remote" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Work Mode</label>
              <select className={inputClass}>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Employment Type</label>
              <select className={inputClass}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Experience Level</label>
              <select className={inputClass}>
                <option>Entry-level</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Executive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Expected Salary (USD)</label>
              <input type="text" placeholder="$100,000" className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Job Search Status</label>
              <select className={inputClass}>
                <option>Actively looking</option>
                <option>Open to offers</option>
                <option>Not looking</option>
              </select>
            </div>
          </div>
          
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

export default JobPreferencesTab;
