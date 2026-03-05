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
  Divider,
} from '@mui/material';
import debounce from 'lodash.debounce';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import {
  getListing,
  updateListing,
  getPlaceSuggestions,
  getAddressFromCoordinates,
  createBooking,
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

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '&:hover fieldset': { borderColor: '#1D6FF2' },
    '&.Mui-focused fieldset': { borderColor: '#1D6FF2' },
  },
};

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

  if (loading) {
    return <Loading />;
  }

  if (error || !listing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error || 'Listing not found'}</Alert>
      </Box>
    );
  }

  const isListingActive = listing.status === 'ACTIVE';
  const statusColor = listing.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6';
  const statusTextColor = listing.status === 'ACTIVE' ? '#15803d' : '#6b7280';

  return (
    <div className="bg-slate-200">
      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}>
        {/* Photo Grid */}
        {listing.photos && listing.photos.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: listing.photos.length === 1 ? '1fr' : '1fr 1fr',
              gap: 1.5,
              mb: 3,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {listing.photos.map((photo, idx) => (
              <Box
                key={idx}
                component="img"
                src={photo.url}
                alt={`${listing.name} ${idx}`}
                sx={{
                  width: '100%',
                  height: { xs: 180, sm: 240 },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ))}
          </Box>
        )}

        {/* Main Card */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
              <Box sx={{ flex: 1 }}>
                {editMode ? (
                  <TextField
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: 20, sm: 24 },
                      color: '#0F0F0F',
                      lineHeight: 1.2,
                    }}
                  >
                    {listing.name}
                  </Typography>
                )}
              </Box>

              <Chip
                label={listing.status}
                size="small"
                sx={{
                  backgroundColor: statusColor,
                  color: statusTextColor,
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  border: 'none',
                  flexShrink: 0,
                }}
              />
            </Stack>

            {/* Service type + Rating row */}
            <Stack direction="row" alignItems="center" gap={1.5} mt={1.5} flexWrap="wrap">
              {editMode ? (
                <TextField
                  select
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  size="small"
                  sx={{ ...inputSx, minWidth: 160 }}
                >
                  {Object.values(ServiceTypeEnum).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Chip
                  label={listing.serviceType}
                  size="small"
                  sx={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D6FF2',
                    fontWeight: 500,
                    fontSize: 12,
                    border: 'none',
                  }}
                />
              )}

              {listing.ratings != null && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>
                    {listing.ratings}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#E0E0E0' }} />

          {/* Details */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
            <Stack spacing={2}>
              {/* Price */}
              <Stack direction="row" alignItems="center" gap={1}>
                <CurrencyRupeeIcon sx={{ fontSize: 18, color: '#6B6B6B' }} />
                {editMode ? (
                  <TextField
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    size="small"
                    sx={{ ...inputSx, width: 140 }}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#0F0F0F' }}>
                    {listing.price.toLocaleString('en-IN')}
                  </Typography>
                )}
              </Stack>

              {/* Location */}
              <Stack direction="row" alignItems="center" gap={1}>
                <LocationOnIcon sx={{ fontSize: 18, color: '#6B6B6B', flexShrink: 0 }} />
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
                            coordinates: [
                              selected.coordinates.longitude,
                              selected.coordinates.latitude,
                            ],
                          },
                        });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Update Location" size="small" sx={inputSx} />
                    )}
                    sx={{ minWidth: 280 }}
                  />
                ) : addressLoading ? (
                  <CircularProgress size={14} sx={{ color: '#6B6B6B' }} />
                ) : (
                  <Typography sx={{ fontSize: 14, color: '#6B6B6B' }}>{addressName}</Typography>
                )}
              </Stack>

              {/* Description */}
              <Box>
                {editMode ? (
                  <TextField
                    multiline
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    sx={inputSx}
                  />
                ) : (
                  <Typography sx={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7 }}>
                    {listing.description}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>

          {/* Actions */}
          {(canEdit || (canBook && isListingActive)) && (
            <>
              <Divider sx={{ borderColor: '#E0E0E0' }} />
              <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
                {canEdit && (
                  <Stack direction="row" gap={1.5}>
                    {editMode ? (
                      <>
                        <Button
                          variant="contained"
                          onClick={handleUpdate}
                          sx={{
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#1D6FF2',
                            boxShadow: 'none',
                            '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
                          }}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setEditMode(false)}
                          sx={{
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: '#E0E0E0',
                            color: '#0F0F0F',
                            '&:hover': { borderColor: '#1D6FF2', color: '#1D6FF2' },
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setEditMode(true)}
                        sx={{
                          borderRadius: '6px',
                          textTransform: 'none',
                          fontWeight: 500,
                          borderColor: '#E0E0E0',
                          color: '#0F0F0F',
                          '&:hover': { borderColor: '#1D6FF2', color: '#1D6FF2' },
                        }}
                      >
                        Edit Listing
                      </Button>
                    )}
                  </Stack>
                )}

                {canBook && isListingActive && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                    onClick={handleBookingOpen}
                    fullWidth
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: '#1D6FF2',
                      boxShadow: 'none',
                      height: 48,
                      '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
                    }}
                  >
                    Book Now
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>

        {/* Booking Dialog */}
        <Dialog
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: 16, color: '#0F0F0F', pb: 1 }}>
            Book this Service
          </DialogTitle>
          <Divider sx={{ borderColor: '#E0E0E0' }} />
          <DialogContent sx={{ pt: 2.5 }}>
            {bookingSuccess ? (
              <Alert severity="success" sx={{ borderRadius: '8px' }}>
                Booking confirmed! We'll see you soon.
              </Alert>
            ) : (
              <Stack spacing={2}>
                <Typography sx={{ fontSize: 13, color: '#6B6B6B' }}>
                  Select a date and time for{' '}
                  <strong style={{ color: '#0F0F0F' }}>{listing.name}</strong>.
                </Typography>
                <TextField
                  label="Scheduled Date & Time"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                  fullWidth
                  size="small"
                  sx={inputSx}
                />
                {bookingError && (
                  <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {bookingError}
                  </Alert>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={() => setBookingOpen(false)}
              disabled={bookingLoading}
              sx={{
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 500,
                color: '#6B6B6B',
                '&:hover': { backgroundColor: '#F5F5F5' },
              }}
            >
              {bookingSuccess ? 'Close' : 'Cancel'}
            </Button>
            {!bookingSuccess && (
              <Button
                variant="contained"
                onClick={handleBookingSubmit}
                disabled={bookingLoading}
                startIcon={bookingLoading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#1D6FF2',
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
                  '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
                }}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default ListingDetail;
