import React, { Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import Header from 'components/Header';
import AuthModal from 'components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import 'styles/ReactWelcome.css';
import Dashboard from 'pages/Dashboard';
import Admin from 'pages/Admin';

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
          </Route>

          {/* Protected - admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const ReactWelcome = () => {
  const { isLoggedIn, account } = useAuth();

  return (
    <Fragment>
      {isLoggedIn && account ? (
        <p>Hey, {account.username}! You are authenticated!</p>
      ) : (
        <p>Don't forget to start your backend server, and then authenticate yourself.</p>
      )}
    </Fragment>
  );
};

export default App;
