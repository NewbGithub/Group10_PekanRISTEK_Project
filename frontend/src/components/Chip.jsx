/** Secondary toggle: snaps to black + yellow on hover (0ms). */
export default function Chip({ active = false, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`ui shrink-0 rounded-[10px] border-[3px] border-ink px-4 py-2 text-[0.8125rem] leading-6 text-ink shadow-hard transition-all duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:text-[0.9375rem] ${active ? 'bg-neutral-300' : 'bg-white'} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
