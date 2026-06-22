interface Props {
  label: string
  value: string | number
  variant?: 'neutral' | 'accent'
}

export default function StatCard({ label, value, variant = 'neutral' }: Props) {
  const isAccent = variant === 'accent'

  return (
    <div
      className={[
        'rounded-lg p-4 flex flex-col gap-1',
        isAccent ? 'bg-tertiary-fixed' : 'bg-surface-container',
      ].join(' ')}
    >
      <span
        className={[
          'font-sans text-xs font-bold tracking-[0.08em] uppercase',
          isAccent ? 'text-on-tertiary-fixed-variant' : 'text-secondary',
        ].join(' ')}
      >
        {label}
      </span>
      <span
        className={[
          'font-serif text-2xl truncate',
          isAccent ? 'text-on-tertiary-fixed' : 'text-primary',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}
