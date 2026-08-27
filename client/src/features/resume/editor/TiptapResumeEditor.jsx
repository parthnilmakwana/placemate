import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { Loader2, Save, Undo, Redo, Palette, Type, Layers } from 'lucide-react';

import { ResumeSection } from './extensions/ResumeSection';
import { ExperienceItem } from './extensions/ExperienceItem';
import { EducationItem } from './extensions/EducationItem';
import { ProjectItem } from './extensions/ProjectItem';
import { ResumeListItem } from './extensions/ResumeListItem';
import { SkillsSection } from './extensions/SkillsSection';
import EditorToolbar from './components/EditorToolbar';
import QuickActionBar from './components/QuickActionBar';

// Utility to convert Profile JSON to Tiptap HTML
const generateHTMLFromProfile = (profile) => {
  if (!profile) return '';
  let html = '';
  
  // Summary Section
  html += `<section data-type="resume-section" title="Professional Summary" sectionid="bio">`;
  html += `<p>${profile.bio || 'Enter your professional summary here...'}</p>`;
  html += `</section>`;
  
  const safe = (str) => String(str || '').replace(/"/g, '&quot;');
  const parseLines = (desc) => {
    let out = '<ul>';
    if (desc) {
      desc.split('\n').forEach(line => {
        if (line.trim()) out += `<li><p>${line.replace(/^-/, '').trim()}</p></li>`;
      });
    } else {
      out += `<li><p></p></li>`;
    }
    out += '</ul>';
    return out;
  };

  // Experience Section
  if (profile.experience && profile.experience.length > 0) {
    html += `<section data-type="resume-section" title="Experience" sectionid="experience">`;
    profile.experience.forEach(exp => {
      html += `<div data-type="experience-item" company="${safe(exp.company)}" position="${safe(exp.position)}" location="${safe(exp.location)}" startdate="${safe(exp.startDate)}" enddate="${safe(exp.endDate)}">`;
      html += parseLines(exp.description);
      html += `</div>`;
    });
    html += `</section>`;
  }

  // Education Section
  if (profile.education && profile.education.length > 0) {
    html += `<section data-type="resume-section" title="Education" sectionid="education">`;
    profile.education.forEach(edu => {
      html += `<div data-type="education-item" institution="${safe(edu.institution)}" degree="${safe(edu.degree)}" fieldofstudy="${safe(edu.fieldOfStudy)}" startyear="${safe(edu.startYear)}" endyear="${safe(edu.endYear)}">`;
      html += parseLines(edu.description);
      html += `</div>`;
    });
    html += `</section>`;
  }

  // Projects Section
  if (profile.projects && profile.projects.length > 0) {
    html += `<section data-type="resume-section" title="Projects" sectionid="projects">`;
    profile.projects.forEach(proj => {
      html += `<div data-type="project-item" title="${safe(proj.title)}" technologies="${safe((proj.technologies || []).join(', '))}" githublink="${safe(proj.githubLink)}" livelink="${safe(proj.liveLink)}">`;
      html += parseLines(proj.description);
      html += `</div>`;
    });
    html += `</section>`;
  }

  // Skills Section
  if (profile.skills && profile.skills.length > 0) {
    html += `<div data-type="skills-section"></div>`;
  }
  
  return html;
};

// Utility to convert Tiptap JSON back to Profile structure (for autosave)
const parseTiptapJSONToProfile = (editorJSON) => {
  const updates = { experience: [], education: [], projects: [], skills: [] };
  
  const extractBullets = (node) => {
    const bullets = [];
    node.content?.forEach(listNode => {
      if (listNode.type === 'bulletList') {
         listNode.content?.forEach(listItem => {
           if (listItem.content && listItem.content[0]?.content) {
             bullets.push(listItem.content[0].content.map(c => c.text).join(''));
           }
         });
      }
    });
    return bullets;
  };

  editorJSON.content?.forEach(sectionNode => {
    if (sectionNode.type !== 'resumeSection') return;
    const sectionId = sectionNode.attrs?.sectionId;
    
    if (sectionId === 'bio') {
      const textNodes = [];
      sectionNode.content?.forEach(child => {
        if (child.type === 'paragraph' && child.content) {
          textNodes.push(child.content.map(c => c.text).join(''));
        }
      });
      updates.bio = textNodes.join('\n');
    }
    else if (sectionId === 'experience') {
      sectionNode.content?.forEach(expNode => {
        if (expNode.type !== 'experienceItem') return;
        updates.experience.push({
          company: expNode.attrs.company || '',
          position: expNode.attrs.position || '',
          location: expNode.attrs.location || '',
          startDate: expNode.attrs.startDate || '',
          endDate: expNode.attrs.endDate || '',
          description: extractBullets(expNode).join('\n')
        });
      });
    }
    else if (sectionId === 'education') {
      sectionNode.content?.forEach(eduNode => {
        if (eduNode.type !== 'educationItem') return;
        updates.education.push({
          institution: eduNode.attrs.institution || '',
          degree: eduNode.attrs.degree || '',
          fieldOfStudy: eduNode.attrs.fieldOfStudy || '',
          startYear: eduNode.attrs.startYear || '',
          endYear: eduNode.attrs.endYear || '',
          description: extractBullets(eduNode).join('\n')
        });
      });
    }
    else if (sectionId === 'projects') {
      sectionNode.content?.forEach(projNode => {
        if (projNode.type !== 'projectItem') return;
        updates.projects.push({
          title: projNode.attrs.title || '',
          technologies: projNode.attrs.technologies ? String(projNode.attrs.technologies).split(',').map(s=>s.trim()).filter(Boolean) : [],
          githubLink: projNode.attrs.githubLink || '',
          liveLink: projNode.attrs.liveLink || '',
          description: extractBullets(projNode).join('\n')
        });
      });
    }
    else if (sectionId === 'skills') {
      updates.skills = extractBullets(sectionNode);
    }
  });

  return updates;
};

const TiptapResumeEditor = ({ profile, onProfileChange, onSaveRequest, isSaving, setIsSaving, setRightPanelMode, setShowRightPanelMobile, activeTheme = 'modern', setActiveTheme }) => {
  const { user } = useAuth();
  const saveTimeoutRef = useRef(null);
  const hasInitialized = useRef(false);

  const handleUpdate = useCallback(({ editor }) => {
    if (!profile) return;
    
    if (setIsSaving) setIsSaving(true);
    
    // Parse current editor state to Profile JSON
    const json = editor.getJSON();
    const profileUpdates = parseTiptapJSONToProfile(json);
    
    const updatedProfile = { ...profile, ...profileUpdates };
    
    // Call onProfileChange so parent can update preview instantly
    if (onProfileChange) {
      onProfileChange(updatedProfile);
    }
    
    // Debounce actual save API call
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (onSaveRequest) {
          await onSaveRequest(updatedProfile);
        } else {
          await api.put(`/api/profiles/${profile._id}`, updatedProfile);
        }
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        if (setIsSaving) setIsSaving(false);
      }
    }, 1500);
  }, [profile, onProfileChange, onSaveRequest, setIsSaving]);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        listItem: false, // We use our custom one
      }),
      ResumeListItem,
      Placeholder.configure({
        placeholder: 'Write something professional...',
      }),
      ResumeSection,
      ExperienceItem,
      EducationItem,
      ProjectItem,
      SkillsSection,
    ],
    content: '',
    onUpdate: handleUpdate,
  });

  // Set initial content when profile loads (ONLY ONCE)
  useEffect(() => {
    if (editor && profile && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialHTML = generateHTMLFromProfile(profile);
      editor.commands.setContent(initialHTML, false); // false = don't emit update event
    }
  }, [editor, profile]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-12 h-full">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-brand-surface relative overflow-hidden">
      
      {/* Active Template Style Indicator Bar (Upper Side) */}
      <div className="px-3 sm:px-4 py-2 bg-brand-bg/95 border-b border-brand-border/60 flex items-center justify-between text-xs shrink-0 relative z-30 shadow-xs overflow-x-auto hide-scrollbar gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Palette size={14} className="text-brand-primary" />
          <span className="font-medium text-text-secondary hidden xs:inline">Template Style:</span>
          <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold uppercase tracking-wider text-[10px]">
            {activeTheme}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {['modern', 'minimal', 'executive', 'software'].map(themeId => (
            <button
              key={themeId}
              onClick={() => setActiveTheme && setActiveTheme(themeId)}
              className={`px-2 sm:px-2.5 py-1 text-[10px] font-semibold rounded-md capitalize transition-all ${
                activeTheme === themeId 
                  ? 'bg-brand-primary text-white shadow-xs' 
                  : 'text-text-muted hover:text-text-main hover:bg-brand-surface-hover'
              }`}
            >
              {themeId}
            </button>
          ))}
        </div>
      </div>

      {/* Persistent Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Content Container with Theme Styling */}
      <div className={`flex-1 p-3 sm:p-6 md:p-12 overflow-y-auto custom-scrollbar relative ${
        activeTheme === 'minimal' ? 'font-sans tracking-tight' :
        activeTheme === 'executive' ? 'font-serif' :
        activeTheme === 'software' ? 'font-mono' : 'font-sans'
      }`}>
        {/* Page Count / Boundary Badge */}
        <div className="sticky top-2 left-2 z-10 w-fit px-2.5 py-1 bg-brand-bg/80 backdrop-blur-xs border border-brand-border rounded-md text-[11px] font-semibold text-text-secondary flex items-center gap-1.5 shadow-xs mb-4">
          <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
          <span>Page 1 of 1</span>
          <span className="text-text-muted font-normal hidden sm:inline">(Standard A4)</span>
        </div>
        {editor && (
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="flex items-center gap-1 p-1 rounded-lg border border-brand-border bg-brand-surface shadow-xl"
          >
            <button
              onClick={async () => {
                const { from, to, empty } = editor.state.selection;
                if (empty) return;
                const text = editor.state.doc.textBetween(from, to, ' ');
                if (setIsSaving) setIsSaving(true);
                try {
                  const res = await api.post('/api/resume/enhance-text', { text, mode: 'professional' });
                  if (res.data?.data) {
                    editor.commands.insertContent(res.data.data);
                  }
                } catch (e) {
                  console.error(e);
                  alert('Enhancement failed');
                } finally {
                  if (setIsSaving) setIsSaving(false);
                }
              }}
              className="px-2 py-1 text-xs font-semibold rounded hover:bg-brand-primary/10 text-brand-primary transition-colors flex items-center gap-1"
            >
              ✨ Enhance
            </button>
            <button
              onClick={async () => {
                const { from, to, empty } = editor.state.selection;
                if (empty) return;
                const text = editor.state.doc.textBetween(from, to, ' ');
                if (setIsSaving) setIsSaving(true);
                try {
                  const res = await api.post('/api/resume/enhance-text', { text, mode: 'action_verbs' });
                  if (res.data?.data) {
                    editor.commands.insertContent(res.data.data);
                  }
                } catch (e) {
                  console.error(e);
                  alert('Enhancement failed');
                } finally {
                  if (setIsSaving) setIsSaving(false);
                }
              }}
              className="px-2 py-1 text-xs font-semibold rounded hover:bg-white/5 text-text-main transition-colors flex items-center gap-1"
            >
              Action Verbs
            </button>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className="prose prose-sm md:prose-base focus:outline-none max-w-none text-text-main pb-32 xl:pb-24" />
      </div>

      {/* Quick Action Bar (Bottom Sticky) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <QuickActionBar 
            onAIImprove={() => {
              if (setRightPanelMode) setRightPanelMode('ai');
              if (setShowRightPanelMobile) setShowRightPanelMobile(true);
            }} 
            onVerbEnhancer={() => {
              if (setRightPanelMode) setRightPanelMode('ai');
              if (setShowRightPanelMobile) setShowRightPanelMobile(true);
            }} 
            onATS={() => {
              if (setRightPanelMode) setRightPanelMode('ats');
              if (setShowRightPanelMobile) setShowRightPanelMobile(true);
            }} 
            onTargetJob={() => {
              if (setRightPanelMode) setRightPanelMode('match');
              if (setShowRightPanelMobile) setShowRightPanelMobile(true);
            }} 
            onTemplate={() => {
              // Usually handled in header, but keeping it functional
              const select = document.querySelector('.template-selector-trigger');
              if (select) select.click();
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default TiptapResumeEditor;
