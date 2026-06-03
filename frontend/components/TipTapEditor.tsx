'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef } from 'react';
import {
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiImage,
  FiMessageSquare,
} from 'react-icons/fi';
import { uploadApi } from '@/lib/api';
import toast from 'react-hot-toast';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const TipTapEditor = ({ content, onChange, placeholder = '开始写作...' }: TipTapEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadApi.image(file);
      return result.url;
    } catch (error) {
      toast.error('图片上传失败');
      return null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const url = await handleImageUpload(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition ${
        active ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="一级标题"
        >
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="二级标题"
        >
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="三级标题"
        >
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">H3</span>
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="粗体"
        >
          <FiBold className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="斜体"
        >
          <FiItalic className="w-5 h-5" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="无序列表"
        >
          <FiList className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="有序列表"
        >
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">OL</span>
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="引用"
        >
          <FiMessageSquare className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="代码块"
        >
          <FiCode className="w-5 h-5" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton onClick={addImage} title="插入图片">
          <FiImage className="w-5 h-5" />
        </ToolbarButton>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <EditorContent editor={editor} className="min-h-[400px]" />
    </div>
  );
};
