import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import CustomSelect from '../../../components/CustomSelect';
import { useAuth } from '../../../context/AuthContext';
import { fetchSettings, updateJobPreferencesSettings } from '../../../services/settingsApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function JobPreferencesTab() {
  const { user, setUser } = useAuth();
  const [preferredRoles, setPreferredRoles] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [workMode, setWorkMode] = useState('any');
  const [employmentType, setEmploymentType] = useState('Any');
  const [experienceLevel, setExperienceLevel] = useState('any');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [jobSearchStatus, setJobSearchStatus] = useState('Actively looking');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  const workModeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
    { value: 'any', label: 'Any Work Mode' },
  ];

  const employmentTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Any', label: 'Any Employment Type' },
  ];

  const experienceLevelOptions = [
    { value: 'fresher', label: 'Entry-level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-level' },
    { value: 'senior', label: 'Senior' },
    { value: 'any', label: 'Any Experience Level' },
  ];

  const jobSearchStatusOptions = [
    { value: 'Actively looking', label: 'Actively looking' },
    { value: 'Open to offers', label: 'Open to offers' },
    { value: 'Not looking', label: 'Not looking' },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const res = await fetchSettings();
        if (isMounted && res.data?.jobPreferences) {
          const pref = res.data.jobPreferences;
          setPreferredRoles(pref.preferredRoles || '');
          setPreferredLocations(pref.preferredLocations || '');
          setWorkMode(pref.workMode || 'any');
          setEmploymentType(pref.employmentType || 'Any');
          setExperienceLevel(pref.experienceLevel || 'any');
          setMinSalary(pref.minSalary ? String(pref.minSalary) : '');
          setMaxSalary(pref.maxSalary ? String(pref.maxSalary) : '');
          setJobSearchStatus(pref.jobSearchStatus || 'Actively looking');
        }
      } catch (err) {
        if (isMounted && user?.profile?.preferences) {
          const pref = user.profile.preferences;
          setPreferredRoles((pref.targetRoles || []).join(', '));
          setPreferredLocations((pref.targetLocations || []).join(', '));
          setWorkMode(pref.remotePreference || 'any');
          setEmploymentType(pref.jobType || 'Any');
          setExperienceLevel(pref.experienceLevel || 'any');
          setMinSalary(pref.minimumSalary ? String(pref.minimumSalary) : '');
          setMaxSalary(pref.maximumSalary ? String(pref.maximumSalary) : '');
          setJobSearchStatus(pref.jobSearchStatus || 'Actively looking');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPreferences();
    return () => { isMounted = false; };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    // Client side salary validation
    const numMin = minSalary ? Number(minSalary) : 0;
    const numMax = maxSalary ? Number(maxSalary) : 0;

    if (numMax > 0 && numMin > numMax) {
      setFeedback({ type: 'error', message: 'Minimum salary cannot be greater than maximum salary.' });
      setSaving(false);
      return;
    }

    try {
      const res = await updateJobPreferencesSettings({
        preferredRoles,
        preferredLocations,
        workMode,
        employmentType,
        experienceLevel,
        minSalary: numMin,
        maxSalary: numMax,
        jobSearchStatus
      });

      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            preferences: {
              ...user.profile?.preferences,
              targetRoles: preferredRoles.split(',').map(r => r.trim()).filter(Boolean),
              targetLocations: preferredLocations.split(',').map(l => l.trim()).filter(Boolean),
              remotePreference: workMode,
              jobType: employmentType,
              experienceLevel,
              minimumSalary: numMin,
              maximumSalary: numMax,
              jobSearchStatus
            }
          }
        });
      }

      setFeedback({ type: 'success', message: 'Job preferences saved and integrated with recommendation system.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save job preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
          <h2 className="font-heading text-2xl font-bold text-text-main">Job Preferences</h2>
          <p className="text-xs text-text-muted">Loading job preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Job Preferences</h2>
        <p className="text-xs text-text-muted">
          Set your career goals to get better job recommendations.
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
        <div className="structured-panel rounded-lg relative border border-brand-border p-6 flex flex-col gap-5 bg-brand-surface">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Preferred Roles</label>
              <input 
                type="text" 
                placeholder="e.g. Frontend Engineer, Full Stack" 
                className={inputClass}
                value={preferredRoles}
                onChange={(e) => setPreferredRoles(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Preferred Locations</label>
              <input 
                type="text" 
                placeholder="e.g. New York, Remote" 
                className={inputClass} 
                value={preferredLocations}
                onChange={(e) => setPreferredLocations(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Work Mode</label>
              <CustomSelect 
                options={workModeOptions}
                value={workMode}
                onChange={(val) => setWorkMode(val)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Employment Type</label>
              <CustomSelect 
                options={employmentTypeOptions}
                value={employmentType}
                onChange={(val) => setEmploymentType(val)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Experience Level</label>
              <CustomSelect 
                options={experienceLevelOptions}
                value={experienceLevel}
                onChange={(val) => setExperienceLevel(val)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Minimum Salary (USD)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-muted font-semibold text-sm select-none">$</span>
                <input 
                  type="number" 
                  placeholder="60000" 
                  className={`${inputClass} pl-8`} 
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Maximum Salary (USD)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-muted font-semibold text-sm select-none">$</span>
                <input 
                  type="number" 
                  placeholder="120000" 
                  className={`${inputClass} pl-8`} 
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Job Search Status</label>
              <CustomSelect 
                options={jobSearchStatusOptions}
                value={jobSearchStatus}
                onChange={(val) => setJobSearchStatus(val)}
              />
            </div>
          </div>
          
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default JobPreferencesTab;
