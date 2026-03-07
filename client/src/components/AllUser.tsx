import React, { useState, useEffect, useCallback } from 'react';
import { getUsersByType } from 'utils/api';
import Pagination from './Pagination';
import UserMyBookings from './UserMyBookings';
import MyListings from './MyListings';

type UserType = 'CUSTOMER' | 'SERVICE_PROVIDER';

interface User {
  _id: string;
  userName: string;
  email: string;
  userType: UserType;
  createdAt?: string;
  [key: string]: any;
}

export const AllUser = () => {
  const [userType, setUserType] = useState<UserType>('CUSTOMER');
  const [nameSearch, setNameSearch] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [individualUser, setIndividualUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log(individualUser);
  // Debounce name search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedName(nameSearch);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [nameSearch]);

  // Reset page when userType changes
  useEffect(() => {
    setPage(1);
  }, [userType]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsersByType({
        userType,
        name: debouncedName || undefined,
        page,
        limit,
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [userType, debouncedName, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const avatarInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  if (!individualUser) {
    return (
      <div className="h-[90vh] bg-gray-50 p-6">
        <div className="max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} {userType === 'CUSTOMER' ? 'customer' : 'service provider'}
              {total !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Toggle */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1 self-start">
              {(['CUSTOMER', 'SERVICE_PROVIDER'] as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    userType === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {type === 'CUSTOMER' ? 'Customers' : 'Providers'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
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
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {nameSearch && (
                <button
                  onClick={() => setNameSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500">
                <svg
                  className="w-8 h-8 mb-2 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg
                  className="w-10 h-10 mb-2 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0zM5 16a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Joined
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setIndividualUser(user?._id)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {avatarInitials(user.username)}
                          </div>
                          <span className="font-medium text-gray-800">{user?.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{user?.email}</td>
                      <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            user.type === 'CUSTOMER'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {user.type === 'CUSTOMER' ? 'Customer' : 'Provider'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-5 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(newPage: any) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      </div>
    );
  } else if (individualUser && userType === 'CUSTOMER') {
    return (
      <div className="flex flex-col justify-between gap-2 bg-white max-w-[1280px]">
        <button
          onClick={() => setIndividualUser(null)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:scale-95 transition-all duration-150 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Go Back
        </button>
        <UserMyBookings userId={individualUser} />
      </div>
    );
  } else
    return (
      <div className="flex flex-col justify-between gap-2 bg-white max-w-[1280px]">
        <button
          onClick={() => setIndividualUser(null)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:scale-95 transition-all duration-150 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Go Back
        </button>
        <MyListings userId={individualUser} />
      </div>
    );
};
