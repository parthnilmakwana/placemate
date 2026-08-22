import React, { useState } from 'react';
import Button from '../../../components/Button';
import { Download, AlertTriangle, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { downloadExportData, deactivateAccount, deleteAccount } from '../../../services/settingsApi';
import { useNavigate } from 'react-router-dom';

function DataAccountTab() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Deactivate modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isGoogleAccount = Boolean(user?.googleId);

  const handleExport = async () => {
    try {
      setExporting(true);
      setFeedback({ type: '', message: '' });
      await downloadExportData();
      setFeedback({ type: 'success', message: 'Data export downloaded successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to export account data.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await deactivateAccount();
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Failed to deactivate account.');
      setDeactivating(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError('');

    try {
      await deleteAccount(confirmPassword);
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Data & Account</h2>
        <p className="text-xs text-text-muted">
          Manage your personal data and account status.
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
          <Button 
            variant="secondary" 
            size="sm" 
            className="shrink-0"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Preparing...' : 'Request Export'}
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
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0 border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate
            </Button>
          </div>

          <div className="w-full h-px bg-red-500/20"></div>

          <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-text-main">Delete Account</span>
              <span className="text-xs text-text-muted">Permanently delete your account and all associated data. This action cannot be undone.</span>
            </div>
            <Button 
              variant="danger" 
              size="sm" 
              className="shrink-0"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>

        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
                <AlertTriangle className="text-amber-400" size={20} />
                Deactivate Account
              </h4>
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="text-text-muted hover:text-text-main p-1"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Your profile and settings will be hidden. You will be logged out immediately. You can reactivate your account at any time by signing back in with your credentials.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeactivateModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? 'Deactivating...' : 'Confirm Deactivation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-brand-surface border border-red-500/40 rounded-xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={20} />
                Delete Account Permanently
              </h4>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-text-muted hover:text-text-main p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-text-muted leading-relaxed">
              This action is <strong className="text-red-400 font-semibold">irreversible</strong>. All your saved jobs, application history, portfolio drafts, and profile data will be permanently wiped.
            </p>

            {deleteError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDelete} className="flex flex-col gap-4">
              {!isGoogleAccount && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                    Enter your password to confirm
                  </label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isGoogleAccount}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="danger" 
                  size="sm" 
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default DataAccountTab;
