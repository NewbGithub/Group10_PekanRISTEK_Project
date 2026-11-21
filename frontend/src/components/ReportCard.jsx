import { useState } from 'react';
import { Link } from 'react-router-dom';

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

export default function ReportCard({ report, layout = 'side' }) {
  const placeholder = (report.category?.name || 'ITEM').toUpperCase();
  const isTop = layout === 'top';
  const [imageFailed, setImageFailed] = useState(false);

  const handleImageError = () => {
    setImageFailed(true);
  };

  return (
    <Link to={`/reports/${report.id}`} className="block w-full min-w-0">
      <div className={`w-full min-w-0 overflow-hidden border border-gray-300 rounded-lg bg-white ${isTop ? 'flex flex-col' : 'flex flex-row'}`}>
        <div className={`bg-gray-100 flex items-center justify-center shrink-0 ${isTop ? 'w-full h-48 border-b border-gray-300' : 'w-28 md:w-40 self-stretch border-r border-gray-300'}`}>
          {report.imageUrl && !imageFailed ? (
            <img
              src={report.imageUrl}
              alt={report.itemName}
              className="w-full h-full object-cover max-w-full"
              loading="lazy"
              onError={handleImageError}
            />
          ) : (
            <span className="font-ui text-xs tracking-wider text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className={`flex-1 min-w-0 flex flex-col gap-1 ${isTop ? 'p-4' : 'p-3'}`}>
          <div className="flex justify-between items-start gap-2">
            <span className="font-ui text-xs tracking-wider border border-gray-300 px-2 py-1 rounded text-gray-600 bg-gray-50">
              {report.type}
            </span>
            <span className="font-body text-xs text-gray-500 whitespace-nowrap">
              {timeAgo(report.createdAt)}
            </span>
          </div>
          <h3 className={`font-headline font-semibold text-gray-900 ${isTop ? '' : 'truncate'}`}>
            {report.itemName}
          </h3>
          <p className="font-body text-sm text-gray-500 truncate">{report.location?.name}</p>
          <p className={`font-body text-sm text-gray-600 ${isTop ? 'line-clamp-2' : 'line-clamp-1'}`}>
            {report.description}
          </p>
          <span className={`font-ui text-sm tracking-wider hover:underline mt-auto ${isTop ? 'block' : 'hidden md:inline-flex'}`}>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
