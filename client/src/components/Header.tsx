import React, { Fragment, type MouseEventHandler, useState } from 'react';
import { useModalStore } from 'store/useModalStore';
import { useAuth } from 'contexts/AuthContext';
import OnlineIndicator from 'components/OnlineIndicator';
import {
  AppBar,
  IconButton,
  Avatar,
  Popover,
  List,
  ListSubheader,
  ListItemButton,
} from '@mui/material';
import { UserRoleEnum, UserTypeEnum } from 'utils/enum';
import { Tabs, Tab } from '@mui/material';
import { TabType, useNavigationStore } from 'store/useNavigationStore';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props {}

const Header: React.FC<Props> = () => {
  const { isLoggedIn, account, logout } = useAuth();
  const { setCurrentModal } = useModalStore();
  const { currentTab, setCurrentTab } = useNavigationStore();
  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null);
  const [popover, setPopover] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, value: TabType) => {
    setCurrentTab(value);
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  const openPopover: MouseEventHandler<HTMLButtonElement> = (e) => {
    setPopover(true);
    setAnchorEl(e.currentTarget);
  };

  const closePopover = () => {
    setPopover(false);
    setAnchorEl(null);
  };

  const clickLogin = () => {
    setCurrentModal('LOGIN');
    closePopover();
  };

  const clickRegister = () => {
    setCurrentModal('REGISTER');
    closePopover();
  };
  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = !isAdmin && account?.type === UserTypeEnum.CUSTOMER;
  const isServiceProvider = !isAdmin && account?.type === UserTypeEnum.SERVICE_PROVIDER;

  return (
    <AppBar
      position="static"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
      }}
      className="bg-white text-black"
    >
      <h1 className="text-blue-500 text-2xl font-bold">BookLocal</h1>

      {isCustomer && (
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Search" value="SEARCH" />
          <Tab label="My Bookings" value="MY_BOOKINGS" />
        </Tabs>
      )}
      {isServiceProvider && (
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Edit Listings" value="EDIT_LISTINGS" />
          <Tab label="Create Listings" value="CREATE_LISTINGS" />
          <Tab label="My Bookings" value="MY_BOOKINGS" />
        </Tabs>
      )}
      {isAdmin && (
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Overview" value="OVERVIEW" />
          <Tab label="Users" value="USERS" />
        </Tabs>
      )}

      <IconButton onClick={openPopover}>
        <OnlineIndicator online={isLoggedIn}>
          <Avatar src={account?.username || ''} alt={account?.username || 'Guest'} />
        </OnlineIndicator>
      </IconButton>

      <Popover
        anchorEl={anchorEl}
        open={popover}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List style={{ minWidth: '100px' }}>
          <ListSubheader style={{ textAlign: 'center' }}>
            Hello, {account?.username || 'Guest'}
          </ListSubheader>

          {isLoggedIn ? (
            <ListItemButton onClick={logout}>Logout</ListItemButton>
          ) : (
            <Fragment>
              <ListItemButton onClick={clickLogin}>Login</ListItemButton>
              <ListItemButton onClick={clickRegister}>Register</ListItemButton>
            </Fragment>
          )}
        </List>
      </Popover>
    </AppBar>
  );
};

export default Header;
