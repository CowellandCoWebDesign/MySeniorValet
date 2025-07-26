import { Router } from 'express';
import { 
  discoverLocalServices, 
  SeniorService, 
  ServiceCategory,
  calculateServiceScore,
  matchServicesToCommunity 
} from '../senior-services';
import { 
  createAmazonAssociatesService,
  AmazonAssociatesService 
} from '../amazon-associates';

const router = Router();
let amazonService: AmazonAssociatesService | null = null;

// Initialize Amazon Associates service if API key is provided
router.post('/api/services/amazon/init', async (req, res) => {
  const { associateTag, accessKey, secretKey } = req.body;
  
  if (!associateTag) {
    return res.status(400).json({ error: 'Associate tag is required' });
  }
  
  try {
    amazonService = createAmazonAssociatesService(associateTag);
    res.json({ success: true, message: 'Amazon Associates service initialized' });
  } catch (error) {
    console.error('Failed to initialize Amazon service:', error);
    res.status(500).json({ error: 'Failed to initialize service' });
  }
});

// Discover local services near a location
router.get('/api/services/discover', async (req, res) => {
  const { lat, lng, radius = 5, category } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const services = await discoverLocalServices(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat(radius as string)
    );
    
    // Filter by category if provided
    let filteredServices = services;
    if (category && category !== 'all') {
      filteredServices = services.filter(s => s.category === category);
    }
    
    // Sort by quality score
    filteredServices.sort((a, b) => calculateServiceScore(b) - calculateServiceScore(a));
    
    res.json({
      services: filteredServices,
      total: filteredServices.length,
      categories: Object.values(ServiceCategory)
    });
  } catch (error) {
    console.error('Failed to discover services:', error);
    res.status(500).json({ error: 'Failed to discover services' });
  }
});

// Get Amazon product recommendations
router.get('/api/services/amazon/products', async (req, res) => {
  const { category, careTypes } = req.query;
  
  if (!amazonService) {
    return res.status(400).json({ 
      error: 'Amazon Associates not configured',
      setup: 'Please provide your Amazon Associates credentials'
    });
  }
  
  try {
    let products = [];
    
    if (category) {
      products = await amazonService.getRecommendedProducts(category as any);
    } else if (careTypes) {
      const types = (careTypes as string).split(',');
      products = await amazonService.getProductsForCommunityType(types);
    } else {
      // Get a mix of popular senior products
      const categories = ['MOBILITY', 'DAILY_LIVING', 'SAFETY'];
      for (const cat of categories) {
        const catProducts = await amazonService.getRecommendedProducts(cat as any);
        products.push(...catProducts.slice(0, 2));
      }
    }
    
    res.json({
      products,
      disclosure: amazonService.getDisclosureText()
    });
  } catch (error) {
    console.error('Failed to get product recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Match services to community type
router.post('/api/services/match', async (req, res) => {
  const { lat, lng, communityTypes } = req.body;
  
  if (!lat || !lng || !communityTypes) {
    return res.status(400).json({ 
      error: 'Location and community types are required' 
    });
  }
  
  try {
    const services = await discoverLocalServices(lat, lng);
    const matchedServices = matchServicesToCommunity(communityTypes, services);
    
    res.json({
      services: matchedServices.slice(0, 10), // Top 10 matches
      total: matchedServices.length
    });
  } catch (error) {
    console.error('Failed to match services:', error);
    res.status(500).json({ error: 'Failed to match services' });
  }
});

export default router;