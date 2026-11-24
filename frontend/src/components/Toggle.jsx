/** Segmented control, e.g. All / Lost / Found. options: [{value, label}] */
export default function Toggle({ options, value, onChange, className = '' }) {
  return (
    <div
      role="group"
      className={`flex gap-1 rounded-[10px] border-[3px] border-ink bg-soft p-2 ${className}`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`ui flex-1 rounded-[10px] px-4 py-2 text-[13px] leading-6 md:flex-none md:px-6 md:text-[15px] ${
            value === o.value ? 'bg-ink text-cream' : 'flip'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
