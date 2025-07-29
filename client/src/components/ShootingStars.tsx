import React from 'react';

export const ShootingStars: React.FC = () => {
  // Create stars with natural diagonal trajectories
  const starTypes = ['diagonal-fast', 'diagonal-medium', 'diagonal-slow'];
  
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    type: starTypes[i % starTypes.length],
    top: Math.random() * 40 - 10, // Start from -10% to 30% (some off-screen)
    left: Math.random() * 120 - 20, // Start from -20% to 100% (wider spread)
    delay: i * 3 + Math.random() * 2, // More spacing between stars
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