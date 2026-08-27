import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Eye, Activity, Target, Download, MoreVertical, Upload, Type, UserCheck, X } from 'lucide-react';

const EditorHeader = ({
  profile,
  profilesList = [],
  onSelectProfile,
  onCreateProfile,
  isSaving,
  rightPanelMode,
  setRightPanelMode,
  setShowRightPanelMobile,
  activeFont = 'Inter',
  setActiveFont,
  handleDownload,
  isDownloading,
  handleImport,
  isImporting
}) => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showProfilePicker, setShowProfilePicker] = useState(false);

  const handlePanelChange = (mode) => {
    setRightPanelMode(mode);
    if (setShowRightPanelMobile) {
      setShowRightPanelMobile(true);
    }
  };

  const typographyList = [
    { id: 'Inter', fontName: 'Inter', styleLabel: 'Sans-Serif' },
    { id: 'Roboto', fontName: 'Roboto', styleLabel: 'ATS Standard' },
    { id: 'Merriweather', fontName: 'Merriweather', styleLabel: 'Formal Serif' },
    { id: 'FiraCode', fontName: 'Fira Code', styleLabel: 'Code Mono' }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-brand-surface border-b border-brand-border shrink-0 relative z-50 shadow-xs">
      
      {/* Left: Navigation and Title */}
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard/resume" 
          className="p-1.5 text-text-secondary hover:text-text-main hover:bg-brand-surface-hover rounded transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowProfilePicker(!showProfilePicker)}
                className="flex items-center gap-1.5 hover:bg-brand-surface-hover px-2 py-1 rounded transition-colors -ml-2 text-left"
              >
                <h1 className="text-sm font-semibold text-text-main truncate max-w-44 sm:max-w-xs">
                  {profile?.fullName ? `${profile.fullName}'s Resume` : 'Resume Editor'}
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {profile?.profileType === 'OWNER' ? 'Primary' : 'Custom'}
                </span>
                <span className="text-text-muted text-[10px]">▼</span>
              </button>

              {/* Profile Selector Popover Dropdown */}
              {showProfilePicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfilePicker(false)} />
                  <div className="absolute left-0 top-full mt-2 z-50 w-70 bg-brand-surface border-2 border-brand-border rounded-xl shadow-2xl p-3 flex flex-col gap-1.5 animate-fade-in ring-1 ring-black/20">
                    <div className="px-3 py-1.5 border-b border-brand-border/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Select Profile</span>
                      <button onClick={() => setShowProfilePicker(false)} className="text-text-muted hover:text-text-main p-0.5">
                        <X size={14} />
                      </button>
                    </div>
                    {profilesList.length > 0 ? (
                      profilesList.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            if (onSelectProfile) onSelectProfile(p);
                            setShowProfilePicker(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                            profile?._id === p._id
                              ? 'text-brand-primary bg-brand-primary/10 font-semibold'
                              : 'text-text-secondary hover:bg-brand-surface-hover hover:text-text-main'
                          }`}
                        >
                          <span className="truncate">{p.fullName || p.profileName || 'Untitled Profile'}</span>
                          {profile?._id === p._id && <Check size={14} />}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-text-muted">No additional profiles</div>
                    )}
                    <div className="border-t border-brand-border/50 my-1"></div>
                    <button
                      onClick={() => {
                        if (onCreateProfile) onCreateProfile();
                        setShowProfilePicker(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                    >
                      + Create Custom Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Save Status */}
      <div className="hidden sm:flex items-center justify-center flex-1">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isSaving ? (
            <>
              <Loader2 size={14} className="text-brand-primary animate-spin" />
              <span className="text-text-secondary">Saving...</span>
            </>
          ) : (
            <>
              <Check size={14} className="text-status-success" />
              <span className="text-text-secondary">Saved</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Right Panel Toggles */}
        <div className="flex items-center bg-brand-bg rounded-lg p-0.5 border border-brand-border">
          <button 
            onClick={() => handlePanelChange('preview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${rightPanelMode === 'preview' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-brand-surface-hover'}`}
          >
            <Eye size={14} />
            <span className="hidden xl:inline">Preview</span>
          </button>
          <button 
            onClick={() => handlePanelChange('ats')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${rightPanelMode === 'ats' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-brand-surface-hover'}`}
          >
            <Activity size={14} />
            <span className="hidden xl:inline">ATS</span>
          </button>
          <button 
            onClick={() => handlePanelChange('match')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${rightPanelMode === 'match' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-brand-surface-hover'}`}
          >
            <Target size={14} />
            <span className="hidden xl:inline">Job Match</span>
          </button>
        </div>

        <div className="w-px h-6 bg-brand-border mx-1"></div>

        {/* Typography Selector Button */}
        <div className="relative">
          <button 
            onClick={() => setShowTemplatePicker(!showTemplatePicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-surface border border-brand-border rounded-lg hover:bg-brand-surface-hover transition-all text-text-main shadow-xs"
            title="Select Resume Typography / Font"
          >
            <Type size={14} className="text-brand-primary" />
            <span>{activeFont}</span>
            <span className="text-text-muted text-[10px]">▼</span>
          </button>

          {/* Typography Selector Popover Dropdown */}
          {showTemplatePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTemplatePicker(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-brand-surface border-2 border-brand-primary/40 rounded-xl shadow-2xl p-3.5 flex flex-col gap-2.5 animate-fade-in ring-1 ring-black/20">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Type size={14} className="text-brand-primary" />
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">Select Typography</span>
                  </div>
                  <button onClick={() => setShowTemplatePicker(false)} className="text-text-muted hover:text-text-main p-0.5">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {typographyList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (setActiveFont) setActiveFont(t.id);
                        setShowTemplatePicker(false);
                      }}
                      className={`p-2.5 border rounded-lg text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        activeFont === t.id 
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs' 
                          : 'border-brand-border bg-brand-bg hover:border-brand-primary/50 text-text-secondary hover:text-text-main hover:bg-brand-surface-hover'
                      }`}
                    >
                      <span className="text-xs font-bold">{t.fontName}</span>
                      <span className="text-[10px] text-text-muted">{t.styleLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Import Action */}
        <label className="cursor-pointer p-1.5 text-text-secondary hover:text-text-main hover:bg-brand-surface-hover rounded transition-colors flex items-center gap-1" title="Import Resume (PDF / DOCX)">
          {isImporting ? <Loader2 size={16} className="animate-spin text-brand-primary" /> : <Upload size={16} />}
          <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleImport} disabled={isImporting} />
        </label>

        {/* Export Action */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="ml-1 px-3 py-1.5 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

    </div>
  );
};

export default EditorHeader;
