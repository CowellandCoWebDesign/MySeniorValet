// Coming Soon Photo Selection Library
// Provides randomized selection of "coming soon" images for communities without photos

import comingSoon1 from "@assets/coming-soon-1.jpg";
import comingSoon2 from "@assets/coming-soon-2.jpg";
import comingSoon3 from "@assets/coming-soon-3.jpg";
import comingSoon4 from "@assets/coming-soon-4.jpg";
import comingSoon5 from "@assets/coming-soon-5.jpg";

const comingSoonImages = [
  comingSoon1,
  comingSoon2,
  comingSoon3,
  comingSoon4,
  comingSoon5,
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