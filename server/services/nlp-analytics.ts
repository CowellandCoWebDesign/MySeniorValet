/**
 * NLP Analytics and Self-Learning System
 * The KRAKEN's Neural Network - Self-Aware Intelligence
 */

// Analytics system doesn't need database for now - using in-memory learning
// This will be added when schema is updated

interface SearchMetrics {
  query: string;
  intent: string;
  confidence: number;
  resultsCount: number;
  clickedResults: string[];
  searchTime: number;
  userSatisfaction?: number;
  timestamp: Date;
}

interface LearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  commonCorrections: Map<string, string>;
  preferredResults: string[];
}

class NLPAnalyticsSystem {
  private searchHistory: SearchMetrics[] = [];
  private learningPatterns = new Map<string, LearningPattern>();
  private queryCorrections = new Map<string, string>();
  private popularQueries = new Map<string, number>();
  private userPreferences = new Map<string, any>();
  
  /**
   * Track search analytics for self-learning
   */
  async trackSearch(
    query: string,
    intent: any,
    results: any[],
    searchTime: number,
    userId?: string
  ): Promise<void> {
    try {
      // Record metrics
      const metrics: SearchMetrics = {
        query,
        intent: intent.primary,
        confidence: intent.confidence,
        resultsCount: results.length,
        clickedResults: [],
        searchTime,
        timestamp: new Date()
      };
      
      this.searchHistory.push(metrics);
      
      // Update popular queries
      this.popularQueries.set(query, (this.popularQueries.get(query) || 0) + 1);
      
      // Store in memory for now (database integration coming soon)
      // Will be persisted when schema is updated
      
      // Learn from patterns
      this.learnFromSearch(query, intent, results);
      
      console.log('📈 Analytics tracked:', {
        query,
        intent: intent.primary,
        results: results.length,
        time: `${searchTime}ms`
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
  
  /**
   * Track user interactions for learning
   */
  async trackInteraction(
    query: string,
    resultId: string,
    interactionType: 'click' | 'save' | 'share' | 'contact',
    userId?: string
  ): Promise<void> {
    try {
      // Update clicked results
      const metric = this.searchHistory.find(m => m.query === query);
      if (metric) {
        metric.clickedResults.push(resultId);
      }
      
      // Store feedback in memory for learning (database integration coming soon)
      
      // Learn from user preferences
      this.learnUserPreference(userId || 'anonymous', interactionType, resultId);
      
      console.log('🎯 Interaction tracked:', { query, resultId, type: interactionType });
    } catch (error) {
      console.error('Interaction tracking error:', error);
    }
  }
  
  /**
   * Self-learning from search patterns
   */
  private learnFromSearch(query: string, intent: any, results: any[]): void {
    // Extract patterns
    const pattern = this.extractPattern(query);
    
    // Update learning patterns
    if (!this.learningPatterns.has(pattern)) {
      this.learningPatterns.set(pattern, {
        pattern,
        frequency: 0,
        successRate: 0,
        commonCorrections: new Map(),
        preferredResults: []
      });
    }
    
    const learningData = this.learningPatterns.get(pattern)!;
    learningData.frequency++;
    
    // Calculate success rate based on results
    if (results.length > 0) {
      learningData.successRate = 
        (learningData.successRate * (learningData.frequency - 1) + 1) / learningData.frequency;
    } else {
      learningData.successRate = 
        (learningData.successRate * (learningData.frequency - 1)) / learningData.frequency;
    }
    
    // Learn query corrections
    if (intent.confidence < 0.5 && results.length === 0) {
      this.suggestCorrection(query);
    }
  }
  
  /**
   * Learn user preferences over time
   */
  private learnUserPreference(userId: string, action: string, data: any): void {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        preferredLocations: [],
        preferredCareTypes: [],
        priceRange: { min: 0, max: 10000 },
        interactions: []
      });
    }
    
    const prefs = this.userPreferences.get(userId);
    prefs.interactions.push({ action, data, timestamp: Date.now() });
    
    // Analyze patterns in user behavior
    if (prefs.interactions.length > 10) {
      this.analyzeUserBehavior(userId, prefs);
    }
  }
  
  /**
   * Analyze user behavior for personalization
   */
  private analyzeUserBehavior(userId: string, preferences: any): void {
    const recentInteractions = preferences.interactions.slice(-50);
    
    // Extract common patterns
    const locationCounts = new Map<string, number>();
    const careTypeCounts = new Map<string, number>();
    const pricePoints: number[] = [];
    
    recentInteractions.forEach((interaction: any) => {
      if (interaction.data.location) {
        locationCounts.set(
          interaction.data.location,
          (locationCounts.get(interaction.data.location) || 0) + 1
        );
      }
      if (interaction.data.careType) {
        careTypeCounts.set(
          interaction.data.careType,
          (careTypeCounts.get(interaction.data.careType) || 0) + 1
        );
      }
      if (interaction.data.price) {
        pricePoints.push(interaction.data.price);
      }
    });
    
    // Update preferences based on patterns
    if (locationCounts.size > 0) {
      preferences.preferredLocations = Array.from(locationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([loc]) => loc);
    }
    
    if (careTypeCounts.size > 0) {
      preferences.preferredCareTypes = Array.from(careTypeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);
    }
    
    if (pricePoints.length > 0) {
      preferences.priceRange = {
        min: Math.min(...pricePoints),
        max: Math.max(...pricePoints)
      };
    }
    
    console.log('🧠 User preferences learned:', { userId, preferences });
  }
  
  /**
   * Extract patterns from queries for learning
   */
  private extractPattern(query: string): string {
    // Remove specific values to find general patterns
    return query.toLowerCase()
      .replace(/\d+/g, 'NUM')
      .replace(/(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)/gi, 'STATE')
      .replace(/(dallas|houston|austin|san antonio|los angeles|san francisco|miami|chicago|new york)/gi, 'CITY')
      .trim();
  }
  
  /**
   * Suggest query corrections based on learning
   */
  private suggestCorrection(query: string): string | null {
    // Find similar successful queries
    const similarQueries = Array.from(this.popularQueries.entries())
      .filter(([q]) => this.calculateSimilarity(query, q) > 0.7)
      .sort((a, b) => b[1] - a[1]);
    
    if (similarQueries.length > 0) {
      const suggestion = similarQueries[0][0];
      this.queryCorrections.set(query, suggestion);
      return suggestion;
    }
    
    return null;
  }
  
  /**
   * Calculate query similarity for corrections
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  /**
   * Levenshtein distance for similarity
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(): Promise<any> {
    try {
      // Get top queries
      const topQueries = Array.from(this.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));
      
      // Get search patterns
      const patterns = Array.from(this.learningPatterns.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);
      
      // Get performance metrics
      const avgResponseTime = this.searchHistory.length > 0
        ? this.searchHistory.reduce((sum, m) => sum + m.searchTime, 0) / this.searchHistory.length
        : 0;
      
      const avgConfidence = this.searchHistory.length > 0
        ? this.searchHistory.reduce((sum, m) => sum + m.confidence, 0) / this.searchHistory.length
        : 0;
      
      // Get from memory for now
      const recentSearches = this.searchHistory.slice(-100).reverse();
      
      return {
        summary: {
          totalSearches: this.searchHistory.length,
          avgResponseTime: Math.round(avgResponseTime),
          avgConfidence: avgConfidence.toFixed(2),
          uniqueQueries: this.popularQueries.size,
          learnedPatterns: this.learningPatterns.size
        },
        topQueries,
        patterns,
        recentSearches: recentSearches.slice(0, 10),
        corrections: Array.from(this.queryCorrections.entries()).slice(0, 10),
        userPreferences: this.userPreferences.size
      };
    } catch (error) {
      console.error('Analytics dashboard error:', error);
      return null;
    }
  }
  
  /**
   * Get personalized suggestions for a user
   */
  getPersonalizedSuggestions(userId: string): string[] {
    const prefs = this.userPreferences.get(userId);
    if (!prefs) return [];
    
    const suggestions: string[] = [];
    
    // Generate suggestions based on preferences
    if (prefs.preferredLocations.length > 0) {
      prefs.preferredCareTypes.forEach((type: string) => {
        prefs.preferredLocations.forEach((loc: string) => {
          suggestions.push(`${type} in ${loc}`);
        });
      });
    }
    
    // Add price-based suggestions
    if (prefs.priceRange.max < 5000) {
      suggestions.push(`affordable options under $${prefs.priceRange.max}`);
    }
    
    return suggestions.slice(0, 5);
  }
  
  /**
   * Export learning data for model training
   */
  async exportLearningData(): Promise<any> {
    return {
      patterns: Array.from(this.learningPatterns.entries()),
      corrections: Array.from(this.queryCorrections.entries()),
      preferences: Array.from(this.userPreferences.entries()),
      popularQueries: Array.from(this.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
    };
  }
}

// Export singleton instance - THE KRAKEN'S BRAIN
export const nlpAnalytics = new NLPAnalyticsSystem();