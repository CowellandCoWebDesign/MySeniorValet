import React from 'react';

export const ShootingStars: React.FC = () => {
  // Generate random positions for stars with better distribution
  const stars = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 30, // Keep them in upper portion
    left: Math.random() * 80 + 10, // Avoid edges
    delay: i * 1.5 + Math.random() * 2, // Stagger them more
    duration: 3 + Math.random() * 2 // Slower, more graceful
  }));

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Generate multiple shooting stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="shooting-star"
            style={{
              position: 'absolute',
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          >
            <div className="shooting-star-tail" />
          </div>
        ))}
      </div>
    </>
  );
};