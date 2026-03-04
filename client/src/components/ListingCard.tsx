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

interface Props {
  listing: any;
  distanceInMeters?: number;
  showToggle?: boolean;
  onToggle?: (id: string, status: boolean) => void;
  togglingId?: string | null;
}

const ListingCard: React.FC<Props> = ({
  listing,
  distanceInMeters,
  showToggle,
  onToggle,
  togglingId,
}) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      {/* Image */}
      {listing.photos?.[0]?.url && (
        <CardMedia
          component="img"
          image={listing.photos[0].url}
          sx={{
            width: 120,
            height: 120,
            borderRadius: 2,
            objectFit: 'cover',
            mr: 2,
          }}
        />
      )}

      {/* Content */}
      <Box sx={{ flexGrow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6">{listing.name}</Typography>

          <Typography variant="body2" color="text.secondary">
            {listing.description}
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
            ₹{listing.price}
          </Typography>

          {/* Customer Distance */}
          {distanceInMeters !== undefined && (
            <Chip
              label={`${distanceInMeters} meters away`}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Box>

      {/* Admin Toggle */}
      {showToggle && (
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {togglingId === listing._id && <CircularProgress size={16} />}

          <FormControlLabel
            control={
              <Switch
                checked={listing.status === ListingStatusEnum.ACTIVE}
                disabled={togglingId === listing._id}
                onChange={() => onToggle?.(listing._id, listing.status)}
              />
            }
            label={listing.status ? 'Active' : 'Inactive'}
          />
        </Box>
      )}
    </Card>
  );
};

export default ListingCard;
