import React, { useEffect, useState } from 'react';
import { getMyListings, toggleListingStatus } from 'utils/api';
import { Grid, Box, CircularProgress } from '@mui/material';
import Pagination from './Pagination';
import ListingCard from './ListingCard';
import { useNavigate } from 'react-router-dom';

interface Listing {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: boolean;
  photos?: { url: string }[];
}

const MyListings = () => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();
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

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      toggleListingStatus(id);
      setMyListings((prev) =>
        prev.map((listing) =>
          listing._id === id ? { ...listing, status: !currentStatus } : listing
        )
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {myListings.map((listing) => (
              <Grid item xs={12} key={listing._id}>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    navigate(`/listing/${listing._id}`);
                  }}
                >
                  <ListingCard
                    listing={listing}
                    showToggle
                    togglingId={togglingId}
                    onToggle={handleToggle}
                  />
                </div>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </Box>
  );
};

export default MyListings;
