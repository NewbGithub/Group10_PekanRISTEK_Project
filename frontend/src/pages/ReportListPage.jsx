import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReports } from '../services/reportService';
import ReportCard from '../components/ReportCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import Chip from '../components/Chip';
import useReferenceData from '../hooks/useReferenceData';

export default function ReportListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { categories: categoryOptions } = useReferenceData();

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
        const result = await getReports({
          search,
          type,
          category,
          categories,
          dateRange,
          location,
          page,
          limit,
        });
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
    return () => {
      cancelled = true;
    };
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

  const toggleMobileCategory = (slug) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get('categories')?.split(',').filter(Boolean) || [];
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    if (next.length > 0) params.set('categories', next.join(','));
    else params.delete('categories');
    params.delete('page');
    setSearchParams(params, { replace: true });
  };

  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return (
    <div className="mx-auto w-full max-w-full px-4 pb-14 pt-8 lg:px-6 lg:pt-12">
      <div className="stamp" style={{ '--i': 1 }}>
        <p className="ui text-xs text-mute md:text-sm">Home / Browse all</p>
        <h1 className="mt-2 text-[2rem] leading-10 md:text-[2.75rem] md:leading-[3.25rem]">
          Browse all reports
        </h1>
        <p className="mt-2 text-sm leading-5 text-mute md:text-lg md:leading-7">
          {loading
            ? 'Loading reports...'
            : `${total} active reports across Fasilkom UI and Universitas Indonesia.`}
        </p>
      </div>

      <SearchBar />

      {/* Mobile controls */}
      <div className="mt-4 grid gap-4 lg:hidden">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          {categoryOptions.map(({ slug, name }) => (
            <Chip
              key={slug}
              active={categoriesParam.split(',').includes(slug)}
              onClick={() => toggleMobileCategory(slug)}
            >
              {name}
            </Chip>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen((open) => !open)}
        >
          {mobileFiltersOpen ? 'Hide filters' : 'Filters'}
        </Button>
        {mobileFiltersOpen && (
          <div className="snap-y">
            <FilterPanel key={filterKey} onApply={() => setMobileFiltersOpen(false)} />
          </div>
        )}
      </div>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
        <div className="stamp hidden lg:block" style={{ '--i': 3 }}>
          <FilterPanel key={filterKey} />
        </div>

        <section aria-label="Results">
          <p className="ui mb-4 text-xs text-mute md:text-[0.9375rem]">
            {loading
              ? 'Loading reports...'
              : `Showing ${startIndex}–${endIndex} of ${total} reports`}
          </p>

          {loading ? (
            <div className="panel p-6">
              <p className="text-sm leading-6 text-mute">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="panel p-6">
              <h2 className="text-2xl">Could not load reports</h2>
              <p className="mt-2 text-mute">{error}</p>
              <Button className="mt-6" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          ) : total === 0 ? (
            <div className="panel p-6">
              <h2 className="text-2xl">No reports match</h2>
              <p className="mt-2 text-mute">
                Clear a filter or search for a different place or item.
              </p>
              <Button variant="outline" className="mt-6" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pr-2 md:gap-6">
              {reports.map((report, i) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  layout="top"
                  className="stamp"
                  style={{ '--i': 4 + i }}
                />
              ))}
            </div>
          )}

          {!loading && !error && total > 0 && (
            <Pagination page={currentPage} totalPages={totalPages} />
          )}
        </section>
      </div>
    </div>
  );
}
