import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function AdminPageShell({ children, className }: Props) {
  return (
    <div className={['px-4 py-6 sm:px-8 sm:py-10 lg:px-16 lg:py-16', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
