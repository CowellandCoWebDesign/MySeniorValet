/**
 * Stock Photo Theme Options for MySeniorValet
 * 5 different themed collections to choose from as default photos
 */

export const STOCK_PHOTO_THEMES = {
  // OPTION 1: MODERN & VIBRANT
  // Bright, contemporary imagery with active seniors and modern facilities
  modern_vibrant: {
    name: "Modern & Vibrant",
    description: "Contemporary, bright imagery showcasing active senior lifestyles and modern facilities",
    photos: [
      // Exterior shots - modern architecture
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop", // Modern apartment complex
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop", // Contemporary building
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop", // Glass building facade
      
      // Active lifestyle
      "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?w=1200&h=800&fit=crop", // Seniors doing yoga
      "https://images.unsplash.com/photo-1559058922-5d29e1f00075?w=1200&h=800&fit=crop", // Active senior couple
      "https://images.unsplash.com/photo-1543333995-a78aea2eee50?w=1200&h=800&fit=crop", // Group fitness class
      
      // Social & dining
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&h=800&fit=crop", // Friends dining together
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=800&fit=crop", // Modern kitchen
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200&h=800&fit=crop", // Elegant dining room
      
      // Comfortable interiors
      "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=1200&h=800&fit=crop", // Bright living room
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&h=800&fit=crop", // Modern bedroom
      "https://images.unsplash.com/photo-1522444024501-4fd85b3c2f0f?w=1200&h=800&fit=crop", // Cozy reading area
    ],
    colors: ["#4A90E2", "#7FD8B9", "#F5A623", "#FFFFFF"]
  },

  // OPTION 2: WARM & HOMEY
  // Cozy, traditional feel with warm tones and comfortable spaces
  warm_homey: {
    name: "Warm & Homey",
    description: "Traditional, cozy imagery with warm tones emphasizing comfort and home-like atmosphere",
    photos: [
      // Exterior - traditional architecture
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop", // Traditional house
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop", // Beautiful home
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&h=800&fit=crop", // Home with garden
      
      // Warm interiors
      "https://images.unsplash.com/photo-1556912167-f556f10f7c50?w=1200&h=800&fit=crop", // Cozy living room
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop", // Warm bedroom
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1200&h=800&fit=crop", // Library corner
      
      // Gardens & outdoors
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop", // Beautiful garden
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=800&fit=crop", // Garden pathway
      "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1200&h=800&fit=crop", // Peaceful garden bench
      
      // Community spaces
      "https://images.unsplash.com/photo-1555396273-367ea4e78b54?w=1200&h=800&fit=crop", // Community room
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop", // Lounge area
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&h=800&fit=crop", // Coffee corner
    ],
    colors: ["#8B4513", "#D2691E", "#FFE4B5", "#228B22"]
  },

  // OPTION 3: LUXURY & ELEGANCE
  // High-end, sophisticated imagery with premium amenities
  luxury_elegance: {
    name: "Luxury & Elegance",
    description: "Sophisticated, high-end imagery showcasing premium amenities and elegant living",
    photos: [
      // Luxury exteriors
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop", // Luxury mansion
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop", // Elegant estate
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop", // Premium property
      
      // Elegant interiors
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop", // Luxury living room
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&fit=crop", // Elegant bedroom
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=800&fit=crop", // Premium kitchen
      
      // Premium amenities
      "https://images.unsplash.com/photo-1571896349842-33a5b48dff8c?w=1200&h=800&fit=crop", // Indoor pool
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop", // Spa area
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop", // Hotel-style room
      
      // Fine dining
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop", // Elegant restaurant
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&h=800&fit=crop", // Fine dining setup
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&h=800&fit=crop", // Wine selection
    ],
    colors: ["#FFD700", "#C0C0C0", "#000080", "#FFFFFF"]
  },

  // OPTION 4: NATURE & WELLNESS
  // Focus on outdoor spaces, gardens, and wellness activities
  nature_wellness: {
    name: "Nature & Wellness",
    description: "Serene imagery focusing on gardens, outdoor spaces, and wellness activities",
    photos: [
      // Natural settings
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=800&fit=crop", // Garden estate
      "https://images.unsplash.com/photo-1488330890490-c9e10a16d1de?w=1200&h=800&fit=crop", // Lake view property
      "https://images.unsplash.com/photo-1519302959554-a75be0afc82a?w=1200&h=800&fit=crop", // Forest retreat
      
      // Gardens & parks
      "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1200&h=800&fit=crop", // Walking paths
      "https://images.unsplash.com/photo-1585637071063-0385f84e0b03?w=1200&h=800&fit=crop", // Zen garden
      "https://images.unsplash.com/photo-1506905925346-21bda4d37b1e?w=1200&h=800&fit=crop", // Park bench
      
      // Wellness activities
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=800&fit=crop", // Meditation space
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop", // Outdoor yoga
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop", // Nature walk
      
      // Sunlit spaces
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&fit=crop", // Sun room
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop", // Bright space
      "https://images.unsplash.com/photo-1560448205-17d3a46c84de?w=1200&h=800&fit=crop", // Conservatory
    ],
    colors: ["#228B22", "#87CEEB", "#F0E68C", "#8FBC8F"]
  },

  // OPTION 5: COMMUNITY & CONNECTION
  // Focus on social interactions, group activities, and community life
  community_connection: {
    name: "Community & Connection",
    description: "Heartwarming imagery emphasizing social connections, friendships, and community activities",
    photos: [
      // Group activities
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=800&fit=crop", // Group celebration
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop", // Friends gathering
      "https://images.unsplash.com/photo-1573496359142-b8d85a7bc5cb?w=1200&h=800&fit=crop", // Coffee friends
      
      // Community spaces
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&h=800&fit=crop", // Game room
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop", // Community center
      "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1200&h=800&fit=crop", // Activity room
      
      // Arts & crafts
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&h=800&fit=crop", // Art class
      "https://images.unsplash.com/photo-1513475382585-d18e6c8d9dbe?w=1200&h=800&fit=crop", // Crafts table
      "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?w=1200&h=800&fit=crop", // Music room
      
      // Shared meals
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop", // Communal dining
      "https://images.unsplash.com/photo-1555396273-367ea4e78be6?w=1200&h=800&fit=crop", // Breakfast together
      "https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=1200&h=800&fit=crop", // Tea time
    ],
    colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF"]
  }
};

// Helper function to get a specific theme
export function getStockPhotoTheme(themeName: keyof typeof STOCK_PHOTO_THEMES) {
  return STOCK_PHOTO_THEMES[themeName];
}

// Helper function to get random photos from a theme
export function getRandomPhotosFromTheme(themeName: keyof typeof STOCK_PHOTO_THEMES, count: number = 8) {
  const theme = STOCK_PHOTO_THEMES[themeName];
  if (!theme) return [];
  
  const shuffled = [...theme.photos].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper function to apply a theme to a community based on its characteristics
export function selectBestThemeForCommunity(community: any): keyof typeof STOCK_PHOTO_THEMES {
  const careTypes = community.careTypes || [];
  const features = community.features || [];
  const amenities = community.amenities || [];
  const description = (community.description || '').toLowerCase();
  
  // Scoring system for each theme
  let scores = {
    modern_vibrant: 0,
    warm_homey: 0,
    luxury_elegance: 0,
    nature_wellness: 0,
    community_connection: 0
  };
  
  // Modern & Vibrant scoring
  if (careTypes.includes('Independent Living')) scores.modern_vibrant += 3;
  if (features.some((f: string) => f.toLowerCase().includes('fitness'))) scores.modern_vibrant += 2;
  if (description.includes('modern') || description.includes('contemporary')) scores.modern_vibrant += 3;
  if (amenities.some((a: string) => a.toLowerCase().includes('technology'))) scores.modern_vibrant += 2;
  
  // Warm & Homey scoring
  if (careTypes.includes('Assisted Living')) scores.warm_homey += 3;
  if (description.includes('home') || description.includes('cozy')) scores.warm_homey += 3;
  if (features.some((f: string) => f.toLowerCase().includes('garden'))) scores.warm_homey += 2;
  if (community.bedCount && community.bedCount < 50) scores.warm_homey += 2;
  
  // Luxury & Elegance scoring
  if (description.includes('luxury') || description.includes('premium') || description.includes('elegant')) scores.luxury_elegance += 4;
  if (community.priceRange && parseInt(community.priceRange) > 7000) scores.luxury_elegance += 3;
  if (amenities.some((a: string) => a.toLowerCase().includes('spa') || a.toLowerCase().includes('concierge'))) scores.luxury_elegance += 3;
  if (features.some((f: string) => f.toLowerCase().includes('fine dining'))) scores.luxury_elegance += 2;
  
  // Nature & Wellness scoring
  if (careTypes.includes('Memory Care')) scores.nature_wellness += 2;
  if (features.some((f: string) => f.toLowerCase().includes('outdoor') || f.toLowerCase().includes('garden'))) scores.nature_wellness += 3;
  if (description.includes('peaceful') || description.includes('serene') || description.includes('nature')) scores.nature_wellness += 3;
  if (amenities.some((a: string) => a.toLowerCase().includes('walking') || a.toLowerCase().includes('trail'))) scores.nature_wellness += 2;
  
  // Community & Connection scoring
  if (description.includes('community') || description.includes('social') || description.includes('friend')) scores.community_connection += 3;
  if (amenities.some((a: string) => a.toLowerCase().includes('activities') || a.toLowerCase().includes('events'))) scores.community_connection += 2;
  if (features.some((f: string) => f.toLowerCase().includes('club') || f.toLowerCase().includes('group'))) scores.community_connection += 2;
  if (careTypes.length > 2) scores.community_connection += 2; // Multiple care levels suggest larger community
  
  // Find the theme with the highest score
  const bestTheme = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof typeof STOCK_PHOTO_THEMES;
  
  return bestTheme;
}