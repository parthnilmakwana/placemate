import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';
import { GripVertical, Trash2, MoreVertical, Copy } from 'lucide-react';

const ProjectItemComponent = ({ node, updateAttributes, deleteNode, getPos, editor }) => {
  const handleDuplicate = () => {
    const pos = getPos();
    editor.chain().focus().insertContentAt(pos + node.nodeSize, node.toJSON()).run();
  };

  return (
    <NodeViewWrapper className="flex gap-3 mb-6 relative group border border-transparent hover:border-brand-border p-3 rounded-lg transition-colors">
      
      {/* Drag Handle */}
      <div 
        className="mt-1 text-text-muted cursor-grab hover:text-text-main opacity-0 group-hover:opacity-100 transition-opacity flex items-start shrink-0" 
        contentEditable={false} 
        draggable="true" 
        data-drag-handle
      >
        <GripVertical size={18} />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {/* Editable Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/50 pb-2">
          <div className="flex flex-col gap-1 w-full max-w-sm">
            <input 
              type="text"
              className="font-bold text-base text-text-main bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-primary/50 rounded px-1"
              placeholder="Project Title"
              value={node.attrs.title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
            />
            <input 
              type="text"
              className="font-medium text-xs text-text-secondary bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-primary/50 rounded px-1"
              placeholder="Technologies (comma separated)"
              value={node.attrs.technologies}
              onChange={(e) => updateAttributes({ technologies: e.target.value })}
            />
          </div>
          
          <div className="flex flex-col sm:items-end gap-1 shrink-0">
            <input 
              type="text"
              className="text-xs text-text-muted bg-transparent border border-transparent hover:border-brand-border focus:border-brand-primary outline-none rounded px-1 w-full sm:text-right"
              placeholder="GitHub Link"
              value={node.attrs.githubLink}
              onChange={(e) => updateAttributes({ githubLink: e.target.value })}
            />
            <input 
              type="text"
              className="text-xs text-text-muted bg-transparent border border-transparent hover:border-brand-border focus:border-brand-primary outline-none rounded px-1 w-full sm:text-right"
              placeholder="Live Link"
              value={node.attrs.liveLink}
              onChange={(e) => updateAttributes({ liveLink: e.target.value })}
            />
          </div>
        </div>

        {/* The Rich Text Content Area (Bullet Points) */}
        <NodeViewContent className="prose prose-sm prose-ul:my-1 prose-li:my-0.5 text-text-secondary focus:outline-none min-h-10 px-1" />
      </div>

      {/* Entry Options Context Menu */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" contentEditable={false}>
        <div className="relative group/entrymenu">
          <button className="p-1.5 bg-brand-surface border border-brand-border text-text-secondary hover:text-text-main rounded-md shadow-sm">
            <MoreVertical size={14} />
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover/entrymenu:flex flex-col bg-brand-surface border border-brand-border rounded-lg shadow-xl z-50 w-36 overflow-hidden py-1">
            <button 
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-brand-surface-hover hover:text-text-main text-left transition-colors"
            >
              <Copy size={13} /> Duplicate
            </button>
            <div className="h-px bg-brand-border my-1"></div>
            <button 
              onClick={deleteNode}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 text-left transition-colors"
            >
              <Trash2 size={13} /> Delete Entry
            </button>
          </div>
        </div>
      </div>

    </NodeViewWrapper>
  );
};

export const ProjectItem = Node.create({
  name: 'projectItem',
  group: 'block',
  content: 'block+',
  draggable: true,
  
  addAttributes() {
    return {
      title: { default: '' },
      technologies: { default: '' },
      githubLink: { default: '' },
      liveLink: { default: '' }
    };
  },

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="project-item"]',
        getAttrs: element => ({
          title: element.getAttribute('title'),
          technologies: element.getAttribute('technologies'),
          githubLink: element.getAttribute('githublink'),
          liveLink: element.getAttribute('livelink')
        })
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'project-item' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProjectItemComponent);
  },
});
