import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';

const SkillsSectionComponent = ({ node, updateAttributes }) => {
  const [newSkillText, setNewSkillText] = useState({});

  // Skill categories format in attrs: categories = [{ name: 'Programming', skills: ['JavaScript', 'Python'] }]
  const categories = node.attrs.categories || [
    { name: 'Languages & Frameworks', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'] },
    { name: 'Tools & Databases', skills: ['Git', 'MongoDB', 'Docker', 'PostgreSQL'] }
  ];

  const handleAddSkill = (catIndex) => {
    const text = (newSkillText[catIndex] || '').trim();
    if (!text) return;

    const newCategories = [...categories];
    newCategories[catIndex] = {
      ...newCategories[catIndex],
      skills: [...newCategories[catIndex].skills, text]
    };
    updateAttributes({ categories: newCategories });
    setNewSkillText({ ...newSkillText, [catIndex]: '' });
  };

  const handleRemoveSkill = (catIndex, skillIndex) => {
    const newCategories = [...categories];
    newCategories[catIndex] = {
      ...newCategories[catIndex],
      skills: newCategories[catIndex].skills.filter((_, i) => i !== skillIndex)
    };
    updateAttributes({ categories: newCategories });
  };

  const handleAddCategory = () => {
    const catName = window.prompt('Category Name (e.g. DevOps, Cloud)');
    if (catName) {
      updateAttributes({
        categories: [...categories, { name: catName, skills: [] }]
      });
    }
  };

  return (
    <NodeViewWrapper className="mb-8 w-full p-4 rounded-xl border border-brand-border bg-brand-surface/50" data-type="skills-section">
      <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
        <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-text-main flex items-center gap-2">
          <Tag size={18} className="text-brand-primary" /> Skills
        </h3>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-1 text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-2.5 py-1 rounded-md transition-colors"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="p-3 bg-brand-bg rounded-lg border border-brand-border/60 flex flex-col gap-2">
            <div className="font-semibold text-xs text-text-secondary uppercase tracking-wide border-b border-brand-border/40 pb-1 flex justify-between items-center">
              <span>{cat.name}</span>
              <span className="text-[10px] text-text-muted font-mono">{cat.skills.length} skills</span>
            </div>

            {/* Skill Badges */}
            <div className="flex flex-wrap gap-1.5 py-1 min-h-8">
              {cat.skills.map((skill, skillIdx) => (
                <span
                  key={skillIdx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-brand-surface border border-brand-border text-text-main text-xs font-medium rounded-md group hover:border-brand-primary transition-colors"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(catIdx, skillIdx)}
                    className="text-text-muted hover:text-status-error opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Input */}
            <div className="flex items-center gap-1.5 mt-auto pt-1">
              <input
                type="text"
                placeholder="Add skill..."
                value={newSkillText[catIdx] || ''}
                onChange={(e) => setNewSkillText({ ...newSkillText, [catIdx]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(catIdx)}
                className="flex-1 text-xs bg-brand-surface border border-brand-border/60 rounded px-2 py-1 text-text-main outline-none focus:border-brand-primary"
              />
              <button
                onClick={() => handleAddSkill(catIdx)}
                className="p-1 bg-brand-surface border border-brand-border hover:border-brand-primary text-text-secondary hover:text-brand-primary rounded transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </NodeViewWrapper>
  );
};

export const SkillsSection = Node.create({
  name: 'skillsSection',
  group: 'block',
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      categories: {
        default: [
          { name: 'Languages & Frameworks', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'] },
          { name: 'Tools & Databases', skills: ['Git', 'MongoDB', 'Docker', 'PostgreSQL'] }
        ]
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="skills-section"]',
        getAttrs: (element) => {
          try {
            const raw = element.getAttribute('categories');
            return { categories: raw ? JSON.parse(raw) : undefined };
          } catch (e) {
            return {};
          }
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'skills-section',
        categories: JSON.stringify(HTMLAttributes.categories || [])
      })
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SkillsSectionComponent);
  }
});
