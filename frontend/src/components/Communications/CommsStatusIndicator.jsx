import React from 'react';

/**
 * Component that shows communications status for a unit
 */
const CommsStatusIndicator = ({ unit, showLabel = false }) => {
  const hasComms = unit.hasCommsLink;
  const signalStrength = unit.commsStrength || 0;

  // Determine signal quality
  const getSignalClass = () => {
    if (!hasComms) return 'no-signal';
    if (signalStrength >= 80) return 'excellent';
    if (signalStrength >= 60) return 'good';
    if (signalStrength >= 40) return 'fair';
    return 'weak';
  };

  const getSignalIcon = () => {
    if (!hasComms) return '📵';
    if (signalStrength >= 80) return '📶';
    if (signalStrength >= 60) return '📶';
    if (signalStrength >= 40) return '📶';
    return '📶';
  };

  const getSignalBars = () => {
    if (!hasComms) return 0;
    if (signalStrength >= 80) return 4;
    if (signalStrength >= 60) return 3;
    if (signalStrength >= 40) return 2;
    return 1;
  };

  return (
    <div className={`comms-status-indicator ${getSignalClass()}`}>
      <div className="signal-bars">
        {[1, 2, 3, 4].map(bar => (
          <div
            key={bar}
            className={`signal-bar ${bar <= getSignalBars() ? 'active' : ''}`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="signal-label">
          {hasComms ? `${signalStrength}%` : 'No Signal'}
        </span>
      )}
      {!hasComms && (
        <div className="no-comms-warning" title="Unit has no communications link">
          ⚠️
        </div>
      )}
    </div>
  );
};

export default CommsStatusIndicator;
