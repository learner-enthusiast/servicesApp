import { model, Schema, Types } from 'mongoose';
import { Booking } from '../@types';
import { BookingStatusEnum, PaymentStatusEnum, UserTypeEnum } from '../utils/enums';

const BookingSchema = new Schema<Booking>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatusEnum),
      required: true,
    },
    finalPrice: { type: Number },
    paymentStatus: { type: String, enum: Object.values(PaymentStatusEnum) },
    paymentId: { type: String },
    isCancelled: { type: Boolean, default: false },
    cancelledBy: { type: Types.ObjectId },
    cancelledAt: { type: Date },
    rescheduleCount: { type: Number, default: 0 },
    originalDate: { type: Date },
    scheduledDate: { type: Date, required: true },
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
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

export default model<Booking>('Booking', BookingSchema);
