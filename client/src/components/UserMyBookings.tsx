import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'contexts/AuthContext';
import { BookingStatusEnum, UserRoleEnum, UserTypeEnum } from 'utils/enum';
import {
  getUserMyBookings,
  cancelBooking,
  approveBooking,
  rescheduleBooking,
  getService_ProviderMyBookings,
  approveRescheduleBooking,
  getUserMyBookingsAdmin,
} from 'utils/api';
import Loading from './Loading';
import Pagination from './Pagination';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusCls = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
    RESCHEDULEDANDAPPROVED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    COMPLETED: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-orange-100 text-orange-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-500';
};

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  ...Object.values(BookingStatusEnum).map((s) => ({
    label: s.replace(/_/g, ' '),
    value: s,
  })),
];

// ─── Component ────────────────────────────────────────────────────────────────
interface UserMyBookingsProps {
  userId?: string;
}

const UserMyBookings: React.FC<UserMyBookingsProps> = ({ userId }) => {
  const { account } = useAuth();
  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = account?.type === UserTypeEnum.CUSTOMER && !isAdmin;
  const isServiceProvider = account?.type === UserTypeEnum.SERVICE_PROVIDER && !isAdmin;
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [openReschedule, setOpenReschedule] = useState(false);

  // ── Search & filter state ──
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedId, setDebouncedId] = useState('');

  // Debounce ID search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedId(searchId);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchId]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchBookings = useCallback(
    async (pageNumber: number) => {
      try {
        setLoading(true);
        const params = {
          page: pageNumber,
          ...(debouncedId && { id: debouncedId }),
          ...(statusFilter && { status: statusFilter }),
        };
        const res = isAdmin
          ? await getUserMyBookingsAdmin({ ...params, userId })
          : isCustomer
            ? await getUserMyBookings(params)
            : await getService_ProviderMyBookings(params);
        setBookings(res.data);
        setTotalPages(res.totalPages);
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [debouncedId, statusFilter, isAdmin, isCustomer, userId]
  );

  useEffect(() => {
    try {
      fetchBookings(page);
    } catch (error) {
    } finally {
    }
  }, [page, fetchBookings]);

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    fetchBookings(page);
  };

  const handleApprove = async (id: string) => {
    await approveBooking(id);
    fetchBookings(page);
  };

  const handleApproveReschedule = async (id: string) => {
    await approveRescheduleBooking(id);
    fetchBookings(page);
  };

  const handleReschedule = async () => {
    await rescheduleBooking(selectedBooking._id, { scheduledDate: rescheduleDate });
    setOpenReschedule(false);
    setRescheduleDate('');
    fetchBookings(page);
  };

  const clearFilters = () => {
    setSearchId('');
    setStatusFilter('');
    setPage(1);
  };

  const hasFilters = !!searchId || !!statusFilter;

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-4 py-6">
      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        {/* ID search */}
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search by booking ID..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchId && (
            <button
              onClick={() => setSearchId('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer min-w-[160px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '16px',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear
          </button>
        )}
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div>
          {/* ── Empty State ── */}
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-lg shadow-sm">
              <svg
                className="w-10 h-10 text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-900 mb-1">No bookings found</p>
              <p className="text-sm text-gray-500">
                {hasFilters
                  ? 'Try adjusting your search or filter.'
                  : isCustomer
                    ? 'Your bookings will appear here once you book a service.'
                    : 'Bookings from customers will appear here.'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── Booking Cards ── */}
              <div className="flex flex-col gap-3">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    onClick={() => navigate(`/booking/${booking._id}`)}
                    className="bg-white border border-gray-200 hover:border-blue-500 rounded-lg shadow-sm px-5 py-4 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      {/* Left: info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-900">
                            Booking #{booking._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${statusCls(booking.status)}`}
                          >
                            {booking.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-800">Price:</span> ₹
                            {booking.finalPrice?.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-800">Scheduled:</span>{' '}
                            {new Date(booking.scheduledDate).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div
                        className="flex sm:flex-col flex-row flex-wrap gap-2 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isCustomer &&
                          booking.rescheduleCount === 0 &&
                          booking.status !== BookingStatusEnum.CANCELLED &&
                          booking.status !== BookingStatusEnum.COMPLETED && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setOpenReschedule(true);
                              }}
                              className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-800 hover:border-blue-500 hover:text-blue-600 transition-colors"
                            >
                              Reschedule
                            </button>
                          )}

                        {!booking.isCancelled &&
                          booking.status !== BookingStatusEnum.CANCELLED &&
                          booking.status !== BookingStatusEnum.COMPLETED && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50 transition-colors"
                            >
                              Cancel
                            </button>
                          )}

                        {(isAdmin || isServiceProvider) &&
                          booking.status === BookingStatusEnum.REQUESTED && (
                            <button
                              onClick={() => handleApprove(booking._id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                              Approve
                            </button>
                          )}

                        {(isAdmin || isServiceProvider) &&
                          booking.status === BookingStatusEnum.RESCHEDULED && (
                            <button
                              onClick={() => handleApproveReschedule(booking._id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                              Approve Reschedule
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ── */}
              <div className="flex justify-center mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(newPage) => setPage(newPage)}
                />
              </div>
            </>
          )}

          {/* ── Reschedule Dialog ── */}
          {openReschedule && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setOpenReschedule(false)}
            >
              <div className="bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-w-sm">
                <div className="px-5 pt-5 pb-3">
                  <h2 className="text-base font-bold text-gray-900">Reschedule Booking</h2>
                </div>
                <div className="border-t border-gray-100" />
                <div className="px-5 py-4">
                  <input
                    type="datetime-local"
                    value={rescheduleDate}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="border-t border-gray-100" />
                <div className="px-5 py-3 flex justify-end gap-2">
                  <button
                    onClick={() => setOpenReschedule(false)}
                    className="text-sm font-medium text-gray-500 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMyBookings;
