import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { fetchSettings, updateAccountSettings } from '../../../services/settingsApi';
import { CheckCircle2, AlertCircle, Lock } from 'lucide-react';

function AccountTab() {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  useEffect(() => {
    let isMounted = true;
    const loadAccountData = async () => {
      try {
        setLoading(true);
        const res = await fetchSettings();
        if (isMounted && res.data?.account) {
          const acc = res.data.account;
          
          // The production API currently falls back to `name` if `firstName` is missing.
          // We want to enforce Google-controlled names, so if it's a Google account and 
          // the firstName exactly matches the legacy user.name, it means the API fell back.
          // In this case, we treat it as empty so the user knows they need to re-login to sync.
          const isLegacyFallback = acc.isGoogleAccount && acc.firstName === acc.name && acc.lastName === '';
          
          setFirstName(isLegacyFallback ? '' : (acc.firstName || ''));
          setLastName(acc.lastName || '');
          setEmail(acc.email || '');
          setIsGoogleAccount(acc.isGoogleAccount || false);
        }
      } catch (err) {
        if (isMounted) {
          // Fallback to user context which now guarantees settings are populated
          setFirstName(user?.settings?.firstName || '');
          setLastName(user?.settings?.lastName || '');
          setEmail(user?.email || '');
          setIsGoogleAccount(Boolean(user?.googleId));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAccountData();
    return () => { isMounted = false; };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await updateAccountSettings({ firstName, lastName, email });
      if (res.user) {
        setUser(res.user);
      }
      setFeedback({ type: 'success', message: 'Account details saved successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update account details.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
          <h2 className="font-heading text-2xl font-bold text-text-main">Account Information</h2>
          <p className="text-xs text-text-muted">Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Account Information</h2>
        <p className="text-xs text-text-muted">
          Update your basic account details and email address.
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
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border p-6 flex flex-col gap-5 bg-brand-surface">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={`${labelClass} flex items-center gap-1.5`}>
                First Name {isGoogleAccount && <Lock size={12} className="text-brand-primary" title="Managed by Google" />}
              </label>
              <input 
                type="text" 
                placeholder="John" 
                className={inputClass} 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isGoogleAccount}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={`${labelClass} flex items-center gap-1.5`}>
                Last Name {isGoogleAccount && <Lock size={12} className="text-brand-primary" title="Managed by Google" />}
              </label>
              <input 
                type="text" 
                placeholder="Doe" 
                className={inputClass} 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isGoogleAccount}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Email Address</label>
            <input 
              type="email" 
              placeholder="john@example.com" 
              className={inputClass} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isGoogleAccount}
              required
            />
            {isGoogleAccount ? (
              <p className="text-[11px] text-brand-primary mt-1 flex items-center gap-1">
                Connected via Google OAuth. Email address managed by Google.
              </p>
            ) : (
              <p className="text-[11px] text-text-disabled mt-1">
                We will send a verification email if you change your address.
              </p>
            )}
          </div>
          
        </div>

        {!isGoogleAccount && (
          <div className="flex justify-end mt-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default AccountTab;
