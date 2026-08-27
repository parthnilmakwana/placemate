import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, FileText, ListTree, Eye, X } from 'lucide-react';
import TiptapResumeEditor from '../editor/TiptapResumeEditor';
import ResumePreview from '../components/ResumePreview';
import AtsScoreView from '../components/AtsScoreView';
import JobMatchView from '../components/JobMatchView';
import AiAssistantView from '../components/AiAssistantView';
import EditorHeader from '../components/EditorHeader';
import ResumeSidebar from '../components/ResumeSidebar';
import { api, BASE_URL } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

function ResumeEditorTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profilesList, setProfilesList] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Layout State
  const [activeTheme, setActiveTheme] = useState('modern');
  const [activeFont, setActiveFont] = useState('Inter');
  const [rightPanelMode, setRightPanelMode] = useState('ai'); // 'preview' | 'ats' | 'match' | 'ai'
  const [showRightPanelMobile, setShowRightPanelMobile] = useState(false);
  const [showSectionsMobile, setShowSectionsMobile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          api.get('/api/profiles'),
          api.get('/api/settings')
        ]);
        
        if (profileRes.data && profileRes.data.length > 0) {
          setProfilesList(profileRes.data);
          const ownerProfile = profileRes.data.find(p => p.profileType === 'OWNER') || profileRes.data[0];
          setProfile(ownerProfile);
        }
        
        if (settingsRes.data) {
          setSettings(settingsRes.data);
          if (settingsRes.data.themeId) {
            setActiveTheme(settingsRes.data.themeId);
          }
          if (settingsRes.data.fontFamily) {
            setActiveFont(settingsRes.data.fontFamily);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleThemeChange = async (newTheme) => {
    setActiveTheme(newTheme);
    try {
      await api.patch('/api/settings/appearance', { themeId: newTheme });
    } catch (e) {
      console.error('Failed to save theme setting:', e);
    }
  };

  const handleFontChange = async (newFont) => {
    setActiveFont(newFont);
    try {
      await api.patch('/api/settings/appearance', { fontFamily: newFont });
    } catch (e) {
      console.error('Failed to save font setting:', e);
    }
  };

  const handleProfileChange = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleSelectProfile = (selectedProf) => {
    setProfile(selectedProf);
  };

  const handleCreateProfile = async () => {
    try {
      setLoading(true);
      const res = await api.post('/api/profiles', {
        profileName: 'Custom Profile',
        targetRole: 'Software Engineer',
        fullName: user?.name || 'Developer',
        bio: 'New profile summary...',
      });
      if (res.data) {
        const updatedList = [...profilesList, res.data];
        setProfilesList(updatedList);
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to create profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      const res = await api.post('/api/upload/parse-to-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.profile) {
        setProfile(res.data.profile);
        alert('Resume imported and parsed successfully!');
      } else if (res.data) {
        setProfile(prev => ({ ...prev, ...res.data }));
        alert('Resume imported successfully!');
      }
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import file. Please ensure it is a valid PDF or DOCX file.');
    } finally {
      setImporting(false);
    }
  };

  const handleSaveRequest = async (updatedProfile) => {
    setIsSaving(true);
    try {
      await api.put(`/api/profiles/${updatedProfile._id}`, updatedProfile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      if (profile) await handleSaveRequest(profile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL || ''}/api/resume/download?optimize=false`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to export PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-125">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  const previewSettings = { 
    ...(settings || {}), 
    themeId: activeTheme,
    fontFamily: activeFont
  };

  return (
    <div className="flex flex-col w-full h-full animate-fade-in bg-brand-bg relative overflow-hidden rounded-xl border border-brand-border shadow-sm">
      
      {/* Top Beta Feature Announcement Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider text-[10px] shrink-0 border border-amber-500/30">
            Beta
          </span>
          <span className="text-amber-200/90 text-xs font-medium">
            You're using the Resume Editor Beta. We're actively refining the experience, so you may encounter occasional issues in some features
          </span>
        </div>
      </div>

      {/* Editor Header */}
      <EditorHeader
        profile={profile}
        profilesList={profilesList}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        isSaving={isSaving}
        rightPanelMode={rightPanelMode}
        setRightPanelMode={setRightPanelMode}
        setShowRightPanelMobile={setShowRightPanelMobile}
        activeFont={activeFont}
        setActiveFont={handleFontChange}
        handleDownload={handleDownload}
        isDownloading={isDownloading}
        handleImport={handleImport}
        isImporting={importing}
      />

      {/* 3-Pane Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Left Pane: Outline Sidebar (Hidden on mobile by default) */}
        <div className="hidden lg:block w-64 shrink-0 h-full z-10">
          <ResumeSidebar profile={profile} />
        </div>

        {/* Center Pane: Tiptap Editor */}
        <div className="flex-1 min-w-[320px] max-w-4xl mx-auto h-full overflow-hidden bg-brand-surface border-r border-l border-transparent lg:border-brand-border">
          <TiptapResumeEditor 
            profile={profile} 
            onProfileChange={handleProfileChange} 
            onSaveRequest={handleSaveRequest}
            setIsSaving={setIsSaving}
            isSaving={isSaving}
            setRightPanelMode={setRightPanelMode}
            setShowRightPanelMobile={setShowRightPanelMobile}
            activeTheme={activeTheme}
            setActiveTheme={handleThemeChange}
          />
        </div>

        {/* Right Pane: Assistant / Preview */}
        <div className={`
          absolute inset-0 z-50 bg-brand-surface flex-col transition-transform duration-300 shadow-2xl xl:shadow-none
          ${showRightPanelMobile ? 'translate-x-0' : 'translate-x-full'}
          xl:relative xl:translate-x-0 xl:flex xl:w-100 2xl:w-120 shrink-0 h-full
        `}>
          {/* Mobile Right Panel Header */}
          <div className="xl:hidden p-3 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
            <h3 className="font-semibold text-text-main text-sm capitalize">
              {rightPanelMode === 'preview' ? 'PDF Preview' : rightPanelMode === 'ats' ? 'ATS Score' : rightPanelMode === 'ai' ? 'AI Assistant' : 'Target Job Match'}
            </h3>
            <button 
              onClick={() => setShowRightPanelMobile(false)} 
              className="text-text-secondary hover:text-text-main p-1.5 hover:bg-brand-surface-hover rounded flex items-center gap-1 text-xs font-semibold"
            >
              <X size={16} /> Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar h-full relative pb-16 xl:pb-0">
            {rightPanelMode === 'preview' ? (
              <ResumePreview 
                user={user} 
                profile={profile} 
                settings={previewSettings} 
                optimize={false} 
              />
            ) : rightPanelMode === 'ats' ? (
              <AtsScoreView profile={profile} />
            ) : rightPanelMode === 'ai' ? (
              <AiAssistantView profile={profile} />
            ) : (
              <JobMatchView profile={profile} />
            )}
          </div>
        </div>

        {/* Mobile Sections Drawer / Bottom Sheet */}
        {showSectionsMobile && (
          <div className="lg:hidden absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
            <div className="bg-brand-surface border-t border-brand-border rounded-t-2xl max-h-[80vh] h-full flex flex-col overflow-hidden shadow-2xl">
              <div className="p-3 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
                <h3 className="font-semibold text-text-main text-sm flex items-center gap-2">
                  <ListTree size={16} className="text-brand-primary" /> Resume Sections
                </h3>
                <button 
                  onClick={() => setShowSectionsMobile(false)} 
                  className="text-text-secondary hover:text-text-main p-1.5 hover:bg-brand-surface-hover rounded flex items-center gap-1 text-xs font-semibold"
                >
                  <X size={16} /> Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pb-16" onClick={() => setShowSectionsMobile(false)}>
                <ResumeSidebar profile={profile} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on Mobile & Tablet) */}
      <div className="xl:hidden border-t border-brand-border bg-brand-surface/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around z-40 shrink-0">
        <button
          onClick={() => {
            setShowRightPanelMobile(false);
            setShowSectionsMobile(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
            !showRightPanelMobile && !showSectionsMobile ? 'text-brand-primary bg-brand-primary/10' : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <FileText size={18} />
          <span>Edit</span>
        </button>

        <button
          onClick={() => {
            setShowSectionsMobile(false);
            setRightPanelMode('ai');
            setShowRightPanelMobile(true);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
            showRightPanelMobile && rightPanelMode === 'ai' ? 'text-brand-primary bg-brand-primary/10' : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <Sparkles size={18} />
          <span>AI Assist</span>
        </button>

        <button
          onClick={() => {
            setShowRightPanelMobile(false);
            setShowSectionsMobile(true);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
            showSectionsMobile ? 'text-brand-primary bg-brand-primary/10' : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <ListTree size={18} />
          <span>Sections</span>
        </button>

        <button
          onClick={() => {
            setShowSectionsMobile(false);
            setRightPanelMode('preview');
            setShowRightPanelMobile(true);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
            showRightPanelMobile && rightPanelMode === 'preview' ? 'text-brand-primary bg-brand-primary/10' : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <Eye size={18} />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );
}

export default ResumeEditorTab;
