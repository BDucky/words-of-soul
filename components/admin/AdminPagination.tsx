import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'

interface Props {
  currentPage: number
  totalPages: number
  baseHref: string
}

export default function AdminPagination({ currentPage, totalPages, baseHref }: Props) {
  if (totalPages <= 1) return null

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <nav className="flex items-center justify-center gap-8" aria-label="Phân trang">
      {prevDisabled ? (
        <span className="flex items-center gap-2 font-sans text-xs font-bold tracking-[0.08em] uppercase text-outline/40 cursor-not-allowed select-none">
          <ChevronLeftIcon size={16} />
          Trang trước
        </span>
      ) : (
        <Link
          href={`${baseHref}?page=${currentPage - 1}`}
          className="flex items-center gap-2 font-sans text-xs font-bold tracking-[0.08em] uppercase text-secondary hover:text-primary transition-colors"
        >
          <ChevronLeftIcon size={16} />
          Trang trước
        </Link>
      )}

      <div className="flex items-center gap-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`${baseHref}?page=${p}`}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-xl font-sans text-xs font-bold transition-colors',
              p === currentPage
                ? 'bg-primary text-on-primary'
                : 'text-secondary hover:bg-surface-container',
            ].join(' ')}
          >
            {p}
          </Link>
        ))}
      </div>

      {nextDisabled ? (
        <span className="flex items-center gap-2 font-sans text-xs font-bold tracking-[0.08em] uppercase text-outline/40 cursor-not-allowed select-none">
          Trang tiếp
          <ChevronRightIcon size={16} />
        </span>
      ) : (
        <Link
          href={`${baseHref}?page=${currentPage + 1}`}
          className="flex items-center gap-2 font-sans text-xs font-bold tracking-[0.08em] uppercase text-secondary hover:text-primary transition-colors"
        >
          Trang tiếp
          <ChevronRightIcon size={16} />
        </Link>
      )}
    </nav>
  )
}
