import { Router } from "express";
import { pixabayService } from "../pixabay-api";

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

// Get authentic product images from Pixabay
router.get("/images", async (req, res) => {
  try {
    const productImages = [];

    // Fetch images for each product category using Pixabay
    for (const [productId, details] of Object.entries(productImageMap)) {
      try {
        const images = await pixabayService.searchImages(details.searchTerm, 'all', 800);
        
        if (images && images.length > 0) {
          const image = images[0];
          productImages.push({
            id: productId,
            imageUrl: image.largeImageURL,
            thumbnailUrl: image.webformatURL,
            category: details.category,
            price: details.price,
            rating: details.rating,
            reviews: details.reviews,
            photographer: image.user,
            pixabayId: image.id,
            tags: image.tags
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

    // Filter products by category
    const categoryProducts = Object.entries(productImageMap).filter(
      ([_, details]) => details.category.toLowerCase().includes(category.toLowerCase())
    );

    const categoryImages = [];

    for (const [productId, details] of categoryProducts) {
      try {
        const images = await pixabayService.searchImages(details.searchTerm, 'all', 800);
        
        if (images && images.length > 0) {
          const image = images[0];
          categoryImages.push({
            id: productId,
            imageUrl: image.largeImageURL,
            thumbnailUrl: image.webformatURL,
            category: details.category,
            price: details.price,
            rating: details.rating,
            reviews: details.reviews,
            photographer: image.user,
            pixabayId: image.id,
            tags: image.tags
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