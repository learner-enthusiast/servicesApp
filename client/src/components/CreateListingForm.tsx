import React, { useState, useMemo } from 'react';
import debounce from 'lodash.debounce';

import { ServiceTypeEnum } from 'utils/enum';
import { createListing, getPlaceSuggestions } from 'utils/api';

const MAX_PHOTOS = 5;

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400';

export default function CreateListingForm() {
  const [options, setOptions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
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
    setShowDropdown(true);
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 400), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected: File[] = Array.from(e.target.files || []);
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

  const isDisabled =
    submitting ||
    !form.name ||
    !form.description ||
    !form.price ||
    !form.serviceType ||
    !form.lat ||
    !form.lng;

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
      setForm({ name: '', description: '', price: '', serviceType: '', lat: '', lng: '' });
      previews.forEach((src) => URL.revokeObjectURL(src));
      setPhotos([]);
      setPreviews([]);
      setLocationQuery('');
      alert('Listing created');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 w-full max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Create Listing</h2>

      <div className="space-y-4">
        {/* Service Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Service Name"
          className={inputCls}
        />

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows={3}
          className={`${inputCls} resize-none`}
        />

        {/* Price + Service Type */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className={`${inputCls} flex-1`}
          />
          <select
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            className={`${inputCls} flex-1`}
          >
            <option value="" disabled hidden>
              Service Type
            </option>
            {Object.values(ServiceTypeEnum).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Location Autocomplete */}
        <div className="relative">
          <input
            type="text"
            placeholder="Location"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              debouncedFetch(e.target.value);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className={inputCls}
          />
          {showDropdown && options.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {options.map((option: any, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => {
                    setForm((prev) => ({
                      ...prev,
                      lat: option.coordinates.latitude,
                      lng: option.coordinates.longitude,
                    }));
                    setLocationQuery(option.fullAddress);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  {option.fullAddress}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Photos</span>
            <span className="text-xs text-gray-500">
              {photos.length} / {MAX_PHOTOS}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Previews */}
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
              >
                <img
                  src={src}
                  alt={`photo-${index}`}
                  className="w-full h-full object-cover block"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/55 hover:bg-black/75 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add button */}
            {photos.length < MAX_PHOTOS && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0">
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-medium">Add</span>
                <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
              </label>
            )}
          </div>

          {photos.length === MAX_PHOTOS && (
            <p className="text-xs text-gray-500 mt-1.5">Maximum of {MAX_PHOTOS} photos reached.</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Listing'}
        </button>
      </div>
    </div>
  );
}
