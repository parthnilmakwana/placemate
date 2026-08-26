import React, { useState, useEffect } from 'react';
import { profilesApi } from '../../services/profilesApi';
import { Plus, Copy, Trash2, Edit3, Star, Loader, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import ProfileEditor from './ProfileEditor';

export default function ProfileTab() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingProfileId, setEditingProfileId] = useState(null);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const res = await profilesApi.getProfiles();
      setProfiles(res.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profiles.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!editingProfileId) {
      fetchProfiles();
    }
  }, [editingProfileId]);

  const handleCreateProfile = async () => {
    try {
      const res = await profilesApi.createProfile({
        fullName: 'New Profile',
      });
      setEditingProfileId(res.data._id);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create profile.' });
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await profilesApi.duplicateProfile(id);
      fetchProfiles();
      setMessage({ type: 'success', text: 'Profile duplicated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to duplicate profile.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    try {
      await profilesApi.deleteProfile(id);
      fetchProfiles();
      setMessage({ type: 'success', text: 'Profile deleted successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete profile.' });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await profilesApi.setDefaultProfile(id);
      fetchProfiles();
      setMessage({ type: 'success', text: 'Default profile updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to set default profile.' });
    }
  };

  if (editingProfileId) {
    return (
      <ProfileEditor 
        profileId={editingProfileId} 
        onBack={() => setEditingProfileId(null)} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border pb-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main">Profile Manager</h2>
          <p className="text-xs md:text-sm text-text-muted">
            Manage your master Owner Profile or create Custom Profiles for specific jobs and industries.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateProfile}>
          <Plus size={16} className="mr-2" />
          Create Profile
        </Button>
      </div>

      {message.text && (
        <div className={`flex items-start gap-3 p-4 rounded-md text-xs
          ${message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-status-success' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader size={24} className="animate-spin text-text-muted" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profiles.map(profile => (
            <div key={profile._id} className="bg-brand-surface border border-brand-border rounded-lg p-5 flex flex-col gap-4 relative hover:border-brand-primary transition-colors">
              {profile.isDefault && (
                <div className="absolute top-4 right-4 bg-brand-primary/20 text-brand-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Default
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg font-bold text-text-main">{profile.fullName}</h3>
                <p className="text-sm text-text-secondary">{profile.title || 'No Title Set'}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${profile.profileType === 'OWNER' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                    {profile.profileType}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-brand-border flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingProfileId(profile._id)}>
                  <Edit3 size={14} className="mr-1.5" /> Edit
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(profile._id)} title="Duplicate">
                  <Copy size={14} />
                </Button>

                {!profile.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => handleSetDefault(profile._id)} title="Set as Default">
                    <Star size={14} />
                  </Button>
                )}

                {profile.profileType !== 'OWNER' && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(profile._id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto" title="Delete">
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
