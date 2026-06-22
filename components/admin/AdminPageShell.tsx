import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function AdminPageShell({ children, className }: Props) {
  return (
    <div className={['px-16 py-16', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
