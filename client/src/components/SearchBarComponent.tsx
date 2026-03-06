import React, { useState } from 'react';

import { ListingStatusEnum, ServiceTypeEnum } from 'utils/enum';
import LocationSearch from './LocationSearch';

interface Props {
  onSearch: (filters: any) => void;
}

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
];

const RATING_OPTIONS = [
  { label: 'No Ratings', value: 0 },
  { label: '1+ Stars', value: 1 },
  { label: '2+ Stars', value: 2 },
  { label: '3+ Stars', value: 3 },
  { label: '4+ Stars', value: 4 },
  { label: '5 Stars', value: 5 },
];

const selectCls =
  'border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer';

export default function ListingsSearchBar({ onSearch }: Props) {
  const [filters, setFilters] = useState({
    serviceType: '',
    status: '',
    lat: '',
    lng: '',
    radiusKm: '',
    minRating: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const isDisabled = Object.values(filters).some((v) => v === '');

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-3 w-fit">
      {/* Service Type */}
      <select
        name="serviceType"
        value={filters.serviceType}
        onChange={handleChange}
        className={`${selectCls} min-w-[130px]`}
      >
        <option value="" disabled hidden>
          Service Type
        </option>
        {Object.values(ServiceTypeEnum).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className={`${selectCls} min-w-[110px]`}
      >
        <option value="" disabled hidden>
          Status
        </option>
        {Object.values(ListingStatusEnum).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* Location — existing component */}
      <LocationSearch setFilters={setFilters} />

      {/* Radius */}
      <select
        name="radiusKm"
        value={filters.radiusKm}
        onChange={handleChange}
        className={`${selectCls} min-w-[120px]`}
      >
        <option value="" disabled hidden>
          Radius (km)
        </option>
        {RADIUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Min Rating */}
      <select
        name="minRating"
        value={filters.minRating}
        onChange={handleChange}
        className={`${selectCls} min-w-[120px]`}
      >
        <option value="" disabled hidden>
          Min Rating
        </option>
        {RATING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Search button */}
      <button
        onClick={() => onSearch(filters)}
        disabled={isDisabled}
        className={`font-semibold px-4 py-1.5 rounded-md text-sm transition-colors ${
          isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
        }`}
      >
        Search
      </button>
    </div>
  );
}
