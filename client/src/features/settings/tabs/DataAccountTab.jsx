import React from 'react';
import Button from '../../../components/Button';
import { Download, AlertTriangle } from 'lucide-react';

function DataAccountTab() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Data & Account</h2>
        <p className="text-xs text-text-muted">
          Manage your personal data and account status.
        </p>
      </div>

      {/* Export Data */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <Download size={16} className="text-brand-primary" />
          Export Data
        </h3>
        <div className="structured-panel rounded-lg border border-brand-border p-6 flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center bg-brand-surface">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text-main">Download your account data</span>
            <span className="text-xs text-text-muted">Get a copy of your profile, job preferences, and application history in JSON format.</span>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0">
            Request Export
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="flex flex-col gap-4 pt-6 border-t border-brand-border/50">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <AlertTriangle size={16} />
          Danger Zone
        </h3>
        
        <div className="structured-panel rounded-lg border border-red-500/30 p-6 flex flex-col gap-6 bg-red-500/5">
          
          <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-text-main">Deactivate Account</span>
              <span className="text-xs text-text-muted">Temporarily hide your profile. You can reactivate it anytime by logging back in.</span>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 border-red-500/50 text-red-400 hover:bg-red-500/10">
              Deactivate
            </Button>
          </div>

          <div className="w-full h-px bg-red-500/20"></div>

          <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-text-main">Delete Account</span>
              <span className="text-xs text-text-muted">Permanently delete your account and all associated data. This action cannot be undone.</span>
            </div>
            <Button variant="danger" size="sm" className="shrink-0">
              Delete Account
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default DataAccountTab;
