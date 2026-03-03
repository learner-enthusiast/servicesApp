import { model, Schema } from 'mongoose';
import { Listing } from '../@types';
import { DeletionRequestEnum, ListingStatusEnum, ServiceTypeEnum } from '../utils/enums';

const ListingSchema = new Schema<Listing>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    serviceType: { type: String, enum: Object.values(ServiceTypeEnum) },
    geoLocation: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    ratings: { type: Number },
    bookingIds: [{ type: Schema.Types.ObjectId, ref: 'Booking', default: [] }],
    reviewIds: [{ type: Schema.Types.ObjectId, ref: 'Review', default: [] }],
    status: {
      type: String,
      enum: Object.values(ListingStatusEnum),
      default: ListingStatusEnum.ACTIVE,
    },
    price: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    deletionRequest: {
      status: {
        type: String,
        enum: Object.values(DeletionRequestEnum),
        default: DeletionRequestEnum.NONE,
      },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
    },
    photos: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
ListingSchema.index({ geoLocation: '2dsphere' });

export default model<Listing>('Listing', ListingSchema);
