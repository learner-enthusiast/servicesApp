import React, { useEffect, useState } from 'react';
import { fetchOverviewStatsfromapi } from 'utils/api';

interface ServiceTypeStat {
  _id: string;
  total: number;
  active: number;
  inactive: number;
  rated4OrMore: number;
}

interface BookingStatus {
  _id: string;
  count: number;
}

interface OverviewStats {
  customers: number;
  serviceProviders: number;
  totalListings: number;
  activeListings: number;
  inactiveListings: number;
  listingsByServiceType: ServiceTypeStat[];
  totalReviews: number;
  bookingsByStatus: BookingStatus[];
  listingsWithNoBookings: number;
  mostPopularServiceType: string;
  avgReviewRating: number | null;
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const formatLabel = (str: string) =>
  str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const BOOKING_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  REQUESTED: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400' },
};

const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  delay: string;
}) => (
  <div
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverviewStats() {
      try {
        const response = await fetchOverviewStatsfromapi();
        setStats(response);
      } finally {
        setLoading(false);
      }
    }
    fetchOverviewStats();
  }, []);

  const totalBookings = stats?.bookingsByStatus.reduce((a, b) => a + b.count, 0) ?? 0;
  const topServices = [...(stats?.listingsByServiceType ?? [])]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  const maxServiceTotal = topServices[0]?.total ?? 1;

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 lg:p-8 max-w-[1280px]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
        .overview-root { font-family: 'DM Sans', sans-serif; }
        .overview-root h1, .overview-root .heading { font-family: 'Sora', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
      `}</style>

      <div className="overview-root max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="fade-up" style={{ animationDelay: '0ms' }}>
          <h1 className="heading text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time snapshot of BookLocal activity</p>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 fade-up"
            style={{ animationDelay: '60ms' }}
          >
            <StatCard
              label="Customers"
              value={fmt(stats!.customers)}
              icon={
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
              accent="bg-violet-100"
              delay="80ms"
            />
            <StatCard
              label="Providers"
              value={fmt(stats!.serviceProviders)}
              icon={
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2"
                  />
                </svg>
              }
              accent="bg-blue-100"
              delay="120ms"
            />
            <StatCard
              label="Total Listings"
              value={fmt(stats!.totalListings)}
              sub={`${stats!.listingsWithNoBookings} with no bookings`}
              icon={
                <svg
                  className="w-5 h-5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
              accent="bg-cyan-100"
              delay="160ms"
            />
            <StatCard
              label="Total Bookings"
              value={fmt(totalBookings)}
              icon={
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              accent="bg-emerald-100"
              delay="200ms"
            />
            <StatCard
              label="Total Reviews"
              value={fmt(stats!.totalReviews)}
              icon={
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              }
              accent="bg-amber-100"
              delay="240ms"
            />
            <StatCard
              label="Top Service"
              value={formatLabel(stats!.mostPopularServiceType)}
              icon={
                <svg
                  className="w-5 h-5 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
              accent="bg-rose-100"
              delay="280ms"
            />
          </div>
        )}

        {/* ── Bookings + Top Services ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 fade-up"
          style={{ animationDelay: '200ms' }}
        >
          {/* Bookings by Status */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="heading text-base font-semibold text-gray-800 mb-1">
              Bookings by Status
            </h2>
            <p className="text-xs text-gray-400 mb-5">{fmt(totalBookings)} total bookings</p>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonBlock key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats!.bookingsByStatus
                  .sort((a, b) => b.count - a.count)
                  .map((b) => {
                    const pct = Math.round((b.count / totalBookings) * 100);
                    const c = BOOKING_COLORS[b._id] ?? {
                      bg: 'bg-gray-50',
                      text: 'text-gray-600',
                      bar: 'bg-gray-400',
                    };
                    return (
                      <div key={b._id} className={`rounded-xl p-4 ${c.bg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}
                          >
                            {formatLabel(b._id)}
                          </span>
                          <span className={`text-sm font-bold ${c.text}`}>{fmt(b.count)}</span>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">{pct}% of total</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Top Services Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="heading text-base font-semibold text-gray-800 mb-1">
              Top Services by Listings
            </h2>
            <p className="text-xs text-gray-400 mb-5">Showing top 8 service categories</p>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-8" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topServices.map((s, i) => {
                  const pct = Math.round((s.total / maxServiceTotal) * 100);
                  const isTop = i === 0;
                  return (
                    <div key={s._id} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs text-gray-600 font-medium truncate text-right">
                        {formatLabel(s._id)}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                        <div
                          className={`h-full rounded-md flex items-center pl-2 transition-all duration-700 ${
                            isTop ? 'bg-blue-500' : 'bg-blue-200'
                          }`}
                          style={{ width: `${pct}%` }}
                        >
                          {pct > 25 && (
                            <span
                              className={`text-xs font-semibold ${isTop ? 'text-white' : 'text-blue-700'}`}
                            >
                              {s.total}
                            </span>
                          )}
                        </div>
                      </div>
                      {pct <= 25 && (
                        <span className="text-xs font-semibold text-gray-500 w-8 shrink-0">
                          {s.total}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── All Service Types Table ── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="heading text-base font-semibold text-gray-800">
              All Service Categories
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {stats?.listingsByServiceType.length ?? '—'} categories
            </p>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Active
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Inactive
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Rated 4+
                    </th>
                    <th className="px-6 py-3 hidden lg:table-cell"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...stats!.listingsByServiceType]
                    .sort((a, b) => b.total - a.total)
                    .map((s, i) => {
                      const barPct = Math.round((s.total / stats!.totalListings) * 100 * 10);
                      const isPopular = s._id === stats!.mostPopularServiceType;
                      return (
                        <tr key={s._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-800 flex items-center gap-2">
                            {i < 3 && (
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0
                                    ? 'bg-amber-100 text-amber-700'
                                    : i === 1
                                      ? 'bg-gray-100 text-gray-600'
                                      : 'bg-orange-50 text-orange-600'
                                }`}
                              >
                                {i + 1}
                              </span>
                            )}
                            {formatLabel(s._id)}
                            {isPopular && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-50 text-blue-600 font-semibold rounded">
                                Popular
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold text-gray-800">
                            {s.total}
                          </td>
                          <td className="px-6 py-3 text-right text-emerald-600 font-medium hidden sm:table-cell">
                            {s.active}
                          </td>
                          <td className="px-6 py-3 text-right text-gray-400 hidden sm:table-cell">
                            {s.inactive}
                          </td>
                          <td className="px-6 py-3 text-right text-amber-600 font-medium hidden md:table-cell">
                            {s.rated4OrMore}
                          </td>
                          <td className="px-6 py-3 w-24 hidden lg:table-cell">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-400 rounded-full"
                                style={{ width: `${Math.min(barPct, 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
