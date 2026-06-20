'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/storage'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function CoverImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const url = await uploadImage(file, 'covers')
      onChange(url)
    } catch {
      alert('Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      className="relative w-full aspect-[16/7] rounded-lg overflow-hidden border border-dashed border-outline-variant hover:border-primary cursor-pointer transition-colors group bg-surface-container-low"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {value ? (
        <>
          <Image src={value} alt="Cover" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-sans text-sm text-white">Đổi ảnh bìa</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          {uploading ? (
            <span className="font-sans text-sm animate-pulse">Đang tải lên...</span>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              <p className="font-sans text-sm">Kéo thả hoặc <span className="underline">chọn ảnh bìa</span></p>
              <p className="font-sans text-xs text-outline">JPG, PNG, WEBP · Tỉ lệ 16:7 trông đẹp nhất</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
