import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { profilesApi } from '../services/profilesApi';
import { Loader2, ChevronDown, Check, User, UserCheck, Plus, ExternalLink } from 'lucide-react';

export default function ProfileSelector({ selectedProfileId, onChange }) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profilesApi.getProfiles();
        const profileList = res.data || [];
        setProfiles(profileList);
        
        // Auto-select if none selected
        if (!selectedProfileId && profileList.length > 0) {
          const defaultProfile = profileList.find(p => p.isDefault) || profileList[0];
          onChange(defaultProfile._id, defaultProfile);
        }
      } catch (err) {
        console.error('Failed to load profiles for selector:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [selectedProfileId, onChange]);

  // Handle clicking outside to close custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProfile = profiles.find(p => p._id === selectedProfileId) || profiles[0];

  const handleSelect = (profile) => {
    onChange(profile._id, profile);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
          Active User Profile
        </label>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-primary border border-border-subtle text-text-muted text-sm animate-pulse">
          <Loader2 size={16} className="animate-spin text-brand-primary" />
          <span>Loading profiles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
          <UserCheck size={13} className="text-brand-primary" />
          <span>Active User Profile</span>
        </label>
        {profiles.length > 0 && (
          <span className="text-[11px] text-text-muted">
            {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} available
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl bg-surface-primary border transition-all duration-200 text-left flex items-center justify-between gap-3 group shadow-sm hover:shadow-md ${
          isOpen
            ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-surface-elevated'
            : 'border-border-subtle hover:border-border-strong hover:bg-surface-elevated'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <User size={16} className="text-brand-primary" />
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-main truncate">
                {activeProfile?.fullName || 'Select a Profile'}
              </span>
              {activeProfile && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                  activeProfile.profileType === 'OWNER' || activeProfile.isDefault
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {activeProfile.profileType === 'OWNER' || activeProfile.isDefault ? 'Owner' : 'Custom'}
                </span>
              )}
            </div>
            <span className="text-xs text-text-muted truncate">
              {activeProfile?.title || activeProfile?.email || 'No title set'}
            </span>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-primary' : 'group-hover:text-text-main'
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl bg-surface-primary border border-border-strong shadow-2xl overflow-hidden backdrop-blur-2xl animate-fade-in divide-y divide-border-subtle">
          <div className="max-h-56 overflow-y-auto p-1.5 dropdown-scrollbar flex flex-col gap-1">
            {profiles.map((p) => {
              const isSelected = p._id === activeProfile?._id;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`w-full px-3 py-2.5 rounded-lg text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-brand-primary/10 text-text-main font-medium border border-brand-primary/30'
                      : 'hover:bg-surface-elevated text-text-secondary hover:text-text-main border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-surface-elevated text-text-muted'
                    }`}>
                      <User size={14} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-main truncate">
                          {p.fullName}
                        </span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${
                          p.profileType === 'OWNER' || p.isDefault
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {p.profileType === 'OWNER' || p.isDefault ? 'Owner' : 'Custom'}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted truncate">
                        {p.title || p.email || 'Developer Profile'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-brand-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Shortcut to Profile Management */}
          <Link
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 bg-bg-sidebar/80 hover:bg-surface-elevated text-xs text-brand-primary font-medium transition-colors group"
          >
            <span className="flex items-center gap-1.5">
              <Plus size={13} className="group-hover:scale-110 transition-transform" />
              Manage or Add Profiles
            </span>
            <ExternalLink size={12} className="text-text-muted group-hover:text-brand-primary transition-colors" />
          </Link>
        </div>
      )}
    </div>
  );
}
