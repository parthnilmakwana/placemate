import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState } from 'react';
import { Wand2, Zap, MoreVertical, Trash2, GripVertical, Scissors, Target, Check, ShieldCheck } from 'lucide-react';
import { api } from '../../../../services/api';
import AiDiffModal from '../components/AiDiffModal';

const ResumeListItemComponent = ({ node, getPos, editor, deleteNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('professional');
  const [suggestedText, setSuggestedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const originalText = node.textContent;

  const triggerAI = async (mode) => {
    if (!originalText.trim()) return;
    setActiveMode(mode);
    setIsModalOpen(true);
    setSuggestedText('');
    setIsEnhancing(true);

    try {
      const res = await api.post('/api/resume/enhance-text', { text: originalText, mode });
      if (res.data?.data) {
        setSuggestedText(res.data.data);
      }
    } catch (e) {
      console.error(e);
      setSuggestedText('Failed to generate enhancement.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    if (!suggestedText) return;
    const pos = getPos();
    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).insertContentAt(pos, {
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: suggestedText }]
        }
      ]
    }).run();
    setIsModalOpen(false);
  };

  return (
    <NodeViewWrapper as="li" className="group relative flex gap-2 w-full my-1 rounded hover:bg-brand-surface-hover/50 transition-colors p-1 -ml-1">
      
      {/* Drag handle */}
      <div 
        className="mt-1 opacity-0 group-hover:opacity-100 cursor-grab text-text-muted hover:text-text-main transition-opacity shrink-0" 
        contentEditable={false} 
        draggable="true" 
        data-drag-handle
      >
        <GripVertical size={14} />
      </div>

      {/* Bullet Content */}
      <div className="flex-1 min-w-0">
        <NodeViewContent className="prose prose-sm prose-p:my-0 text-text-secondary focus:outline-none" />
      </div>

      {/* Hover Actions */}
      <div 
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0"
        contentEditable={false}
      >
        <button 
          onClick={() => triggerAI('professional')}
          className="px-2 py-1 text-[10px] font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded flex items-center gap-1 transition-colors"
          title="✨ AI Improve"
        >
          <Wand2 size={12} /> <span className="hidden xl:inline">Improve</span>
        </button>

        <button 
          onClick={() => triggerAI('action_verbs')}
          className="px-2 py-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded flex items-center gap-1 transition-colors"
          title="⚡ Verb Enhancer"
        >
          <Zap size={12} /> <span className="hidden xl:inline">Verb</span>
        </button>

        <div className="relative group/menu">
          <button className="p-1 text-text-muted hover:text-text-main hover:bg-brand-surface-hover rounded transition-colors">
            <MoreVertical size={14} />
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:flex flex-col bg-brand-surface border border-brand-border rounded-lg shadow-xl z-50 w-36 overflow-hidden py-1">
            <button 
              onClick={() => triggerAI('concise')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-brand-surface-hover text-left transition-colors"
            >
              <Scissors size={12} className="text-blue-500" /> Make Concise
            </button>
            <button 
              onClick={() => triggerAI('impact')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-brand-surface-hover text-left transition-colors"
            >
              <Target size={12} className="text-emerald-500" /> Improve Impact
            </button>
            <button 
              onClick={() => triggerAI('grammar')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-brand-surface-hover text-left transition-colors"
            >
              <Check size={12} className="text-indigo-500" /> Fix Grammar
            </button>
            <button 
              onClick={() => triggerAI('ats_optimize')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-brand-surface-hover text-left transition-colors"
            >
              <ShieldCheck size={12} className="text-teal-500" /> ATS Optimize
            </button>
            <div className="h-px bg-brand-border my-1"></div>
            <button 
              onClick={deleteNode}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 text-left transition-colors"
            >
              <Trash2 size={12} /> Delete Bullet
            </button>
          </div>
        </div>
      </div>

      {/* AI Diff Modal */}
      <AiDiffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        originalText={originalText}
        suggestedText={suggestedText}
        mode={activeMode}
        isLoading={isEnhancing}
        onAccept={handleAccept}
        onRegenerate={() => triggerAI(activeMode)}
      />
    </NodeViewWrapper>
  );
};

export const ResumeListItem = Node.create({
  name: 'listItem',
  group: 'listItem',
  content: 'paragraph block*',
  defining: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResumeListItemComponent);
  },
});
