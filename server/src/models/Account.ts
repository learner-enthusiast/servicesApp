import { type Document, model, Schema } from 'mongoose';
import { type Account } from '../@types';
import { UserRoleEnum, UserTypeEnum } from '../utils/enums';

interface I extends Document, Account {}

const instance = new Schema<I>(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRoleEnum),
      default: UserRoleEnum.USER,
    },
    type: {
      type: String,
      enum: Object.values(UserTypeEnum),
    },
    defaultLocation: {
      type: String,
    },
    photo: {
      type: String,
    },
    bookingIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    listingIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const modelName = 'Account';
export default model<I>(modelName, instance);
