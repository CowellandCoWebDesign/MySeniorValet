import React from 'react';

export const ShootingStars: React.FC = () => {
  // Create stars with different trajectories
  const starTypes = ['steep', 'moderate', 'gentle'];
  
  const stars = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    type: starTypes[i % starTypes.length],
    top: Math.random() * 20, // Start from top area
    left: 50 + Math.random() * 40, // Start more from right side
    delay: i * 2 + Math.random() * 3, // Well spaced out
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Generate multiple shooting stars with different angles */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`shooting-star shooting-star-${star.type}`}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDelay: `${star.delay}s`,
          }}
        >
          <div className="shooting-star-tail" />
        </div>
      ))}
    </div>
  );
};