import CreateListingForm from 'components/CreateListingForm';
import MyListings from 'components/MyListings';
import UserMyBookings from 'components/UserMyBookings';
import React from 'react';
import { NavigationTabEnum } from 'utils/enum';

const ServiceProvider = ({ currentTab }: any) => {
  return (
    <div>
      {currentTab === NavigationTabEnum.CREATE_LISTINGS && (
        <>
          <CreateListingForm />
        </>
      )}
      {currentTab === NavigationTabEnum.EDIT_LISTINGS && (
        <>
          <MyListings />
        </>
      )}{' '}
      {currentTab === NavigationTabEnum.MY_BOOKINGS && <UserMyBookings />}
    </div>
  );
};

export default ServiceProvider;
