import { model, Schema } from 'mongoose';
import { Review } from '../@types';

const ReviewSchema = new Schema<Review>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    description: { type: String, required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    beforePhotos: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    afterPhotos: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default model<Review>('Review', ReviewSchema);
