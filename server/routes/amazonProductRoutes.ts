import { Router } from "express";
import { db } from "../db";
import { services, serviceCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all Amazon products from services management database
router.get("/images", async (req, res) => {
  try {
    // Fetch all Amazon services from the database
    const amazonServices = await db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        shortDescription: services.shortDescription,
        features: services.features,
        pricing: services.pricing,
        externalUrl: services.externalUrl,
        affiliateCode: services.affiliateCode,
        productId: services.productId,
        imageUrl: services.imageUrl,
        isFeatured: services.isFeatured,
        categoryName: serviceCategories.name,
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.providerId, 4)) // Amazon provider ID
      .orderBy(services.isFeatured, services.sortOrder, services.name);

    const productImages = [];
    
    for (const service of amazonServices) {
      // Create category-based SVG placeholders
      const getCategoryColor = (categoryName: string) => {
        const colors: Record<string, string> = {
          "Mobility & Safety": "dbeafe",
          "Daily Living Aids": "e9d5ff", 
          "Bathroom Safety": "ccfbf1",
          "Medication Management": "d1fae5",
          "Home Essentials": "fed7aa",
          "Furniture & Storage": "e0e7ff",
          "Essential Products": "fef3c7"
        };
        return colors[categoryName] || "f3f4f6";
      };

      const getCategoryIcon = (categoryName: string, productName: string) => {
        if (productName.toLowerCase().includes('walker')) {
          return `<g transform='translate(200,120)'><circle r='25' fill='none' stroke='%232563eb' stroke-width='3' cy='20'/><circle r='25' fill='none' stroke='%232563eb' stroke-width='3' cy='20' cx='-60'/><rect x='-80' y='-30' width='100' height='40' fill='none' stroke='%232563eb' stroke-width='3' rx='5'/><line x1='-30' y1='-30' x2='-10' y2='-60' stroke='%232563eb' stroke-width='3'/><line x1='30' y1='-30' x2='10' y2='-60' stroke='%232563eb' stroke-width='3'/></g>`;
        }
        if (productName.toLowerCase().includes('chair')) {
          return `<g transform='translate(200,120)'><rect x='-30' y='-30' width='60' height='40' fill='none' stroke='%2314b8a6' stroke-width='3' rx='5'/><line x1='-25' y1='10' x2='-25' y2='40' stroke='%2314b8a6' stroke-width='3'/><line x1='25' y1='10' x2='25' y2='40' stroke='%2314b8a6' stroke-width='3'/><line x1='-25' y1='-10' x2='-25' y2='-40' stroke='%2314b8a6' stroke-width='3'/><line x1='25' y1='-10' x2='25' y2='-40' stroke='%2314b8a6' stroke-width='3'/></g>`;
        }
        if (productName.toLowerCase().includes('pill') || productName.toLowerCase().includes('medication')) {
          return `<g transform='translate(200,120)'><rect x='-40' y='-20' width='80' height='40' fill='none' stroke='%2310b981' stroke-width='3' rx='5'/><line x1='-20' y1='-20' x2='-20' y2='20' stroke='%2310b981' stroke-width='2'/><line x1='0' y1='-20' x2='0' y2='20' stroke='%2310b981' stroke-width='2'/><line x1='20' y1='-20' x2='20' y2='20' stroke='%2310b981' stroke-width='2'/></g>`;
        }
        if (productName.toLowerCase().includes('nightstand') || productName.toLowerCase().includes('table')) {
          return `<g transform='translate(200,120)'><rect x='-35' y='-40' width='70' height='80' fill='none' stroke='%236366f1' stroke-width='3'/><rect x='-30' y='-35' width='60' height='25' fill='none' stroke='%236366f1' stroke-width='2'/><circle r='3' cy='-22' fill='%236366f1'/><line x1='-35' y1='0' x2='35' y2='0' stroke='%236366f1' stroke-width='2'/></g>`;
        }
        // Default icon
        return `<g transform='translate(200,150)'><rect x='-25' y='-25' width='50' height='50' fill='none' stroke='%23374151' stroke-width='3' rx='5'/><line x1='-15' y1='-15' x2='15' y2='15' stroke='%23374151' stroke-width='2'/><line x1='15' y1='-15' x2='-15' y2='15' stroke='%23374151' stroke-width='2'/></g>`;
      };

      const bgColor = getCategoryColor(service.categoryName || '');
      const iconSvg = getCategoryIcon(service.categoryName || '', service.name);
      
      // Generate SVG placeholder
      const svgPlaceholder = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect fill='%23${bgColor}' width='400' height='300'/>${iconSvg}<text x='50%' y='80%' text-anchor='middle' dy='.3em' fill='%231e40af' font-family='Arial, sans-serif' font-size='14' font-weight='bold'>${encodeURIComponent(service.name)}</text><text x='50%' y='90%' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'>*AI-rendered • Not exact to listing</text></svg>`;

      // Extract price from pricing object
      let priceDisplay = "Contact for pricing";
      if (service.pricing && typeof service.pricing === 'object') {
        const pricing = service.pricing as any;
        if (pricing.type === 'fixed' && pricing.amount) {
          priceDisplay = `$${pricing.amount}`;
        } else if (pricing.type === 'range' && pricing.min && pricing.max) {
          priceDisplay = `$${pricing.min} - $${pricing.max}`;
        } else if (pricing.description) {
          priceDisplay = pricing.description;
        }
      }

      productImages.push({
        id: service.productId || `amazon-${service.id}`,
        name: service.name,
        imageUrl: service.imageUrl || svgPlaceholder,
        thumbnailUrl: service.imageUrl || svgPlaceholder,
        category: service.categoryName || "Products",
        price: priceDisplay,
        rating: "4.5★",
        reviews: "Prime delivery available",
        description: service.shortDescription || service.description,
        features: service.features || [],
        externalUrl: service.externalUrl,
        affiliateCode: service.affiliateCode,
        isFeatured: service.isFeatured,
        aiGenerated: true,
        disclaimer: "AI-generated representation - actual product may vary"
      });
    }

    res.json({
      products: productImages,
      total: productImages.length,
      disclaimer: "Images are AI-generated representations for illustration purposes only. Actual products may vary.",
      _version: "v5_database_integrated"
    });

  } catch (error) {
    console.error("Error fetching Amazon products from database:", error);
    res.status(500).json({ 
      error: "Failed to load Amazon products",
      _version: "v5_database_integrated" 
    });
  }
});

export default router;