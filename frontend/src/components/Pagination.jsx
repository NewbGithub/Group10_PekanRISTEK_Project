import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Pagination({ page, totalPages }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const goToPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }
    navigate(`/reports?${params.toString()}`, { replace: true });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="font-ui text-xs border border-gray-300 px-2.5 py-1 rounded font-semibold tracking-wider transition disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        &lt; Prev
      </button>
      {[...Array(totalPages)].map((_, i) => {
        const p = i + 1;
        const active = p === page;
        return (
          <button
            key={p}
            onClick={() => goToPage(p)}
            aria-current={active ? 'page' : undefined}
            className={`font-ui text-xs border border-gray-300 px-2.5 py-1 rounded font-semibold tracking-wider transition ${
              active
                ? 'bg-gray-200 text-gray-800'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="font-ui text-xs border border-gray-300 px-2.5 py-1 rounded font-semibold tracking-wider transition disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Next &gt;
      </button>
    </div>
  );
}
