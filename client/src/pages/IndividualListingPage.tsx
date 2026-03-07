import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';

import {
  getListing,
  updateListing,
  getPlaceSuggestions,
  getAddressFromCoordinates,
  createBooking,
  getReviewsByListingId,
} from 'utils/api';
import { useAuth } from 'contexts/AuthContext';
import { UserRoleEnum, UserTypeEnum, ServiceTypeEnum } from 'utils/enum';
import Loading from 'components/Loading';

interface Listing {
  _id: string;
  name: string;
  description: string;
  serviceType: string;
  status: string;
  price: number;
  ratings?: number;
  photos?: { url: string }[];
  geoLocation?: { type: string; coordinates: [number, number] };
  createdAt: string;
}

interface Review {
  _id: string;
  description: string;
  stars: number;
  createdAt: string;
  userId: { username?: string; photo?: { url: string } };
  beforePhotos: { url: string }[];
  afterPhotos: { url: string }[];
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating: React.FC<{ value: number; size?: string }> = ({ value, size = 'text-sm' }) => (
  <div className={`flex items-center gap-0.5 ${size}`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
      </svg>
    ))}
  </div>
);

// ─── Reviews Section ──────────────────────────────────────────────────────────

const ReviewsSection: React.FC<{ listingId: string }> = ({ listingId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getReviewsByListingId(listingId);
        setReviews(res.data || res);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [listingId]);

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!reviews.length) return <p className="text-sm text-gray-400 py-2">No reviews yet.</p>;

  return (
    <div className="space-y-5 max-h-72 overflow-y-auto">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base border border-gray-200 overflow-hidden flex-shrink-0">
                {review.userId?.photo?.url ? (
                  <img
                    src={review.userId.photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (review.userId?.username?.[0]?.toUpperCase() ?? '?')
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">
                  {review.userId?.username ?? 'Anonymous'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <StarRating value={review.stars} />
          </div>
          {review.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.description}</p>
          )}

          {((review.beforePhotos && review.beforePhotos.length > 0) ||
            (review.afterPhotos && review.afterPhotos.length > 0)) && (
            <div className="flex gap-3 flex-wrap">
              {review.beforePhotos?.slice(0, 2).map((photo, idx) => (
                <div key={`before-${idx}`} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 mb-1">Before</span>
                  <img
                    src={photo.url}
                    alt="before"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              ))}

              {review.afterPhotos?.slice(0, 2).map((photo, idx) => (
                <div key={`after-${idx}`} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 mb-1">After</span>
                  <img
                    src={photo.url}
                    alt="after"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useAuth();

  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isServiceProvider = account?.type === UserTypeEnum.SERVICE_PROVIDER && !isAdmin;
  const canEdit = isAdmin || isServiceProvider;
  const canBook = !isAdmin && !isServiceProvider;

  const [listing, setListing] = useState<Listing | null>(null);
  const [form, setForm] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingOpen, setBookingOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchAddress = async (coordinates: [number, number]) => {
    setAddressLoading(true);
    try {
      const data = await getAddressFromCoordinates([
        String(coordinates[0]),
        String(coordinates[1]),
      ]);
      setAddressName(
        data?.fullAddress ||
          data?.name ||
          `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
      );
    } catch {
      setAddressName(`${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchListing = async () => {
    try {
      const { data } = await getListing(id);
      const listingData = data.data || data;
      setListing(listingData);
      setForm({
        name: listingData.name,
        description: listingData.description,
        serviceType: listingData.serviceType,
        price: listingData.price,
        geoLocation: listingData.geoLocation,
      });
      if (listingData.geoLocation?.coordinates) fetchAddress(listingData.geoLocation.coordinates);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchSuggestions = async (value: string) => {
    if (!value || value.length < 3) return;
    const data = await getPlaceSuggestions(value);
    setLocationOptions(data);
    setShowLocationDropdown(true);
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 400), []);

  const handleUpdate = async () => {
    try {
      const updated = await updateListing(listing!._id, form);
      const updatedData = updated.data || updated;
      setListing(updatedData);
      setEditMode(false);
      if (updatedData.geoLocation?.coordinates) fetchAddress(updatedData.geoLocation.coordinates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingOpen = () => {
    setScheduledDate('');
    setBookingError('');
    setBookingSuccess(false);
    setBookingOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!scheduledDate) {
      setBookingError('Please select a date and time.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      await createBooking({ listingId: listing!._id, scheduledDate });
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(
        err?.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !listing)
    return (
      <div className="flex justify-center items-center min-h-[60vh] max-w-[1280px]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-medium">
          {error || 'Listing not found'}
        </div>
      </div>
    );

  const isListingActive = listing.status === 'ACTIVE';
  const hasRatings = listing.ratings != null && listing.ratings > 0;

  return (
    <div className="bg-gray-50 min-h-screen mt-4 max-w-[1280px]">
      <main className="mx-auto px-4 py-10">
        <div className="mb-7">
          {editMode ? (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              {listing.name}
            </h1>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status badge */}
            <span
              className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full flex items-center gap-1.5 border ${
                isListingActive
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isListingActive ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              {listing.status}
            </span>

            {/* Service type */}
            {editMode ? (
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="text-xs font-semibold bg-white border border-gray-200 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              >
                {Object.values(ServiceTypeEnum).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">
                {listing.serviceType}
              </span>
            )}

            {/* Location */}
            {!editMode && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="max-w-52 overflow-hidden text-ellipsis whitespace-nowrap">
                  {addressLoading ? (
                    <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    addressName
                  )}
                </div>
              </span>
            )}

            {/* Rating badge */}
            {hasRatings && (
              <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-2 py-1 rounded-lg">
                <svg
                  className="w-3.5 h-3.5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
                <span className="text-gray-900 font-bold text-xs">{listing.ratings}</span>
              </span>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: photos + description + reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photos */}
            {listing.photos && listing.photos.length > 0 ? (
              <div
                className={`grid gap-2 rounded-2xl overflow-hidden ${
                  listing.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}
              >
                {listing.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo.url}
                    alt={`${listing.name} ${idx}`}
                    className="w-full h-72 object-cover block"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-72 bg-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-300">
                <svg
                  className="w-12 h-12 mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-base font-medium">No photos yet</span>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold mb-3 text-gray-900">About this service</h2>
              {editMode ? (
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-sm">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Location edit (only in edit mode) */}
            {editMode && (
              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-900">Update Location</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      debouncedFetch(e.target.value);
                    }}
                    className="max-w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showLocationDropdown && locationOptions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {locationOptions.map((option: any, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setForm({
                              ...form,
                              geoLocation: {
                                type: 'Point',
                                coordinates: [
                                  option.coordinates.longitude,
                                  option.coordinates.latitude,
                                ],
                              },
                            });
                            setLocationQuery(option.fullAddress);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          {option.fullAddress}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            {hasRatings && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                  <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-2 py-1 rounded-lg">
                    <svg
                      className="w-3.5 h-3.5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                    <span className="text-gray-900 font-bold text-xs">{listing.ratings}</span>
                  </span>
                </div>
                <ReviewsSection listingId={listing._id} />
              </div>
            )}
          </div>

          {/* Right: sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl">
              {/* Price */}
              <div className="mb-6">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-gray-900">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="text-3xl font-extrabold text-gray-900 w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">
                      ₹{listing.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-500 font-medium ml-1">/ total</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              {canEdit && (
                <div className="space-y-2 mb-6">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-100 text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-200 transition duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-200 text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Edit Listing
                    </button>
                  )}
                </div>
              )}

              {canBook && isListingActive && (
                <button
                  onClick={handleBookingOpen}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-200 mb-6 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Book Now
                </button>
              )}

              {/* Location section */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Location</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {addressLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    addressName
                  )}
                </p>
                <div className="w-full h-28 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden relative">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                    }}
                  />
                  <svg
                    className="w-8 h-8 text-red-400 relative z-10 drop-shadow"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      {bookingOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setBookingOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Book this Service</h2>
            </div>
            <div className="border-t border-gray-100" />
            <div className="px-6 py-5">
              {bookingSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Booking confirmed! We'll see you soon.
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Select a date and time for{' '}
                    <strong className="text-gray-900">{listing.name}</strong>.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {bookingError}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="border-t border-gray-100" />
            <div className="px-6 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setBookingOpen(false)}
                disabled={bookingLoading}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition"
              >
                {bookingSuccess ? 'Close' : 'Cancel'}
              </button>
              {!bookingSuccess && (
                <button
                  onClick={handleBookingSubmit}
                  disabled={bookingLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm transition flex items-center gap-2"
                >
                  {bookingLoading && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
