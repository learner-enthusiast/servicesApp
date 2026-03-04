import CreateListingForm from 'components/CreateListingForm';
import MyListings from 'components/MyListings';
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
      )}
    </div>
  );
};

export default ServiceProvider;
