import React, { createContext, useContext, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const ShepherdTourContext = createContext<any>(null);

export const ShepherdTourProvider: React.FC<{ children: React.ReactNode; role: string }> = ({
  children,
  role,
}) => {
  const tourRef = useRef<any>(null);

  const startTour = () => {
    if (tourRef.current) {
      tourRef.current.cancel();
      tourRef.current = null;
    }

    tourRef.current = new Shepherd.Tour({
      defaultStepOptions: {
        scrollTo: true,
        cancelIcon: { enabled: true },
      },
    });

    // Admin tour
    if (role === 'admin') {
      tourRef.current.addStep({
        id: 'admin-dashboard',
        text: 'Admin: This is your dashboard.',
        attachTo: { element: '.dashboard', on: 'bottom' },
        buttons: [{ text: 'Next', action: tourRef.current.next }],
      });
      // Add more admin steps...
    }

    // Customer tour
    if (role === 'customer') {
      tourRef.current.addStep({
        id: 'customer-dashboard',
        text: 'Customer: This is your dashboard.',
        attachTo: { element: '.dashboard', on: 'bottom' },
        buttons: [{ text: 'Next', action: tourRef.current.next }],
      });
      // Add more customer steps...
    }

    // Provider tour
    if (role === 'provider') {
      tourRef.current.addStep({
        id: 'provider-dashboard',
        text: 'Provider: This is your dashboard.',
        attachTo: { element: '.dashboard', on: 'bottom' },
        buttons: [{ text: 'Next', action: tourRef.current.next }],
      });
      // Add more provider steps...
    }

    tourRef.current.start();
  };

  return (
    <ShepherdTourContext.Provider value={{ startTour }}>{children}</ShepherdTourContext.Provider>
  );
};

export const useShepherdTour = () => useContext(ShepherdTourContext);
