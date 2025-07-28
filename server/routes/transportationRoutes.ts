import { Router } from 'express';
import { db } from '../db.js';
import { vendors, vendorServices, vendorServiceCategories } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get transportation vendor information
router.get('/vendor', async (req, res) => {
  try {
    console.log('Fetching GoGoGrandparent vendor information...');
    
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.businessName, 'GoGoGrandparent'))
      .limit(1);

    if (vendor.length === 0) {
      console.log('GoGoGrandparent vendor not found');
      return res.status(404).json({ 
        message: 'Transportation vendor not found',
        _version: 'v4_structured_response'
      });
    }

    console.log(`Found GoGoGrandparent vendor: ${vendor[0].businessName}`);
    
    res.json({
      ...vendor[0],
      _version: 'v4_structured_response'
    });
  } catch (error) {
    console.error('Error fetching transportation vendor:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transportation vendor',
      _version: 'v4_structured_response' 
    });
  }
});

// Get all transportation services
router.get('/services', async (req, res) => {
  try {
    console.log('Fetching GoGoGrandparent services...');
    
    // Get the transportation category
    const transportationCategory = await db
      .select()
      .from(vendorServiceCategories)
      .where(eq(vendorServiceCategories.slug, 'transportation-services'))
      .limit(1);

    const homeServicesCategory = await db
      .select()
      .from(vendorServiceCategories)
      .where(eq(vendorServiceCategories.slug, 'home-services'))
      .limit(1);

    if (transportationCategory.length === 0) {
      console.log('Transportation category not found');
      return res.status(404).json({ 
        message: 'Transportation category not found',
        _version: 'v4_structured_response'
      });
    }

    // Get GoGoGrandparent vendor
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.businessName, 'GoGoGrandparent'))
      .limit(1);

    if (vendor.length === 0) {
      console.log('GoGoGrandparent vendor not found');
      return res.status(404).json({ 
        message: 'GoGoGrandparent vendor not found',
        _version: 'v4_structured_response'
      });
    }

    // Get all services for GoGoGrandparent (transportation and home services)
    const services = await db
      .select({
        id: vendorServices.id,
        vendorId: vendorServices.vendorId,
        categoryId: vendorServices.categoryId,
        serviceName: vendorServices.serviceName,
        serviceDescription: vendorServices.serviceDescription,
        serviceFeatures: vendorServices.includedFeatures,
        pricingModel: vendorServices.pricingType,
        priceMin: vendorServices.price,
        priceMax: vendorServices.price,
        priceUnit: vendorServices.priceUnit,
        serviceAreas: vendorServices.isActive,
        completionTimeDays: vendorServices.duration,
        successRate: vendorServices.isActive,
        isActive: vendorServices.isActive,
        featured: vendorServices.isActive,
        categoryName: vendorServiceCategories.name,
        categorySlug: vendorServiceCategories.slug
      })
      .from(vendorServices)
      .leftJoin(vendorServiceCategories, eq(vendorServices.categoryId, vendorServiceCategories.id))
      .where(
        and(
          eq(vendorServices.vendorId, vendor[0].id),
          eq(vendorServices.isActive, true)
        )
      );

    console.log(`Found ${services.length} services for GoGoGrandparent`);
    
    res.json({
      services,
      _version: 'v4_structured_response'
    });
  } catch (error) {
    console.error('Error fetching transportation services:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transportation services',
      _version: 'v4_structured_response' 
    });
  }
});

// Get featured transportation service
router.get('/featured', async (req, res) => {
  try {
    console.log('Fetching featured transportation service...');
    
    // Get GoGoGrandparent vendor
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.businessName, 'GoGoGrandparent'))
      .limit(1);

    if (vendor.length === 0) {
      console.log('GoGoGrandparent vendor not found');
      return res.status(404).json({ 
        message: 'GoGoGrandparent vendor not found',
        _version: 'v4_structured_response'
      });
    }

    // Get featured service (transportation service)
    const featuredService = await db
      .select({
        id: vendorServices.id,
        vendorId: vendorServices.vendorId,
        serviceName: vendorServices.serviceName,
        serviceDescription: vendorServices.serviceDescription,
        serviceFeatures: vendorServices.includedFeatures,
        pricingModel: vendorServices.pricingType,
        priceMin: vendorServices.price,
        priceMax: vendorServices.price,
        priceUnit: vendorServices.priceUnit,
        successRate: vendorServices.isActive,
        categoryName: vendorServiceCategories.name,
        categorySlug: vendorServiceCategories.slug,
        vendorName: vendors.businessName,
        vendorPhone: vendors.primaryContactPhone,
        vendorWebsite: vendors.website
      })
      .from(vendorServices)
      .leftJoin(vendorServiceCategories, eq(vendorServices.categoryId, vendorServiceCategories.id))
      .leftJoin(vendors, eq(vendorServices.vendorId, vendors.id))
      .where(
        and(
          eq(vendorServices.vendorId, vendor[0].id),
          eq(vendorServices.isActive, true),
          eq(vendorServices.isActive, true)
        )
      )
      .limit(1);

    if (featuredService.length === 0) {
      console.log('No featured transportation service found');
      return res.status(404).json({ 
        message: 'No featured transportation service found',
        _version: 'v4_structured_response'
      });
    }

    console.log(`Found featured service: ${featuredService[0].serviceName}`);
    
    res.json({
      ...featuredService[0],
      _version: 'v4_structured_response'
    });
  } catch (error) {
    console.error('Error fetching featured transportation service:', error);
    res.status(500).json({ 
      message: 'Failed to fetch featured transportation service',
      _version: 'v4_structured_response' 
    });
  }
});

export default router;