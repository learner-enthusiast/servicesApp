import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import Header from 'components/Header';
import AuthModal from 'components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import 'styles/ReactWelcome.css';
import Dashboard from 'pages/Dashboard';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import IndividualListingPage from 'pages/IndividualListingPage';

// Pages (create these as needed)

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <AuthModal />
        <Routes>
          {/* Public */}
          <Route path="/" element={<ReactWelcome />} />

          {/* Protected - any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listing/:id" element={<IndividualListingPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

/* ── Service categories data ── */
const serviceCategories = [
  { label: 'Cleaning Services', icon: <CleaningServicesIcon sx={{ fontSize: 40 }} /> },
  { label: 'Handyman', icon: <HandymanIcon sx={{ fontSize: 40 }} /> },
  { label: 'Plumbing', icon: <PlumbingIcon sx={{ fontSize: 40 }} /> },
  { label: 'Electrician', icon: <ElectricalServicesIcon sx={{ fontSize: 40 }} /> },
];

/* ── How It Works data ── */
const howItWorks = [
  {
    title: 'Browse',
    description: 'Browse your booking to your services',
    icon: <ListAltIcon sx={{ fontSize: 44 }} />,
  },
  {
    title: 'Book',
    description: 'Book your task & get it done conveniently',
    icon: <EventAvailableIcon sx={{ fontSize: 44 }} />,
  },
  {
    title: 'Track',
    description: 'Track and manage all your bookings easily',
    icon: <TrackChangesIcon sx={{ fontSize: 44 }} />,
  },
];

const ReactWelcome = () => {
  const { isLoggedIn, account } = useAuth();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');

  if (isLoggedIn && account) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="w-full min-h-screen bg-white">
      {/* ─── Hero Section ─── */}
      <section className="w-full px-4 pt-10 pb-8 sm:pt-16 sm:pb-12 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-xl">
          Find Trusted Local Services Near You.
        </h1>

        {/* ── Search Bar ── */}
        <div className="mt-8 w-full max-w-xl flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 border border-gray-300 rounded-lg sm:rounded-full overflow-hidden shadow-sm">
          {/* Service input */}
          <TextField
            variant="standard"
            placeholder="e.g. Cleaning"
            label="Find services"
            value={service}
            onChange={(e) => setService(e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ shrink: true }}
            className="flex-1"
            sx={{
              px: 2,
              py: 1,
              '& .MuiInputLabel-root': { px: 2, pt: 0.5, fontSize: '0.75rem', color: '#6b7280' },
              '& .MuiInput-input': { fontSize: '0.95rem' },
            }}
          />

          {/* Divider (visible on sm+) */}
          <div className="hidden sm:block w-px bg-gray-300 my-2" />

          {/* Location input */}
          <TextField
            variant="standard"
            placeholder="Enter City/Area"
            label="Near you"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlinedIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ shrink: true }}
            className="flex-1"
            sx={{
              px: 2,
              py: 1,
              '& .MuiInputLabel-root': { px: 2, pt: 0.5, fontSize: '0.75rem', color: '#6b7280' },
              '& .MuiInput-input': { fontSize: '0.95rem' },
            }}
          />

          {/* Search button */}
          <Button
            variant="contained"
            disableElevation
            className="!rounded-none sm:!rounded-r-full"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: '0.95rem',
              bgcolor: '#1e293b',
              '&:hover': { bgcolor: '#334155' },
            }}
          >
            Search
          </Button>
        </div>
      </section>

      {/* ─── Service Categories ─── */}
      <section className="w-full px-4 py-6 sm:py-10 flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-xl w-full">
          {serviceCategories.map((cat) => (
            <button
              key={cat.label}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            >
              <span className="text-gray-700">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-800 text-center leading-tight">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="w-full px-4 py-8 sm:py-14 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12">How It Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-2xl w-full">
          {howItWorks.map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-700">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[180px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default App;
