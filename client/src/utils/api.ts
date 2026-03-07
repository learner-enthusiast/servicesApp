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

export const getMyListings = async (query: any) => {
  try {
    const { data } = await api.get('/listing/me', { params: query });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const getMyListingsAdmin = async (query: any) => {
  try {
    const { data } = await api.get('/listing/admin/individualUser', { params: query });

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
        latitude: coordinates[1],
        longitude: coordinates[0],
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

export const getUserMyBookings = async (query: any) => {
  try {
    const { data } = await api.get('/booking/my-bookings', { params: query });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const getUserMyBookingsAdmin = async (query: any) => {
  try {
    const { data } = await api.get('/booking/user-bookings', { params: query });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const cancelBooking = async (id: String) => {
  try {
    const { data } = await api.patch(`/booking/${id}/cancel`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const approveBooking = async (id: String) => {
  try {
    const { data } = await api.post(`/booking/${id}/approve`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const approveRescheduleBooking = async (id: String) => {
  try {
    const { data } = await api.patch(`/booking/${id}/rescheduleApprove`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

interface RescheduleBookingParams {
  scheduledDate: string;
}

export const rescheduleBooking = async (id: string, params: RescheduleBookingParams) => {
  try {
    const { data } = await api.patch(`/booking/${id}/reschedule`, params);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const getService_ProviderMyBookings = async (query: any) => {
  try {
    const { data } = await api.get('/booking/bookingsservice_provider', { params: query });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const getBookingById = async (id: string | undefined) => {
  try {
    const { data } = await api.get(`/booking/${id}`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const uploadBookingPhotos = async (
  id: string | undefined,
  beforePhotos?: File[],
  afterPhotos?: File[]
) => {
  const formData = new FormData();

  beforePhotos?.forEach((file) => {
    formData.append('beforePhotos', file);
  });

  afterPhotos?.forEach((file) => {
    formData.append('afterPhotos', file);
  });

  const { data } = await api.post(`/booking/${id}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};
export const updateBookingStatus = async (id: String | undefined, status: String) => {
  try {
    const { data } = await api.patch(`/booking/${id}/status`, { status });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

//Reviews

export const createReview = async (body: any) => {
  try {
    const { data } = await api.post(`/review`, body);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const updateReview = async (id: string, body: any) => {
  try {
    const { data } = await api.put(`/review/${id}`, body);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const getReviewsByListingId = async (id: string) => {
  try {
    const { data } = await api.get(`/review/listing/${id}`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const uploadReviewBeforePhotos = async (reviewId: string, photos: File[]) => {
  try {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    const { data } = await api.post(`/review/${reviewId}/before-photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

// Upload after photos for a review (max 2)
export const uploadReviewAfterPhotos = async (reviewId: string, photos: File[]) => {
  try {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    const { data } = await api.post(`/review/${reviewId}/after-photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

// Replace a specific before photo by index
export const replaceReviewBeforePhoto = async (
  reviewId: string,
  photoIndex: number,
  photo: File
) => {
  try {
    const formData = new FormData();
    formData.append('photos', photo);

    const { data } = await api.patch(`/review/${reviewId}/before-photos/${photoIndex}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

// Replace a specific after photo by index
export const replaceReviewAfterPhoto = async (
  reviewId: string,
  photoIndex: number,
  photo: File
) => {
  try {
    const formData = new FormData();
    formData.append('photos', photo);

    const { data } = await api.patch(`/review/${reviewId}/after-photos/${photoIndex}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const suggestDescription = async (body: any) => {
  try {
    const { data } = await api.post(`/ai/suggest-description`, body);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
export const suggestPricing = async (body: any) => {
  try {
    const { data } = await api.post(`/ai/suggest-pricing`, body);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const getUsersByType = async (query: any) => {
  try {
    const { data } = await api.get(`/auth/users`, { params: query });

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};

export const fetchOverviewStatsfromapi = async () => {
  try {
    const { data } = await api.get(`/auth/overviewStats`);

    return data;
  } catch (error: any) {
    throw error?.response?.data?.message || error.message;
  }
};
