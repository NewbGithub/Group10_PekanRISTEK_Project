import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toLocationSlug } from '../constants/filters';
import useReferenceData from '../hooks/useReferenceData';

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
    if (locationFilter && locationFilter !== 'ALL') params.set('location', locationFilter);
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
      className="flex flex-col sm:flex-row items-stretch gap-2 border border-gray-300 rounded-lg bg-white overflow-hidden mb-6"
    >
      <input
        type="text"
        className="font-body flex-1 px-3 py-2 border-r border-gray-300 bg-white text-sm text-gray-800 focus:outline-none"
        placeholder="What did you lose or find?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
        className="font-body px-3 py-2 border-r border-gray-300 bg-gray-50 text-sm text-gray-800 focus:outline-none"
      >
        <option value="ALL">All Locations</option>
        {locationOptions.map(({ slug, name }) => (
          <option key={slug} value={slug}>
            {name}
          </option>
        ))}
      </select>
    </form>
  );
}
