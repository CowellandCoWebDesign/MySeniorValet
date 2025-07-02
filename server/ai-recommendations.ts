import OpenAI from "openai";
import { Community } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RecommendationRequest {
  careNeeds: string[];
  budget: { min: number; max: number };
  location: { city?: string; state?: string; radius?: number };
  preferences: {
    communitySize?: "small" | "medium" | "large";
    amenityPriorities?: string[];
    careLevel?: "Independent Living" | "Assisted Living" | "Memory Care" | "Skilled Nursing";
    medicalRestrictions?: string[];
  };
  familyPriorities?: string[];
}

export interface RecommendationResult {
  community: Community;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  considerations: string[];
  priceTransparency: {
    hasPublicPricing: boolean;
    priceRange?: string;
    lastUpdated?: Date;
  };
}

export class AIRecommendationEngine {
  async getPersonalizedRecommendations(
    request: RecommendationRequest,
    availableCommunities: Community[]
  ): Promise<RecommendationResult[]> {
    try {
      const prompt = this.buildRecommendationPrompt(request, availableCommunities);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior living expert who helps families find the perfect care community. 
            Analyze communities based on care needs, budget, location, and family priorities. 
            Focus on pricing transparency, availability, trusted reviews, and licensing compliance.
            Consider medical restrictions as disqualifiers and highlight service differentiators.
            Respond with JSON in the specified format.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return this.processAIRecommendations(result, availableCommunities);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      return this.getFallbackRecommendations(availableCommunities, request);
    }
  }

  private buildRecommendationPrompt(
    request: RecommendationRequest,
    communities: Community[]
  ): string {
    return `
    Analyze these senior living communities for the best matches:

    FAMILY NEEDS:
    - Care Requirements: ${request.careNeeds.join(", ")}
    - Budget Range: $${request.budget.min} - $${request.budget.max}/month
    - Location: ${request.location.city || "Flexible"}, ${request.location.state || "Any State"}
    - Care Level: ${request.preferences.careLevel || "Any"}
    - Medical Restrictions: ${request.preferences.medicalRestrictions?.join(", ") || "None"}
    - Priority Amenities: ${request.preferences.amenityPriorities?.join(", ") || "None specified"}
    - Family Priorities: ${request.familyPriorities?.join(", ") || "None specified"}

    AVAILABLE COMMUNITIES:
    ${communities.map(c => `
    Name: ${c.name}
    Location: ${c.city}, ${c.state}
    Care Types: ${c.careTypes.join(", ")}
    Pricing: ${c.priceRange ? `$${c.priceRange}/month` : "Contact for pricing"} 
    Availability: ${c.availabilityStatus}
    Amenities: ${c.amenities?.join(", ") || "Standard amenities"}
    Services: ${c.services?.join(", ") || "Standard services"}
    Medical Restrictions: ${c.medicalRestrictions?.join(", ") || "None listed"}
    Average Rating: ${c.averageRating || "Not rated"}
    Review Sources: ${c.trustedReviewSources?.map(r => `${r.source} (${r.rating}/5)`).join(", ") || "No reviews"}
    Description: ${c.description || "No description available"}
    `).join("\n---\n")}

    Provide recommendations in this JSON format:
    {
      "recommendations": [
        {
          "communityName": "exact community name",
          "matchScore": 85,
          "reasoning": "Why this community matches their needs",
          "strengths": ["Key strengths for this family"],
          "considerations": ["Important factors to consider"],
          "disqualifiers": ["Any medical restrictions or budget issues"]
        }
      ]
    }

    Rank by best match (medical restrictions as disqualifiers, then budget, care needs, location, amenities).
    Focus on pricing transparency and availability status.
    `;
  }

  private processAIRecommendations(
    aiResult: any,
    communities: Community[]
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];

    if (aiResult.recommendations && Array.isArray(aiResult.recommendations)) {
      for (const rec of aiResult.recommendations) {
        const community = communities.find(c => c.name === rec.communityName);
        if (community) {
          recommendations.push({
            community,
            matchScore: rec.matchScore || 0,
            reasoning: rec.reasoning || "Good match based on your criteria",
            strengths: rec.strengths || [],
            considerations: rec.considerations || [],
            priceTransparency: {
              hasPublicPricing: !!community.basePrice,
              priceRange: community.basePrice ? `$${community.basePrice}/month` : undefined,
              lastUpdated: community.lastPriceUpdate
            }
          });
        }
      }
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  private getFallbackRecommendations(
    communities: Community[],
    request: RecommendationRequest
  ): RecommendationResult[] {
    // Simple fallback scoring based on basic criteria
    return communities
      .map(community => {
        let score = 50; // Base score

        // Budget match
        if (community.basePrice && community.basePrice <= request.budget.max) {
          score += 20;
        }

        // Care type match
        if (request.preferences.careLevel && 
            community.careTypes.includes(request.preferences.careLevel)) {
          score += 20;
        }

        // Availability bonus
        if (community.availabilityStatus === "Available") {
          score += 10;
        }

        return {
          community,
          matchScore: Math.min(score, 100),
          reasoning: "Basic match based on budget and care type",
          strengths: ["Meets basic criteria"],
          considerations: ["Review detailed information"],
          priceTransparency: {
            hasPublicPricing: !!community.basePrice,
            priceRange: community.basePrice ? `$${community.basePrice}/month` : undefined,
            lastUpdated: community.lastPriceUpdate
          }
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  async generateComparisonInsights(communities: Community[]): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior living expert. Compare communities highlighting key differences in pricing, care, amenities, and licensing."
          },
          {
            role: "user",
            content: `Compare these communities and highlight the most important differences:

            ${communities.map(c => `
            ${c.name} (${c.city}, ${c.state}):
            - Care Types: ${c.careTypes.join(", ")}
            - Pricing: ${c.basePrice ? `$${c.basePrice}/month` : "Contact for pricing"}
            - Availability: ${c.availabilityStatus}
            - Amenities: ${c.amenities?.slice(0, 5).join(", ") || "Standard"}
            - Rating: ${c.averageRating || "Not rated"}
            - License Status: ${c.licenseStatus || "Unknown"}
            `).join("\n")}`
          }
        ]
      });

      return response.choices[0].message.content || "Unable to generate comparison";
    } catch (error) {
      console.error("Error generating comparison insights:", error);
      return "Comparison analysis unavailable. Please review individual community details.";
    }
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();