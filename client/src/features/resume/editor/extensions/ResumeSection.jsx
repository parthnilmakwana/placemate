import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState } from 'react';
import { Plus, MoreVertical, ArrowUp, ArrowDown, Trash2, Wand2 } from 'lucide-react';

const ResumeSectionComponent = ({ node, updateAttributes, editor, getPos, deleteNode }) => {
  const sectionId = node.attrs.sectionId;
  const isEmpty = node.childCount === 0;

  const handleAddItem = () => {
    const pos = getPos();
    const nodeSize = node.nodeSize;
    let nodeType = '';
    
    if (sectionId === 'experience') nodeType = 'experienceItem';
    else if (sectionId === 'education') nodeType = 'educationItem';
    else if (sectionId === 'projects') nodeType = 'projectItem';
    else return;

    editor.chain().focus().insertContentAt(pos + nodeSize - 1, {
      type: nodeType,
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph' }]
            }
          ]
        }
      ]
    }).run();
  };

  const canAddItems = ['experience', 'education', 'projects'].includes(sectionId);

  return (
    <NodeViewWrapper className="mb-10 w-full relative group/section" data-section-id={sectionId}>
      <div className="flex items-center justify-between mb-4 border-b-2 border-brand-primary pb-2">
        <input 
          type="text"
          className="text-xl font-heading font-bold uppercase tracking-wider text-text-main bg-transparent border-none outline-none focus:ring-2 focus:ring-brand-primary/50 rounded px-1 w-full"
          value={node.attrs.title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
        />

        {/* Section Controls */}
        <div className="opacity-100 sm:opacity-0 sm:group-hover/section:opacity-100 transition-opacity flex items-center gap-1 shrink-0 bg-brand-surface border border-brand-border rounded-md shadow-sm">
          <div className="relative group/menu">
            <button className="p-1.5 text-text-muted hover:text-text-main hover:bg-brand-surface-hover rounded transition-colors" title="Section Options">
              <MoreVertical size={16} />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:flex flex-col bg-brand-bg border border-brand-border rounded shadow-lg z-50 w-32 overflow-hidden py-1">
              <button 
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text-main hover:bg-brand-surface-hover text-left transition-colors"
                onClick={() => {}} // TODO: implement move up/down
              >
                <ArrowUp size={14} /> Move Up
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text-main hover:bg-brand-surface-hover text-left transition-colors"
                onClick={() => {}}
              >
                <ArrowDown size={14} /> Move Down
              </button>
              <div className="h-px bg-brand-border my-1"></div>
              <button 
                onClick={deleteNode}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 text-left transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isEmpty && (
        <div className="py-8 px-4 rounded-lg border border-dashed border-brand-border bg-brand-surface-hover/50 text-center mb-4">
          <p className="text-text-secondary text-sm mb-4">
            You don't have any {sectionId} entries yet.<br/>
            Add your strongest {sectionId} to showcase your work.
          </p>
          <div className="flex justify-center gap-3">
            {canAddItems && (
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border rounded-md text-text-main hover:text-brand-primary hover:border-brand-primary transition-colors text-sm font-semibold shadow-sm"
              >
                <Plus size={16} /> Add {sectionId === 'experience' ? 'Experience' : sectionId === 'education' ? 'Education' : 'Project'}
              </button>
            )}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-md text-indigo-400 hover:from-purple-500/20 hover:to-indigo-500/20 transition-colors text-sm font-semibold shadow-sm"
            >
              <Wand2 size={16} /> Structure with AI
            </button>
          </div>
        </div>
      )}

      <NodeViewContent className="flex flex-col gap-2" />

      {canAddItems && !isEmpty && (
        <button
          onClick={handleAddItem}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed border-brand-border text-text-secondary hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-sm font-semibold group"
        >
          <Plus size={16} className="group-hover:scale-110 transition-transform" />
          Add {sectionId === 'experience' ? 'Experience' : sectionId === 'education' ? 'Education' : 'Project'}
        </button>
      )}
    </NodeViewWrapper>
  );
};

export const ResumeSection = Node.create({
  name: 'resumeSection',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      title: { default: 'Section' },
      sectionId: { default: '' } // e.g. 'experience', 'education'
    };
  },

  parseHTML() {
    return [
      { 
        tag: 'section[data-type="resume-section"]',
        getAttrs: element => ({
          title: element.getAttribute('title'),
          sectionId: element.getAttribute('sectionid')
        })
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(HTMLAttributes, { 'data-type': 'resume-section' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResumeSectionComponent);
  },
});
