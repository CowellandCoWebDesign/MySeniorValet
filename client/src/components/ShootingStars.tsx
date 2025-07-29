import React from 'react';

export const ShootingStars: React.FC = () => {
  // Generate random positions for stars
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    top: Math.random() * 50,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3
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