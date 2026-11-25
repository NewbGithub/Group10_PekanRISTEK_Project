export default function Badge({ status }) {
  const lost = status === 'LOST';
  return (
    <span
      className={`ui inline-block rounded-md border-2 border-ink px-2 py-1 text-xs leading-4 ${lost ? 'bg-rose' : 'bg-green'}`}
    >
      {status}
    </span>
  );
}
