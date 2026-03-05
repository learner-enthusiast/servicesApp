import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import { useAuth } from 'contexts/AuthContext';
import { BookingStatusEnum, UserRoleEnum, UserTypeEnum } from 'utils/enum';
import {
  getUserMyBookings,
  cancelBooking,
  approveBooking,
  rescheduleBooking,
  getService_ProviderMyBookings,
  approveRescheduleBooking,
} from 'utils/api';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';

const statusChipSx = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    APPROVED: { bg: '#dcfce7', color: '#15803d' },
    REQUESTED: { bg: '#fef9c3', color: '#854d0e' },
    RESCHEDULED: { bg: '#dbeafe', color: '#1d4ed8' },
    CANCELLED: { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return {
    backgroundColor: s.bg,
    color: s.color,
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: '0.04em',
    border: 'none',
  };
};

const outlinedBtnSx = {
  borderRadius: '6px',
  textTransform: 'none',
  fontWeight: 500,
  borderColor: '#E0E0E0',
  color: '#0F0F0F',
  '&:hover': { borderColor: '#1D6FF2', color: '#1D6FF2' },
};

const containedBtnSx = {
  borderRadius: '6px',
  textTransform: 'none',
  fontWeight: 600,
  backgroundColor: '#1D6FF2',
  boxShadow: 'none',
  '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&:hover fieldset': { borderColor: '#1D6FF2' },
    '&.Mui-focused fieldset': { borderColor: '#1D6FF2' },
  },
};

const UserMyBookings = () => {
  const { account } = useAuth();
  const isAdmin = account?.role === UserRoleEnum.ADMIN;
  const isCustomer = account?.type === UserTypeEnum.CUSTOMER && !isAdmin;
  const isServiceProvider = account?.type === UserTypeEnum.SERVICE_PROVIDER && !isAdmin;
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [openReschedule, setOpenReschedule] = useState(false);

  const fetchBookings = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = isCustomer
        ? await getUserMyBookings(pageNumber)
        : await getService_ProviderMyBookings(pageNumber);
      setBookings(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    fetchBookings(page);
  };
  const handleApprove = async (id: string) => {
    await approveBooking(id);
    fetchBookings(page);
  };
  const handleApproveReschedule = async (id: string) => {
    await approveRescheduleBooking(id);
    fetchBookings(page);
  };

  const openRescheduleDialog = (booking: any) => {
    setSelectedBooking(booking);
    setOpenReschedule(true);
  };

  const handleReschedule = async () => {
    await rescheduleBooking(selectedBooking._id, { scheduledDate: rescheduleDate });
    setOpenReschedule(false);
    setRescheduleDate('');
    fetchBookings(page);
  };

  if (loading) return <Loading />;

  return (
    <Box maxWidth={720} mx="auto" px={{ xs: 2, sm: 3 }} py={{ xs: 3, sm: 4 }}>
      {/* Empty state */}
      {bookings.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 10,
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <CalendarMonthOutlinedIcon sx={{ fontSize: 40, color: '#D0D0D0', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#0F0F0F', mb: 0.5 }}>
            No bookings yet
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#6B6B6B' }}>
            {isCustomer
              ? 'Your bookings will appear here once you book a service.'
              : 'Bookings from customers will appear here.'}
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {bookings.map((booking) => (
              <Card
                key={booking._id}
                elevation={0}
                onClick={() => navigate(`/booking/${booking._id}`)}
                sx={{
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#1D6FF2' },
                  transition: 'border-color 0.15s ease',
                }}
              >
                <CardContent sx={{ p: '20px 24px !important' }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F0F0F' }}>
                          Booking #{booking._id.slice(-6).toUpperCase()}
                        </Typography>
                        <Chip
                          label={booking.status}
                          size="small"
                          sx={statusChipSx(booking.status)}
                        />
                      </Stack>

                      <Stack spacing={0.5}>
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

                    <Stack
                      direction={{ xs: 'row', sm: 'column' }}
                      gap={1}
                      flexShrink={0}
                      flexWrap="wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isCustomer &&
                        booking.rescheduleCount === 0 &&
                        booking.status !== BookingStatusEnum.CANCELLED &&
                        booking.status !== BookingStatusEnum.COMPLETED && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openRescheduleDialog(booking)}
                            sx={outlinedBtnSx}
                          >
                            Reschedule
                          </Button>
                        )}

                      {!booking.isCancelled &&
                        booking.status !== BookingStatusEnum.CANCELLED &&
                        booking.status !== BookingStatusEnum.COMPLETED && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleCancel(booking._id)}
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              fontWeight: 500,
                              borderColor: '#fca5a5',
                              color: '#dc2626',
                              '&:hover': { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
                            }}
                          >
                            Cancel
                          </Button>
                        )}

                      {(isAdmin || isServiceProvider) &&
                        booking.status === BookingStatusEnum.REQUESTED && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApprove(booking._id)}
                            sx={containedBtnSx}
                          >
                            Approve
                          </Button>
                        )}

                      {(isAdmin || isServiceProvider) &&
                        booking.status === BookingStatusEnum.RESCHEDULED && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApproveReschedule(booking._id)}
                            sx={containedBtnSx}
                          >
                            Approve Reschedule
                          </Button>
                        )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Stack alignItems="center" mt={3}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_, value) => setPage(value)}
              sx={{
                '& .MuiPaginationItem-root': { borderRadius: '6px' },
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: '#1D6FF2',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#1558CC' },
                },
              }}
            />
          </Stack>
        </>
      )}

      {/* Reschedule Dialog */}
      <Dialog
        open={openReschedule}
        onClose={() => setOpenReschedule(false)}
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
          Reschedule Booking
        </DialogTitle>
        <Divider sx={{ borderColor: '#E0E0E0' }} />
        <DialogContent sx={{ pt: 2.5 }}>
          <TextField
            type="datetime-local"
            fullWidth
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().slice(0, 16) }}
            size="small"
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpenReschedule(false)}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              color: '#6B6B6B',
              '&:hover': { backgroundColor: '#F5F5F5' },
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleReschedule} sx={containedBtnSx}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserMyBookings;
