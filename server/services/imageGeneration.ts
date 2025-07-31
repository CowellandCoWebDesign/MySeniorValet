import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export interface ThematicImagePrompt {
  vendorName: string;
  theme: string;
  style?: string;
}

const vendorThemes: Record<string, string> = {
  // Groceries & Essentials
  'Walmart': 'fresh colorful groceries in a shopping basket, fruits vegetables and bread, bright supermarket lighting',
  'Amazon': 'modern delivery packages and boxes with various products, e-commerce shopping scene',
  'Amazon Fresh': 'modern grocery delivery boxes filled with fresh produce and essentials, clean minimal style',
  'Instacart': 'shopping cart filled with fresh groceries and household items, bright clean grocery store',
  'Kroger': 'traditional grocery store shelves stocked with food items, warm inviting atmosphere',
  'Whole Foods': 'organic fresh produce display, natural foods and healthy groceries, earthy tones',
  
  // Transportation
  'Uber': 'sleek modern luxury car on city street, professional ride service, evening city lights',
  'Lyft': 'friendly pink-accented car with city skyline, approachable transportation service',
  'GoGoGrandparent': 'comfortable sedan with senior-friendly features, safe reliable transportation',
  'Local Transit Authority': 'modern public bus at a clean bus stop, accessible public transportation',
  
  // Food Delivery  
  'DoorDash': 'restaurant takeout bags ready for delivery, variety of cuisines, appetizing presentation',
  'Grubhub': 'delicious meals in delivery containers, diverse food options, mouth-watering display',
  'Meals on Wheels': 'nutritious home-cooked meals being delivered, caring service, wholesome food',
  'Uber Eats': 'gourmet restaurant dishes packaged for delivery, premium food presentation',
  
  // Meal Kits
  'Blue Apron': 'fresh ingredients and recipe cards in a meal kit box, cooking preparation scene',
  'HelloFresh': 'colorful fresh ingredients portioned for cooking, family meal preparation',
  'Silver Cuisine': 'senior-friendly nutritious meals, easy-to-prepare healthy food options',
  'Home Chef': 'professional chef-quality ingredients ready to cook, kitchen preparation scene',
  
  // Home Services
  'TaskRabbit': 'professional handyman tools and home repair equipment, helpful service providers',
  'Handy': 'home cleaning and maintenance supplies, sparkling clean home interior',
  'Thumbtack': 'various professional service tools and equipment, trusted home services',
  'Care.com': 'caring caregiver helping elderly person, compassionate home care scene',
  
  // Entertainment
  'Netflix': 'collection of DVD cases and movie posters, entertainment media display, cozy viewing setup',
  'Hulu': 'streaming entertainment on tablet with popcorn, modern digital entertainment',
  'Disney+': 'family-friendly entertainment collection, magical movie moments display',
  'Spotify': 'music notes and vintage vinyl records, audio entertainment collection',
  
  // Healthcare
  'CVS Pharmacy': 'pharmacy shelves with medications and health products, professional healthcare setting',
  'Walgreens': 'prescription bottles and health wellness products, trusted pharmacy interior',
  'GoodRx': 'affordable prescription medications with savings, healthcare cost savings visual',
  'Teladoc': 'digital healthcare consultation setup, modern telemedicine technology',
  
  // Senior-specific services
  'Carewell': 'medical supplies and home healthcare products, senior care essentials, compassionate care',
  'Consumer Cellular': 'simple senior-friendly smartphones and devices, easy-to-use technology',
  'Lively': 'emergency response pendant and medical alert devices, senior safety equipment',
  'T-Mobile 55+': 'modern smartphones with large displays, senior-friendly mobile technology',
  
  // Moving & Home Services
  'Bellhop': 'professional moving boxes and furniture being carefully loaded, reliable moving service',
  
  // Financial Services
  'Rocket Mortgage': 'modern home with sold sign, mortgage paperwork and calculator, homeownership dream',
  'American Advisors Group': 'happy senior couple reviewing financial documents with advisor, retirement planning'
};

// Use Claude to generate better prompts
async function generateClaudeEnhancedPrompt(vendorName: string, baseTheme: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are helping create image prompts for a senior living services marketplace. Create a detailed, warm, and appropriate image prompt for:

Vendor: ${vendorName}
Base concept: ${baseTheme}

Requirements:
1. Must appeal to seniors and their adult children
2. Should feel warm, trustworthy, and professional
3. Focus on the service benefit, not the brand
4. Include specific visual details that make the image feel real and relatable
5. Avoid any logos, text, or brand identifiers
6. Make it feel aspirational yet accessible

Generate a single detailed prompt (max 100 words):`
      }]
    });
    
    return message.content[0].type === 'text' ? message.content[0].text : baseTheme;
  } catch (error) {
    console.log('Claude unavailable, using base theme');
    return baseTheme;
  }
}

export async function generateThematicImage(vendorName: string): Promise<string | null> {
  try {
    const theme = vendorThemes[vendorName];
    if (!theme) {
      console.log(`No theme found for vendor: ${vendorName}`);
      return null;
    }

    // Use Claude to enhance the prompt if available
    const enhancedPrompt = process.env.ANTHROPIC_API_KEY 
      ? await generateClaudeEnhancedPrompt(vendorName, theme)
      : `A warm, professional photograph: ${theme}. Senior-friendly, trustworthy atmosphere, excellent lighting, no logos or text.`;
    
    console.log(`Generating image for ${vendorName} with AI-enhanced prompt:`, enhancedPrompt);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error(`Error generating image for ${vendorName}:`, error);
    return null;
  }
}

export async function generateBulkThematicImages(vendorNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};
  
  // Process in batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < vendorNames.length; i += batchSize) {
    const batch = vendorNames.slice(i, i + batchSize);
    const promises = batch.map(async (vendorName) => {
      const url = await generateThematicImage(vendorName);
      results[vendorName] = url;
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < vendorNames.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}