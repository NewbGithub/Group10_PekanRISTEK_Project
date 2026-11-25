import { Link } from 'react-router-dom';

/** Hard-shadow button. variant: 'primary' (pink) | 'outline' (white). Pass `to` to render a router link. */
export default function Button({
  to,
  variant = 'primary',
  full = false,
  small = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'press ui inline-flex items-center justify-center gap-2 rounded-[10px] text-center leading-6',
    small ? 'px-4 py-2 text-xs md:text-sm' : 'px-6 py-4 text-sm',
    variant === 'primary' ? 'bg-pink' : 'bg-white',
    full ? 'w-full' : '',
    className,
  ].join(' ');

  return to ? (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  ) : (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
