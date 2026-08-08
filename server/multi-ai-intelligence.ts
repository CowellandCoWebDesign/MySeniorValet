export interface MultiAIAnalysis {
  summary?: string;
  insights?: string[];
  confidence?: number;
  sources?: string[];
}

export interface ComprehensiveCarePlan {
  recommendations?: string[];
  timeline?: string;
  budget?: any;
  careTypes?: string[];
}

export class ClaudeIntelligenceService {
  async analyze(_query: string, _context?: any): Promise<MultiAIAnalysis> {
    return { summary: 'AI service disabled', insights: [], confidence: 0 };
  }

  async generateCarePlan(_request: any): Promise<ComprehensiveCarePlan> {
    return { recommendations: [], careTypes: [] };
  }
}

export class GeminiIntelligenceService {
  async analyze(_query: string, _context?: any): Promise<MultiAIAnalysis> {
    return { summary: 'AI service disabled', insights: [], confidence: 0 };
  }
}

export class MultiAIOrchestrator {
  async analyze(_query: string, _context?: any): Promise<MultiAIAnalysis> {
    return { summary: 'AI service disabled', insights: [], confidence: 0 };
  }

  async verifyData(_data: any): Promise<any> {
    return { verified: false, confidence: 0 };
  }

  async enrichCommunity(_community: any): Promise<any> {
    return _community;
  }
}

export type { MultiAIAnalysis, ComprehensiveCarePlan };
