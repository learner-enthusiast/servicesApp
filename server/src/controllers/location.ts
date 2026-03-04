import { RequestHandler } from 'express';
import axios from 'axios';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_BASE_URL } from '../constants';

// Get place suggestions as user types (autocomplete)
export const getPlaceSuggestions: RequestHandler = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return next({ statusCode: 400, message: 'query parameter is required' });
    }

    const response = await axios.get(
      `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          autocomplete: true,
          limit: 5,
          types: 'place,address,poi',
        },
      }
    );

    const suggestions = response.data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.text,
      fullAddress: feature.place_name,
      coordinates: {
        longitude: feature.center[0],
        latitude: feature.center[1],
      },
    }));

    res.status(200).json({ message: 'Suggestions fetched', data: suggestions });
  } catch (error) {
    next(error);
  }
};

// Get coordinates (latitude, longitude) for a selected place
export const getCoordinates: RequestHandler = async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return next({ statusCode: 400, message: 'address parameter is required' });
    }

    const response = await axios.get(
      `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          limit: 1,
        },
      }
    );

    const feature = response.data.features[0];
    if (!feature) {
      return next({ statusCode: 404, message: 'Location not found' });
    }

    const geoLocation = {
      type: 'Point',
      coordinates: [feature.center[0], feature.center[1]], // [longitude, latitude]
    };

    res.status(200).json({
      message: 'Coordinates fetched',
      data: {
        fullAddress: feature.place_name,
        geoLocation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reverse geocode: get address from coordinates
export const getAddressFromCoordinates: RequestHandler = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return next({ statusCode: 400, message: 'longitude and latitude are required' });
    }

    const response = await axios.get(
      `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          limit: 1,
        },
      }
    );

    const feature = response.data.features[0];
    if (!feature) {
      return next({ statusCode: 404, message: 'Address not found' });
    }

    res.status(200).json({
      message: 'Address fetched',
      data: {
        fullAddress: feature.place_name,
        geoLocation: {
          type: 'Point',
          coordinates: [feature.center[0], feature.center[1]],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get nearby listings by coordinates and radius (in km)
export const getNearbyListings: RequestHandler = async (req, res, next) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (!longitude || !latitude) {
      return next({ statusCode: 400, message: 'longitude and latitude are required' });
    }

    const radiusInMeters = Number(radius || 10) * 1000; // default 10km

    // Import Listing model here to avoid circular dependency
    const Listing = (await import('../models/Listings')).default;

    const listings = await Listing.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: radiusInMeters,
        },
      },
      status: 'Active',
    });

    res.status(200).json({ message: 'Nearby listings fetched', data: listings });
  } catch (error) {
    next(error);
  }
};
