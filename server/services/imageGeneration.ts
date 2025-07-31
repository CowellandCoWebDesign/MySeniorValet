import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
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

export async function generateThematicImage(vendorName: string): Promise<string | null> {
  try {
    const theme = vendorThemes[vendorName];
    if (!theme) {
      console.log(`No theme found for vendor: ${vendorName}`);
      return null;
    }

    const prompt = `Professional product photography style: ${theme}. High quality, clean composition, no text or logos, photorealistic style.`;
    
    console.log(`Generating image for ${vendorName} with prompt:`, prompt);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
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