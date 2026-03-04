import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Stack,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import debounce from 'lodash.debounce';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import {
  getListing,
  updateListing,
  getPlaceSuggestions,
  getAddressFromCoordinates,
  createBooking, // make sure this is exported from utils/api
} from 'utils/api';
import { useAuth } from 'contexts/AuthContext';
import { UserRoleEnum, UserTypeEnum, ServiceTypeEnum } from 'utils/enum';

interface Listing {
  _id: string;
  name: string;
  description: string;
  serviceType: string;
  status: string;
  price: number;
  ratings?: number;
  photos?: { url: string }[];
  geoLocation?: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
}

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { account } = useAuth();
  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isServiceProvider = account?.type === UserTypeEnum.SERVICE_PROVIDER && !isAdmin;

  const canEdit = isAdmin || isServiceProvider;

  // Only regular logged-in users (not admin, not service provider) can book
  const canBook = !isAdmin && !isServiceProvider;

  const [listing, setListing] = useState<Listing | null>(null);
  const [form, setForm] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [addressName, setAddressName] = useState<string>('');
  const [addressLoading, setAddressLoading] = useState(false);

  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking state
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

      if (listingData.geoLocation?.coordinates) {
        fetchAddress(listingData.geoLocation.coordinates);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const fetchSuggestions = async (value: string) => {
    if (!value || value.length < 3) return;
    const data = await getPlaceSuggestions(value);
    setLocationOptions(data);
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 400), []);

  const handleUpdate = async () => {
    try {
      const updated = await updateListing(listing!._id, form);
      const updatedData = updated.data || updated;
      setListing(updatedData);
      setEditMode(false);

      if (updatedData.geoLocation?.coordinates) {
        fetchAddress(updatedData.geoLocation.coordinates);
      }
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

  const handleBookingClose = () => {
    setBookingOpen(false);
  };

  const handleBookingSubmit = async () => {
    if (!scheduledDate) {
      setBookingError('Please select a date and time.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      await createBooking({
        listingId: listing!._id,
        scheduledDate,
      });
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(
        err?.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !listing) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <Alert severity="error">{error || 'Listing not found'}</Alert>
      </Box>
    );
  }

  const statusColor =
    listing.status === 'ACTIVE' ? 'success' : listing.status === 'INACTIVE' ? 'default' : 'warning';

  const isListingActive = listing.status === 'ACTIVE';

  return (
    <Box className="max-w-3xl mx-auto px-4 py-8">
      {/* Photos */}
      {listing.photos?.length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {listing.photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo.url}
              alt={`${listing.name} ${idx}`}
              className="w-full h-48 object-cover rounded-xl"
            />
          ))}
        </div>
      )}

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          {editMode ? (
            <TextField name="name" value={form.name} onChange={handleChange} fullWidth />
          ) : (
            <Typography variant="h5">{listing.name}</Typography>
          )}
          <Chip label={listing.status} color={statusColor} />
        </Stack>

        {/* Service Type */}
        {editMode ? (
          <TextField
            select
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            sx={{ mt: 2 }}
          >
            {Object.values(ServiceTypeEnum).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Chip label={listing.serviceType} sx={{ mt: 1 }} />
        )}

        {/* Price */}
        <Stack direction="row" alignItems="center" gap={1} mt={2}>
          <CurrencyRupeeIcon />
          {editMode ? (
            <TextField type="number" name="price" value={form.price} onChange={handleChange} />
          ) : (
            <Typography variant="h6">{listing.price}</Typography>
          )}
        </Stack>

        {/* Location */}
        <Stack direction="row" alignItems="center" gap={1} mt={2}>
          <LocationOnIcon sx={{ color: '#64748b' }} />
          {editMode ? (
            <Autocomplete
              options={locationOptions}
              getOptionLabel={(option: any) => option.fullAddress}
              onInputChange={(_, value) => debouncedFetch(value)}
              onChange={(_, selected: any) => {
                if (selected) {
                  setForm({
                    ...form,
                    geoLocation: {
                      type: 'Point',
                      coordinates: [selected.coordinates.longitude, selected.coordinates.latitude],
                    },
                  });
                }
              }}
              renderInput={(params) => <TextField {...params} label="Update Location" />}
              sx={{ minWidth: 280 }}
            />
          ) : addressLoading ? (
            <CircularProgress size={16} />
          ) : (
            <Typography variant="body1" color="#475569">
              {addressName}
            </Typography>
          )}
        </Stack>

        {/* Description */}
        {editMode ? (
          <TextField
            multiline
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 3 }}
          />
        ) : (
          <Typography mt={3}>{listing.description}</Typography>
        )}

        {/* Rating */}
        {listing.ratings && (
          <Stack direction="row" alignItems="center" mt={2}>
            <StarIcon sx={{ color: '#f59e0b' }} />
            <Typography>{listing.ratings}</Typography>
          </Stack>
        )}

        {/* Edit Buttons (admin / service provider) */}
        {canEdit && (
          <Stack direction="row" gap={2} mt={4}>
            {editMode ? (
              <>
                <Button variant="contained" onClick={handleUpdate}>
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={() => setEditMode(true)}>
                Edit Listing
              </Button>
            )}
          </Stack>
        )}

        {/* Book Now Button (regular users only, listing must be active) */}
        {canBook && isListingActive && (
          <Stack mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CalendarMonthIcon />}
              onClick={handleBookingOpen}
            >
              Book Now
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={handleBookingClose} maxWidth="xs" fullWidth>
        <DialogTitle>Book this Service</DialogTitle>
        <DialogContent>
          {bookingSuccess ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              Booking confirmed! We'll see you soon.
            </Alert>
          ) : (
            <Stack spacing={2} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Select a date and time for <strong>{listing.name}</strong>.
              </Typography>
              <TextField
                label="Scheduled Date & Time"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                fullWidth
              />
              {bookingError && <Alert severity="error">{bookingError}</Alert>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose} disabled={bookingLoading}>
            {bookingSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!bookingSuccess && (
            <Button
              variant="contained"
              onClick={handleBookingSubmit}
              disabled={bookingLoading}
              startIcon={bookingLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {bookingLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListingDetail;
