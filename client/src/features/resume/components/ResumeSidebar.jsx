import React, { useState } from 'react';
import { AlignLeft, Briefcase, GraduationCap, Code, Award, Plus, Folder, Eye, EyeOff } from 'lucide-react';

const ResumeSidebar = ({ profile }) => {
  const [hiddenSections, setHiddenSections] = useState({});

  const toggleSectionVisibility = (sectionId, e) => {
    e.stopPropagation();
    const isHidden = !hiddenSections[sectionId];
    setHiddenSections(prev => ({ ...prev, [sectionId]: isHidden }));

    const el = document.querySelector(`[sectionid="${sectionId}"]`) || document.querySelector(`[data-type="${sectionId === 'skills' ? 'skills-section' : sectionId}"]`);
    if (el) {
      if (isHidden) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const el = document.querySelector(`[sectionid="${sectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      el.classList.add('ring-2', 'ring-brand-primary', 'ring-offset-2', 'ring-offset-brand-bg', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-brand-primary', 'ring-offset-2', 'ring-offset-brand-bg');
      }, 1500);
    }
  };

  const scrollToSubItem = (sectionId, index) => {
    const sectionEl = document.querySelector(`[sectionid="${sectionId}"]`);
    if (sectionEl) {
      const items = sectionEl.querySelectorAll(`[data-type="${sectionId === 'experience' ? 'experience-item' : sectionId === 'education' ? 'education-item' : 'project-item'}"]`);
      const targetEl = items[index] || sectionEl;
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('ring-2', 'ring-brand-primary', 'ring-offset-2', 'ring-offset-brand-bg', 'transition-all', 'duration-500');
      setTimeout(() => {
        targetEl.classList.remove('ring-2', 'ring-brand-primary', 'ring-offset-2', 'ring-offset-brand-bg');
      }, 1500);
    }
  };

  const sections = [
    { id: 'bio', label: 'Summary', icon: AlignLeft, hasData: !!profile?.bio },
    { 
      id: 'experience', label: 'Experience', icon: Briefcase, 
      hasData: profile?.experience?.length > 0, count: profile?.experience?.length,
      items: profile?.experience?.map(e => e.company || 'Unknown Company')
    },
    { 
      id: 'education', label: 'Education', icon: GraduationCap, 
      hasData: profile?.education?.length > 0, count: profile?.education?.length,
      items: profile?.education?.map(e => e.institution || 'Unknown Institution')
    },
    { 
      id: 'projects', label: 'Projects', icon: Folder, 
      hasData: profile?.projects?.length > 0, count: profile?.projects?.length,
      items: profile?.projects?.map(p => p.title || 'Unknown Project')
    },
    { id: 'skills', label: 'Skills', icon: Code, hasData: profile?.skills?.length > 0, count: profile?.skills?.length },
    { id: 'certifications', label: 'Certifications', icon: Award, hasData: profile?.certifications?.length > 0, count: profile?.certifications?.length },
  ];

  return (
    <div className="w-full h-full bg-brand-surface border-r border-brand-border flex flex-col pt-2 pb-6 overflow-y-auto custom-scrollbar">
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">Resume Outline</h3>
        
        <div className="flex flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isHidden = hiddenSections[section.id];
            return (
              <div key={section.id} className={isHidden ? 'opacity-40' : ''}>
                <div
                  onClick={() => scrollToSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-brand-surface-hover cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={`${section.hasData ? 'text-brand-primary' : 'text-text-muted'} group-hover:scale-110 transition-transform`} />
                    <span className={`text-sm font-medium ${section.hasData ? 'text-text-main' : 'text-text-secondary'} ${isHidden ? 'line-through' : ''}`}>
                      {section.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {section.count > 0 && (
                      <span className="text-[10px] font-bold bg-brand-bg text-text-secondary px-1.5 py-0.5 rounded border border-brand-border">
                        {section.count}
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleSectionVisibility(section.id, e)}
                      className="text-text-muted hover:text-text-main p-1 rounded transition-colors"
                      title={isHidden ? 'Show Section' : 'Hide Section'}
                    >
                      {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {/* Nested Items */}
                {!isHidden && section.items && section.items.length > 0 && (
                  <div className="ml-7 mt-1 border-l border-brand-border pl-2 flex flex-col gap-1">
                    {section.items.map((itemLabel, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => scrollToSubItem(section.id, idx)}
                        className="text-xs text-text-muted hover:text-text-main cursor-pointer truncate py-0.5 px-1 rounded hover:bg-brand-surface-hover transition-colors"
                      >
                        {itemLabel}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Adding a new section */}
      <div className="px-4 mt-6">
        <div className="relative group/addsection">
          <button className="w-full flex items-center gap-2 justify-center py-2 text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-brand-surface-hover border border-dashed border-brand-border hover:border-text-secondary rounded-md transition-colors">
            <Plus size={14} />
            Add Section
          </button>
          
          {/* Add Section Dropdown */}
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover/addsection:flex flex-col bg-brand-surface border border-brand-border rounded-lg shadow-xl z-50 w-full py-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-brand-border/50 mb-1">
              New Section
            </div>
            {['Experience', 'Education', 'Projects', 'Skills', 'Certifications', 'Languages', 'Custom Section'].map(s => (
              <button key={s} className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-brand-surface-hover hover:text-text-main transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSidebar;
