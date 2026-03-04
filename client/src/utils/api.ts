import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
interface ListingsParams {
  serviceType: string;
  status: string;
  lat: number;
  lng: number;
  radiusKm: number;
  minRating: number;
}

//Listing api

export const getListings = async (params: ListingsParams) => {
  try {
    const { data } = await api.get('/listing', {
      params,
    });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

interface CreateListingParams {
  name: string;
  description: string;
  geoLocation: {
    type: String;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  price: number;
  serviceType: string;
  photos: File[];
}

export const createListing = async ({
  name,
  description,
  geoLocation,
  price,
  serviceType,
  photos,
}: CreateListingParams) => {
  try {
    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('serviceType', serviceType);
    formData.append('geoLocation', JSON.stringify(geoLocation));

    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    const { data } = await api.post('/listing', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const getMyListings = async (page: number) => {
  try {
    const { data } = await api.get('/listing/me', { params: { page } });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const getListing = async (id: string | undefined) => {
  try {
    const { data } = await api.get(`/listing/${id}`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const toggleListingStatus = async (id: string) => {
  try {
    const { data } = await api.patch(`/listing/${id}/status`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
interface UpdateListingParams {
  name?: string;
  description?: string;
  serviceType?: string;
  price?: number;
  geoLocation?: {
    lat: number;
    lng: number;
  };
}

export const updateListing = async (id: string, updates: UpdateListingParams) => {
  try {
    const { data } = await api.put(`/listing/${id}`, updates);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

//Location apis

export const getPlaceSuggestions = async (query: string) => {
  try {
    const { data } = await api.get('/location/suggestions', {
      params: { query },
    });

    return data.data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const getAddressFromCoordinates = async (coordinates: Array<string>) => {
  try {
    const { data } = await api.get('/location/reverse', {
      params: {
        latitude: coordinates[0],
        longitude: coordinates[1],
      },
    });

    return data.data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

//booking apis

export const createBooking = async (body: { listingId: string; scheduledDate: string }) => {
  try {
    const { data } = await api.post('/booking', body);

    return data.data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
