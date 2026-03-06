import { Types } from 'mongoose';

export interface Account {
  username: string;
  password: string;
  role: 'USER' | 'ADMIN';
  type?: 'CUSTOMER' | 'SERVICE_PROVIDER';
  defaultLocation?: string;
  bookingIds?: string[];
  listingIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  photo?: string;
}

export interface Listing {
  name: string;
  description?: string;
  serviceType?: string;
  geoLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  ratings?: number;
  bookingIds?: string[] | Types.ObjectId[];
  reviewIds?: string[] | Types.ObjectId[];
  status?: 'ACTIVE' | 'INACTIVE';
  price: number;
  userId: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletionRequest?: {
    status: 'None' | 'Pending' | 'Approved' | 'Rejected';
    requestedAt?: Date;
    reviewedAt?: Date;
  };
  photos: {
    url: string;
    isPrimary?: boolean;
    uploadedAt?: Date;
  }[];
}

export interface Booking {
  listingId: string | Types.ObjectId;
  customerId: string | Types.ObjectId;
  status:
    | 'REQUESTED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'RESCHEDULED'
    | 'RESCHEDULEDANDAPPROVED';
  finalPrice?: number;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Refunded';
  paymentId?: string;
  isCancelled?: boolean;
  cancelledBy?: 'CUSTOMER' | 'SERVICE_PROVIDER';
  cancelledAt?: Date;
  rescheduleCount?: number;
  originalDate?: Date;
  scheduledDate: Date;
  reviewId?: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Review {
  listingId: string | Types.ObjectId;
  bookingId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  description?: string;
  stars: number; // 1-5
  createdAt?: Date;
  beforePhotos: {
    url: string;
    isPrimary?: boolean;
    uploadedAt?: Date;
  }[];
  afterPhotos: {
    url: string;
    isPrimary?: boolean;
    uploadedAt?: Date;
  }[];
}
