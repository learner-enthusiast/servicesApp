import React, { useState, useMemo } from 'react';
import { TextField, Button, Stack, Autocomplete, MenuItem, Paper, Typography } from '@mui/material';
import debounce from 'lodash.debounce';

import { ServiceTypeEnum } from 'utils/enum';
import { createListing, getPlaceSuggestions } from 'utils/api';

export default function CreateListingForm() {
  const [options, setOptions] = useState<any[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    serviceType: '',
    lat: '',
    lng: '',
  });

  const fetchSuggestions = async (value: string) => {
    if (!value || value.length < 3) return;

    const data = await getPlaceSuggestions(value);
    setOptions(data);
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 400), []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: any) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await createListing({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        serviceType: form.serviceType,
        geoLocation: {
          type: 'point',
          coordinates: {
            lat: Number(form.lat),
            lng: Number(form.lng),
          },
        },
        photos,
      });

      alert('Listing created');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" mb={2}>
        Create Listing
      </Typography>

      <Stack spacing={2}>
        <TextField label="Service Name" name="name" value={form.name} onChange={handleChange} />

        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          value={form.description}
          onChange={handleChange}
        />

        <TextField
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />

        {/* Service Type */}
        <TextField
          select
          label="Service Type"
          name="serviceType"
          value={form.serviceType}
          onChange={handleChange}
        >
          {Object.values(ServiceTypeEnum).map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* Location Autocomplete */}
        <Autocomplete
          options={options}
          getOptionLabel={(option: any) => option.fullAddress}
          onInputChange={(_, value) => debouncedFetch(value)}
          onChange={(_, selected: any) => {
            if (selected) {
              setForm((prev) => ({
                ...prev,
                lat: selected.coordinates.latitude,
                lng: selected.coordinates.longitude,
              }));
            }
          }}
          renderInput={(params) => <TextField {...params} label="Location" />}
        />

        {/* Photos */}
        <Button variant="outlined" component="label">
          Upload Photos
          <input hidden type="file" multiple onChange={handleFileChange} />
        </Button>

        {/* Submit */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          loading={submitting}
        >
          Create Listing
        </Button>
      </Stack>
    </Paper>
  );
}
