import { NavLink } from 'react-router-dom';

const TABS = [
  {
    to: '/',
    label: 'Home',
    icon: (active) => (
      <path
        d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 001 1h3v-5h4v5h3a1 1 0 001-1v-9"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/pos',
    label: 'POS',
    icon: (active) => (
      <>
        <rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" strokeWidth={active ? 2.4 : 2} />
        <path d="M8 3h8M9 11h6M9 15h4" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" />
      </>
    ),
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (active) => (
      <>
        <path d="M3 7l9-4 9 4-9 4-9-4z" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinejoin="round" />
        <path d="M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinejoin="round" />
      </>
    ),
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: (active) => (
      <>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth={active ? 2.4 : 2} />
        <path d="M3 20a6 6 0 0112 0M15 8a3 3 0 110 6M21 20a6 6 0 00-6-6" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" />
      </>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex justify-around pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 text-[11px] font-medium ${
              isActive ? 'text-primary' : 'text-ink-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {tab.icon(isActive)}
              </svg>
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
