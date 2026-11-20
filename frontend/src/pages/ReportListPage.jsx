import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReports } from '../services/reportService';
import ReportCard from '../components/ReportCard';

export default function ReportListPage() {
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const urlLocation = searchParams.get('location') || 'ALL';
  const urlCategory = searchParams.get('category') || 'ALL';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [locationFilter, setLocationFilter] = useState(urlLocation);
  const [topTypeFilter, setTopTypeFilter] = useState('ALL');
  const [pendingTypes, setPendingTypes] = useState(['ALL']);
  const [pendingCategories, setPendingCategories] = useState(urlCategory !== 'ALL' ? [urlCategory] : ['ALL']);
  const [pendingDates, setPendingDates] = useState(['ALL']);
  const [appliedTypes, setAppliedTypes] = useState(['ALL']);
  const [appliedCategories, setAppliedCategories] = useState(urlCategory !== 'ALL' ? [urlCategory] : ['ALL']);
  const [appliedDates, setAppliedDates] = useState(['ALL']);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortDirection, setSortDirection] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const ITEMS_PER_PAGE = 8;

  const resetPage = () => {
    setCurrentPage(1);
    setVisibleCount(6);
  };

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const toggleType = (opt) => {
    setPendingTypes((prev) => {
      if (prev.includes(opt)) {
        const next = prev.filter((t) => t !== opt);
        return next.length > 0 ? next : ['ALL'];
      }
      if (opt === 'ALL') return ['ALL'];
      return prev.includes('ALL') ? [opt] : [...prev, opt];
    });
    resetPage();
  };

  const toggleCategory = (opt) => {
    setPendingCategories((prev) => {
      if (prev.includes(opt)) {
        const next = prev.filter((c) => c !== opt);
        return next.length > 0 ? next : ['ALL'];
      }
      if (opt === 'ALL') return ['ALL'];
      return prev.includes('ALL') ? [opt] : [...prev, opt];
    });
    resetPage();
  };

  const toggleDate = (opt) => {
    setPendingDates((prev) => {
      if (prev.includes(opt)) {
        const next = prev.filter((d) => d !== opt);
        return next.length > 0 ? next : ['ALL'];
      }
      if (opt === 'ALL') return ['ALL'];
      return prev.includes('ALL') ? [opt] : [...prev, opt];
    });
    resetPage();
  };

  const applyFilters = () => {
    setAppliedTypes(pendingTypes);
    setAppliedCategories(pendingCategories);
    setAppliedDates(pendingDates);
    resetPage();
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setLocationFilter('ALL');
    setTopTypeFilter('ALL');
    setPendingTypes(['ALL']);
    setPendingCategories(['ALL']);
    setPendingDates(['ALL']);
    setAppliedTypes(['ALL']);
    setAppliedCategories(['ALL']);
    setAppliedDates(['ALL']);
    resetPage();
    setMobileFiltersOpen(false);
  };

  const CATEGORIES = ['ALL', 'Elektronik', 'Dokumen/KTM', 'Alat Makan & Minum', 'Kunci & Aksesori'];

  const defaultCategories = ['Phones', 'Wallets', 'Keys', 'Bags', 'Pets', 'Documents'];
  const uniqueCategories = [
    ...new Set([...defaultCategories, ...reports.map((r) => r.category).filter(Boolean)]),
  ];
  const uniqueLocations = ['ALL', ...new Set(reports.map((report) => report.location))];

  const activeFilterCount =
    (topTypeFilter !== 'ALL' ? 1 : 0) +
    (locationFilter !== 'ALL' ? 1 : 0) +
    appliedCategories.filter((c) => c !== 'ALL').length +
    appliedTypes.filter((t) => t !== 'ALL').length +
    appliedDates.filter((d) => d !== 'ALL').length;

  const filteredReports = reports.filter((report) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      (report?.itemName?.toLowerCase().includes(q) ?? false) ||
      (report?.location?.toLowerCase().includes(q) ?? false) ||
      (report?.description?.toLowerCase().includes(q) ?? false);

    const matchesLocation = locationFilter === 'ALL' || report?.location === locationFilter;

    const matchesTopType =
      topTypeFilter === 'ALL' ||
      (report?.type && report.type.toLowerCase() === topTypeFilter.toLowerCase());

    const matchesCheckboxType =
      appliedTypes.includes('ALL') ||
      appliedTypes.length === 0 ||
      (report?.type && appliedTypes.includes(report.type));

    const matchesCheckboxCategory =
      appliedCategories.includes('ALL') ||
      appliedCategories.length === 0 ||
      (report?.category && appliedCategories.includes(report.category));

    let matchesCheckboxDate = true;
    if (!appliedDates.includes('ALL') && appliedDates.length > 0) {
      const reportDate = new Date(report?.createdAt);
      const now = new Date();
      const diffDays = (now - reportDate) / (1000 * 60 * 60 * 24);
      const within24h = diffDays <= 1;
      const within7d = diffDays <= 7;
      const within30d = diffDays <= 30;
      matchesCheckboxDate =
        (appliedDates.includes('24H') && within24h) ||
        (appliedDates.includes('7D') && within7d) ||
        (appliedDates.includes('30D') && within30d);
    }

    return (
      matchesSearch &&
      matchesLocation &&
      matchesTopType &&
      matchesCheckboxType &&
      matchesCheckboxCategory &&
      matchesCheckboxDate
    );
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);
    return sortDirection === 'newest' ? db - da : da - db;
  });

  const totalPages = Math.max(1, Math.ceil(sortedReports.length / ITEMS_PER_PAGE));
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const mobileReports = sortedReports.slice(0, visibleCount);

  const checkbox = (checked, label, onChange) => (
    <label className="font-ui flex items-center gap-2 cursor-pointer text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-gray-700 focus:ring-gray-500"
      />
      {label}
    </label>
  );

  const typeBtn = (active, label, value) => (
    <button
      onClick={() => {
        setTopTypeFilter(value);
        resetPage();
      }}
      className={`font-ui text-xs border border-gray-300 px-2 py-1 rounded text-sm font-semibold tracking-wider transition ${
        active ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const pageBtn = (active, label, onClick, disabled) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-ui text-xs border border-gray-300 px-2.5 py-1 rounded text-sm font-semibold tracking-wider transition ${
        active
          ? 'bg-gray-200 text-gray-800'
          : disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const chip = (active, label) => (
    <button
      onClick={() => {
        if (appliedCategories.includes(label)) {
          setAppliedCategories((prev) => {
            const next = prev.filter((c) => c !== label);
            return next.length > 0 ? next : ['ALL'];
          });
        } else if (label === 'ALL') {
          setAppliedCategories(['ALL']);
        } else {
          setAppliedCategories((prev) =>
            prev.includes('ALL') ? [label] : [...prev, label]
          );
        }
        resetPage();
      }}
      className={`font-ui text-xs border border-gray-300 px-2.5 py-1 rounded font-semibold tracking-wider transition ${
        active ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  if (loading) return <p className="text-gray-500">Memuat laporan...</p>;

  return (
    <div className="w-screen">
      <nav className="font-ui text-xs tracking-wider text-gray-500 mb-1">
        Home / Browse All
      </nav>
      <h1 className="font-headline text-2xl text-gray-800 mb-1">Browse all reports</h1>
      <p className="font-body text-sm text-gray-500 mb-4">
        {reports.length} active reports
      </p>

      {/* Desktop composite search bar */}
      <div className="hidden md:flex flex-col sm:flex-row items-stretch gap-2 border border-gray-300 rounded-lg bg-white overflow-hidden mb-6">
        <input
          type="text"
          className="font-body flex-1 px-3 py-2 border-r border-gray-300 bg-white text-sm text-gray-800 focus:outline-none"
          placeholder="What did you lose or find?"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            resetPage();
          }}
        />
        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            resetPage();
          }}
          className="font-body px-3 py-2 border-r border-gray-300 bg-gray-50 text-sm text-gray-800 focus:outline-none"
        >
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc === 'ALL' ? 'All Locations' : loc}
            </option>
          ))}
        </select>
        <button
          className="font-ui px-4 py-2 bg-white text-sm text-gray-700 border-l border-gray-300 hover:bg-gray-50 font-semibold tracking-wider"
        >
          Search
        </button>
      </div>

      {/* Mobile filter stack */}
      <div className="md:hidden space-y-3 mb-4">
        <div className="flex gap-2 border border-gray-300 rounded-lg bg-white overflow-hidden">
          <input
            type="text"
            className="font-body flex-1 px-3 py-2 border-r border-gray-300 bg-white text-sm text-gray-800 focus:outline-none"
            placeholder="Search items, places..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
          />
          <button
            onClick={resetPage}
            className="font-ui shrink-0 px-3 py-2 border-l border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 font-semibold tracking-wider"
          >
            Go
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg p-1 bg-gray-100 grid grid-cols-3">
          {typeBtn(
            topTypeFilter === 'ALL',
            'All',
            'ALL'
          )}
          {typeBtn(topTypeFilter === 'LOST', 'Lost', 'LOST')}
          {typeBtn(topTypeFilter === 'FOUND', 'Found', 'FOUND')}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {uniqueCategories.map((cat) => (
            chip(appliedCategories.includes(cat), cat)
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMobileFiltersOpen((o) => !o)}
            className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Filters ({activeFilterCount})
          </button>
          <button
            onClick={() => setSortDirection(sortDirection === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Sort: {sortDirection === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:flex flex-col gap-4 lg:w-80 shrink-0 overflow-hidden">
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Tipe</label>
                <div className="flex flex-col gap-2">
                  {checkbox(
                    pendingTypes.includes('ALL'),
                    'All reports',
                    () => toggleType('ALL')
                  )}
                  {checkbox(
                    pendingTypes.includes('LOST'),
                    'Lost',
                    () => toggleType('LOST')
                  )}
                  {checkbox(
                    pendingTypes.includes('FOUND'),
                    'Found',
                    () => toggleType('FOUND')
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Kategori</label>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => (
                    checkbox(
                      pendingCategories.includes(cat),
                      cat,
                      () => toggleCategory(cat)
                    )
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Tanggal</label>
                <div className="flex flex-col gap-2">
                  {checkbox(
                    pendingDates.includes('ALL'),
                    'All time',
                    () => toggleDate('ALL')
                  )}
                  {checkbox(
                    pendingDates.includes('24H'),
                    'Last 24 hours',
                    () => toggleDate('24H')
                  )}
                  {checkbox(
                    pendingDates.includes('7D'),
                    'Last 7 days',
                    () => toggleDate('7D')
                  )}
                  {checkbox(
                    pendingDates.includes('30D'),
                    'Last 30 days',
                    () => toggleDate('30D')
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={applyFilters}
              className="font-ui mt-4 w-full py-2 px-4 border border-gray-300 rounded text-sm font-semibold tracking-wider text-gray-700 bg-white hover:bg-gray-50"
            >
              Apply Filter
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 w-full">
          {/* Mobile collapsible filter panel */}
          {mobileFiltersOpen && (
            <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-white space-y-3">
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Lokasi</label>
                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    resetPage();
                  }}
                  className="font-body w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none"
                >
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === 'ALL' ? 'All Locations' : loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Tanggal</label>
                <div className="flex flex-col gap-2">
                  {checkbox(
                    appliedDates.includes('ALL'),
                    'All time',
                    () => {
                      setAppliedDates(['ALL']);
                      resetPage();
                    }
                  )}
                  {checkbox(
                    appliedDates.includes('24H'),
                    'Last 24 hours',
                    () => {
                      setAppliedDates((prev) =>
                        prev.includes('24H')
                          ? prev.filter((d) => d !== '24H') || ['ALL']
                          : [...prev.filter((d) => d !== 'ALL'), '24H']
                      );
                      resetPage();
                    }
                  )}
                  {checkbox(
                    appliedDates.includes('7D'),
                    'Last 7 days',
                    () => {
                      setAppliedDates((prev) =>
                        prev.includes('7D')
                          ? prev.filter((d) => d !== '7D') || ['ALL']
                          : [...prev.filter((d) => d !== 'ALL'), '7D']
                      );
                      resetPage();
                    }
                  )}
                  {checkbox(
                    appliedDates.includes('30D'),
                    'Last 30 days',
                    () => {
                      setAppliedDates((prev) =>
                        prev.includes('30D')
                          ? prev.filter((d) => d !== '30D') || ['ALL']
                          : [...prev.filter((d) => d !== 'ALL'), '30D']
                      );
                      resetPage();
                    }
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Kategori</label>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => (
                    checkbox(
                      appliedCategories.includes(cat),
                      cat,
                      () => {
                        setAppliedCategories((prev) => {
                          if (prev.includes(cat)) {
                            const next = prev.filter((c) => c !== cat);
                            return next.length > 0 ? next : ['ALL'];
                          }
                          if (cat === 'ALL') return ['ALL'];
                          return prev.includes('ALL') ? [cat] : [...prev, cat];
                        });
                        resetPage();
                      }
                    )
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-ui text-xs tracking-wider text-gray-500">Tipe</label>
                <div className="flex flex-col gap-2">
                  {checkbox(
                    appliedTypes.includes('ALL'),
                    'All reports',
                    () => {
                      setAppliedTypes(['ALL']);
                      resetPage();
                    }
                  )}
                  {checkbox(
                    appliedTypes.includes('LOST'),
                    'Lost',
                    () => {
                      setAppliedTypes((prev) => {
                        if (prev.includes('LOST')) {
                          const next = prev.filter((t) => t !== 'LOST');
                          return next.length > 0 ? next : ['ALL'];
                        }
                        return prev.includes('ALL') ? ['LOST'] : [...prev, 'LOST'];
                      });
                      resetPage();
                    }
                  )}
                  {checkbox(
                    appliedTypes.includes('FOUND'),
                    'Found',
                    () => {
                      setAppliedTypes((prev) => {
                        if (prev.includes('FOUND')) {
                          const next = prev.filter((t) => t !== 'FOUND');
                          return next.length > 0 ? next : ['ALL'];
                        }
                        return prev.includes('ALL') ? ['FOUND'] : [...prev, 'FOUND'];
                      });
                      resetPage();
                    }
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="font-ui flex-1 py-2 px-4 border border-gray-300 rounded text-sm font-semibold tracking-wider text-gray-700 bg-white hover:bg-gray-50"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="font-ui flex-1 py-2 px-4 border border-gray-300 rounded text-sm font-semibold tracking-wider text-gray-600 bg-white hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <span className="font-ui text-xs tracking-wider text-gray-500">
              Showing {mobileReports.length} of {sortedReports.length} reports
            </span>
          </div>

          {sortedReports.length === 0 ? (
            <div className="min-w-0 w-full text-center py-12">
              <p className="font-body text-sm text-gray-500 mb-4">Tidak ada laporan yang cocok.</p>
              <button
                onClick={resetFilters}
                className="font-ui text-sm border border-gray-300 px-4 py-2 rounded font-semibold tracking-wider text-gray-700 bg-white hover:bg-gray-50"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 min-w-0 w-full">
                {mobileReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
              <div className="hidden md:flex flex-col gap-6 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {paginatedReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>

                {sortedReports.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {pageBtn(
                      currentPage === 1,
                      '< Prev',
                      () => setCurrentPage((p) => Math.max(p - 1, 1)),
                      currentPage === 1
                    )}
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      return pageBtn(
                        currentPage === page,
                        String(page),
                        () => setCurrentPage(page)
                      );
                    })}
                    {pageBtn(
                      currentPage === totalPages,
                      'Next >',
                      () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
                      currentPage === totalPages
                    )}
                  </div>
                )}
              </div>
              {!mobileFiltersOpen && sortedReports.length > 0 && visibleCount < sortedReports.length && (
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="font-ui md:hidden w-full py-3 mt-4 border border-gray-300 rounded-lg bg-white text-sm font-semibold tracking-wider text-gray-700 hover:bg-gray-50"
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
