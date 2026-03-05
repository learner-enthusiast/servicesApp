import React, { useState, useMemo } from 'react';
import {
  TextField,
  Button,
  Stack,
  Autocomplete,
  MenuItem,
  Paper,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import debounce from 'lodash.debounce';

import { ServiceTypeEnum } from 'utils/enum';
import { createListing, getPlaceSuggestions } from 'utils/api';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '&:hover fieldset': { borderColor: '#1D6FF2' },
    '&.Mui-focused fieldset': { borderColor: '#1D6FF2' },
  },
};

const MAX_PHOTOS = 5;

export default function CreateListingForm() {
  const [options, setOptions] = useState<any[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const selected: File[] = Array.from(e.target.files);
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = selected.slice(0, remaining);

    const newPreviews = toAdd.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
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
          coordinates: { lat: Number(form.lat), lng: Number(form.lng) },
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
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: { xs: '100%', sm: 560, md: 600 },
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
      }}
    >
      <Typography
        variant="h6"
        mb={2.5}
        sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 18 }, color: '#0F0F0F' }}
      >
        Create Listing
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Service Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          size="small"
          sx={inputSx}
        />

        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          value={form.description}
          onChange={handleChange}
          size="small"
          sx={inputSx}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            size="small"
            sx={{ ...inputSx, flex: 1 }}
          />
          <TextField
            select
            label="Service Type"
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            size="small"
            sx={{ ...inputSx, flex: 1 }}
          >
            {Object.values(ServiceTypeEnum).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

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
          renderInput={(params) => (
            <TextField {...params} label="Location" size="small" sx={inputSx} />
          )}
        />

        {/* Photo Upload */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#0F0F0F' }}>Photos</Typography>
            <Typography sx={{ fontSize: 12, color: '#6B6B6B' }}>
              {photos.length} / {MAX_PHOTOS}
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Preview thumbnails */}
            {previews.map((src, index) => (
              <Box
                key={index}
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
                  alt={`photo-${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <IconButton
                  size="small"
                  onClick={() => removePhoto(index)}
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

            {/* Add button — hide when max reached */}
            {photos.length < MAX_PHOTOS && (
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
                  '&:hover': {
                    borderColor: '#1D6FF2',
                    color: '#1D6FF2',
                    backgroundColor: '#F5F8FF',
                  },
                }}
              >
                <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22 }} />
                <Typography sx={{ fontSize: 10, textTransform: 'none', lineHeight: 1 }}>
                  Add
                </Typography>
                <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
              </Button>
            )}
          </Box>

          {photos.length === MAX_PHOTOS && (
            <Typography sx={{ fontSize: 12, color: '#6B6B6B', mt: 1 }}>
              Maximum of {MAX_PHOTOS} photos reached.
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          loading={submitting}
          sx={{
            borderRadius: '6px',
            backgroundColor: '#1D6FF2',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#1558CC', boxShadow: 'none' },
            '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#9E9E9E' },
          }}
        >
          Create Listing
        </Button>
      </Stack>
    </Paper>
  );
}
