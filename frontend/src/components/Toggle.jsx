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
          className={`ui flex-1 rounded-[10px] px-4 py-2 text-[0.8125rem] leading-6 transition-all duration-75 active:translate-x-0.5 active:translate-y-0.5 md:flex-none md:px-6 md:text-[0.9375rem] ${
            value === o.value
              ? 'bg-neutral-300 text-ink'
              : 'text-mute md:hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
