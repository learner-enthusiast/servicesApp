import { useAuth } from 'contexts/AuthContext';
import React from 'react';
import { UserRoleEnum, UserTypeEnum } from 'utils/enum';
import Admin from './Admin';
import Customer from './Customer';
import ServiceProvider from './ServiceProvider';
import { useNavigationStore } from 'store/useNavigationStore';

const Dashboard = () => {
  const { account } = useAuth();
  const { currentTab } = useNavigationStore();

  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = !isAdmin && account?.type === UserTypeEnum.CUSTOMER;
  const isServiceProvider = !isAdmin && account?.type === UserTypeEnum.SERVICE_PROVIDER;
  return (
    <div className="min-h-screen min-w-full bg-slate-200">
      <div className="mt-4 px-3 py-4 max-w-full mx-auto flex justify-center">
        {isAdmin && <Admin currentTab={currentTab} />}
        {isCustomer && <Customer currentTab={currentTab} />}
        {isServiceProvider && <ServiceProvider currentTab={currentTab} />}
      </div>
    </div>
  );
};

export default Dashboard;
