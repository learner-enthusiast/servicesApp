import React, { useEffect, useState } from 'react';
import { getMyListings, toggleListingStatus } from 'utils/api';
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

const MyListings = () => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchListings = async (pageNumber: number) => {
    try {
      setLoading(true);
      const response = await getMyListings(pageNumber);
      setMyListings(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(page);
  }, [page]);

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

  if (loading) return <Loading />;

  return (
    <div>
      {myListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-lg bg-white shadow-sm">
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
          <p className="text-sm font-semibold text-gray-900 mb-1">No listings yet</p>
          <p className="text-sm text-gray-500">Listings you create will appear here.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
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
    </div>
  );
};

export default MyListings;
