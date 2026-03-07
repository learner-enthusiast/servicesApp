import React, { useState, useMemo } from 'react';
import debounce from 'lodash.debounce';

import { ServiceTypeEnum } from 'utils/enum';
import { createListing, getPlaceSuggestions, suggestDescription, suggestPricing } from 'utils/api';
import { useNavigationStore } from 'store/useNavigationStore';

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

  // AI suggestion states
  const [descSuggestions, setDescSuggestions] = useState<string[]>([]);
  const [showDescSuggestions, setShowDescSuggestions] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);

  const [pricingSuggestions, setPricingSuggestions] = useState<
    { tier: string; price: number; reason: string }[]
  >([]);
  const [showPricingSuggestions, setShowPricingSuggestions] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);

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
    // Hide suggestions when user manually edits
    if (e.target.name === 'description') setShowDescSuggestions(false);
    if (e.target.name === 'price') setShowPricingSuggestions(false);
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

  // --- AI: Suggest Descriptions ---
  const handleSuggestDescription = async () => {
    if (!form.serviceType) return;
    try {
      setLoadingDesc(true);
      setShowDescSuggestions(false);
      const suggestions = await suggestDescription({
        serviceType: form.serviceType,
        location: locationQuery || undefined,
      });
      setDescSuggestions(suggestions);
      setShowDescSuggestions(true);
    } catch (err) {
      console.error('Failed to fetch description suggestions:', err);
    } finally {
      setLoadingDesc(false);
    }
  };

  const applyDescSuggestion = (desc: string) => {
    setForm((prev) => ({ ...prev, description: desc }));
    setShowDescSuggestions(false);
  };
  const handleSuggestPricing = async () => {
    if (!form.serviceType) return;
    try {
      setLoadingPricing(true);
      setShowPricingSuggestions(false);
      const data = await suggestPricing({
        serviceType: form.serviceType,
        location: locationQuery || undefined,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        radiusKm: 10,
      });
      setPricingSuggestions(data.suggestions);
      setShowPricingSuggestions(true);
    } catch (err) {
      console.error('Failed to fetch pricing suggestions:', err);
    } finally {
      setLoadingPricing(false);
    }
  };

  const applyPricingSuggestion = (price: number) => {
    setForm((prev) => ({ ...prev, price: String(price) }));
    setShowPricingSuggestions(false);
  };
  const { setCurrentTab } = useNavigationStore();
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
      setDescSuggestions([]);
      setPricingSuggestions([]);
      alert('Listing created');
      setCurrentTab('EDIT_LISTINGS');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSuggestDesc = !!form.serviceType;
  const canSuggestPrice = !!form.serviceType;

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

        {/* Description + AI Suggest */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <button
              type="button"
              onClick={handleSuggestDescription}
              disabled={!canSuggestDesc || loadingDesc}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              title={!canSuggestDesc ? 'Select a service type first' : 'Generate AI suggestions'}
            >
              {loadingDesc ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  AI Suggest
                </>
              )}
            </button>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            className={`${inputCls} resize-none`}
          />

          {/* Description suggestions */}
          {showDescSuggestions && descSuggestions.length > 0 && (
            <div className="mt-2 border border-blue-100 rounded-lg overflow-hidden bg-blue-50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-blue-100">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  AI Suggestions — click to apply
                </span>
                <button
                  type="button"
                  onClick={() => setShowDescSuggestions(false)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
              {descSuggestions.map((desc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyDescSuggestion(desc)}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-100 border-b border-blue-100 last:border-0 transition-colors"
                >
                  <span className="text-blue-500 font-semibold text-xs mr-1.5">{i + 1}.</span>
                  {desc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price + Service Type */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Price with AI suggest */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">Price (₹)</span>
              <button
                type="button"
                onClick={handleSuggestPricing}
                disabled={!canSuggestPrice || loadingPricing}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                title={
                  !canSuggestPrice ? 'Select a service type first' : 'Get AI pricing suggestions'
                }
              >
                {loadingPricing ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    AI Suggest
                  </>
                )}
              </button>
            </div>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className={inputCls}
            />
          </div>

          <div className="flex-1 sm:self-end">
            <select
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              className={inputCls}
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
        </div>

        {/* Pricing suggestions */}
        {showPricingSuggestions && pricingSuggestions.length > 0 && (
          <div className="border border-blue-100 rounded-lg overflow-hidden bg-blue-50">
            <div className="flex items-center justify-between px-3 py-2 border-b border-blue-100">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                AI Pricing — click to apply
              </span>
              <button
                type="button"
                onClick={() => setShowPricingSuggestions(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-blue-100">
              {pricingSuggestions.map((s) => (
                <button
                  key={s.tier}
                  type="button"
                  onClick={() => applyPricingSuggestion(s.price)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-100 transition-colors text-left group"
                >
                  <div>
                    <span
                      className={`text-xs font-semibold mr-2 px-1.5 py-0.5 rounded ${
                        s.tier === 'Budget'
                          ? 'bg-green-100 text-green-700'
                          : s.tier === 'Standard'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {s.tier}
                    </span>
                    <span className="text-xs text-gray-500">{s.reason}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 ml-3 shrink-0 group-hover:text-blue-700">
                    ₹{s.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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
