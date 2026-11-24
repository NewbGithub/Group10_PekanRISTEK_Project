import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toLocationSlug } from '../constants/filters';
import useReferenceData from '../hooks/useReferenceData';
import Button from './Button';

export default function SearchBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { locations: locationOptions } = useReferenceData();

  const urlSearch = searchParams.get('search') || '';
  const rawUrlLocation = searchParams.get('location') || 'ALL';
  // The UI uses slugs; this also converts legacy names from shared links.
  const urlLocation =
    rawUrlLocation === 'ALL'
      ? 'ALL'
      : toLocationSlug(rawUrlLocation, locationOptions);

  const [query, setQuery] = useState(urlSearch);
  const [locationFilter, setLocationFilter] = useState(urlLocation);
  const [lastPushedKey, setLastPushedKey] = useState(null);

  // Pick up URL changes made elsewhere (Reset filters, back/forward, shared links)
  // without overwriting the text while the user is typing.
  const urlKey = `${urlSearch}\u0000${urlLocation}`;
  const [syncedUrlKey, setSyncedUrlKey] = useState(urlKey);
  if (urlKey !== syncedUrlKey) {
    setSyncedUrlKey(urlKey);
    if (urlKey !== lastPushedKey) {
      setQuery(urlSearch);
      setLocationFilter(urlLocation);
    }
  }

  const updateUrl = useCallback(() => {
    const q = query.trim();
    const searchChanged = q !== urlSearch;
    const locationChanged = locationFilter !== urlLocation;
    if (!searchChanged && !locationChanged) return;

    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('search', q);
    else params.delete('search');
    if (locationFilter && locationFilter !== 'ALL')
      params.set('location', locationFilter);
    else params.delete('location');

    // A new result set always starts from the first page.
    params.delete('page');

    setLastPushedKey(`${q}\u0000${locationFilter || 'ALL'}`);
    navigate(`/reports?${params.toString()}`, { replace: true });
  }, [searchParams, query, locationFilter, urlSearch, urlLocation, navigate]);

  useEffect(() => {
    if (query.trim() === urlSearch && locationFilter === urlLocation) return;
    const timer = setTimeout(updateUrl, 300);
    return () => clearTimeout(timer);
  }, [query, locationFilter, urlSearch, urlLocation, updateUrl]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateUrl();
      }}
      className="stamp mt-6 flex gap-2 md:mt-8 md:gap-0"
      style={{ '--i': 2 }}
    >
      <div className="flex flex-1 items-center gap-4 md:rounded-[10px] md:border-[3px] md:border-ink md:bg-white md:p-2 md:pl-7 md:shadow-hard">
        <input
          type="text"
          aria-label="Search items"
          className="h-14 w-full rounded-[10px] border-[3px] border-ink bg-white px-4 shadow-hard placeholder:text-mute focus:outline-none md:h-12 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:shadow-none"
          placeholder="Search items, places…"
          maxLength={100}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter by location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="ui max-w-[11.875rem] shrink-0 rounded-[10px] border-[3px] border-ink bg-white px-3 py-2 text-[0.6875rem] focus:outline-none md:text-sm"
        >
          <option value="ALL">All locations</option>
          {locationOptions.map(({ slug, name }) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" small className="md:!px-6 md:!py-4">
        Search
      </Button>
    </form>
  );
}
