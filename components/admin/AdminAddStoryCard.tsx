import Link from 'next/link'
import { WriteIcon } from '@/components/icons'

export default function AdminAddStoryCard() {
  return (
    <Link
      href="/admin/stories/new"
      className="bg-surface-container-low rounded-lg flex flex-col items-center justify-center gap-4 min-h-[400px] hover:bg-surface-container transition-colors group border border-outline-variant/20"
    >
      <div className="w-16 h-16 bg-primary-fixed rounded-xl flex items-center justify-center text-primary group-hover:bg-primary-fixed-dim transition-colors">
        <WriteIcon size={28} />
      </div>
      <span className="font-serif text-2xl text-primary text-center px-6 leading-snug">
        Viết thêm một
        <br />
        mẩu chuyện
      </span>
    </Link>
  )
}
