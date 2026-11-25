import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getReports } from '../services/reportService';
import ReportCard from '../components/ReportCard';
import Button from '../components/Button';
import Chip from '../components/Chip';
import useReferenceData from '../hooks/useReferenceData';

const steps = [
  ['1', 'Report', 'Post what you lost or found with a photo, location and date.'],
  ['2', 'Match', 'We surface likely matches so owners and finders can connect.'],
  ['3', 'Reunite', 'Confirm details, arrange a safe handover, and mark it returned.'],
];

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
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
    if (location.hash !== '#how-it-works') return undefined;
    const scrollToSection = () =>
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    scrollToSection();
    // Layout can still grow while the report photos load; re-target once settled.
    const timer = window.setTimeout(scrollToSection, 350);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  const handleRetry = () => {
    window.location.reload();
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/reports?search=${encodeURIComponent(q)}` : '/reports');
  };

  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-ink bg-yellow px-4 py-10 md:px-16 md:py-24">
        <div className="mx-auto max-w-[56.25rem] md:text-center">
          <h1
            className="stamp text-[2.5rem] leading-[3rem] md:text-[4rem] md:leading-[4.5rem]"
            style={{ '--i': 1 }}
          >
            Lost something?
            <br />
            Let’s find it.
          </h1>
          <p
            className="stamp mt-6 text-base leading-6 text-[#2B2B2B] md:mx-auto md:max-w-[40rem] md:text-xl md:leading-7"
            style={{ '--i': 2 }}
          >
            Search reported items or post your own. Our community helps lost
            belongings find their way home.
          </p>
          <form
            onSubmit={submitSearch}
            className="stamp mt-6 hidden gap-4 md:mx-auto md:grid md:max-w-[47.5rem] md:grid-cols-[1fr_auto_auto] md:items-center md:rounded-[10px] md:border-[3px] md:border-ink md:bg-white md:p-2 md:pl-7 md:shadow-hard"
            style={{ '--i': 3 }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search lost and found items"
              placeholder="What did you lose or find?"
              maxLength={100}
              className="h-14 w-full rounded-[10px] border-[3px] border-ink bg-white px-4 shadow-hard placeholder:text-mute focus:outline-none md:h-12 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:shadow-none"
            />
            <span className="ui hidden text-[0.9375rem] md:block">All locations</span>
            <Button type="submit" className="w-full md:w-auto">
              Search
            </Button>
          </form>
          <div
            className="stamp mt-6 grid gap-4 md:flex md:justify-center"
            style={{ '--i': 4 }}
          >
            <Button to="/reports" variant="outline">
              Browse All Reports
            </Button>
            <Button to="/create?type=LOST">I lost something</Button>
            <Button to="/create?type=FOUND" variant="outline">
              I found something
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="stamp pt-8 md:px-16 md:pt-8" style={{ '--i': 5 }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
          <span className="ui shrink-0 whitespace-nowrap px-4 text-xs md:px-0 md:text-base">
            Browse by category
          </span>
          <div className="flex w-full min-w-0 gap-2 overflow-x-auto px-4 pb-2 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 md:gap-3">
            {categoryOptions.map(({ slug, name }) => (
              <Chip
                key={slug}
                onClick={() => navigate(`/reports?categories=${encodeURIComponent(slug)}`)}
              >
                {name}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Recently reported */}
      <section className="px-4 py-8 md:px-16 md:py-14">
        <div
          className="stamp mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-7"
          style={{ '--i': 6 }}
        >
          <h2 className="text-2xl leading-8 md:text-[2rem] md:leading-10">
            Recently reported
          </h2>
          <Link to="/reports" className="ui shrink-0 text-xs text-link md:text-base">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 pr-2 md:grid-cols-2">
          {loading ? (
            <div className="panel p-6 md:col-span-2">
              <p className="text-sm leading-6 text-mute">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="panel p-6 md:col-span-2">
              <p className="text-sm text-mute">{error}</p>
              <Button className="mt-4" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          ) : sortedReports.length === 0 ? (
            <div className="panel p-6 md:col-span-2">
              <p className="text-sm leading-6 text-mute">No reports yet.</p>
            </div>
          ) : (
            sortedReports.map((report, i) => (
              <ReportCard
                key={report.id}
                report={report}
                layout="top"
                className="stamp"
                style={{ '--i': 7 + i }}
              />
            ))
          )}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t-[3px] border-ink bg-soft px-4 py-12 md:px-16 md:py-16"
      >
        <h2 className="mb-6 text-2xl leading-8 md:mb-9 md:text-[2rem] md:leading-10">
          How it works
        </h2>
        <div className="grid gap-6 pr-2 md:grid-cols-3">
          {steps.map(([n, title, description]) => (
            <div key={n} className="panel flex overflow-hidden">
              <div className="grid w-14 shrink-0 place-items-center border-r-[3px] border-ink bg-pink md:w-16">
                <span className="wiggle font-head text-3xl font-bold md:text-[2.5rem]">
                  {n}
                </span>
              </div>
              <div className="grid content-center gap-2 p-4 md:p-6">
                <h3 className="text-2xl leading-8 md:text-[2rem] md:leading-10">
                  {title}
                </h3>
                <p className="text-sm leading-5 text-mute md:text-base md:leading-6">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
