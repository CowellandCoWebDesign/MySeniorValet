/**
 * Amazon Product AI Summary Generator
 * Creates original, senior-focused product summaries for compliance
 * Does NOT copy Amazon content directly
 */

import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface ProductSummaryRequest {
  productName: string;
  category: string;
  generalDescription?: string; // Optional general product type info
}

export interface ProductSummaryResult {
  summary: string;
  highlights: string[];
  seniorBenefits: string[];
  isCompliant: boolean;
  violations?: string[];
}

/**
 * Generate senior-focused product summary using AI
 */
export async function generateSeniorProductSummary(
  request: ProductSummaryRequest
): Promise<ProductSummaryResult> {
  try {
    const prompt = `Create a helpful product summary for seniors and caregivers.

Product: ${request.productName}
Category: ${request.category}
${request.generalDescription ? `Type: ${request.generalDescription}` : ''}

Instructions:
- Write a clear, concise summary (2-3 sentences) focused on seniors
- Highlight accessibility, simplicity, ease of use, comfort, or safety
- Use friendly, supportive language
- Focus on how this helps with daily living
- DO NOT mention prices, ratings, reviews, or availability
- DO NOT use phrases like "best seller", "as seen on Amazon", or "5 stars"
- Create ORIGINAL content, not copied from any source

Respond with JSON in this format:
{
  "summary": "A helpful 2-3 sentence description",
  "highlights": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "seniorBenefits": ["Benefit for seniors 1", "Benefit for seniors 2", "Benefit for seniors 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest model released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant creating product descriptions for seniors. Focus on accessibility, ease of use, and daily living benefits. Never mention prices, ratings, or commercial terms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate compliance
    const validationResult = validateSummaryCompliance(result.summary);
    
    return {
      summary: result.summary || "",
      highlights: result.highlights || [],
      seniorBenefits: result.seniorBenefits || [],
      isCompliant: validationResult.isCompliant,
      violations: validationResult.violations
    };
  } catch (error) {
    console.error("Error generating AI summary:", error);
    
    // Fallback to safe, generic summary
    return {
      summary: `This ${request.category.toLowerCase()} is designed to assist with daily living activities.`,
      highlights: ["Easy to use", "Practical design", "Daily living aid"],
      seniorBenefits: ["Supports independent living", "Simple operation", "Helpful for daily tasks"],
      isCompliant: true
    };
  }
}

/**
 * Validate summary for compliance
 */
function validateSummaryCompliance(summary: string): {
  isCompliant: boolean;
  violations?: string[];
} {
  const violations: string[] = [];
  const lowerSummary = summary.toLowerCase();
  
  // Check for prohibited terms
  const prohibitedTerms = [
    "5 stars",
    "customer reviews",
    "price is",
    "available now",
    "as seen on amazon",
    "$",
    "best seller",
    "top rated",
    "highly rated",
    "amazon's choice",
    "#1",
    "number one"
  ];
  
  for (const term of prohibitedTerms) {
    if (lowerSummary.includes(term)) {
      violations.push(`Contains prohibited term: "${term}"`);
    }
  }
  
  return {
    isCompliant: violations.length === 0,
    violations: violations.length > 0 ? violations : undefined
  };
}

/**
 * Batch generate summaries for multiple products
 */
export async function batchGenerateSummaries(
  products: ProductSummaryRequest[]
): Promise<Map<string, ProductSummaryResult>> {
  const results = new Map<string, ProductSummaryResult>();
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    const batchPromises = batch.map(product => 
      generateSeniorProductSummary(product)
        .then(result => ({ name: product.productName, result }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const { name, result } of batchResults) {
      results.set(name, result);
    }
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Pre-defined safe summaries for common product categories
 */
export const CATEGORY_TEMPLATES = {
  "Mobility & Safety": {
    defaultHighlights: ["Stability support", "Easy grip design", "Safety features"],
    defaultBenefits: ["Promotes safe mobility", "Reduces fall risk", "Supports independence"]
  },
  "Daily Living Aids": {
    defaultHighlights: ["Ergonomic design", "Simple operation", "Practical functionality"],
    defaultBenefits: ["Makes daily tasks easier", "Reduces strain", "Maintains independence"]
  },
  "Bathroom Safety": {
    defaultHighlights: ["Non-slip surface", "Sturdy construction", "Easy installation"],
    defaultBenefits: ["Prevents bathroom falls", "Provides stability", "Peace of mind"]
  },
  "Medication Management": {
    defaultHighlights: ["Clear organization", "Easy-read labels", "Reminder features"],
    defaultBenefits: ["Prevents missed doses", "Simplifies medication routine", "Reduces confusion"]
  },
  "Home Essentials": {
    defaultHighlights: ["Comfortable design", "Durable materials", "Practical features"],
    defaultBenefits: ["Enhances comfort", "Improves daily living", "Long-lasting quality"]
  },
  "Furniture & Storage": {
    defaultHighlights: ["Accessible design", "Organized storage", "Quality construction"],
    defaultBenefits: ["Easy access to items", "Reduces clutter", "Improves organization"]
  }
};