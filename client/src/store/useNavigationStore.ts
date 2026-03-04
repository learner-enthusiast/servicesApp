import { create } from 'zustand';

export type TabType =
  | 'SEARCH'
  | 'MY_BOOKINGS'
  | 'JOBS'
  | 'EDIT_LISTINGS'
  | 'CREATE_LISTINGS'
  | 'OVERVIEW'
  | 'USERS';

interface NavigationState {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentTab: 'SEARCH',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));
