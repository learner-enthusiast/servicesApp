import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
  useMemo,
} from 'react';
import axios from 'utils/axios';
import { type FormData, type Account } from '@types';

interface Context {
  token: string | null;
  account: Account | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  register: (payload: FormData) => Promise<any>;
  login: (payload: FormData) => Promise<any>;
  logout: () => void;
}

const initContext: Context = {
  token: null,
  account: null,
  isLoggedIn: false,
  isLoading: true,
  register: async () => {},
  login: async () => {},
  logout: () => {},
};

// init context
const AuthContext = createContext(initContext);
const { Provider } = AuthContext;

// export the consumer
export const useAuth = () => useContext(AuthContext);

// export the provider
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState(localStorage.getItem('token') || initContext.token);
  const [account, setAccount] = useState(initContext.account);
  const [isLoggedIn, setIsLoggedIn] = useState(initContext.isLoggedIn);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'));

  const register = (formData: FormData) => {
    return new Promise((resolve, reject) => {
      axios
        .post('/auth/register', formData)
        .then(({ data: { data: accountData, token: accessToken } }) => {
          setAccount(accountData);
          setToken(accessToken);
          setIsLoggedIn(true);
          resolve(true);
        })
        .catch((error) => {
          reject(error?.response?.data?.message || error.message);
        });
    });
  };

  const login = (formData: FormData) => {
    return new Promise((resolve, reject) => {
      axios
        .post('/auth/login', formData)
        .then(({ data: { data: accountData, token: accessToken } }) => {
          setAccount(accountData);
          setToken(accessToken);
          setIsLoggedIn(true);
          resolve(true);
        })
        .catch((error) => {
          reject(error?.response?.data?.message || error.message);
        });
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAccount(null);
    setToken(null);
  };

  const loginWithToken = async () => {
    try {
      const {
        data: { data: accountData, token: accessToken },
      } = await axios.get('/auth/login', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setAccount(accountData);
      setToken(accessToken);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.statusCode === 401) setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (!isLoggedIn && !account && token) {
      loginWithToken();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, account, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ token, account, isLoggedIn, isLoading, register, login, logout }),
    [token, account, isLoggedIn, isLoading]
  );

  return <Provider value={value}>{children}</Provider>;
};
