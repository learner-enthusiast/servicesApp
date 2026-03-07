import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import Header from 'components/Header';
import AuthModal from 'components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import 'styles/ReactWelcome.css';
import Dashboard from 'pages/Dashboard';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import IndividualListingPage from 'pages/IndividualListingPage';
import IndividualBookingPage from 'pages/IndividualBookingPage';
import { ShepherdTourProvider } from 'contexts/ShepherdTourContext';
import { useModalStore } from 'store/useModalStore';

// Pages (create these as needed)

const App = () => {
  const { account } = useAuth();
  return (
    <ShepherdTourProvider role={account?.role || 'guest'}>
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
              <Route path="/booking/:id" element={<IndividualBookingPage />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ShepherdTourProvider>
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
  const { setCurrentModal } = useModalStore();
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
      </section>

      {/* ─── Service Categories ─── */}
      <section className="w-full px-4 py-6 sm:py-10 flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-xl w-full">
          {serviceCategories.map((cat) => (
            <button
              onClick={() => setCurrentModal('LOGIN')}
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
            <div
              key={step.title}
              onClick={() => setCurrentModal('LOGIN')}
              className="flex flex-col items-center text-center gap-3 hover:shadow-md hover:border-gray-300 border-gray-200 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 ">
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
