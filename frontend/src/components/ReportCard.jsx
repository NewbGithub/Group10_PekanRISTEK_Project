import { Link } from 'react-router-dom';
import Badge from './Badge';
import Photo from './Photo';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/** Reported-item card. `stack` = photo on top on mobile, left from md up. */
export default function ReportCard({
  report,
  layout = 'side',
  className = '',
  style,
}) {
  const stack = layout === 'top';
  const photo = stack
    ? 'h-36 border-b-[3px] border-ink md:h-auto md:w-[168px] md:shrink-0 md:border-b-0 md:border-r-[3px]'
    : 'w-24 shrink-0 border-r-[3px] border-ink md:w-[168px]';
  const label = (report.category?.name || 'ITEM').toUpperCase();
  const time = timeAgo(report.createdAt);

  return (
    <Link
      to={`/reports/${report.id}`}
      style={style}
      className={`press-card flex overflow-hidden rounded-[10px] bg-white ${
        stack ? 'flex-col md:flex-row' : 'flex-row'
      } ${className}`}
    >
      <Photo
        index={report.id}
        label={label}
        imageUrl={report.imageUrl}
        className={photo}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <Badge status={report.type} />
          {stack && <span className="text-xs text-mute md:text-[13px]">{time}</span>}
        </div>
        <h3 className="text-lg leading-6 md:text-xl md:leading-7">
          {report.itemName}
        </h3>
        <p className="text-xs leading-4 text-mute md:text-sm md:leading-5">
          {report.location?.name}
        </p>
        <p
          className={`text-sm leading-5 text-mute ${stack ? '' : 'hidden md:block'}`}
        >
          {report.description}
        </p>
        {!stack && <span className="text-xs text-mute md:hidden">{time}</span>}
        <span className="ui mt-auto text-xs text-link">View details →</span>
      </div>
    </Link>
  );
}
