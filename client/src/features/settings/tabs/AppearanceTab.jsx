import React from 'react';
import Button from '../../../components/Button';
import { Moon, Sun, Monitor } from 'lucide-react';

function AppearanceTab() {
  const labelClass = "text-sm font-semibold text-text-main";
  
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Appearance</h2>
        <p className="text-xs text-text-muted">
          Customize how PlaceMate looks on your device.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-3">
          <label className={labelClass}>Theme Preference</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="cursor-pointer">
              <input type="radio" name="theme" value="light" className="peer sr-only" />
              <div className="rounded-lg border border-brand-border bg-brand-surface p-4 flex flex-col items-center gap-3 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 transition-all">
                <Sun size={24} className="text-text-muted peer-checked:text-brand-primary" />
                <span className="text-sm font-semibold text-text-main">Light</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="theme" value="dark" className="peer sr-only" defaultChecked />
              <div className="rounded-lg border border-brand-border bg-brand-surface p-4 flex flex-col items-center gap-3 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 transition-all">
                <Moon size={24} className="text-text-muted peer-checked:text-brand-primary" />
                <span className="text-sm font-semibold text-text-main">Dark</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="theme" value="system" className="peer sr-only" />
              <div className="rounded-lg border border-brand-border bg-brand-surface p-4 flex flex-col items-center gap-3 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 transition-all">
                <Monitor size={24} className="text-text-muted peer-checked:text-brand-primary" />
                <span className="text-sm font-semibold text-text-main">System</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-brand-border/50">
          <label className={labelClass}>Language</label>
          <select className="w-full md:w-1/2 px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main text-sm focus:border-white focus:outline-none transition-colors">
            <option value="en">English (US)</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AppearanceTab;
