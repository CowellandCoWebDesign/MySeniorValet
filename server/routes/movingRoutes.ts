import { Express } from 'express';
import { db } from '../db';
import { vendors, vendorServices, vendorServiceCategories } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export default function movingRoutes(app: Express) {
  
  // Get all moving service providers
  app.get('/api/moving/providers', async (req, res) => {
    try {
      const movingProviders = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.businessType, 'Moving Services'),
            eq(vendors.status, 'active')
          )
        );

      res.json(movingProviders);
    } catch (error) {
      console.error('Error fetching moving providers:', error);
      res.status(500).json({ error: 'Failed to fetch moving providers' });
    }
  });

  // Get specific moving provider details
  app.get('/api/moving/providers/:id', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      
      const [provider] = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.id, providerId),
            eq(vendors.businessType, 'Moving Services'),
            eq(vendors.status, 'active')
          )
        );

      if (!provider) {
        return res.status(404).json({ error: 'Moving provider not found' });
      }

      res.json(provider);
    } catch (error) {
      console.error('Error fetching moving provider:', error);
      res.status(500).json({ error: 'Failed to fetch moving provider' });
    }
  });

  // Get services for a specific moving provider
  app.get('/api/moving/providers/:id/services', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      
      const services = await db
        .select()
        .from(vendorServices)
        .leftJoin(vendorServiceCategories, eq(vendorServices.categoryId, vendorServiceCategories.id))
        .where(
          and(
            eq(vendorServices.vendorId, providerId),
            eq(vendorServices.isActive, true)
          )
        );

      res.json(services);
    } catch (error) {
      console.error('Error fetching provider services:', error);
      res.status(500).json({ error: 'Failed to fetch provider services' });
    }
  });

  // Get Two Men and a Truck specifically (featured provider)
  app.get('/api/moving/two-men-and-a-truck', async (req, res) => {
    try {
      const [twoMenProvider] = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.businessName, 'TWO MEN AND A TRUCK'),
            eq(vendors.status, 'active')
          )
        );

      if (!twoMenProvider) {
        return res.status(404).json({ error: 'TWO MEN AND A TRUCK not found' });
      }

      // Get their services
      const services = await db
        .select()
        .from(vendorServices)
        .leftJoin(vendorServiceCategories, eq(vendorServices.categoryId, vendorServiceCategories.id))
        .where(
          and(
            eq(vendorServices.vendorId, twoMenProvider.id),
            eq(vendorServices.isActive, true)
          )
        );

      res.json({
        provider: twoMenProvider,
        services: services
      });
    } catch (error) {
      console.error('Error fetching Two Men and a Truck data:', error);
      res.status(500).json({ error: 'Failed to fetch Two Men and a Truck data' });
    }
  });

  // Get moving service statistics
  app.get('/api/moving/stats', async (req, res) => {
    try {
      const providers = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.businessType, 'Moving Services'),
            eq(vendors.status, 'active')
          )
        );

      const allServices = await db
        .select()
        .from(vendorServices)
        .leftJoin(vendors, eq(vendorServices.vendorId, vendors.id))
        .where(
          and(
            eq(vendors.businessType, 'Moving Services'),
            eq(vendors.status, 'active'),
            eq(vendorServices.isActive, true)
          )
        );

      res.json({
        totalProviders: providers.length,
        totalServices: allServices.length,
        featuredProvider: 'TWO MEN AND A TRUCK',
        _version: 'v1_moving_services'
      });
    } catch (error) {
      console.error('Error fetching moving stats:', error);
      res.status(500).json({ error: 'Failed to fetch moving stats' });
    }
  });
}