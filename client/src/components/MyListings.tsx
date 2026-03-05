import React, { useEffect, useState } from 'react';
import { getMyListings, toggleListingStatus } from 'utils/api';
import { Grid, Box, Typography } from '@mui/material';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
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
      let newStatus =
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
    <Box>
      {myListings.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 10,
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <ListOutlinedIcon sx={{ fontSize: 40, color: '#D0D0D0', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#0F0F0F', mb: 0.5 }}>
            No listings yet
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#6B6B6B' }}>
            Listings you create will appear here.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {myListings.map((listing) => (
              <Grid item xs={12} key={listing._id}>
                <div className="cursor-pointer">
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
