import React, { Fragment, useRef, useState } from 'react';
import { useModalStore } from 'store/useModalStore';
import { useAuth } from 'contexts/AuthContext';
import OnlineIndicator from 'components/OnlineIndicator';
import { UserRoleEnum, UserTypeEnum } from 'utils/enum';
import { TabType, useNavigationStore } from 'store/useNavigationStore';
import { useLocation, useNavigate } from 'react-router-dom';

const CUSTOMER_TABS: { label: string; value: TabType }[] = [
  { label: 'Search', value: 'SEARCH' },
  { label: 'My Bookings', value: 'MY_BOOKINGS' },
];

const SERVICE_PROVIDER_TABS: { label: string; value: TabType }[] = [
  { label: 'Edit Listings', value: 'EDIT_LISTINGS' },
  { label: 'Create Listings', value: 'CREATE_LISTINGS' },
  { label: 'My Bookings', value: 'MY_BOOKINGS' },
];

const ADMIN_TABS: { label: string; value: TabType }[] = [
  { label: 'Overview', value: 'OVERVIEW' },
  { label: 'Users', value: 'USERS' },
];

const Header: React.FC = () => {
  const { isLoggedIn, account, logout } = useAuth();
  const { setCurrentModal } = useModalStore();
  const { currentTab, setCurrentTab } = useNavigationStore();
  const [popover, setPopover] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = !isAdmin && account?.type === UserTypeEnum.CUSTOMER;
  const isServiceProvider = !isAdmin && account?.type === UserTypeEnum.SERVICE_PROVIDER;

  const tabs = isCustomer
    ? CUSTOMER_TABS
    : isServiceProvider
      ? SERVICE_PROVIDER_TABS
      : isAdmin
        ? ADMIN_TABS
        : [];

  const handleTabChange = (value: TabType) => {
    setCurrentTab(value);
    if (location.pathname !== '/dashboard') navigate('/dashboard');
  };

  const clickLogin = () => {
    setCurrentModal('LOGIN');
    setPopover(false);
  };
  const clickRegister = () => {
    setCurrentModal('REGISTER');
    setPopover(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-3 shadow-sm w-full">
      {/* Logo */}
      <h1 className="text-blue-500 text-xl font-bold tracking-wide">BookLocal</h1>

      {/* Tabs */}
      {tabs.length > 0 && (
        <nav className="flex items-center h-full space-x-8 text-sm font-medium text-gray-500">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`py-4 border-b-2 transition-colors ${
                currentTab === tab.value
                  ? 'text-purple-700 border-purple-700'
                  : 'border-transparent hover:text-gray-800'
              }`}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </nav>
      )}

      {/* Avatar + Popover */}
      <div className="relative">
        <button
          ref={avatarRef}
          onClick={() => setPopover((prev) => !prev)}
          className="focus:outline-none"
        >
          <OnlineIndicator online={isLoggedIn}>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {account?.photo ? (
                <img
                  src={account?.photo}
                  alt={account.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                (account?.username?.[0]?.toUpperCase() ?? 'G')
              )}
            </div>
          </OnlineIndicator>
        </button>

        {popover && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setPopover(false)} />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              <p className="text-xs text-center text-gray-500 font-medium px-3 py-2 border-b border-gray-100">
                Hello, {account?.username || 'Guest'}
              </p>

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    logout();
                    setPopover(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Fragment>
                  <button
                    onClick={clickLogin}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={clickRegister}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                  >
                    Register
                  </button>
                </Fragment>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
