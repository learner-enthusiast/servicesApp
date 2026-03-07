import React, { useState } from 'react';
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

/* ── Seeded Users Data ── */
const SERVICE_PROVIDERS = [
  'ravi_movers',
  'priya_cleaners',
  'suresh_electrician',
  'anita_plumber',
  'deepak_parking',
  'mohan_carwash',
  'sunita_cleaning',
  'rajesh_electrician',
  'kavita_plumber',
  'arun_movers',
];

const CUSTOMERS = [
  'customer_arjun',
  'customer_meena',
  'customer_rohit',
  'customer_sita',
  'customer_vijay',
  'customer_pooja',
  'customer_nikhil',
  'customer_divya',
  'customer_suresh',
  'customer_ananya',
];

type TabType = 'providers' | 'customers' | 'admin';

const SeededUsersPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('providers');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const tabs: { key: TabType; label: string; color: string }[] = [
    {
      key: 'providers',
      label: 'Service Providers',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    { key: 'customers', label: 'Customers', color: 'bg-green-50 text-green-700 border-green-200' },
    { key: 'admin', label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  // const activeColor = tabs.find((t) => t.key === activeTab)?.color ?? '';

  return (
    <section className="w-full px-4 py-8 sm:py-12 flex flex-col items-center">
      <div className="w-full max-w-md border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Seeded Test Accounts</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Use these credentials to log in and explore the app
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-gray-800 text-gray-900 bg-gray-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Password badge */}
        <div className="px-5 pt-3 pb-1">
          {activeTab === 'providers' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-mono border border-blue-100">
              password: <strong>provider123</strong>
            </span>
          )}
          {activeTab === 'customers' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-mono border border-green-100">
              password: <strong>customer123</strong>
            </span>
          )}
          {activeTab === 'admin' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 font-mono border border-purple-100">
              password: <strong>admin123</strong>
            </span>
          )}
        </div>

        {/* User list */}
        <div className="overflow-y-auto h-52 px-5 py-2 flex flex-col gap-1.5">
          {activeTab === 'providers' &&
            SERVICE_PROVIDERS.map((username) => (
              <button
                key={username}
                onClick={() => handleCopy(username)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
              >
                <span className="text-sm font-mono text-gray-700 group-hover:text-blue-700">
                  {username}
                </span>
                <span className="text-xs text-gray-300 group-hover:text-blue-400">
                  {copied === username ? '✓ copied' : 'copy'}
                </span>
              </button>
            ))}

          {activeTab === 'customers' &&
            CUSTOMERS.map((username) => (
              <button
                key={username}
                onClick={() => handleCopy(username)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-100 transition-all group"
              >
                <span className="text-sm font-mono text-gray-700 group-hover:text-green-700">
                  {username}
                </span>
                <span className="text-xs text-gray-300 group-hover:text-green-400">
                  {copied === username ? '✓ copied' : 'copy'}
                </span>
              </button>
            ))}

          {activeTab === 'admin' && (
            <button
              onClick={() => handleCopy('admin')}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all group"
            >
              <span className="text-sm font-mono text-gray-700 group-hover:text-purple-700">
                admin
              </span>
              <span className="text-xs text-gray-300 group-hover:text-purple-400">
                {copied === 'admin' ? '✓ copied' : 'copy'}
              </span>
            </button>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Click any username to copy it to clipboard
          </p>
        </div>
      </div>
    </section>
  );
};

const ReactWelcome = () => {
  const { isLoggedIn, account } = useAuth();
  const { setCurrentModal } = useModalStore();
  if (isLoggedIn && account) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="w-full min-h-screen bg-white">
      {/* ─── Hero Section ─── */}
      <section className="w-[50vw] px-4 pt-10 pb-8 sm:pt-16 sm:pb-12 flex flex-row items-center text-center mx-auto gap-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-xl">
          Find Trusted Local Services Near You.
        </h1>
        <SeededUsersPanel />
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

      {/* ─── Seeded Users Panel ─── */}
    </main>
  );
};

export default App;
