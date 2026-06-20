interface Props {
  category: string
  className?: string
}

export default function CategoryBadge({ category, className = '' }: Props) {
  return (
    <span
      className={[
        'inline-block bg-petal text-on-petal',
        'font-sans text-[11px] font-bold tracking-[0.1em] uppercase',
        'px-3 py-1 rounded-full',
        className,
      ].join(' ')}
    >
      {category}
    </span>
  )
}
