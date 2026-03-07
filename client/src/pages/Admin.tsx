import { AllUser } from 'components/AllUser';
import Overview from 'components/Overview';
import React from 'react';

const Admin = ({ currentTab }: any) => {
  console.log(currentTab);

  return (
    <div>
      {currentTab === 'USERS' && (
        <div>
          <AllUser />
        </div>
      )}
      {currentTab === 'OVERVIEW' && <Overview />}
    </div>
  );
};

export default Admin;
