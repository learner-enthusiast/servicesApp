export interface Account {
  username: string;
  password: string;
  role: 'USER' | 'ADMIN';
  type: 'CUSTOMER' | 'SERVICE_PROVIDER';
  photo?: string | undefined;
}

export interface FormData {
  username: Account['username'];
  password: Account['password'];
  userType: String;
  image?: File | null;
}

export interface TabType {
  tab: 'SEARCH' | 'MY_BOOKINGS' | 'JOBS' | 'EDIT_LISTINGS' | 'OVERVIEW' | 'USERS';
}
