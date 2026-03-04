import ListingsSearchBar from 'components/SearchBarComponent';
import React, { useState } from 'react';
import { getListings } from 'utils/api';
import { NavigationTabEnum } from 'utils/enum';
import { Grid } from '@mui/material';
import ListingCard from 'components/ListingCard';
import { useNavigate } from 'react-router-dom';

const Customer = ({ currentTab }: any) => {
  const [listings, setListings] = useState<any[]>([]);
  const navigate = useNavigate();
  const handleSearch = async (filters: any) => {
    try {
      const response = await getListings(filters);

      const sortedListings = response.data.sort(
        (a: any, b: any) => a.distanceInMeters - b.distanceInMeters
      );

      setListings(sortedListings);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {currentTab === NavigationTabEnum.SEARCH && (
        <>
          <ListingsSearchBar onSearch={handleSearch} />

          <Grid container spacing={2} mt={2}>
            {listings.map((listing) => (
              <Grid item xs={12} key={listing._id}>
                <div
                  onClick={() => {
                    navigate(`/listing/${listing._id}`);
                  }}
                >
                  <ListingCard listing={listing} distanceInMeters={listing.distanceInMeters} />
                </div>{' '}
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {currentTab === NavigationTabEnum.MY_BOOKINGS && <></>}
    </div>
  );
};

export default Customer;
