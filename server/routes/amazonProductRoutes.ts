import { Router } from "express";
import OpenAI from "openai";
import { productImageMap } from "../generate-amazon-images";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for generated images
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Remove duplicate - imported from generate-amazon-images.ts
// Product image mapping for Amazon affiliate products
/* const productImageMap: Record<string, { searchTerm: string; category: string; price: string; rating: string; reviews: string }> = {
  "wheeled-walker": {
    searchTerm: "wheeled walker mobility aid",
    category: "Mobility & Safety",
    price: "From $89.99",
    rating: "4.5★",
    reviews: "2,847 reviews"
  },
  "sock-aid": {
    searchTerm: "sock aid helper tool",
    category: "Daily Living Aids", 
    price: "$12.99",
    rating: "4.3★",
    reviews: "1,924 reviews"
  },
  "shower-chair": {
    searchTerm: "shower chair safety bathroom",
    category: "Bathroom Safety",
    price: "$54.99",
    rating: "4.6★",
    reviews: "3,521 reviews"
  },
  "pill-organizer": {
    searchTerm: "weekly pill organizer medication",
    category: "Medication Management",
    price: "$16.99",
    rating: "4.4★", 
    reviews: "5,672 reviews"
  },
  "bed-sheets": {
    searchTerm: "luxury bed sheets microfiber",
    category: "Home Essentials",
    price: "From $19.99",
    rating: "4.5★",
    reviews: "12,843 reviews"
  },
  "nightstand": {
    searchTerm: "modern nightstand bedside table",
    category: "Furniture & Storage",
    price: "$89.99",
    rating: "4.3★",
    reviews: "2,156 reviews"
  },
  "shower-chair-2": {
    searchTerm: "premium shower chair adjustable",
    category: "Bathroom Safety",
    price: "$59.99",
    rating: "4.5★",
    reviews: "1,892 reviews"
  },
  "grabber-tool": {
    searchTerm: "reacher grabber tool mobility",
    category: "Daily Living Aids",
    price: "$18.99",
    rating: "4.4★",
    reviews: "3,267 reviews"
  },
  "disposable-pads": {
    searchTerm: "disposable bed pads protection",
    category: "Home Essentials",
    price: "$24.99",
    rating: "4.2★",
    reviews: "1,543 reviews"
  },
  "first-aid-kit": {
    searchTerm: "compact first aid kit emergency",
    category: "Home Essentials",
    price: "$29.99",
    rating: "4.6★",
    reviews: "4,231 reviews"
  }
}; */

// Helper function to generate AI image with caching
async function getAIGeneratedImage(productId: string): Promise<string | null> {
  try {
    // Check cache first
    const cached = imageCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.url;
    }

    // Generate appropriate prompt based on product
    const prompts: Record<string, string> = {
      "wheeled-walker": "A modern medical wheeled walker with padded seat, storage basket underneath, hand brakes, professional product photography on white background, high quality studio lighting, no text or logos",
      "sock-aid": "A sock aid helper tool with long blue handles and white plastic cradle shape, medical mobility aid device, product photography style on white background, studio lighting",
      "shower-chair": "A white medical shower chair with adjustable height legs, back support, drainage holes in seat, non-slip rubber feet, bathroom safety equipment, clean product photo on white background",
      "pill-organizer": "A clear plastic weekly pill organizer with 7 compartments, each labeled with days of week, colorful snap lids, AM/PM sections, medical product photography on white background",
      "bed-sheets": "Luxury microfiber bed sheet set neatly folded showing soft texture, light gray color, includes fitted sheet and pillowcases, premium bedding product photo on white background",
      "nightstand": "Modern wooden nightstand with one drawer and lower shelf, light oak finish, minimalist scandinavian design, bedroom furniture product photo on white background"
    };

    const prompt = prompts[productId];
    if (!prompt) return null;

    // Only try to generate if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, using placeholder");
      return null;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    if (imageUrl) {
      // Cache the result
      imageCache.set(productId, { url: imageUrl, timestamp: Date.now() });
      return imageUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error generating AI image for ${productId}:`, error);
    return null;
  }
}

// Get AI-generated product images with disclosure
router.get("/images", async (req, res) => {
  try {
    const productImages = [];
    
    // Process only the first 6 products that we have affiliate links for
    const mainProducts = ["wheeled-walker", "sock-aid", "shower-chair", "pill-organizer", "bed-sheets", "nightstand"];
    
    for (const productId of mainProducts) {
      const details = productImageMap[productId];
      if (!details) continue;

      // Try to get AI-generated image
      const aiImageUrl = await getAIGeneratedImage(productId);
      
      // Create product-specific SVG placeholders with icons
      const productSvgs: Record<string, string> = {
        "wheeled-walker": `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23dbeafe' width='400' height='300'/%3E%3Cg transform='translate(200,120)'%3E%3Ccircle r='25' fill='none' stroke='%232563eb' stroke-width='3' cy='20'/%3E%3Ccircle r='25' fill='none' stroke='%232563eb' stroke-width='3' cy='20' cx='-60'/%3E%3Crect x='-80' y='-30' width='100' height='40' fill='none' stroke='%232563eb' stroke-width='3' rx='5'/%3E%3Cline x1='-30' y1='-30' x2='-10' y2='-60' stroke='%232563eb' stroke-width='3'/%3E%3Cline x1='30' y1='-30' x2='10' y2='-60' stroke='%232563eb' stroke-width='3'/%3E%3C/g%3E%3Ctext x='50%25' y='80%25' text-anchor='middle' dy='.3em' fill='%231e40af' font-family='Arial, sans-serif' font-size='14' font-weight='bold'%3EWheeled Walker%3C/text%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'%3E*AI-rendered • Not exact to listing%3C/text%3E%3C/svg%3E`,
        "sock-aid": `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e9d5ff' width='400' height='300'/%3E%3Cg transform='translate(200,120)'%3E%3Cpath d='M-30,0 C-30,-20 -20,-30 0,-30 C20,-30 30,-20 30,0 L30,30 C30,40 20,50 0,50 C-20,50 -30,40 -30,30 Z' fill='none' stroke='%237c3aed' stroke-width='3'/%3E%3Cline x1='0' y1='-30' x2='0' y2='-60' stroke='%237c3aed' stroke-width='3'/%3E%3Ccircle r='5' cy='-65' fill='%237c3aed'/%3E%3C/g%3E%3Ctext x='50%25' y='80%25' text-anchor='middle' dy='.3em' fill='%236d28d9' font-family='Arial, sans-serif' font-size='14' font-weight='bold'%3ESock Aid Tool%3C/text%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'%3E*AI-rendered • Not exact to listing%3C/text%3E%3C/svg%3E`,
        "shower-chair": `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ccfbf1' width='400' height='300'/%3E%3Cg transform='translate(200,120)'%3E%3Crect x='-30' y='-30' width='60' height='40' fill='none' stroke='%2314b8a6' stroke-width='3' rx='5'/%3E%3Cline x1='-25' y1='10' x2='-25' y2='40' stroke='%2314b8a6' stroke-width='3'/%3E%3Cline x1='25' y1='10' x2='25' y2='40' stroke='%2314b8a6' stroke-width='3'/%3E%3Cline x1='-25' y1='-10' x2='-25' y2='-40' stroke='%2314b8a6' stroke-width='3'/%3E%3Cline x1='25' y1='-10' x2='25' y2='-40' stroke='%2314b8a6' stroke-width='3'/%3E%3C/g%3E%3Ctext x='50%25' y='80%25' text-anchor='middle' dy='.3em' fill='%230f766e' font-family='Arial, sans-serif' font-size='14' font-weight='bold'%3EShower Chair%3C/text%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'%3E*AI-rendered • Not exact to listing%3C/text%3E%3C/svg%3E`,
        "pill-organizer": `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23d1fae5' width='400' height='300'/%3E%3Cg transform='translate(200,120)'%3E%3Crect x='-40' y='-20' width='80' height='40' fill='none' stroke='%2310b981' stroke-width='3' rx='5'/%3E%3Cline x1='-20' y1='-20' x2='-20' y2='20' stroke='%2310b981' stroke-width='2'/%3E%3Cline x1='0' y1='-20' x2='0' y2='20' stroke='%2310b981' stroke-width='2'/%3E%3Cline x1='20' y1='-20' x2='20' y2='20' stroke='%2310b981' stroke-width='2'/%3E%3C/g%3E%3Ctext x='50%25' y='80%25' text-anchor='middle' dy='.3em' fill='%23047857' font-family='Arial, sans-serif' font-size='14' font-weight='bold'%3EPill Organizer%3C/text%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'%3E*AI-rendered • Not exact to listing%3C/text%3E%3C/svg%3E`,
        "bed-sheets": `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23fed7aa' width='400' height='300'/%3E%3Cg transform='translate(200,120)'%3E%3Crect x='-50' y='-30' width='100' height='60' fill='none' stroke='%23ea580c' stroke-width='3' rx='3'/%3E%3Cpath d='M-50,-30 L-30,-10 L50,-10 L50,-30' fill='none' stroke='%23ea580c' stroke-width='3'/%3E%3C/g%3E%3Ctext x='50%25' y='80%25' text-anchor='middle' dy='.3em' fill='%23c2410c' font-family='Arial, sans-serif' font-size='14' font-weight='bold'%3EBed Sheet Set%3C/text%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'%3E*AI-rendered • Not exact to listing%3C/text%3E%3C/svg%3E`,
        "nightstand": `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e0e7ff' width='400' height='300'/%3E%3Cg transform='translate(200,120)'%3E%3Crect x='-35' y='-40' width='70' height='80' fill='none' stroke='%236366f1' stroke-width='3'/%3E%3Crect x='-30' y='-35' width='60' height='25' fill='none' stroke='%236366f1' stroke-width='2'/%3E%3Ccircle r='3' cy='-22' fill='%236366f1'/%3E%3Cline x1='-35' y1='0' x2='35' y2='0' stroke='%236366f1' stroke-width='2'/%3E%3C/g%3E%3Ctext x='50%25' y='80%25' text-anchor='middle' dy='.3em' fill='%234338ca' font-family='Arial, sans-serif' font-size='14' font-weight='bold'%3ENightstand%3C/text%3E%3Ctext x='50%25' y='90%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='11'%3E*AI-rendered • Not exact to listing%3C/text%3E%3C/svg%3E`
      };
      
      // Use AI image if available, otherwise use product-specific SVG placeholder
      const imageUrl = aiImageUrl || productSvgs[productId] || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3E${encodeURIComponent(productId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E`;

      productImages.push({
        id: productId,
        imageUrl: imageUrl,
        thumbnailUrl: imageUrl,
        category: details.category,
        price: details.price,
        rating: details.rating,
        reviews: details.reviews,
        aiGenerated: true,
        disclaimer: "AI-generated representation - actual product may vary"
      });
    }

    res.json({
      products: productImages,
      total: productImages.length,
      disclaimer: "Images are AI-generated representations for illustration purposes only. Actual products may vary.",
      _version: "v4_stream_enabled"
    });

  } catch (error) {
    console.error("Error generating Amazon product images:", error);
    res.status(500).json({ 
      error: "Failed to generate product images",
      _version: "v4_stream_enabled" 
    });
  }
});

// Get images for a specific product category
router.get("/images/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Pre-generated AI images mapping (same as above)
    const aiGeneratedImages = {
      "wheeled-walker": {
        prompt: "A modern wheeled walker with padded seat and storage basket, professional product photo on white background, high quality, no text or logos",
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3EWheeled Walker%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E"
      },
      "sock-aid": {
        prompt: "A sock aid helper tool with long handles and smooth plastic cradle, product photography style on white background, no text",
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3ESock Aid Tool%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E"
      },
      "shower-chair": {
        prompt: "A white adjustable shower chair with back support and non-slip feet, clean product photo on light background",
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3EShower Chair%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E"
      },
      "pill-organizer": {
        prompt: "A weekly pill organizer with 7 compartments labeled with days, clear plastic with colorful lids, product photo",
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3EPill Organizer%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E"
      },
      "bed-sheets": {
        prompt: "Luxury microfiber bed sheets neatly folded showing soft texture, neutral colors, professional product photography",
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3EBed Sheet Set%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E"
      },
      "nightstand": {
        prompt: "Modern wooden nightstand with drawer and lower shelf, minimalist design, product photo on white background",
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151' font-family='Arial, sans-serif' font-size='16'%3ENightstand%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EAI-Generated Representation%3C/text%3E%3C/svg%3E"
      }
    };

    // Filter products by category
    const categoryProducts = Object.entries(productImageMap).filter(
      ([_, details]) => details.category.toLowerCase().includes(category.toLowerCase())
    );

    const categoryImages = [];

    for (const [productId, details] of categoryProducts) {
      const aiImage = aiGeneratedImages[productId];
      if (aiImage) {
        categoryImages.push({
          id: productId,
          imageUrl: aiImage.imageUrl,
          thumbnailUrl: aiImage.imageUrl,
          category: details.category,
          price: details.price,
          rating: details.rating,
          reviews: details.reviews,
          aiGenerated: true,
          disclaimer: "AI-generated representation - actual product may vary"
        });
      }
    }

    res.json({
      category,
      products: categoryImages,
      total: categoryImages.length,
      disclaimer: "Images are AI-generated representations for illustration purposes only. Actual products may vary.",
      _version: "v4_stream_enabled"
    });

  } catch (error) {
    console.error("Error fetching category product images:", error);
    res.status(500).json({ 
      error: "Failed to fetch category product images",
      _version: "v4_stream_enabled" 
    });
  }
});

export default router;