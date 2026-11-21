import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReports } from '../services/reportService';
import ReportCard from '../components/ReportCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';

export default function ReportListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = 8;
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'ALL';
  const category = searchParams.get('category') || 'ALL';
  const categoriesParam = searchParams.get('categories') || '';
  const dateRange = searchParams.get('dateRange') || '';
  const location = searchParams.get('location') || 'ALL';

  // Remounting on applied-filter changes keeps the staged sidebar state in sync
  // with back/forward and resets, without reacting to search/location changes.
  const filterKey = `${type}|${categoriesParam}|${dateRange}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const categories = categoriesParam ? categoriesParam.split(',') : [];
        const result = await getReports({ search, type, category, categories, dateRange, location, page, limit });
        if (!cancelled) {
          setReports(result.reports);
          setTotal(result.total);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load reports.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [search, type, category, categoriesParam, dateRange, location, page, limit]);

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);

  // Keep an out-of-range `?page=` value from rendering a blank page.
  useEffect(() => {
    if (loading || page <= totalPages) return;
    const params = new URLSearchParams(searchParams);
    if (totalPages <= 1) params.delete('page');
    else params.set('page', String(totalPages));
    setSearchParams(params, { replace: true });
  }, [loading, page, totalPages, searchParams, setSearchParams]);

  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <div className="w-full">
      <nav className="font-ui text-xs tracking-wider text-gray-500 mb-1">
        Home / Browse All
      </nav>
      <h1 className="font-headline text-2xl text-gray-800 mb-1">Browse all reports</h1>
      <p className="font-body text-sm text-gray-500 mb-4">
        {loading ? 'Loading reports...' : `${total} active reports`}
      </p>

      <SearchBar />

      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="hidden lg:block">
          <FilterPanel key={filterKey} />
        </aside>

        <div className="min-w-0">
          {/* Collapsible filter panel (hidden once the sidebar is visible) */}
          <div className="mb-4">
            <button
              onClick={() => setMobileFiltersOpen((o) => !o)}
              className="font-ui text-xs border border-gray-300 px-3 py-1 rounded text-gray-700 bg-white hover:bg-gray-50 w-full lg:hidden"
            >
              {mobileFiltersOpen ? 'Hide filters' : 'Filters'}
            </button>
          </div>
          {mobileFiltersOpen && (
            <div className="mb-4 lg:hidden">
              <FilterPanel key={filterKey} onApply={() => setMobileFiltersOpen(false)} />
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="font-ui text-xs tracking-wider text-gray-500">
              {loading
                ? 'Loading reports...'
                : `Showing ${startIndex}–${endIndex} of ${total} reports`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p className="font-body text-sm text-gray-500">Loading reports...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="font-body text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="font-ui text-sm border border-gray-300 px-4 py-2 rounded font-semibold tracking-wider text-gray-700 bg-white hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            ) : total === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="font-body text-sm text-gray-500 mb-4">
                  No matching reports.
                </p>
                <button
                  onClick={resetFilters}
                  className="font-ui text-sm border border-gray-300 px-4 py-2 rounded font-semibold tracking-wider text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              reports.map((report) => (
                <ReportCard key={report.id} report={report} layout="side" />
              ))
            )}
          </div>

          {!loading && !error && total > 0 && (
            <Pagination page={currentPage} totalPages={totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
