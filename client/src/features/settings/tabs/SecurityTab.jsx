import React from 'react';
import Button from '../../../components/Button';
import { Key, Smartphone, Monitor } from 'lucide-react';

function SecurityTab() {
  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Security</h2>
        <p className="text-xs text-text-muted">
          Manage your password and secure your account.
        </p>
      </div>

      {/* Change Password */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <Key size={16} className="text-brand-primary" />
          Change Password
        </h3>
        <form className="structured-panel rounded-lg overflow-hidden border border-brand-border p-6 flex flex-col gap-5 bg-brand-surface" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Current Password</label>
            <input type="password" placeholder="••••••••" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>New Password</label>
              <input type="password" placeholder="••••••••" className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" placeholder="••••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button type="submit" variant="secondary" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="flex flex-col gap-4 pt-4 border-t border-brand-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Smartphone size={16} className="text-brand-primary" />
            Two-Factor Authentication (2FA)
          </h3>
          <Button variant="outline" size="sm">Enable 2FA</Button>
        </div>
        <p className="text-xs text-text-muted">
          Add an extra layer of security to your account by requiring a verification code when you sign in.
        </p>
      </div>

      {/* Active Sessions */}
      <div className="flex flex-col gap-4 pt-4 border-t border-brand-border/50">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <Monitor size={16} className="text-brand-primary" />
          Active Sessions
        </h3>
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border bg-brand-surface divide-y divide-brand-border/50">
          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-main">Mac OS • Chrome</span>
              <span className="text-xs text-text-muted">New York, USA • Active now</span>
            </div>
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-2 py-1 rounded">Current</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-main">iOS • Safari</span>
              <span className="text-xs text-text-muted">New York, USA • Last active 2 hours ago</span>
            </div>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              Revoke
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default SecurityTab;
