import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// Product image mapping for Amazon affiliate products
const productImageMap: Record<string, { searchTerm: string; category: string; price: string; rating: string; reviews: string }> = {
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
};

// Get authentic product images from Unsplash
router.get("/images", async (req, res) => {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!UNSPLASH_ACCESS_KEY) {
      return res.status(500).json({ 
        error: "Unsplash API access not configured",
        _version: "v4_stream_enabled" 
      });
    }

    const productImages = [];

    // Fetch images for each product category
    for (const [productId, details] of Object.entries(productImageMap)) {
      try {
        const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(details.searchTerm)}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const image = data.results[0];
          productImages.push({
            id: productId,
            imageUrl: image.urls.regular,
            thumbnailUrl: image.urls.small,
            category: details.category,
            price: details.price,
            rating: details.rating,
            reviews: details.reviews,
            photographer: image.user.name,
            photographerUrl: image.user.links.html,
            unsplashUrl: image.links.html
          });
        }
      } catch (error) {
        console.error(`Error fetching image for ${productId}:`, error);
        // Continue with other products even if one fails
      }
    }

    res.json({
      products: productImages,
      total: productImages.length,
      _version: "v4_stream_enabled"
    });

  } catch (error) {
    console.error("Error fetching Amazon product images:", error);
    res.status(500).json({ 
      error: "Failed to fetch product images",
      _version: "v4_stream_enabled" 
    });
  }
});

// Get images for a specific product category
router.get("/images/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!UNSPLASH_ACCESS_KEY) {
      return res.status(500).json({ 
        error: "Unsplash API access not configured",
        _version: "v4_stream_enabled" 
      });
    }

    // Filter products by category
    const categoryProducts = Object.entries(productImageMap).filter(
      ([_, details]) => details.category.toLowerCase().includes(category.toLowerCase())
    );

    const categoryImages = [];

    for (const [productId, details] of categoryProducts) {
      try {
        const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(details.searchTerm)}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const image = data.results[0];
          categoryImages.push({
            id: productId,
            imageUrl: image.urls.regular,
            thumbnailUrl: image.urls.small,
            category: details.category,
            price: details.price,
            rating: details.rating,
            reviews: details.reviews,
            photographer: image.user.name,
            photographerUrl: image.user.links.html,
            unsplashUrl: image.links.html
          });
        }
      } catch (error) {
        console.error(`Error fetching category image for ${productId}:`, error);
      }
    }

    res.json({
      category,
      products: categoryImages,
      total: categoryImages.length,
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