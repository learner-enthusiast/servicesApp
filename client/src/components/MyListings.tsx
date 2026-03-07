import React, { useEffect, useState, useCallback } from 'react';
import { getMyListings, getMyListingsAdmin, toggleListingStatus } from 'utils/api';
import Pagination from './Pagination';
import ListingCard from './ListingCard';
import Loading from './Loading';
import { ListingStatusEnum } from 'utils/enum';

interface Listing {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  photos?: { url: string }[];
}
interface MyListingsProps {
  userId?: string;
}

const MyListings: React.FC<MyListingsProps> = ({ userId }) => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchListings = useCallback(
    async (pageNumber: number) => {
      try {
        setLoading(true);
        const params = {
          page: pageNumber,
          ...(debouncedSearch && { name: debouncedSearch }),
        };
        const response = userId
          ? await getMyListingsAdmin({ ...params, userId })
          : await getMyListings(params);
        setMyListings(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, userId]
  );

  useEffect(() => {
    fetchListings(page);
  }, [page, fetchListings]);

  const handleToggle = async (id: string, currentStatus: any) => {
    setTogglingId(id);
    try {
      toggleListingStatus(id);
      const newStatus =
        currentStatus === ListingStatusEnum.ACTIVE
          ? ListingStatusEnum.INACTIVE
          : ListingStatusEnum.ACTIVE;
      setMyListings((prev) =>
        prev.map((listing) => (listing._id === id ? { ...listing, status: newStatus } : listing))
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  // if (loading) return <Loading />;

  return (
    <div className="flex flex-col justify-center items-center w-4xl  px-2 pt-2">
      {/* Search */}
      <div className="relative mb-4 max-w-xs">
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
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
      {loading ? (
        <div className="w-4xl">
          <Loading />
        </div>
      ) : (
        <>
          {myListings.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-900 mb-1">No listings found</p>
              <p className="text-sm text-gray-500">
                {search ? 'Try a different search term.' : 'Listings you create will appear here.'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 bg-white p-3">
                {myListings.map((listing) => (
                  <div key={listing._id} className="cursor-pointer">
                    <ListingCard
                      listing={listing}
                      showToggle
                      togglingId={togglingId}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyListings;
