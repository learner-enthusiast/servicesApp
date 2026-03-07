import React, { useState } from 'react';

import { BASE_LOCATIONS, ListingStatusEnum, ServiceTypeEnum } from 'utils/enum';
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

// Seeded locations from the database
const SEEDED_LOCATIONS = BASE_LOCATIONS;

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
  const [copied, setCopied] = useState<string | null>(null);
  const [showSeededLocation, setShowSeededLocation] = useState<boolean>(true);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShowSeededLocation(false);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const isDisabled = Object.values(filters).some((v) => v === '');

  const handleCopy = (loc: (typeof SEEDED_LOCATIONS)[0]) => {
    const text = `${loc.area}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(loc.area);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleUseLocation = (loc: (typeof SEEDED_LOCATIONS)[0]) => {
    setFilters((prev) => ({ ...prev, lat: String(loc.lat), lng: String(loc.lng) }));
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-3 w-fit">
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

        <LocationSearch setFilters={setFilters} />

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
        <button
          disabled={showSeededLocation}
          onClick={() => setShowSeededLocation(true)}
          className={`font-semibold px-4 py-1.5 rounded-md text-sm transition-colors ${
            showSeededLocation
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
        >
          See Seeded Location
        </button>
      </div>

      {/* Empty state — seeded locations panel */}
      {showSeededLocation && (
        <div className="mt-6 max-w-2xl">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700">Available seeded locations</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Click a location to populate the search, or copy the coordinates.
            </p>
          </div>

          <div className="overflow-y-auto max-h-72 rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
            {SEEDED_LOCATIONS.map((loc) => (
              <div
                key={loc.area}
                className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors group"
              >
                {/* Left: name + address */}
                <button
                  onClick={() => handleUseLocation(loc)}
                  className="text-left flex-1 min-w-0 cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {loc.area}
                  </p>
                </button>

                {/* Right: coords + copy */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {loc.lat}, {loc.lng}
                  </span>
                  <button
                    onClick={() => handleCopy(loc)}
                    className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copied === loc.area ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
