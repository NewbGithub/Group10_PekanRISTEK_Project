import { Link, useNavigate } from 'react-router-dom';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  return 'Just now';
}

export default function ReportCard({ report, stackedOnMobile }) {
  const navigate = useNavigate();
  const placeholder = (report.category || 'ITEM').toUpperCase();

  const handleCardClick = (e) => {
    if (e.target.closest('a')) return;
    navigate(`/reports/${report.id}`);
  };

  return (
    <Link to={`/reports/${report.id}`} onClick={handleCardClick} className="block w-full min-w-0">
      <div className={`w-full min-w-0 ${stackedOnMobile ? 'flex flex-col' : 'flex flex-row md:flex-row'} overflow-hidden border border-gray-300 rounded-lg bg-white`}>
        <div className={`bg-gray-100 flex items-center justify-center shrink-0 ${
          stackedOnMobile
            ? 'w-full h-48 border-b border-gray-300'
            : 'w-28 md:w-[160px] h-[160px] border-r border-gray-300'
        }`}>
          {report.imageUrl ? (
            <img src={report.imageUrl} alt={report.itemName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-ui text-xs tracking-wider text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <span className="font-ui text-xs tracking-wider border border-gray-300 px-2 py-1 rounded text-gray-600 bg-gray-50">
              {report.type}
            </span>
            <span className={`font-body text-xs ${stackedOnMobile ? 'md:hidden' : 'hidden md:inline'}`}>
              {timeAgo(report.createdAt)}
            </span>
          </div>
          <h3 className="font-headline font-semibold text-gray-900">{report.itemName}</h3>
          <p className="font-body text-sm text-gray-500">{report.location}</p>
          <p className={`font-body text-xs text-gray-500 mt-1 ${stackedOnMobile ? 'md:hidden' : ''}`}>
            {timeAgo(report.createdAt)}
          </p>
          <p className={`font-body text-sm text-gray-600 line-clamp-2 ${stackedOnMobile ? '' : 'hidden md:block'}`}>
            {report.description}
          </p>
          <span className={`font-ui text-sm tracking-wider hover:underline mt-1 inline-block ${stackedOnMobile ? '' : 'hidden md:inline-flex'}`}>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
