import { Community } from "@shared/schema";

export interface RecommendationRequest {
  userId?: number;
  preferences?: any;
  location?: string;
  budget?: number;
  careType?: string;
}

export interface RecommendationResult {
  communities: Community[];
  reasoning?: string;
  confidence?: number;
}

export class AIRecommendationEngine {
  async getRecommendations(_request: RecommendationRequest): Promise<RecommendationResult> {
    return { communities: [], reasoning: 'AI service disabled', confidence: 0 };
  }

  async rankCommunities(_communities: Community[], _preferences: any): Promise<Community[]> {
    return _communities;
  }

  async explainRecommendation(_communityId: number, _preferences: any): Promise<string> {
    return 'AI recommendations temporarily unavailable.';
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();
