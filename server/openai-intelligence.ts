import OpenAI from 'openai';

// IMPORTANT: This is ChatGPT integration for multi-AI orchestration
// Part of MySeniorValet's world-changing transparency initiative

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

export const ChatGPTIntelligenceService = {
  // ChatGPT Specialization: Financial Analysis & Cost Projections
  async analyzeFinancialImpact(communityData: any, userProfile: any) {
    try {
      const prompt = `As a financial analysis expert for senior living transparency, analyze the following community and user profile to provide comprehensive financial insights.
      
      Community Data: ${JSON.stringify(communityData)}
      User Profile: ${JSON.stringify(userProfile)}
      
      Provide a detailed financial analysis including:
      1. Total 5-year cost projection with itemized breakdown
      2. Hidden costs often not disclosed upfront
      3. Financial assistance options and qualifications
      4. Cost comparison with similar communities
      5. Red flags or concerning fee structures
      
      Format as JSON with sections for immediateImpact, longTermProjections, hiddenCosts, assistanceOptions, and warnings.`;

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a financial transparency expert for MySeniorValet, exposing hidden costs and providing truthful financial projections for senior living decisions. Focus on transparency, not placement."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ChatGPT financial analysis error:', error);
      throw error;
    }
  },

  // ChatGPT Specialization: Contract Analysis & Legal Transparency
  async analyzeContractTerms(contractText: string, communityName: string) {
    try {
      const prompt = `Analyze this senior living contract for transparency and fairness. Identify:
      
      1. Concerning clauses or red flags
      2. Hidden fees or escalation clauses
      3. Resident rights and protections
      4. Exit clauses and refund policies
      5. Comparison to industry standards
      
      Contract from ${communityName}:
      ${contractText}
      
      Provide analysis as JSON with sections for concerns, hiddenTerms, residentRights, exitOptions, and recommendations.`;

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a legal transparency advocate analyzing senior living contracts to protect families from unfair terms. Focus on exposing hidden clauses and ensuring transparency."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ChatGPT contract analysis error:', error);
      throw error;
    }
  },

  // ChatGPT Specialization: Review Sentiment & Pattern Analysis
  async analyzeReviewPatterns(reviews: any[], communityId: number) {
    try {
      const prompt = `Analyze these reviews to identify patterns and extract truthful insights about this senior living community.
      
      Reviews: ${JSON.stringify(reviews)}
      
      Identify:
      1. Recurring positive themes
      2. Consistent complaints or issues
      3. Potential fake or incentivized reviews
      4. Staff turnover indicators
      5. Quality of care trends over time
      
      Provide analysis as JSON with sections for strengths, concerns, authenticity, trends, and overallSentiment.`;

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a review analysis expert identifying truthful patterns in senior living feedback. Focus on transparency and authentic insights."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ChatGPT review analysis error:', error);
      throw error;
    }
  },

  // Cross-check with other AIs
  async crossCheckAnalysis(originalAnalysis: any, analysisType: string) {
    try {
      const prompt = `Cross-check and verify this ${analysisType} analysis from another AI system.
      
      Original Analysis: ${JSON.stringify(originalAnalysis)}
      
      Provide:
      1. Verification of key findings
      2. Additional insights missed
      3. Potential biases or errors
      4. Confidence score (0-100)
      5. Recommendations for improvement
      
      Format as JSON with verified, additionalInsights, concerns, confidence, and recommendations.`;

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a cross-verification expert ensuring accuracy and transparency in AI-generated senior living insights."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ChatGPT cross-check error:', error);
      throw error;
    }
  }
};