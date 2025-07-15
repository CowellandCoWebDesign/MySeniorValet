// Coming Soon Photo Selection Library
// Provides randomized selection of "coming soon" images for communities without photos

// For now, use a single coming soon image and create variety through different overlays
// This avoids import issues while still providing authentic coming soon imagery

// Array of coming soon images for variety
const comingSoonImages = [
  "/assets/coming-soon-1.jpg",
  "/assets/coming-soon-2.jpg", 
  "/assets/coming-soon-3.jpg",
  "/assets/coming-soon-4.jpg",
  "/assets/coming-soon-5.jpg"
];

// Get a consistent "coming soon" image for a community based on its ID
export const getComingSoonImage = (communityId: number): string => {
  const index = communityId % comingSoonImages.length;
  return comingSoonImages[index];
};

// Get a random "coming soon" image
export const getRandomComingSoonImage = (): string => {
  const index = Math.floor(Math.random() * comingSoonImages.length);
  return comingSoonImages[index];
};