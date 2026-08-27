import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';
import { GripVertical, Trash2, MoreVertical, Copy, ArrowUp, ArrowDown, Plus } from 'lucide-react';

const ExperienceItemComponent = ({ node, updateAttributes, deleteNode, getPos, editor }) => {
  const handleAddBullet = () => {
    const pos = getPos();
    const nodeSize = node.nodeSize;
    // Insert bullet into end of current experience item
    editor.chain().focus().insertContentAt(pos + nodeSize - 2, {
      type: 'listItem',
      content: [{ type: 'paragraph' }]
    }).run();
  };

  const handleDuplicate = () => {
    const pos = getPos();
    editor.chain().focus().insertContentAt(pos + node.nodeSize, node.toJSON()).run();
  };

  return (
    <NodeViewWrapper className="flex gap-3 mb-6 relative group border border-transparent hover:border-brand-border p-3 rounded-lg transition-colors">
      
      {/* Drag Handle */}
      <div 
        className="mt-1 text-text-muted cursor-grab hover:text-text-main opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-start shrink-0" 
        contentEditable={false} 
        draggable="true" 
        data-drag-handle
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Editable Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/50 pb-2">
          <div className="flex flex-col gap-1 w-full max-w-sm">
            <input 
              type="text"
              className="font-bold text-base text-text-main bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-primary/50 rounded px-1"
              placeholder="Position Title"
              value={node.attrs.position}
              onChange={(e) => updateAttributes({ position: e.target.value })}
            />
            <input 
              type="text"
              className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-primary/50 rounded px-1"
              placeholder="Company Name"
              value={node.attrs.company}
              onChange={(e) => updateAttributes({ company: e.target.value })}
            />
          </div>
          
          <div className="flex flex-col sm:items-end gap-1 shrink-0">
             <div className="flex items-center gap-1.5 sm:gap-2">
                <input 
                  type="text"
                  className="text-xs text-text-muted bg-transparent border border-transparent hover:border-brand-border focus:border-brand-primary outline-none rounded px-1 w-16 sm:w-20 text-center"
                  placeholder="Start Date"
                  value={node.attrs.startDate}
                  onChange={(e) => updateAttributes({ startDate: e.target.value })}
                />
                <span className="text-text-muted text-xs">-</span>
                <input 
                  type="text"
                  className="text-xs text-text-muted bg-transparent border border-transparent hover:border-brand-border focus:border-brand-primary outline-none rounded px-1 w-16 sm:w-20 text-center"
                  placeholder="End Date"
                  value={node.attrs.endDate}
                  onChange={(e) => updateAttributes({ endDate: e.target.value })}
                />
             </div>
             <input 
               type="text"
               className="text-xs text-text-muted bg-transparent border border-transparent hover:border-brand-border focus:border-brand-primary outline-none rounded px-1 w-full sm:text-right"
               placeholder="Location"
               value={node.attrs.location}
               onChange={(e) => updateAttributes({ location: e.target.value })}
             />
          </div>
        </div>

        {/* The Rich Text Content Area (Bullet Points) */}
        <NodeViewContent className="prose prose-sm prose-ul:my-1 prose-li:my-0.5 text-text-secondary focus:outline-none min-h-10 px-1" />

        {/* Add Bullet Button */}
        <div contentEditable={false} className="pt-1">
          <button
            onClick={handleAddBullet}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-primary transition-colors py-1 px-1 rounded hover:bg-brand-primary/5 font-medium"
          >
            <Plus size={14} /> Add Bullet
          </button>
        </div>
      </div>

      {/* Entry Options Context Menu */}
      <div className="absolute right-1 top-1 sm:right-2 sm:top-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10" contentEditable={false}>
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

export const ExperienceItem = Node.create({
  name: 'experienceItem',
  group: 'block',
  content: 'block+',
  draggable: true,
  
  addAttributes() {
    return {
      company: { default: '' },
      position: { default: '' },
      location: { default: '' },
      startDate: { default: '' },
      endDate: { default: '' }
    };
  },

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="experience-item"]',
        getAttrs: element => ({
          company: element.getAttribute('company'),
          position: element.getAttribute('position'),
          location: element.getAttribute('location'),
          startDate: element.getAttribute('startdate'),
          endDate: element.getAttribute('enddate')
        })
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'experience-item' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExperienceItemComponent);
  },
});
