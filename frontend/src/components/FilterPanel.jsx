import { useId, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toCategorySlug } from '../constants/filters';
import useReferenceData from '../hooks/useReferenceData';

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'ALL REPORTS' },
  { value: 'LOST', label: 'LOST' },
  { value: 'FOUND', label: 'FOUND' },
];

const DATE_OPTIONS = [
  { value: '24h', label: 'LAST 24 HOURS' },
  { value: '7d', label: 'LAST 7 DAYS' },
  { value: '30d', label: 'LAST 30 DAYS' },
];

function OptionIndicator({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`w-5 h-5 rounded-md border border-gray-400 shrink-0 transition-colors ${
        checked ? 'bg-gray-800 border-gray-800' : 'bg-white'
      }`}
    />
  );
}

export default function FilterPanel({ onApply }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = useId();
  const { categories: categoryOptions } = useReferenceData();

  const appliedType = searchParams.get('type') || 'ALL';
  const appliedCategories = searchParams.get('categories') || '';
  const appliedDateRange = searchParams.get('dateRange') || '';

  const [type, setType] = useState(appliedType);
  const [categories, setCategories] = useState(
    appliedCategories
      ? appliedCategories
          .split(',')
          .map((value) => toCategorySlug(value, categoryOptions))
      : [],
  );
  const [dateRange, setDateRange] = useState(appliedDateRange || null);

  const toggleCategory = (value) => {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const toggleDateRange = (value) => {
    setDateRange((prev) => (prev === value ? null : value));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (type === 'ALL') params.delete('type');
    else params.set('type', type);

    if (categories.length > 0) params.set('categories', categories.join(','));
    else params.delete('categories');

    if (dateRange) params.set('dateRange', dateRange);
    else params.delete('dateRange');

    // The legacy single-category link from the Home page is superseded
    // once the sidebar filters are applied.
    params.delete('category');

    // A new filter set always starts from the first page.
    params.delete('page');

    navigate(`/reports?${params.toString()}`, { replace: true });
    onApply?.();
  };

  return (
    <div className="w-full md:w-72 shrink-0 bg-white border border-gray-300 rounded-xl p-6">
      <div className="space-y-6">
        <section>
          <h2 className="uppercase tracking-wider text-sm font-semibold text-gray-900 mb-3">
            TYPE
          </h2>
          <div className="space-y-3">
            {TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name={`type-${groupId}`}
                  value={option.value}
                  checked={type === option.value}
                  onChange={() => setType(option.value)}
                  className="sr-only"
                />
                <OptionIndicator checked={type === option.value} />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="uppercase tracking-wider text-sm font-semibold text-gray-900 mb-3">
            CATEGORY
          </h2>
          <div className="space-y-3">
            {categoryOptions.map(({ slug, name }) => {
              const checked = categories.includes(slug);
              return (
                <label
                  key={slug}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    name="categories"
                    value={slug}
                    checked={checked}
                    onChange={() => toggleCategory(slug)}
                    className="sr-only"
                  />
                  <OptionIndicator checked={checked} />
                  <span className="text-sm text-gray-700">{name}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="uppercase tracking-wider text-sm font-semibold text-gray-900 mb-3">
            DATE
          </h2>
          <div className="space-y-3">
            {DATE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name={`dateRange-${groupId}`}
                  value={option.value}
                  checked={dateRange === option.value}
                  onChange={() => setDateRange(option.value)}
                  onClick={() => {
                    if (dateRange === option.value) toggleDateRange(option.value);
                  }}
                  className="sr-only"
                />
                <OptionIndicator checked={dateRange === option.value} />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={applyFilters}
        className="w-full mt-7 py-3 px-4 bg-gray-800 text-white rounded-lg font-semibold uppercase tracking-wider text-sm hover:bg-gray-700"
      >
        APPLY FILTERS
      </button>
    </div>
  );
}
