/** Secondary toggle: snaps to black + yellow on hover (0ms). */
export default function Chip({ active = false, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`flip ui shrink-0 rounded-[10px] border-[3px] border-ink px-4 py-2 text-[13px] leading-6 shadow-hard md:text-[15px] ${active ? 'bg-ink text-yellow' : 'bg-white'} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
