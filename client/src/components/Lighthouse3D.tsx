import React from 'react';

const Lighthouse3D = () => {
  return (
    <div className="lighthouse-3d-container">
      {/* 3D Lighthouse Video Background */}
      <video 
        className="lighthouse-3d-video"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/lighthouse-loop.mp4" type="video/mp4" />
        {/* Fallback to static image if video doesn't load */}
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay beacon effects for extra glow */}
      <div className="beacon-overlay">
        <div className="beacon-glow"></div>
        <div className="beacon-pulse"></div>
      </div>
      
      {/* Stars overlay for depth */}
      <div className="sky-elements">
        <div className="star star1"></div>
        <div className="star star2"></div>
        <div className="star star3"></div>
        <div className="star star4"></div>
        <div className="star star5"></div>
        <div className="star star6"></div>
        <div className="star star7"></div>
        <div className="star star8"></div>
      </div>
    </div>
  );
};

export default Lighthouse3D;