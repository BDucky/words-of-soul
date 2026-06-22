export function DashboardIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function StoriesIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 5h12M3 9h12M3 13h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function AnalyticsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="10" width="3" height="7" rx="1" fill="currentColor" />
      <rect x="7.5" y="6" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="13" y="2" width="3" height="15" rx="1" fill="currentColor" />
    </svg>
  )
}

export function SettingsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 1.5v1.8M9 14.7v1.8M1.5 9h1.8M14.7 9h1.8M3.57 3.57l1.27 1.27M13.16 13.16l1.27 1.27M14.43 3.57l-1.27 1.27M4.84 13.16l-1.27 1.27"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function HelpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.5 5.5a1.5 1.5 0 0 1 2.9.5c0 1-1.4 1.5-1.4 2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="7" cy="10.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function LogoutIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function PencilIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11 2 14 5 5 14H2v-3L11 2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TrashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WriteIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M4 24 6 18 20 4l4 4-14 14-6 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M18 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
