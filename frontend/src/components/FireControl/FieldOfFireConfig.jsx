import React, { useState, useEffect } from 'react';
import fireControlService from '../../services/fireControlService';
import '../../styles/components/FieldOfFire.css';

const FieldOfFireConfig = ({ unit, onUpdate, onClose }) => {
  const [centerAzimuth, setCenterAzimuth] = useState(0);
  const [leftAzimuth, setLeftAzimuth] = useState(315);
  const [rightAzimuth, setRightAzimuth] = useState(45);
  const [maxRange, setMaxRange] = useState(3000);
  const [minRange, setMinRange] = useState(100);
  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState('PRIMARY');
  const [description, setDescription] = useState('');
  const [useMouseSelect, setUseMouseSelect] = useState(false);

  useEffect(() => {
    if (unit && unit.fieldOfFire) {
      const fof = unit.fieldOfFire;
      setCenterAzimuth(fof.centerAzimuth || 0);
      setLeftAzimuth(fof.leftAzimuth || 315);
      setRightAzimuth(fof.rightAzimuth || 45);
      setMaxRange(fof.maxRange || 3000);
      setMinRange(fof.minRange || 100);
      setActive(fof.active !== undefined ? fof.active : true);
      setPriority(fof.priority || 'PRIMARY');
      setDescription(fof.description || '');
    } else if (unit && unit.direction !== undefined) {
      // Initialize based on unit's facing direction
      setCenterAzimuth(unit.direction);
      setLeftAzimuth((unit.direction - 45 + 360) % 360);
      setRightAzimuth((unit.direction + 45) % 360);
    }
  }, [unit]);

  const handleSave = async () => {
    if (!unit) return;

    const fieldOfFire = {
      centerAzimuth,
      leftAzimuth,
      rightAzimuth,
      maxRange,
      minRange,
      active,
      priority,
      description
    };

    try {
      const updatedUnit = await fireControlService.setFieldOfFire(unit.id, fieldOfFire);
      onUpdate(updatedUnit);
      alert('Field of fire set successfully!');
    } catch (error) {
      alert('Failed to set field of fire');
    }
  };

  const handleClear = async () => {
    if (!unit) return;

    try {
      const updatedUnit = await fireControlService.clearFieldOfFire(unit.id);
      onUpdate(updatedUnit);
      alert('Field of fire cleared');
    } catch (error) {
      alert('Failed to clear field of fire');
    }
  };

  const calculateSectorWidth = () => {
    let width = rightAzimuth - leftAzimuth;
    if (width < 0) width += 360;
    return width;
  };

  return (
    <div className="field-of-fire-config">
      <div className="config-header">
        <h3>🎯 Field of Fire Configuration</h3>
        <p>Unit: {unit?.unitType} - {unit?.faction}</p>
      </div>

      <div className="config-content">
        {/* Visual representation */}
        <div className="fire-sector-diagram">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="#2d2d3a" stroke="#4a4a5a" strokeWidth="2"/>

            {/* Range rings */}
            <circle cx="100" cy="100" r="60" fill="none" stroke="#3d3d4a" strokeWidth="1"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="#3d3d4a" strokeWidth="1"/>
            <circle cx="100" cy="100" r="20" fill="none" stroke="#3d3d4a" strokeWidth="1"/>

            {/* Unit position */}
            <circle cx="100" cy="100" r="5" fill={unit?.faction === 'BLUE_FORCE' ? '#0066cc' : '#cc0000'}/>

            {/* Field of fire sector */}
            <path
              d={`M 100 100
                  L ${100 + 80 * Math.sin(leftAzimuth * Math.PI / 180)} ${100 - 80 * Math.cos(leftAzimuth * Math.PI / 180)}
                  A 80 80 0 ${calculateSectorWidth() > 180 ? 1 : 0} 1
                    ${100 + 80 * Math.sin(rightAzimuth * Math.PI / 180)} ${100 - 80 * Math.cos(rightAzimuth * Math.PI / 180)}
                  Z`}
              fill="rgba(255, 0, 0, 0.3)"
              stroke="#ff0000"
              strokeWidth="2"
            />

            {/* Center line */}
            <line
              x1="100"
              y1="100"
              x2={100 + 80 * Math.sin(centerAzimuth * Math.PI / 180)}
              y2={100 - 80 * Math.cos(centerAzimuth * Math.PI / 180)}
              stroke="#ffff00"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* North indicator */}
            <text x="100" y="15" textAnchor="middle" fill="#888" fontSize="12">N</text>
          </svg>
          <div className="sector-info">
            Sector Width: {calculateSectorWidth()}°
          </div>
        </div>

        {/* Controls */}
        <div className="config-controls">
          <div className="form-group">
            <label>Center Azimuth (degrees)</label>
            <input
              type="number"
              min="0"
              max="359"
              value={centerAzimuth}
              onChange={(e) => setCenterAzimuth(parseInt(e.target.value) || 0)}
            />
            <input
              type="range"
              min="0"
              max="359"
              value={centerAzimuth}
              onChange={(e) => setCenterAzimuth(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Left Boundary (degrees)</label>
            <input
              type="number"
              min="0"
              max="359"
              value={leftAzimuth}
              onChange={(e) => setLeftAzimuth(parseInt(e.target.value) || 0)}
            />
            <input
              type="range"
              min="0"
              max="359"
              value={leftAzimuth}
              onChange={(e) => setLeftAzimuth(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Right Boundary (degrees)</label>
            <input
              type="number"
              min="0"
              max="359"
              value={rightAzimuth}
              onChange={(e) => setRightAzimuth(parseInt(e.target.value) || 0)}
            />
            <input
              type="range"
              min="0"
              max="359"
              value={rightAzimuth}
              onChange={(e) => setRightAzimuth(parseInt(e.target.value))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Max Range (m)</label>
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={maxRange}
                onChange={(e) => setMaxRange(parseInt(e.target.value) || 1000)}
              />
            </div>

            <div className="form-group">
              <label>Min Range (m)</label>
              <input
                type="number"
                min="0"
                max="5000"
                step="10"
                value={minRange}
                onChange={(e) => setMinRange(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="PRIMARY">Primary</option>
              <option value="SECONDARY">Secondary</option>
              <option value="FINAL_PROTECTIVE_FIRE">Final Protective Fire</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g., Main avenue of approach"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button onClick={handleSave} className="btn-save">
          💾 Save Field of Fire
        </button>
        {unit?.fieldOfFire && (
          <button onClick={handleClear} className="btn-clear">
            ❌ Clear
          </button>
        )}
        <button onClick={onClose} className="btn-cancel">
          Close
        </button>
      </div>

      <div className="config-help">
        <h4>Tips:</h4>
        <ul>
          <li>Azimuths are measured clockwise from North (0°)</li>
          <li>Left and Right boundaries define the sector of fire</li>
          <li>Center line shows primary engagement direction</li>
          <li>Max range should not exceed unit's weapon range</li>
          <li>Min range creates a "dead zone" close to the unit</li>
        </ul>
      </div>
    </div>
  );
};

export default FieldOfFireConfig;
