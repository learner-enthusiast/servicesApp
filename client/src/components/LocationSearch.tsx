import React, { useState, useMemo } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import debounce from 'lodash.debounce';
import { getPlaceSuggestions } from 'utils/api';

interface PlaceSuggestion {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

export default function LocationSearch({ setFilters }: any) {
  const [options, setOptions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (value: string) => {
    if (!value) return;

    try {
      setLoading(true);
      const data = await getPlaceSuggestions(value);
      setOptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 400), []);

  return (
    <Autocomplete
      options={options}
      sx={{ minWidth: 260 }}
      getOptionLabel={(option: PlaceSuggestion) => option.fullAddress}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={(x) => x} // disable client filtering
      onInputChange={(_, value) => {
        debouncedFetch(value);
      }}
      onChange={(_, selected) => {
        if (selected) {
          setFilters((prev: any) => ({
            ...prev,
            lat: selected.coordinates.latitude,
            lng: selected.coordinates.longitude,
          }));
        }
      }}
      loading={loading}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <strong>{option.name}</strong>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{option.fullAddress}</div>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Location"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
