import React, { useState } from 'react';
import { TextField, MenuItem, Stack, Button, Paper } from '@mui/material';

import { ListingStatusEnum, ServiceTypeEnum } from 'utils/enum';
import LocationSearch from './LocationSearch';

interface Props {
  onSearch: (filters: any) => void;
}

const selectSx = {
  width: { xs: '100%', sm: '100%', md: 'auto' },
  minWidth: { md: 140 },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '&:hover fieldset': { borderColor: '#1D6FF2' },
    '&.Mui-focused fieldset': { borderColor: '#1D6FF2' },
  },
};

export default function ListingsSearchBar({ onSearch }: Props) {
  const [filters, setFilters] = useState({
    serviceType: '',
    status: '',
    lat: '',
    lng: '',
    radiusKm: '',
    minRating: '',
  });

  const handleChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const isDisabled = Object.values(filters).some((v) => v === '');

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        {/* Row 1 on tablet: Service Type + Status */}
        <Stack
          direction={{ xs: 'column', sm: 'row', md: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <TextField
            select
            label="Service Type"
            name="serviceType"
            value={filters.serviceType}
            onChange={handleChange}
            size="small"
            sx={selectSx}
          >
            {Object.values(ServiceTypeEnum).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            size="small"
            sx={selectSx}
          >
            {Object.values(ListingStatusEnum).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Location — full width on mobile/tablet */}
        <LocationSearch setFilters={setFilters} />

        {/* Row 2 on tablet: Radius + Rating */}
        <Stack
          direction={{ xs: 'column', sm: 'row', md: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <TextField
            select
            label="Radius (km)"
            name="radiusKm"
            value={filters.radiusKm}
            onChange={handleChange}
            size="small"
            sx={{ ...selectSx, minWidth: { md: 120 } }}
          >
            <MenuItem value={1}>1 km</MenuItem>
            <MenuItem value={5}>5 km</MenuItem>
            <MenuItem value={10}>10 km</MenuItem>
            <MenuItem value={20}>20 km</MenuItem>
          </TextField>

          <TextField
            select
            label="Min Rating"
            name="minRating"
            value={filters.minRating}
            onChange={handleChange}
            size="small"
            sx={{ ...selectSx, minWidth: { md: 120 } }}
          >
            <MenuItem value={0}>No Ratings</MenuItem>
            <MenuItem value={1}>1+</MenuItem>
            <MenuItem value={2}>2+</MenuItem>
            <MenuItem value={3}>3+</MenuItem>
            <MenuItem value={4}>4+</MenuItem>
            <MenuItem value={5}>5</MenuItem>
          </TextField>
        </Stack>

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={isDisabled}
          sx={{
            borderRadius: '6px',
            backgroundColor: '#1D6FF2',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            height: 40,
            width: { xs: '100%', md: 'auto' },
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
            '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
          }}
        >
          Search
        </Button>
      </Stack>
    </Paper>
  );
}
