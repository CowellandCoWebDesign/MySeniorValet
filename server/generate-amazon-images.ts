import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Product image generation configuration
const productImageConfig = {
  "wheeled-walker": {
    prompt: "A modern medical wheeled walker with padded seat, storage basket underneath, hand brakes, professional product photography on white background, high quality studio lighting, no text or logos",
    filename: "wheeled-walker.png"
  },
  "sock-aid": {
    prompt: "A sock aid helper tool with long blue handles and white plastic cradle shape, medical mobility aid device, product photography style on white background, studio lighting",
    filename: "sock-aid.png"
  },
  "shower-chair": {
    prompt: "A white medical shower chair with adjustable height legs, back support, drainage holes in seat, non-slip rubber feet, bathroom safety equipment, clean product photo on white background",
    filename: "shower-chair.png"
  },
  "pill-organizer": {
    prompt: "A clear plastic weekly pill organizer with 7 compartments, each labeled with days of week, colorful snap lids, AM/PM sections, medical product photography on white background",
    filename: "pill-organizer.png"
  },
  "bed-sheets": {
    prompt: "Luxury microfiber bed sheet set neatly folded showing soft texture, light gray color, includes fitted sheet and pillowcases, premium bedding product photo on white background",
    filename: "bed-sheets.png"
  },
  "nightstand": {
    prompt: "Modern wooden nightstand with one drawer and lower shelf, light oak finish, minimalist scandinavian design, bedroom furniture product photo on white background",
    filename: "nightstand.png"
  }
};

export async function generateProductImages() {
  const imagesDir = path.join(process.cwd(), 'public', 'amazon-products');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const generatedImages: Record<string, string> = {};

  for (const [productId, config] of Object.entries(productImageConfig)) {
    try {
      console.log(`Generating image for ${productId}...`);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: config.prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        // In production, you would download and save the image
        // For now, we'll store the URL
        generatedImages[productId] = imageUrl;
        console.log(`✓ Generated image for ${productId}`);
      }
    } catch (error) {
      console.error(`Error generating image for ${productId}:`, error);
    }
  }

  return generatedImages;
}

// Export the product image map for use in routes
export const productImageMap = {
  "wheeled-walker": {
    category: "Mobility & Safety",
    searchTerm: "wheeled walker mobility aid",
    price: "From $89.99",
    rating: "4.5★",
    reviews: "2,847 reviews"
  },
  "sock-aid": {
    category: "Daily Living Aids", 
    searchTerm: "sock aid helper tool",
    price: "$12.99",
    rating: "4.3★",
    reviews: "1,924 reviews"
  },
  "shower-chair": {
    category: "Bathroom Safety",
    searchTerm: "shower chair bathroom safety",
    price: "$54.99",
    rating: "4.6★",
    reviews: "3,521 reviews"
  },
  "pill-organizer": {
    category: "Medication Management",
    searchTerm: "weekly pill organizer",
    price: "$16.99",
    rating: "4.4★",
    reviews: "5,672 reviews"
  },
  "bed-sheets": {
    category: "Home Essentials",
    searchTerm: "luxury bed sheets microfiber",
    price: "From $19.99",
    rating: "4.5★",
    reviews: "12,843 reviews"
  },
  "nightstand": {
    category: "Furniture & Storage",
    searchTerm: "bedroom nightstand furniture",
    price: "$89.99",
    rating: "4.3★",
    reviews: "2,156 reviews"
  }
};