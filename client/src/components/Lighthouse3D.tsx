import React from 'react';

const Lighthouse3D = () => {
  return (
    <div className="lighthouse-3d-container">
      {/* Ocean waves */}
      <div className="ocean">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
        <div className="wave wave4"></div>
      </div>
      
      {/* Rocky island base */}
      <div className="island">
        <div className="rock rock1"></div>
        <div className="rock rock2"></div>
        <div className="rock rock3"></div>
      </div>
      
      {/* Lighthouse structure */}
      <div className="lighthouse-structure">
        {/* Base */}
        <div className="lighthouse-base"></div>
        
        {/* Tower with stripes */}
        <div className="lighthouse-tower">
          <div className="stripe stripe1"></div>
          <div className="stripe stripe2"></div>
          <div className="stripe stripe3"></div>
          <div className="stripe stripe4"></div>
          <div className="stripe stripe5"></div>
          <div className="stripe stripe6"></div>
        </div>
        
        {/* Lantern room */}
        <div className="lantern-room">
          <div className="lantern-glass"></div>
          <div className="lantern-top"></div>
        </div>
        
        {/* Rotating beacon light */}
        <div className="beacon-3d">
          <div className="beacon-rotation">
            <div className="light-beam beam1"></div>
            <div className="light-beam beam2"></div>
            <div className="light-source"></div>
          </div>
        </div>
      </div>
      
      {/* Sky elements */}
      <div className="sky-elements">
        <div className="star star1"></div>
        <div className="star star2"></div>
        <div className="star star3"></div>
        <div className="star star4"></div>
        <div className="star star5"></div>
        <div className="star star6"></div>
        <div className="star star7"></div>
        <div className="star star8"></div>
        <div className="moon"></div>
      </div>
      
      {/* Flying birds */}
      <div className="birds">
        <div className="bird bird1">
          <span></span>
          <span></span>
        </div>
        <div className="bird bird2">
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Lighthouse3D;