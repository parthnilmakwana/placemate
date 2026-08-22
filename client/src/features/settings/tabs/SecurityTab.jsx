import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { Key, Smartphone, Monitor, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { 
  changePasswordSettings, 
  fetchSessions, 
  revokeSession, 
  logoutAllOtherSessions 
} from '../../../services/settingsApi';

function SecurityTab() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  const isGoogleAccount = Boolean(user?.googleId);

  const loadActiveSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await fetchSessions();
      if (res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err.message);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSessions();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordFeedback({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      setPasswordSaving(false);
      return;
    }

    try {
      await changePasswordSettings({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPasswordFeedback({ type: 'success', message: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      setSessionActionLoading(true);
      await revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      alert(err.message || 'Failed to revoke session.');
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleLogoutAllOther = async () => {
    try {
      setSessionActionLoading(true);
      await logoutAllOtherSessions();
      setSessions(prev => prev.filter(s => s.isCurrent));
    } catch (err) {
      alert(err.message || 'Failed to log out of other sessions.');
    } finally {
      setSessionActionLoading(false);
    }
  };

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

        {passwordFeedback.message && (
          <div className={`p-4 rounded-md text-xs font-medium flex items-center gap-2 ${
            passwordFeedback.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {passwordFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        {isGoogleAccount && (
          <div className="p-4 rounded-lg bg-brand-surface border border-brand-border text-xs text-text-muted flex items-center gap-2">
            <ShieldAlert size={16} className="text-brand-primary shrink-0" />
            <span>Your account uses Google OAuth. You can set a password if you wish to log in via email as well.</span>
          </div>
        )}

        <form className="structured-panel rounded-lg overflow-hidden border border-brand-border p-6 flex flex-col gap-5 bg-brand-surface" onSubmit={handlePasswordSubmit}>
          {!isGoogleAccount && (
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={inputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={!isGoogleAccount}
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button type="submit" variant="secondary" size="sm" disabled={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Update Password'}
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
          <Button variant="outline" size="sm" onClick={() => alert('2FA integration coming in future release.')}>
            Enable 2FA
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Add an extra layer of security to your account by requiring a verification code when you sign in.
        </p>
      </div>

      {/* Active Sessions */}
      <div className="flex flex-col gap-4 pt-4 border-t border-brand-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Monitor size={16} className="text-brand-primary" />
            Active Sessions
          </h3>
          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogoutAllOther}
              disabled={sessionActionLoading}
              className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              Log out of all other sessions
            </Button>
          )}
        </div>

        {sessionsLoading ? (
          <p className="text-xs text-text-muted">Loading active sessions...</p>
        ) : (
          <div className="structured-panel rounded-lg overflow-hidden border border-brand-border bg-brand-surface divide-y divide-brand-border/50">
            {sessions.length === 0 ? (
              <div className="p-4 text-xs text-text-muted">No active sessions tracked.</div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-main">{session.device}</span>
                    <span className="text-xs text-text-muted">
                      {session.ipAddress} • {session.isCurrent ? 'Active now' : `Last active ${new Date(session.lastActive).toLocaleDateString()}`}
                    </span>
                  </div>
                  {session.isCurrent ? (
                    <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-2 py-1 rounded">
                      Current Session
                    </span>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={sessionActionLoading}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}

export default SecurityTab;
