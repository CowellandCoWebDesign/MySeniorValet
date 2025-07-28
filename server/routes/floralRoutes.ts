import { type Express } from "express";
import { db } from "../db";
import { vendors } from "@shared/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { z } from "zod";

interface FloralProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
  suitable_occasions: string[];
  delivery_options: string[];
}

// 1-800-FLORALS Product Catalog (Real products from the fetched data)
const FLORALS_CATALOG: FloralProduct[] = [
  {
    id: "4810D",
    name: "FTD Graceful Grandeur 18 Roses Vase",
    image: "https://www.800florals.com/img/4810Dmd.jpg",
    price: 149.95,
    description: "Elegant arrangement of 18 premium roses in a sophisticated vase",
    category: "roses",
    suitable_occasions: ["move-in", "birthday", "anniversary", "congratulations"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  },
  {
    id: "T2533",
    name: "Your Light Shines Arrangement",
    image: "https://www.800florals.com/img/T2533md.jpg",
    price: 134.95,
    description: "Bright, uplifting floral arrangement perfect for new beginnings",
    category: "mixed",
    suitable_occasions: ["move-in", "get-well", "thinking-of-you", "new-home"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  },
  {
    id: "T2671",
    name: "Love Everlasting Flowers Bouquet",
    image: "https://www.800florals.com/img/T2671md.jpg",
    price: 124.95,
    description: "Beautiful bouquet symbolizing enduring love and care",
    category: "mixed",
    suitable_occasions: ["anniversary", "sympathy", "thinking-of-you"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  },
  {
    id: "4839D",
    name: "FTD Stunning Beauty Bouquet",
    image: "https://www.800florals.com/img/4839Dmd.jpg",
    price: 109.95,
    description: "Stunning mixed floral arrangement that brightens any room",
    category: "mixed",
    suitable_occasions: ["move-in", "birthday", "congratulations", "welcome"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  },
  {
    id: "TW411",
    name: "Fashionista Blooms Flowers Vase",
    image: "https://www.800florals.com/img/TW411md.jpg",
    price: 109.95,
    description: "Stylish and contemporary floral design in decorative vase",
    category: "contemporary",
    suitable_occasions: ["move-in", "birthday", "thank-you", "just-because"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  },
  {
    id: "4810X",
    name: "Graceful Grandeur Dozen Roses",
    image: "https://www.800florals.com/img/4810Xmd.jpg",
    price: 109.95,
    description: "Classic dozen roses arrangement for timeless elegance",
    category: "roses",
    suitable_occasions: ["anniversary", "love", "birthday", "congratulations"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  },
  {
    id: "SPCS1",
    name: "Deal of the Day Spring Mix Bouquet",
    image: "https://www.800florals.com/img/SPCS1md.jpg",
    price: 79.95,
    description: "Fresh spring flowers at exceptional value",
    category: "seasonal",
    suitable_occasions: ["move-in", "thank-you", "get-well", "just-because"],
    delivery_options: ["same-day", "next-day"]
  },
  {
    id: "TW424",
    name: "Heat Wave Flowers Bouquet",
    image: "https://www.800florals.com/img/TW424md.jpg",
    price: 79.95,
    description: "Vibrant, energetic arrangement perfect for celebrations",
    category: "vibrant",
    suitable_occasions: ["congratulations", "birthday", "move-in", "celebration"],
    delivery_options: ["same-day", "next-day", "scheduled"]
  }
];

const seniorLivingSpecialOffers = {
  "move-in-special": {
    title: "Welcome Home Arrangement",
    description: "Special pricing for new senior living residents",
    discount: 15,
    minOrder: 75.00,
    message: "Welcome to your new home! Brighten your first day with fresh flowers."
  },
  "monthly-subscription": {
    title: "Monthly Bloom Subscription",
    description: "Regular floral delivery for senior living residents",
    discount: 20,
    frequency: "monthly",
    message: "Keep your space bright with fresh flowers delivered monthly."
  },
  "family-gift": {
    title: "Family Care Package",
    description: "Multiple arrangements for family visits and celebrations",
    discount: 10,
    minQuantity: 3,
    message: "Show your love with beautiful flowers for every occasion."
  }
};

export function registerFloralRoutes(app: Express) {
  
  // Get floral product catalog
  app.get("/api/florals/catalog", async (req, res) => {
    try {
      const { category, occasion, priceRange, deliveryDate } = req.query;
      
      let filteredProducts = [...FLORALS_CATALOG];
      
      // Filter by category
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      // Filter by occasion
      if (occasion && occasion !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.suitable_occasions.includes(occasion as string)
        );
      }
      
      // Filter by price range
      if (priceRange) {
        const [min, max] = (priceRange as string).split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          filteredProducts = filteredProducts.filter(p => 
            p.price >= min && p.price <= max
          );
        }
      }
      
      // Track catalog view (simplified for now)
      console.log('Floral catalog viewed:', { category, occasion, priceRange });
      
      res.json({
        products: filteredProducts,
        categories: ['roses', 'mixed', 'contemporary', 'seasonal', 'vibrant'],
        occasions: ['move-in', 'birthday', 'anniversary', 'congratulations', 'get-well', 'sympathy', 'thank-you', 'just-because'],
        specialOffers: seniorLivingSpecialOffers,
        deliveryInfo: {
          sameDay: "Available Monday-Saturday before 11am recipient time",
          nextDay: "Standard delivery option",
          scheduled: "Plan ahead for special dates",
          coverage: "49 Continental US states and Canada"
        }
      });
      
    } catch (error) {
      console.error("Error fetching floral catalog:", error);
      res.status(500).json({ error: "Failed to load floral catalog" });
    }
  });

  // Get product by ID
  app.get("/api/florals/product/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = FLORALS_CATALOG.find(p => p.id === id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Track product view (simplified for now)
      console.log('Floral product viewed:', { productId: id, productName: product.name });
      
      res.json({
        ...product,
        orderUrl: `https://www.800florals.com/order.asp?item=${id}&sid=movein_support_florals`,
        specialOffers: seniorLivingSpecialOffers,
        deliveryInfo: {
          sameDay: "Available Monday-Saturday before 11am recipient time",
          nextDay: "Standard delivery option", 
          scheduled: "Plan ahead for special dates"
        }
      });
      
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to load product details" });
    }
  });

  // Get occasion-specific recommendations
  app.get("/api/florals/occasions/:occasion", async (req, res) => {
    try {
      const { occasion } = req.params;
      const { budget } = req.query;
      
      let recommendations = FLORALS_CATALOG.filter(p => 
        p.suitable_occasions.includes(occasion)
      );
      
      // Filter by budget if provided
      if (budget) {
        const budgetNum = parseFloat(budget as string);
        if (!isNaN(budgetNum)) {
          recommendations = recommendations.filter(p => p.price <= budgetNum);
        }
      }
      
      // Sort by price (ascending)
      recommendations.sort((a, b) => a.price - b.price);
      
      // Get occasion-specific messaging
      const occasionMessages = {
        "move-in": {
          title: "Welcome Home Arrangements",
          description: "Beautiful flowers to brighten your new senior living home",
          message: "Starting fresh in a new home is a beautiful beginning. These arrangements will help make your new space feel warm and welcoming."
        },
        "birthday": {
          title: "Birthday Celebrations",
          description: "Special flowers to celebrate another wonderful year",
          message: "Every birthday is a gift. Celebrate with flowers that bring joy and beauty to this special day."
        },
        "get-well": {
          title: "Get Well Soon",
          description: "Uplifting arrangements to brighten recovery",
          message: "Sending thoughts of comfort and healing. These flowers carry wishes for a speedy recovery."
        },
        "sympathy": {
          title: "Sympathy & Comfort",
          description: "Thoughtful arrangements for difficult times",
          message: "During times of loss, flowers express what words cannot. These arrangements honor memories with grace."
        }
      };
      
      res.json({
        occasion: occasion,
        recommendations: recommendations.slice(0, 8), // Top 8 recommendations
        occasionInfo: occasionMessages[occasion as keyof typeof occasionMessages] || {
          title: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Flowers`,
          description: `Beautiful arrangements for ${occasion}`,
          message: "Every occasion deserves beautiful flowers to mark the moment."
        },
        specialOffers: seniorLivingSpecialOffers
      });
      
    } catch (error) {
      console.error("Error fetching occasion recommendations:", error);
      res.status(500).json({ error: "Failed to load recommendations" });
    }
  });

  // Handle order redirect (tracking)
  app.post("/api/florals/order", async (req, res) => {
    try {
      const { productId, userId, communityId, deliveryInfo, orderValue } = req.body;
      
      const product = FLORALS_CATALOG.find(p => p.id === productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Track order initiation (simplified for now)
      console.log('Floral order initiated:', {
        productId,
        productName: product.name,
        orderValue: orderValue || product.price,
        commission: (orderValue || product.price) * 0.08
      });
      
      // Generate affiliate URL with tracking
      const affiliateUrl = `https://www.800florals.com/order.asp?item=${productId}&sid=movein_support_florals`;
      
      res.json({
        success: true,
        orderUrl: affiliateUrl,
        orderSummary: {
          product: product.name,
          price: product.price,
          estimatedDelivery: deliveryInfo?.deliveryDate || "Next business day",
          specialOffers: seniorLivingSpecialOffers
        }
      });
      
    } catch (error) {
      console.error("Error processing order:", error);
      res.status(500).json({ error: "Failed to process order" });
    }
  });

  // Get delivery information
  app.get("/api/florals/delivery-info", async (req, res) => {
    try {
      const { zipCode } = req.query;
      
      // Basic delivery information (would integrate with actual API in production)
      const deliveryInfo = {
        available: true, // Most US locations
        sameDayAvailable: true,
        sameDayCutoff: "11:00 AM",
        nextDayAvailable: true,
        scheduledDeliveryAvailable: true,
        deliveryFee: 14.99,
        rushDeliveryFee: 24.99,
        freeDeliveryThreshold: 75.00,
        restrictions: zipCode === "96720" ? ["Hawaii deliveries not available"] : [],
        estimatedDelivery: {
          sameDay: "Today by 7 PM",
          nextDay: "Tomorrow by 7 PM", 
          scheduled: "On selected date by 7 PM"
        }
      };
      
      res.json(deliveryInfo);
      
    } catch (error) {
      console.error("Error fetching delivery info:", error);
      res.status(500).json({ error: "Failed to load delivery information" });
    }
  });

  // Get vendor information
  app.get("/api/florals/vendor-info", async (req, res) => {
    try {
      const vendorInfo = {
        name: "1-800-FLORALS",
        description: "Professional florist network with over 95 years of experience",
        specialization: "Fresh flowers and plants delivered nationwide",
        coverage: "49 Continental US states and Canada",
        experience: "More than 95 years in business",
        network: "Professional florist network with thousands of certified partners",
        guarantee: "Fresh flowers guaranteed with professional florist delivery",
        features: [
          "Same-day delivery available",
          "Professional florist network",
          "95+ years of experience",
          "Fresh flower guarantee",
          "Nationwide coverage",
          "Senior living specialist rates"
        ],
        seniorLivingBenefits: [
          "Special pricing for senior living communities",
          "Monthly subscription options",
          "Family gift coordination",
          "Move-in welcome arrangements",
          "Celebration and comfort flowers"
        ],
        contact: {
          phone: "1-800-356-7257",
          website: "https://www.800florals.com",
          email: "service@800florals.com"
        }
      };
      
      res.json(vendorInfo);
      
    } catch (error) {
      console.error("Error fetching vendor info:", error);
      res.status(500).json({ error: "Failed to load vendor information" });
    }
  });
}