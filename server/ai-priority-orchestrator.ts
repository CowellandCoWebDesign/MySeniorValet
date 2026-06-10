export interface AIServiceStatus {
  openai?: boolean;
  anthropic?: boolean;
  perplexity?: boolean;
}

export interface AIAnalysisRequest {
  query: string;
  context?: any;
  type?: string;
}

export interface AIAnalysisResponse {
  result?: any;
  source?: string;
  disabled?: boolean;
}

export class AIPriorityOrchestrator {
  async analyze(_request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    return { disabled: true };
  }

  async getStatus(): Promise<AIServiceStatus> {
    return { openai: false, anthropic: false, perplexity: false };
  }

  async enrichCommunity(_community: any): Promise<any> {
    return _community;
  }

  async verifyData(_data: any): Promise<any> {
    return { verified: false };
  }
}

export const aiPriorityOrchestrator = new AIPriorityOrchestrator();
