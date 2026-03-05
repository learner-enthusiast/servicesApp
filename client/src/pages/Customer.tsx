import ListingsSearchBar from 'components/SearchBarComponent';
import React, { useState } from 'react';
import { getListings } from 'utils/api';
import { NavigationTabEnum } from 'utils/enum';
import { Grid } from '@mui/material';
import ListingCard from 'components/ListingCard';

import UserMyBookings from 'components/UserMyBookings';
import Loading from 'components/Loading';

const Customer = ({ currentTab }: any) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (filters: any) => {
    try {
      setLoading(true);
      const response = await getListings(filters);

      const sortedListings = response.data.sort(
        (a: any, b: any) => a.distanceInMeters - b.distanceInMeters
      );

      setListings(sortedListings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {currentTab === NavigationTabEnum.SEARCH && (
        <>
          <ListingsSearchBar onSearch={handleSearch} />
          {loading ? (
            <Loading />
          ) : (
            <Grid container spacing={2} mt={2}>
              {listings.map((listing) => (
                <Grid item xs={12} key={listing._id}>
                  <div>
                    <ListingCard listing={listing} distanceInMeters={listing.distanceInMeters} />
                  </div>{' '}
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      {currentTab === NavigationTabEnum.MY_BOOKINGS && <UserMyBookings />}
    </div>
  );
};

export default Customer;
