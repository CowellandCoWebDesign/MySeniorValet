export interface AISearchQuery {
  query: string;
  location?: string;
  careType?: string;
  budget?: number;
}

export interface ParsedSearchIntent {
  intent?: string;
  location?: string;
  careType?: string;
  budget?: number;
  keywords?: string[];
}

export class AISearchService {
  async parseSearchIntent(_query: string): Promise<ParsedSearchIntent> {
    return { intent: 'search', keywords: [_query] };
  }

  async enhanceSearchQuery(_query: string): Promise<string> {
    return _query;
  }

  async generateSearchSuggestions(_query: string): Promise<string[]> {
    return [];
  }
}

export const aiSearchService = new AISearchService();
