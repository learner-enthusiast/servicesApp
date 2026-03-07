import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { ListingStatusEnum } from 'utils/enum';
import { useNavigate } from 'react-router-dom';

interface Props {
  listing: any;
  distanceInMeters?: number;
  showToggle?: boolean;
  onToggle?: (id: string, status: any) => void;
  togglingId?: string | null;
}

const ListingCard: React.FC<Props> = ({
  listing,
  distanceInMeters,
  showToggle,
  onToggle,
  togglingId,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 1.5, sm: 2 },
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        gap: 2,
      }}
    >
      {/* Clickable area */}
      <Box
        onClick={() => navigate(`/listing/${listing._id}`)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          minWidth: 0,
          cursor: 'pointer',
        }}
      >
        {listing.photos?.[0]?.url && (
          <CardMedia
            component="img"
            image={listing.photos[0].url}
            sx={{
              width: { xs: 80, sm: 120 },
              height: { xs: 80, sm: 120 },
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        )}

        <Box sx={{ minWidth: 0 }}>
          <CardContent sx={{ p: '0 !important' }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: { xs: 14, sm: 16 },
                color: '#0F0F0F',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {listing.name}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#6B6B6B',
                fontSize: { xs: 12, sm: 13 },
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {listing.description}
            </Typography>

            <Typography
              sx={{ mt: 1, fontWeight: 600, fontSize: { xs: 13, sm: 15 }, color: '#0F0F0F' }}
            >
              ₹{listing.price?.toLocaleString('en-IN')}
            </Typography>

            {distanceInMeters !== undefined && (
              <Chip
                label={`${distanceInMeters.toFixed(2)}m away`}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: '#EFF6FF',
                  color: '#1D6FF2',
                  fontWeight: 500,
                  fontSize: 11,
                  border: 'none',
                }}
              />
            )}
          </CardContent>
        </Box>
      </Box>

      {/* Toggle — stopPropagation so it doesn't trigger navigate */}
      {showToggle && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}
        >
          {togglingId === listing._id && <CircularProgress size={16} sx={{ color: '#1D6FF2' }} />}
          <FormControlLabel
            control={
              <Switch
                checked={listing.status === ListingStatusEnum.ACTIVE}
                disabled={togglingId === listing._id}
                onChange={() => onToggle?.(listing._id, listing.status)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#1D6FF2' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#1D6FF2',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: { xs: 11, sm: 13 }, color: '#6B6B6B' }}>
                {listing.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Typography>
            }
          />
        </Box>
      )}
    </Card>
  );
};

export default ListingCard;
