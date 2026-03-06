import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  getBookingById,
  updateBookingStatus,
  createReview,
  updateReview,
  uploadReviewBeforePhotos,
  uploadReviewAfterPhotos,
  replaceReviewBeforePhoto,
  replaceReviewAfterPhoto,
} from 'utils/api';
import { useAuth } from 'contexts/AuthContext';
import { BookingStatusEnum, UserRoleEnum, UserTypeEnum } from 'utils/enum';
import Loading from 'components/Loading';

const MAX_REVIEW_PHOTOS = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyle = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
    COMPLETED: 'bg-gray-100 text-gray-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-500';
};

const ratingLabel = (stars: number) =>
  ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][stars] ?? '';

// ─── Star Picker ──────────────────────────────────────────────────────────────

const StarPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
  canReview: boolean;
}> = ({ value, onChange, canReview }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
          disabled={!canReview}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-200'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className="text-xs text-gray-500 ml-2">{ratingLabel(hovered || value)}</span>
      )}
    </div>
  );
};

// ─── Review Photo Section ─────────────────────────────────────────────────────

interface ReviewPhotoSectionProps {
  label: string;
  type: 'before' | 'after';
  reviewId: string | null;
  existing: any[];
  canUpload: boolean;
  onRefresh: () => void;
}

const ReviewPhotoSection: React.FC<ReviewPhotoSectionProps> = ({
  label,
  type,
  reviewId,
  existing,
  canUpload,
  onRefresh,
}) => {
  const [uploading, setUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const remaining = MAX_REVIEW_PHOTOS - existing.length;

  // Upload new photos
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !reviewId) return;

    if (files.length > remaining) {
      setError(`You can only add ${remaining} more photo(s)`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError('');
    try {
      if (type === 'before') {
        await uploadReviewBeforePhotos(reviewId, files);
      } else {
        await uploadReviewAfterPhotos(reviewId, files);
      }
      onRefresh();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : `Failed to upload ${type} photos`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Replace an existing photo
  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null || !reviewId) return;

    setUploading(true);
    setError('');
    try {
      if (type === 'before') {
        await replaceReviewBeforePhoto(reviewId, replacingIndex, file);
      } else {
        await replaceReviewAfterPhoto(reviewId, replacingIndex, file);
      }
      onRefresh();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : `Failed to replace photo`);
    } finally {
      setUploading(false);
      setReplacingIndex(null);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">{label}</h2>
        <span className="text-xs text-gray-400">
          {existing.length} / {MAX_REVIEW_PHOTOS}
        </span>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {/* Hidden input for replacing */}
      <input
        id={`replace-${type}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleReplace}
      />

      <div className="flex flex-wrap gap-2">
        {/* Existing photos */}
        {existing.map((photo: any, index: number) => (
          <div
            key={index}
            className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 group"
          >
            <img
              src={photo.url}
              alt={`${label} ${index + 1}`}
              className="w-full h-full object-cover block"
            />

            {/* Replace overlay */}
            {canUpload && reviewId && (
              <button
                onClick={() => {
                  setReplacingIndex(index);
                  document.getElementById(`replace-${type}`)?.click();
                }}
                disabled={uploading}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors"
              >
                <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Replace
                </span>
              </button>
            )}
          </div>
        ))}

        {/* Upload button */}
        {canUpload && reviewId && existing.length < MAX_REVIEW_PHOTOS && (
          <label
            className={`w-20 h-20 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0 ${
              uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
            }`}
          >
            {uploading ? (
              <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <>
                <svg
                  className="w-6 h-6 mb-1 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-medium">Add</span>
              </>
            )}
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        )}

        {existing.length === 0 && !canUpload && (
          <p className="text-sm text-gray-400 py-1">No photos yet.</p>
        )}

        {existing.length === 0 && canUpload && !reviewId && (
          <p className="text-sm text-gray-400 py-1">Submit a review first to upload photos.</p>
        )}
      </div>
    </div>
  );
};

// ─── Review Section ───────────────────────────────────────────────────────────

interface ReviewSectionProps {
  bookingId: string;
  existingReview: any | null;
  onSaved: () => void;
  canReview: boolean;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  bookingId,
  existingReview,
  onSaved,
  canReview,
}) => {
  const [stars, setStars] = useState<number>(existingReview?.stars ?? 0);
  const [description, setDescription] = useState<string>(existingReview?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const isEdit = !!existingReview?._id;

  const handleSave = async () => {
    if (!stars) {
      setReviewError('Please select a star rating.');
      return;
    }
    setReviewError('');
    setSaving(true);
    try {
      if (isEdit) {
        await updateReview(existingReview._id, { description, stars });
      } else {
        await createReview({ bookingId, description, stars });
      }
      onSaved();
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || 'Failed to save review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-3">
        {isEdit ? 'Your Review' : 'Leave a Review'}
      </h2>

      <div className="space-y-3">
        <StarPicker value={stars} onChange={setStars} canReview={canReview} />

        <textarea
          disabled={!canReview}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a review..."
          rows={4}
          className="w-full border border-gray-200 rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />

        {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !canReview}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const IndividualBookingPage = () => {
  const { id } = useParams();
  const { account } = useAuth();

  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = account?.type === UserTypeEnum.CUSTOMER && !isAdmin;
  const isServiceProvider = account?.type === UserTypeEnum.SERVICE_PROVIDER && !isAdmin;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooking = async () => {
    try {
      const res = await getBookingById(id);
      setBooking(res.data || res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (loading) return <Loading />;

  if (error || !booking)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-medium">
          {error || 'Booking not found'}
        </div>
      </div>
    );

  const isCompleted = booking.status === BookingStatusEnum.COMPLETED;
  const canUploadPhotos = isCustomer && isCompleted;
  const canComplete =
    (isAdmin || isServiceProvider) &&
    !isCompleted &&
    booking.status !== BookingStatusEnum.CANCELLED;
  const canReview = isCustomer && isCompleted;
  const existingReview = booking.review ?? null;
  const reviewId = existingReview?._id ?? null;

  return (
    <div className="bg-white min-h-screen mt-4">
      <main className="flex justify-center items-start pt-10 px-4 pb-16">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-lg">
          {/* ── Header ── */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-lg font-bold text-gray-900">
                Booking #{booking._id?.slice(-6).toUpperCase()}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${statusStyle(booking.status)}`}
              >
                {booking.status}
              </span>
            </div>

            {/* Listing row */}
            <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                {booking.listingName ?? 'Listing'}
              </h2>
              <Link
                to={`/listing/${booking.listingId?._id ?? booking.listingId}`}
                className="text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md transition-colors shadow-sm"
              >
                View Listing
              </Link>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Price:{' '}
                <span className="font-medium text-gray-700">
                  ₹{booking.finalPrice?.toLocaleString('en-IN')}
                </span>
              </p>
              <p>
                Scheduled:{' '}
                <span className="font-medium text-gray-700">
                  {new Date(booking.scheduledDate).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* ── Review ── */}
          <div className="p-6 border-b border-gray-200">
            <ReviewSection
              canReview={canReview}
              bookingId={booking._id}
              existingReview={existingReview}
              onSaved={fetchBooking}
            />
          </div>

          {/* ── Review Photos (Before & After) ── */}
          <div className="flex justify-between">
            <div className="p-6 border-b border-gray-200 flex-1">
              <ReviewPhotoSection
                label="Before Photos"
                type="before"
                reviewId={reviewId}
                existing={existingReview?.beforePhotos || []}
                canUpload={canUploadPhotos}
                onRefresh={fetchBooking}
              />
            </div>

            <div className="p-6 border-b border-gray-200 flex-1">
              <ReviewPhotoSection
                label="After Photos"
                type="after"
                reviewId={reviewId}
                existing={existingReview?.afterPhotos || []}
                canUpload={canUploadPhotos}
                onRefresh={fetchBooking}
              />
            </div>
          </div>

          {/* ── Actions ── */}
          {canComplete && (
            <div className="p-6">
              <button
                onClick={async () => {
                  await updateBookingStatus(id, 'COMPLETED');
                  fetchBooking();
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default IndividualBookingPage;
