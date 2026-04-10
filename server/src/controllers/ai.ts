import { RequestHandler } from 'express';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Listing from '../models/Listings';
import { dummyData } from '../utils/constants';

// --- Gemini setup ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// --- OpenAI setup ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// --- Unified AI text generator with Gemini → OpenAI fallback ---
async function generateText(prompt: string): Promise<string> {
  // try {
  //   const response = await ai.models.generateContent({
  //     model: 'gemini-2.0-flash',
  //     contents: prompt,
  //   });
  //   return response.text;
  // } catch (geminiError) {
  //   console.warn('[AI] Gemini failed, falling back to OpenAI:', (geminiError as Error).message);
  // }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content ?? '';
  } catch (openaiError) {
    console.error('[AI] OpenAI also failed:', (openaiError as Error).message);
    throw new Error('Both Gemini and OpenAI failed to generate a response');
  }
}

// --- Suggest description for a listing ---
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

    const text = await generateText(prompt);

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

// --- Suggest pricing based on competitors ---
export const suggestPricing: RequestHandler = async (req, res, next) => {
  try {
    const { serviceType, location, lat, lng, radiusKm } = req.body;

    if (!serviceType) {
      return next({ statusCode: 400, message: 'serviceType is required' });
    }

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

    const text = await generateText(prompt);

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

export const tailorResume: RequestHandler = async (req, res, next) => {
  try {
    const { jobs, resume } = req.body;
    res.status(200).json({
      message: 'Tailored resumes generated successfully',
      total: 46,
      failed_batches: 0,
      data: dummyData,
    });
    return;

    if (!Array.isArray(jobs) || !resume) {
      return next({ statusCode: 400, message: 'jobs (array) and resume (text) are required' });
    }

    console.log(jobs.length);

    const BATCH_SIZE = 3;
    const DELAY_MS = 1000;
    const MAX_RETRIES = 2;
    const RETRY_MULTIPLIER = 3;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const cleanLatex = (raw: string): string => {
      return raw
        .trim()
        .replace(/^```latex\n?/, '')
        .replace(/^```\n?/, '')
        .replace(/```$/, '')
        .trim();
    };

    const tailorSingleJob = async (job: any): Promise<any> => {
      const jobDesc = job.job_description || '';
      const jobTitle = job.job_title || 'this role';
      const company = job.company || 'the company';

      const prompt = `You are an expert resume writer and LaTeX specialist with deep knowledge of ATS optimization and recruiter preferences.

TASK: Tailor the provided LaTeX resume for the specific job description below.

CANDIDATE RESUME (LaTeX):
${resume}

TARGET JOB TITLE: ${jobTitle}
TARGET COMPANY: ${company}

JOB DESCRIPTION:
${jobDesc}

INSTRUCTIONS:
1. Analyze the job description for key skills, technologies, and requirements
2. Rewrite the resume summary to directly address this specific role and company
3. Reorder and emphasize experiences that best match the job requirements
4. Incorporate relevant keywords from the job description naturally throughout
5. Keep all factual information accurate - do not fabricate any experience or skills
6. Maintain the exact same LaTeX structure, packages, and custom commands
7. Ensure all LaTeX commands are valid and will compile without errors in Overleaf
8. Keep the same overall length and formatting style as the original

OUTPUT RULES:
- Output ONLY raw LaTeX code
- Start directly with \\documentclass
- No markdown code blocks, no backticks, no explanations
- No text before or after the LaTeX content
- Must be complete and compilable in Overleaf as-is`;

      const aiResume = await generateText(prompt);
      const cleanedLatex = cleanLatex(aiResume);

      if (!cleanedLatex.startsWith('\\documentclass')) {
        console.warn(`Warning: job "${jobTitle}" may have invalid LaTeX output`);
        console.warn('Output starts with:', cleanedLatex.substring(0, 100));
      }

      return {
        job_title: job.job_title,
        company: job.company,
        job_description: job.job_description,
        tailoredResume: cleanedLatex,
        employmentType: job?.employment_type,
        apply_url: job?.apply_url,
        job_url: job?.job_url,
        job_id: job?.job_id,
      };
    };

    const processBatchWithRetry = async (
      batch: any[],
      batchNumber: number,
      totalBatches: number
    ): Promise<{ success: boolean; results: any[]; error?: string }> => {
      let attempt = 0;

      while (attempt <= MAX_RETRIES) {
        try {
          if (attempt > 0) {
            const retryDelay = DELAY_MS * RETRY_MULTIPLIER * attempt;
            console.log(
              `Retry attempt ${attempt}/${MAX_RETRIES} for batch ${batchNumber}. Waiting ${retryDelay}ms...`
            );
            await sleep(retryDelay);
          }

          console.log(
            `Processing batch ${batchNumber} of ${totalBatches} (${batch.length} jobs) — attempt ${attempt + 1}...`
          );

          const results = await Promise.all(batch.map((job) => tailorSingleJob(job)));

          console.log(`Batch ${batchNumber} completed successfully.`);
          return { success: true, results };
        } catch (error: any) {
          console.error(
            `Batch ${batchNumber} attempt ${attempt + 1} failed:`,
            error?.message || error
          );
          attempt++;

          if (attempt > MAX_RETRIES) {
            console.error(
              `Batch ${batchNumber} failed after ${MAX_RETRIES + 1} attempts. Skipping.`
            );
            return {
              success: false,
              results: [],
              error: error?.message || 'Unknown error',
            };
          }
        }
      }

      return { success: false, results: [], error: 'Max retries exceeded' };
    };

    const tailoredJobs: any[] = [];
    const failedBatches: number[] = [];
    const totalBatches = Math.ceil(jobs.length / BATCH_SIZE);

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

      const { success, results, error } = await processBatchWithRetry(
        batch,
        currentBatch,
        totalBatches
      );

      if (success) {
        tailoredJobs.push(...results);
      } else {
        failedBatches.push(currentBatch);
        console.error(`Batch ${currentBatch} ultimately failed: ${error}`);
      }

      console.log(`Total processed so far: ${tailoredJobs.length}/${jobs.length}`);

      if (i + BATCH_SIZE < jobs.length) {
        console.log(`Waiting ${DELAY_MS}ms before next batch...`);
        await sleep(DELAY_MS);
      }
    }

    res.status(200).json({
      message:
        failedBatches.length > 0
          ? `Completed with some failures. ${failedBatches.length} batch(es) failed.`
          : 'Tailored resumes generated successfully',
      total: tailoredJobs.length,
      failed_batches: failedBatches,
      data: tailoredJobs,
    });
  } catch (error) {
    next(error);
  }
};
