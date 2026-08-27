export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-muted gap-3">
      <div className="w-8 h-8 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
