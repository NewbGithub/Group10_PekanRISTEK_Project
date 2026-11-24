import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from './Button';

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
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        small
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹ Prev
      </Button>
      {[...Array(totalPages)].map((_, i) => {
        const p = i + 1;
        const active = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={active ? 'page' : undefined}
            className={`press ui grid h-11 w-11 place-items-center rounded-full text-[15px] ${
              active ? 'bg-pink' : 'bg-white'
            }`}
          >
            {p}
          </button>
        );
      })}
      <Button
        variant="outline"
        small
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next ›
      </Button>
    </nav>
  );
}
