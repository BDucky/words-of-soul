'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { uploadImage } from '@/lib/storage'

interface Props {
  content: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: 'Bắt đầu câu chuyện của bạn...' }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose-story focus:outline-none' },
    },
  })

  async function handleImageUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return
      try {
        const url = await uploadImage(file, 'inline')
        editor.chain().focus().setImage({ src: url }).run()
      } catch {
        alert('Không thể tải ảnh lên. Vui lòng thử lại.')
      }
    }
    input.click()
  }

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={[
        'px-2.5 py-1.5 rounded text-sm font-sans transition-colors',
        active
          ? 'bg-primary text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container',
      ].join(' ')}
    >
      {children}
    </button>
  )

  return (
    <div className="tiptap-editor border border-outline-variant/60 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-outline-variant/40 bg-surface-container-low">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng">
          <em>I</em>
        </ToolbarButton>
        <span className="w-px h-5 bg-outline-variant/60 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề lớn">
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề nhỏ">
          H2
        </ToolbarButton>
        <span className="w-px h-5 bg-outline-variant/60 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
          &ldquo;&rdquo;
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách">
          ≡
        </ToolbarButton>
        <span className="w-px h-5 bg-outline-variant/60 mx-1" />
        <ToolbarButton onClick={handleImageUpload} title="Chèn ảnh">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor area — max-w-180 mirrors the 720px reader column for accurate WYSIWYG */}
      <div className="px-6 py-6 min-h-[420px] bg-surface-container-lowest">
        <div className="max-w-180 mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Word count */}
      <div className="px-4 py-2 text-right border-t border-outline-variant/30 bg-surface-container-low">
        <span className="font-sans text-xs text-outline">
          {editor.storage.characterCount.words()} từ · ~{Math.max(1, Math.ceil(editor.storage.characterCount.words() / 200))} phút đọc
        </span>
      </div>
    </div>
  )
}
