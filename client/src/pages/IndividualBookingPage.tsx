import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { getBookingById, updateBookingStatus, uploadBookingPhotos } from 'utils/api';
import { useAuth } from 'contexts/AuthContext';
import { BookingStatusEnum, UserRoleEnum, UserTypeEnum } from 'utils/enum';

const MAX_PHOTOS = 5;

const statusChipSx = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    APPROVED: { bg: '#dcfce7', color: '#15803d' },
    REQUESTED: { bg: '#fef9c3', color: '#854d0e' },
    RESCHEDULED: { bg: '#dbeafe', color: '#1d4ed8' },
    CANCELLED: { bg: '#fee2e2', color: '#dc2626' },
    COMPLETED: { bg: '#f3f4f6', color: '#374151' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return { backgroundColor: s.bg, color: s.color };
};

interface PhotoUploadSectionProps {
  label: string;
  existing: any[];
  selected: File[];
  previews: string[];
  canUpload: boolean;
  onChange: (files: File[], previews: string[]) => void;
  onRemovePreview: (index: number) => void;
}

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  label,
  existing,
  previews,
  canUpload,
  onChange,
  onRemovePreview,
}) => {
  const remaining = MAX_PHOTOS - existing.length - previews.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []).slice(0, remaining);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    onChange(files, newPreviews);
    e.target.value = '';
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0F0F0F' }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: '#6B6B6B' }}>
          {existing.length + previews.length} / {MAX_PHOTOS}
        </Typography>
      </Stack>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Existing photos */}
        {existing.map((p: any, i: number) => (
          <Box
            key={i}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #E0E0E0',
              flexShrink: 0,
            }}
          >
            <img
              src={p.url}
              alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        ))}

        {/* New previews */}
        {previews.map((src, i) => (
          <Box
            key={`preview-${i}`}
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #E0E0E0',
              flexShrink: 0,
            }}
          >
            <img
              src={src}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <IconButton
              size="small"
              onClick={() => onRemovePreview(i)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                p: '2px',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.75)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        ))}

        {/* Add button */}
        {canUpload && existing.length + previews.length < MAX_PHOTOS && (
          <Button
            component="label"
            variant="outlined"
            sx={{
              width: 80,
              height: 80,
              minWidth: 'unset',
              borderRadius: '8px',
              borderColor: '#E0E0E0',
              borderStyle: 'dashed',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              color: '#6B6B6B',
              flexShrink: 0,
              '&:hover': { borderColor: '#1D6FF2', color: '#1D6FF2', backgroundColor: '#F5F8FF' },
            }}
          >
            <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22 }} />
            <Typography sx={{ fontSize: 10, textTransform: 'none', lineHeight: 1 }}>Add</Typography>
            <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
          </Button>
        )}

        {existing.length === 0 && !canUpload && (
          <Typography sx={{ fontSize: 13, color: '#9E9E9E', py: 1 }}>No photos yet.</Typography>
        )}
      </Box>
    </Box>
  );
};

const IndividualBookingPage = () => {
  const { id } = useParams();
  const { account } = useAuth();

  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = account?.type === UserTypeEnum.CUSTOMER && !isAdmin;
  const isServiceProvider = account?.type === UserTypeEnum.SERVICE_PROVIDER && !isAdmin;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [beforePreviews, setBeforePreviews] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const [afterPreviews, setAfterPreviews] = useState<string[]>([]);

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

  const handleUpload = async () => {
    await uploadBookingPhotos(id, beforePhotos, afterPhotos);
    setBeforePhotos([]);
    setBeforePreviews([]);
    setAfterPhotos([]);
    setAfterPreviews([]);
    fetchBooking();
  };

  const removeBeforePreview = (i: number) => {
    URL.revokeObjectURL(beforePreviews[i]);
    setBeforePhotos((p) => p.filter((_, idx) => idx !== i));
    setBeforePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeAfterPreview = (i: number) => {
    URL.revokeObjectURL(afterPreviews[i]);
    setAfterPhotos((p) => p.filter((_, idx) => idx !== i));
    setAfterPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress sx={{ color: '#1D6FF2' }} />
      </Box>
    );

  if (error || !booking)
    return (
      <Box mt={4}>
        <Alert severity="error">{error || 'Booking not found'}</Alert>
      </Box>
    );

  const canUpload =
    booking.status === BookingStatusEnum.COMPLETED && (isCustomer || isServiceProvider);
  const canComplete =
    (isAdmin || isServiceProvider) &&
    booking.status !== BookingStatusEnum.COMPLETED &&
    booking.status !== BookingStatusEnum.CANCELLED;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}>
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
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 }, color: '#0F0F0F' }}>
              Booking #{booking._id?.slice(-6).toUpperCase()}
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '6px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                ...statusChipSx(booking.status),
              }}
            >
              {booking.status}
            </Box>
          </Stack>

          <Stack spacing={0.5} mt={1.5}>
            <Typography sx={{ fontSize: 13, color: '#6B6B6B' }}>
              <span style={{ color: '#0F0F0F', fontWeight: 500 }}>Price:</span> ₹
              {booking.finalPrice?.toLocaleString('en-IN')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#6B6B6B' }}>
              <span style={{ color: '#0F0F0F', fontWeight: 500 }}>Scheduled:</span>{' '}
              {new Date(booking.scheduledDate).toLocaleString()}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#E0E0E0' }} />

        {/* Photos */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          <Stack spacing={3}>
            <PhotoUploadSection
              label="Before Photos"
              existing={booking.beforePhotos || []}
              selected={beforePhotos}
              previews={beforePreviews}
              canUpload={canUpload}
              onChange={(files, previews) => {
                setBeforePhotos(files);
                setBeforePreviews(previews);
              }}
              onRemovePreview={removeBeforePreview}
            />

            <Divider sx={{ borderColor: '#F0F0F0' }} />

            <PhotoUploadSection
              label="After Photos"
              existing={booking.afterPhotos || []}
              selected={afterPhotos}
              previews={afterPreviews}
              canUpload={canUpload}
              onChange={(files, previews) => {
                setAfterPhotos(files);
                setAfterPreviews(previews);
              }}
              onRemovePreview={removeAfterPreview}
            />
          </Stack>
        </Box>

        {/* Actions */}
        {(canComplete || (canUpload && (beforePhotos.length > 0 || afterPhotos.length > 0))) && (
          <>
            <Divider sx={{ borderColor: '#E0E0E0' }} />
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
              <Stack direction="row" gap={1.5} flexWrap="wrap">
                {canComplete && (
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await updateBookingStatus(id, 'COMPLETED');
                      fetchBooking();
                    }}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: '#16a34a',
                      boxShadow: 'none',
                      '&:hover': { backgroundColor: '#15803d', boxShadow: 'none' },
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}

                {canUpload && (beforePhotos.length > 0 || afterPhotos.length > 0) && (
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: '#1D6FF2',
                      boxShadow: 'none',
                      '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
                    }}
                  >
                    Upload Photos
                  </Button>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default IndividualBookingPage;
