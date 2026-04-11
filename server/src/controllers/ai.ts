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
async function generateText(prompt: string, model: string = 'gpt-4.1'): Promise<string> {
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
      model: model,
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
    const { jobs, resume, resumelatex } = req.body;

    if (!Array.isArray(jobs) || !resume) {
      return next({ statusCode: 400, message: 'jobs (array) and resume (text) are required' });
    }

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

    // ─── Generic batch processor ───────────────────────────────────────────────
    const processInBatches = async <TInput, TOutput>(
      items: TInput[],
      processor: (item: TInput, index: number) => Promise<TOutput>,
      label: string,
      options?: {
        batchSize?: number;
        delayMs?: number;
        maxRetries?: number;
        retryMultiplier?: number;
        model?: string;
      }
    ): Promise<{ results: (TOutput | null)[]; failedBatches: number[] }> => {
      const batchSize = options?.batchSize ?? BATCH_SIZE;
      const delayMs = options?.delayMs ?? DELAY_MS;
      const maxRetries = options?.maxRetries ?? MAX_RETRIES;
      const retryMultiplier = options?.retryMultiplier ?? RETRY_MULTIPLIER;
      const model = options?.model ?? 'gpt-4.1';

      const totalBatches = Math.ceil(items.length / batchSize);
      const allResults: (TOutput | null)[] = new Array(items.length).fill(null);
      const failedBatches: number[] = [];

      console.log(
        `\n[${label}] Starting — ${items.length} item(s) across ${totalBatches} batch(es) (size: ${batchSize})`
      );

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        console.log(
          `[${label}] Batch ${batchNumber}/${totalBatches} — processing ${batch.length} item(s)...`
        );

        let attempt = 0;
        let success = false;

        while (attempt <= maxRetries) {
          if (attempt > 0) {
            const retryDelay = delayMs * retryMultiplier * attempt;
            console.warn(
              `[${label}] Batch ${batchNumber}/${totalBatches} — retry ${attempt}/${maxRetries} in ${retryDelay}ms...`
            );
            await sleep(retryDelay);
          }

          try {
            const batchResults = await Promise.all(batch.map((item, j) => processor(item, i + j)));

            batchResults.forEach((result, j) => {
              allResults[i + j] = result;
            });

            console.log(`[${label}] Batch ${batchNumber}/${totalBatches} — ✓ done`);
            success = true;
            break;
          } catch (err: any) {
            attempt++;
            if (attempt > maxRetries) {
              console.error(
                `[${label}] Batch ${batchNumber}/${totalBatches} — ✗ failed after ${maxRetries} retries. Error: ${err?.message ?? 'Unknown error'}`
              );
            }
          }
        }

        if (!success) {
          failedBatches.push(batchNumber);
        }

        if (i + batchSize < items.length) {
          console.log(`[${label}] Waiting ${delayMs}ms before next batch...`);
          await sleep(delayMs);
        }
      }

      const successCount = allResults.filter((r) => r !== null).length;
      console.log(
        `[${label}] Complete — ${successCount}/${items.length} succeeded, ${failedBatches.length} batch(es) failed\n`
      );

      return { results: allResults, failedBatches };
    };

    // ─── Step 1: Relevance check (batched) ────────────────────────────────────
    const checkRelevance = async (job: any, index: number): Promise<boolean> => {
      const jobTitle = job.job_title || 'Untitled';
      const company = job.company || 'Unknown company';
      console.log(`  [Relevance] Checking job #${index + 1}: "${jobTitle}" at ${company}`);

      const prompt = `
You are a career advisor and resume expert.

Given the following candidate resume (in LaTeX format):

${resume}

And the following job description:

${job.job_description || job.description || ''}

Is this job relevant to the candidate's profile? 
Respond only with a JSON object: {"verdict": true} if relevant, {"verdict": false} if not. No explanation, no markdown.
`;
      try {
        const aiResponse = await generateText(prompt, 'gpt-4.1-mini');
        const verdictObj = JSON.parse(aiResponse.match(/\{[\s\S]*\}/)?.[0] || '{}');
        const verdict = verdictObj.verdict === true;
        console.log(
          `  [Relevance] Job #${index + 1} "${jobTitle}" → ${verdict ? '✓ relevant' : '✗ not relevant'}`
        );
        return verdict;
      } catch {
        console.warn(
          `  [Relevance] Job #${index + 1} "${jobTitle}" → ✗ parse error, defaulting to false`
        );
        return false;
      }
    };

    const { results: relevanceResults, failedBatches: relevanceFailedBatches } =
      await processInBatches(jobs, checkRelevance, 'Relevance');

    if (relevanceFailedBatches.length > 0) {
      console.warn(
        `[Relevance] ${relevanceFailedBatches.length} batch(es) failed entirely: batches [${relevanceFailedBatches.join(', ')}]`
      );
    }

    const relevantJobs = jobs.filter((_, idx) => relevanceResults[idx] === true);

    console.log(`[Relevance] ${relevantJobs.length}/${jobs.length} job(s) passed relevance filter`);

    if (relevantJobs.length === 0) {
      return next({ statusCode: 400, message: 'No relevant jobs' });
    }

    // ─── Step 2: Tailor resumes (batched) ─────────────────────────────────────
    const tailorSingleJob = async (job: any, index: number): Promise<any> => {
      const jobTitle = job.job_title || 'this role';
      const company = job.company_name || 'the company';
      console.log(`  [Tailor] Tailoring job #${index + 1}: "${jobTitle}" at ${company}`);

      const prompt = `You are an expert resume writer and LaTeX specialist. Your ONLY job is to swap out text content in an existing LaTeX resume — nothing else.

TASK: Replace specific text content in the LaTeX resume below to target the given job. The output must be a character-for-character identical copy of the LaTeX resume EXCEPT for the text content changes listed in the instructions.

CANDIDATE RESUME (TEXT — use this to understand the candidate's background):
${resume}

CANDIDATE RESUME (LaTeX — this is your TEMPLATE, follow it with absolute strictness):
${resumelatex}

TARGET JOB TITLE: ${jobTitle}
TARGET COMPANY: ${company}

JOB DESCRIPTION:
${job.job_description || job.description || ''}

WHAT YOU MAY CHANGE (text content only):
- The resume summary/objective paragraph
- Individual bullet point descriptions under experience entries
- The skills/technologies list values

WHAT YOU MUST NEVER CHANGE:
- Any \\vspace, \\hspace, \\smallskip, \\medskip, \\bigskip, or ANY spacing command
- Any \\begin{...} or \\end{...} environment — name, order, or nesting
- Any \\newcommand, \\def, or custom macro definitions
- Font size commands: \\tiny, \\small, \\large, \\Large, \\LARGE, \\huge, etc.
- Font style commands: \\textbf, \\textit, \\underline, \\textcolor, etc.
- Section headers and their formatting
- Column counts, tabular structure, minipage widths
- \\documentclass, \\usepackage, preamble — copy them verbatim
- Margins, geometry settings
- Dates, company names, job titles, institution names, degrees — copy them verbatim
- The number of bullet points per section — do not add or remove any
- Page layout — output must fit exactly one page, identical to the template

STRICT RULE: If you are unsure whether something is "text content" or "structure", DO NOT change it. Copy it exactly from the LaTeX template.

VERIFICATION CHECKLIST (apply mentally before outputting):
1. Does my output have the exact same number of \\begin/\\end pairs as the template? 
2. Are all spacing commands identical to the template?
3. Are all custom macros and preamble lines copied verbatim?
4. Have I kept the same number of bullet points in every section?
5. Does the rendered output fit on one page?

OUTPUT RULES:
- Output ONLY raw LaTeX code
- Start directly with \\documentclass
- No markdown code blocks, no backticks, no explanations
- No text before or after the LaTeX content
- Must be complete and compilable in Overleaf as-is`;

      const aiResume = await generateText(prompt);
      const cleaned = cleanLatex(aiResume);
      console.log(
        `  [Tailor] Job #${index + 1} "${jobTitle}" → ✓ tailored (${cleaned.length} chars)`
      );
      return { ...job, tailoredResume: cleaned };
    };

    const { results: tailorResults, failedBatches: tailorFailedBatches } = await processInBatches(
      relevantJobs,
      tailorSingleJob,
      'Tailor'
    );

    const tailoredJobs = tailorResults.filter((r): r is NonNullable<typeof r> => r !== null);

    console.log(
      `[Tailor] ${tailoredJobs.length}/${relevantJobs.length} resume(s) tailored successfully`
    );

    res.status(200).json({
      message:
        tailorFailedBatches.length > 0
          ? `Completed with some failures. ${tailorFailedBatches.length} batch(es) failed.`
          : 'Tailored resumes generated successfully',
      total: tailoredJobs.length,
      failed_batches: tailorFailedBatches,
      data: tailoredJobs,
    });
  } catch (error) {
    next(error);
  }
};
