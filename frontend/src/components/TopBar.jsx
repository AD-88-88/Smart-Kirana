import { useAuth } from '../context/AuthContext';

export default function TopBar({ title = 'SmartKirana', onBack }) {
  const { logout, role } = useAuth();

  return (
    <div className="sticky top-0 z-30 bg-primary text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} aria-label="Go back" className="p-1 -ml-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <span className="font-bold text-lg tracking-tight">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs bg-white/15 px-2 py-1 rounded-full capitalize">{role}</span>
        <button onClick={logout} aria-label="Log out" className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
