import { RequestHandler } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Listing from '../models/Listings';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Suggest description for a listing
export const suggestDescription: RequestHandler = async (req, res, next) => {
  try {
    const { serviceType, location } = req.body;

    if (!serviceType) {
      return next({ statusCode: 400, message: 'serviceType is required' });
    }

    const prompt = `You are a helpful assistant for a local services marketplace app called BookLocal.

Generate 3 professional, SEO-friendly listing descriptions for a "${serviceType}" service${location ? ` located in "${location}"` : ''}.

Each description should:
- Be 2-3 sentences long
- Highlight key benefits and professionalism
- Sound trustworthy and local
- Be unique from the others

Return a JSON array of 3 strings. Only return valid JSON, no markdown or explanation.
Example: ["Description 1", "Description 2", "Description 3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return next({ statusCode: 500, message: 'Failed to parse AI response' });
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      message: 'Description suggestions generated',
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// Suggest pricing based on competitors
export const suggestPricing: RequestHandler = async (req, res, next) => {
  try {
    const { serviceType, location, lat, lng, radiusKm } = req.body;

    if (!serviceType) {
      return next({ statusCode: 400, message: 'serviceType is required' });
    }

    // Fetch competitor listings from DB
    let competitors: any[] = [];

    if (lat && lng && radiusKm) {
      const radiusInMeters = parseFloat(radiusKm) * 1000;

      competitors = await Listing.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            distanceField: 'distanceInMeters',
            maxDistance: radiusInMeters,
            spherical: true,
            query: { serviceType, status: 'ACTIVE' },
          },
        },
        { $project: { price: 1, ratings: 1, name: 1 } },
        { $limit: 20 },
      ]);
    } else {
      competitors = await Listing.find({ serviceType, status: 'ACTIVE' })
        .select('price ratings name')
        .limit(20)
        .lean();
    }

    const prices = competitors.map((c) => c.price).filter(Boolean);
    const avgPrice = prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : null;
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;

    const competitorSummary = prices.length
      ? `There are ${prices.length} active competitors for "${serviceType}"${location ? ` near "${location}"` : ''}. Price range: ₹${minPrice} - ₹${maxPrice}. Average price: ₹${avgPrice}.`
      : `No active competitors found for "${serviceType}"${location ? ` near "${location}"` : ''}.`;

    const prompt = `You are a pricing strategist for a local services marketplace called BookLocal.

${competitorSummary}

${prices.length ? `Competitor prices: ${prices.map((p) => `₹${p}`).join(', ')}` : ''}

Suggest 3 pricing strategies for a new "${serviceType}" listing${location ? ` in "${location}"` : ''}:

1. **Budget** - competitive low price to attract customers
2. **Standard** - balanced price for good value
3. **Premium** - higher price for premium quality service

Return a JSON object with this exact structure, no markdown or explanation:
{
  "competitorStats": {
    "count": ${prices.length},
    "min": ${minPrice || 0},
    "max": ${maxPrice || 0},
    "avg": ${avgPrice || 0}
  },
  "suggestions": [
    { "tier": "Budget", "price": <number>, "reason": "<1 sentence explanation>" },
    { "tier": "Standard", "price": <number>, "reason": "<1 sentence explanation>" },
    { "tier": "Premium", "price": <number>, "reason": "<1 sentence explanation>" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return next({ statusCode: 500, message: 'Failed to parse AI response' });
    }

    const pricingSuggestions = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      message: 'Pricing suggestions generated',
      data: pricingSuggestions,
    });
  } catch (error) {
    next(error);
  }
};
