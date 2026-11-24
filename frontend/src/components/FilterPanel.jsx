import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toCategorySlug } from '../constants/filters';
import useReferenceData from '../hooks/useReferenceData';
import Button from './Button';

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All reports' },
  { value: 'LOST', label: 'Lost' },
  { value: 'FOUND', label: 'Found' },
];

const DATE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

function Row({ checked, children, onClick, radio }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className="flip flex w-full items-center gap-2 px-2 py-2 text-left text-[0.9375rem]"
    >
      <span
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 border-2 border-ink ${
          radio ? 'rounded-full' : 'rounded-[5px]'
        } ${checked ? 'bg-pink' : 'bg-transparent'}`}
      />
      {children}
    </button>
  );
}

export default function FilterPanel({ onApply }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    <aside className="panel grid content-start gap-5 p-6" aria-label="Filters">
      <div className="grid gap-1">
        <h2 className="ui mb-1 text-sm">Type</h2>
        {TYPE_OPTIONS.map((option) => (
          <Row
            key={option.value}
            radio
            checked={type === option.value}
            onClick={() => setType(option.value)}
          >
            {option.label}
          </Row>
        ))}
      </div>

      <div className="grid gap-1">
        <h2 className="ui mb-1 text-sm">Category</h2>
        {categoryOptions.map(({ slug, name }) => (
          <Row
            key={slug}
            checked={categories.includes(slug)}
            onClick={() => toggleCategory(slug)}
          >
            {name}
          </Row>
        ))}
      </div>

      <div className="grid gap-1">
        <h2 className="ui mb-1 text-sm">Date</h2>
        {DATE_OPTIONS.map((option) => (
          <Row
            key={option.value}
            radio
            checked={dateRange === option.value}
            onClick={() => toggleDateRange(option.value)}
          >
            {option.label}
          </Row>
        ))}
      </div>

      <Button full onClick={applyFilters}>
        Apply filters
      </Button>
    </aside>
  );
}
