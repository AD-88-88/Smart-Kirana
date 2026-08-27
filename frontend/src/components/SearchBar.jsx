export default function SearchBar({ value, onChange, placeholder = 'Search item or category...', rightSlot }) {
  return (
    <div className="sticky top-[56px] z-20 bg-surface px-4 py-2">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-muted">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 outline-none text-base placeholder:text-ink-muted bg-transparent"
          autoComplete="off"
        />
        {rightSlot}
      </div>
    </div>
  );
}
