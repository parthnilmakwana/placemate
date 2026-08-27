import React from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Link2, Wand2, Undo, Redo } from 'lucide-react';

const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 p-1.5 sm:p-2 border-b border-brand-border bg-brand-bg/95 backdrop-blur-md sticky top-0 z-20 overflow-x-auto hide-scrollbar flex-nowrap shrink-0 max-w-full">
      <div className="flex items-center gap-1 border-r border-brand-border pr-1.5 sm:pr-2 mr-0.5 sm:mr-1 shrink-0">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-1.5 rounded hover:bg-brand-surface-hover text-text-secondary disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-1.5 rounded hover:bg-brand-surface-hover text-text-secondary disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-brand-border pr-1.5 sm:pr-2 mr-0.5 sm:mr-1 shrink-0">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Strikethrough"
        >
          <span className="line-through text-[14px] font-serif w-4 text-center">S</span>
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-brand-border pr-1.5 sm:pr-2 mr-0.5 sm:mr-1 shrink-0">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-brand-border pr-1.5 sm:pr-2 mr-0.5 sm:mr-1 shrink-0">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => {
            const url = window.prompt('URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else if (url === '') editor.chain().focus().unsetLink().run();
          }}
          className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-surface-hover text-text-main'}`}
          title="Insert Link"
        >
          <Link2 size={16} />
        </button>
      </div>
      
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md bg-linear-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-500/20 text-indigo-400 transition-all shrink-0"
          title="AI Formatting Assist"
        >
          <Wand2 size={14} />
          <span className="hidden sm:inline">AI Assist</span>
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
