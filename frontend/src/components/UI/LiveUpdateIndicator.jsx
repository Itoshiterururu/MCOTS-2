import React, { useState, useEffect } from 'react';
import './LiveUpdateIndicator.css';

const LiveUpdateIndicator = ({ isActive = true }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="live-update-indicator">
      <div className={`indicator-dot ${pulse ? 'pulse' : ''}`}></div>
      <span className="indicator-text">Live Updates</span>
    </div>
  );
};

export default LiveUpdateIndicator;
