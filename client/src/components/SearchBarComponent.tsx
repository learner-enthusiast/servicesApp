import React, { useState } from 'react';
import { TextField, MenuItem, Stack, Button, Paper } from '@mui/material';

import { ListingStatusEnum, ServiceTypeEnum } from 'utils/enum';
import LocationSearch from './LocationSearch';

interface Props {
  onSearch: (filters: any) => void;
}

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
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const isDisabled = Object.values(filters).some((v) => v === '');

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        {/* Service Type */}
        <TextField
          select
          label="Service Type"
          name="serviceType"
          value={filters.serviceType}
          onChange={handleChange}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {Object.values(ServiceTypeEnum).map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        {/* Status */}
        <TextField
          select
          label="Status"
          name="status"
          value={filters.status}
          onChange={handleChange}
          size="small"
          sx={{ minWidth: 140 }}
        >
          {Object.values(ListingStatusEnum).map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        {/* Location Search */}
        <LocationSearch setFilters={setFilters} />

        {/* Radius */}
        <TextField
          select
          label="Radius (km)"
          name="radiusKm"
          value={filters.radiusKm}
          onChange={handleChange}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value={1}>1 km</MenuItem>
          <MenuItem value={5}>5 km</MenuItem>
          <MenuItem value={10}>10 km</MenuItem>
          <MenuItem value={20}>20 km</MenuItem>
        </TextField>

        {/* Min Rating */}
        <TextField
          select
          label="Min Rating"
          name="minRating"
          value={filters.minRating}
          onChange={handleChange}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {' '}
          <MenuItem value={0}>No Ratings</MenuItem>
          <MenuItem value={1}>1+</MenuItem>
          <MenuItem value={2}>2+</MenuItem>
          <MenuItem value={3}>3+</MenuItem>
          <MenuItem value={4}>4+</MenuItem>
          <MenuItem value={5}>5</MenuItem>
        </TextField>

        {/* Search Button */}
        <Button variant="contained" onClick={handleSearch} disabled={isDisabled}>
          Search
        </Button>
      </Stack>
    </Paper>
  );
}
