import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getReports } from '../services/reportService';
import ReportCard from '../components/ReportCard';
import useReferenceData from '../hooks/useReferenceData';

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { categories: categoryOptions } = useReferenceData();

  useEffect(() => {
    let cancelled = false;
    const fetchRecent = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getReports({ limit: 4 });
        if (!cancelled) {
          setReports(result.reports);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load reports.');
          setLoading(false);
        }
      }
    };
    fetchRecent();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hash scrolling
  useEffect(() => {
    if (location.hash === '#how-it-works') {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const handleRetry = () => {
    window.location.reload();
  };

  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="flex flex-col min-h-0">
      <section className="bg-gray-100 border-b border-gray-300 py-14 px-4">
        <div className="max-w-3xl mx-auto text-left md:text-center">
          <h1 className="font-headline text-3xl text-gray-900 mb-3">
            Lost something? Let's find it.
          </h1>
          <p className="font-body text-gray-600 mt-3 text-sm mb-6">
            Search reported items or post your own. Our community helps lost belongings find their way home.
          </p>
          <Link
            to="/reports"
            className="font-ui w-full md:w-auto px-5 py-3 bg-pink-500 text-white rounded-lg font-semibold tracking-wider text-center text-sm hover:bg-pink-600 block"
          >
            Browse All Reports
          </Link>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-center">
            <Link
              to="/create?type=LOST"
              className="font-ui w-full md:w-auto px-5 py-3 bg-pink-500 text-white rounded-lg font-semibold tracking-wider text-center text-sm hover:bg-pink-600"
            >
              I Lost Something
            </Link>
            <Link
              to="/create?type=FOUND"
              className="font-ui w-full md:w-auto px-5 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold tracking-wider text-center text-sm hover:bg-gray-50"
            >
              I Found Something
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-b border-gray-300 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-2">
          <span className="font-ui text-xs tracking-wider text-gray-600 mb-2 md:inline md:mb-0 md:mr-2">
            BROWSE BY CATEGORY
          </span>
          <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-1">
            {categoryOptions.map(({ slug, name }) => (
              <Link
                key={slug}
                to={{
                  pathname: '/reports',
                  search: `?categories=${encodeURIComponent(slug)}`,
                }}
                className="font-ui shrink-0 px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold tracking-wider text-gray-800 hover:bg-gray-100 whitespace-nowrap"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-lg text-gray-900 mb-0">Recently reported</h2>
          <Link to="/reports" className="font-ui text-sm font-semibold tracking-wider text-gray-700 hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p className="font-body text-sm text-gray-500 col-span-full py-8 text-center">
              Loading reports...
            </p>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="font-body text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="font-ui text-sm border border-gray-300 px-4 py-2 rounded font-semibold tracking-wider text-gray-700 bg-white hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          ) : sortedReports.length === 0 ? (
            <p className="font-body text-sm text-gray-500 col-span-full py-8 text-center">
              No reports yet.
            </p>
          ) : (
            sortedReports.map((report) => (
              <ReportCard key={report.id} report={report} layout="top" />
            ))
          )}
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 border-t border-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-headline text-lg text-gray-900 mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="flex overflow-hidden border border-gray-300 rounded-lg bg-white">
              <div className="w-14 bg-gray-100 border-r border-gray-300 flex items-center justify-center font-headline text-xl text-gray-800 shrink-0">
                1
              </div>
              <div className="p-4">
                <h3 className="font-headline font-semibold text-gray-900 text-sm mb-1">Report</h3>
                <p className="font-body text-sm text-gray-600">
                  Post what you lost or found with a photo, location and date.
                </p>
              </div>
            </div>
            <div className="flex overflow-hidden border border-gray-300 rounded-lg bg-white">
              <div className="w-14 bg-gray-100 border-r border-gray-300 flex items-center justify-center font-headline text-xl text-gray-800 shrink-0">
                2
              </div>
              <div className="p-4">
                <h3 className="font-headline font-semibold text-gray-900 text-sm mb-1">Match</h3>
                <p className="font-body text-sm text-gray-600">
                  We surface likely matches so owners and finders can connect.
                </p>
              </div>
            </div>
            <div className="flex overflow-hidden border border-gray-300 rounded-lg bg-white">
              <div className="w-14 bg-gray-100 border-r border-gray-300 flex items-center justify-center font-headline text-xl text-gray-800 shrink-0">
                3
              </div>
              <div className="p-4">
                <h3 className="font-headline font-semibold text-gray-900 text-sm mb-1">Reunite</h3>
                <p className="font-body text-sm text-gray-600">
                  Confirm details, arrange a safe handover, and mark it returned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
