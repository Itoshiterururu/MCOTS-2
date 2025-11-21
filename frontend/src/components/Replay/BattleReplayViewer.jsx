import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import replayService from '../../services/replayService';
import ActivityHeatmap from './ActivityHeatmap';
import '../../styles/components/BattleReplay.css';

const BattleReplayViewer = ({ replayId, onClose }) => {
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTrails, setShowTrails] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedTab, setSelectedTab] = useState('replay'); // replay, stats, events
  const playbackRef = useRef(null);

  useEffect(() => {
    loadReplay();
  }, [replayId]);

  useEffect(() => {
    if (playing && replay) {
      playbackRef.current = setInterval(() => {
        setCurrentSnapshotIndex(prev => {
          if (prev >= replay.snapshots.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [playing, playbackSpeed, replay]);

  const loadReplay = async () => {
    try {
      setLoading(true);
      const data = await replayService.getReplay(replayId);
      setReplay(data);
    } catch (error) {
      console.error('Failed to load replay:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleStop = () => {
    setPlaying(false);
    setCurrentSnapshotIndex(0);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handleTimelineClick = (index) => {
    setCurrentSnapshotIndex(index);
  };

  const getUnitIcon = (unit) => {
    const color = unit.faction === 'BLUE_FORCE' ? '#0066cc' : '#cc0000';
    const iconHtml = `
      <div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px;">
        ${unit.unitType === 'INFANTRY' ? '🪖' : unit.unitType === 'TANK' ? '🛡️' : unit.unitType === 'ARTILLERY' ? '💣' : '📡'}
      </div>
    `;
    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [20, 20]
    });
  };

  const getUnitTrail = (unitId) => {
    if (!replay || !showTrails) return [];

    const positions = [];
    for (let i = 0; i <= currentSnapshotIndex; i++) {
      const snapshot = replay.snapshots[i];
      const unit = snapshot.units.find(u => u.id === unitId);
      if (unit && unit.position) {
        positions.push([unit.position.latitude, unit.position.longitude]);
      }
    }
    return positions;
  };

  const getEventsAtCurrentTime = () => {
    if (!replay || !showEvents) return [];

    const currentTime = replay.snapshots[currentSnapshotIndex]?.timestamp;
    if (!currentTime) return [];

    return replay.events.filter(event => {
      const eventTime = new Date(event.timestamp);
      const snapshotTime = new Date(currentTime);
      return Math.abs(eventTime - snapshotTime) < 10000; // Within 10 seconds
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="replay-overlay">
        <div className="replay-modal">
          <div className="loading">Loading replay...</div>
        </div>
      </div>
    );
  }

  if (!replay) {
    return (
      <div className="replay-overlay">
        <div className="replay-modal">
          <div className="error">Failed to load replay</div>
          <button onClick={onClose} className="btn-close">Close</button>
        </div>
      </div>
    );
  }

  const currentSnapshot = replay.snapshots[currentSnapshotIndex];

  return (
    <div className="replay-overlay">
      <div className="replay-modal">
        <div className="replay-header">
          <div className="replay-title">
            <h2>📹 {replay.battleName}</h2>
            <p>{replay.description}</p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="replay-tabs">
          <button
            className={selectedTab === 'replay' ? 'active' : ''}
            onClick={() => setSelectedTab('replay')}
          >
            Replay
          </button>
          <button
            className={selectedTab === 'stats' ? 'active' : ''}
            onClick={() => setSelectedTab('stats')}
          >
            Statistics
          </button>
          <button
            className={selectedTab === 'events' ? 'active' : ''}
            onClick={() => setSelectedTab('events')}
          >
            Events
          </button>
        </div>

        <div className="replay-content">
          {selectedTab === 'replay' && (
            <>
              <div className="replay-map-container">
                <MapContainer
                  center={[48.3794, 31.1656]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />

                  {showHeatmap && (
                    <ActivityHeatmap
                      events={replay.events}
                      snapshots={replay.snapshots}
                      currentSnapshotIndex={currentSnapshotIndex}
                    />
                  )}

                  {currentSnapshot?.units.map(unit => (
                    <React.Fragment key={unit.id}>
                      {showTrails && (
                        <Polyline
                          positions={getUnitTrail(unit.id)}
                          pathOptions={{
                            color: unit.faction === 'BLUE_FORCE' ? '#0066cc' : '#cc0000',
                            weight: 2,
                            opacity: 0.6,
                            dashArray: '5, 10'
                          }}
                        />
                      )}
                      <Marker
                        position={[unit.position.latitude, unit.position.longitude]}
                        icon={getUnitIcon(unit)}
                      >
                        <Popup>
                          <div className="unit-popup">
                            <strong>{unit.unitType} ({unit.unitRank || 'N/A'})</strong>
                            <div>Personnel: {unit.personnel}</div>
                            <div>Supply: {unit.supplyLevel}%</div>
                            <div>Range: {unit.range}km</div>
                            <div>Faction: {unit.faction}</div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  ))}
                </MapContainer>

                <div className="replay-overlay-info">
                  <div className="snapshot-info">
                    Snapshot {currentSnapshotIndex + 1} / {replay.snapshots.length}
                  </div>
                  {getEventsAtCurrentTime().length > 0 && (
                    <div className="current-events">
                      {getEventsAtCurrentTime().map((event, idx) => (
                        <div key={idx} className="event-notification">
                          {event.eventType}: {event.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="replay-controls">
                <div className="playback-buttons">
                  <button onClick={handleStop} className="btn-control" title="Stop">
                    ⏹️
                  </button>
                  <button onClick={handlePlayPause} className="btn-control btn-play" title={playing ? 'Pause' : 'Play'}>
                    {playing ? '⏸️' : '▶️'}
                  </button>
                </div>

                <div className="timeline-container">
                  <input
                    type="range"
                    min="0"
                    max={replay.snapshots.length - 1}
                    value={currentSnapshotIndex}
                    onChange={(e) => handleTimelineClick(parseInt(e.target.value))}
                    className="timeline-slider"
                  />
                  <div className="timeline-markers">
                    {replay.events.map((event, idx) => {
                      const eventTime = new Date(event.timestamp);
                      const startTime = new Date(replay.startTime);
                      const totalDuration = new Date(replay.endTime) - startTime;
                      const position = ((eventTime - startTime) / totalDuration) * 100;

                      return (
                        <div
                          key={idx}
                          className="timeline-marker"
                          style={{ left: `${position}%` }}
                          title={`${event.eventType}: ${event.description}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="playback-speed">
                  <label>Speed:</label>
                  {[0.5, 1, 2, 4].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={playbackSpeed === speed ? 'active' : ''}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div className="view-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={showTrails}
                      onChange={(e) => setShowTrails(e.target.checked)}
                    />
                    Show Trails
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showEvents}
                      onChange={(e) => setShowEvents(e.target.checked)}
                    />
                    Show Events
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showHeatmap}
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                    />
                    Show Heatmap
                  </label>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'stats' && replay.statistics && (
            <div className="statistics-panel">
              <h3>Battle Statistics</h3>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Duration</div>
                  <div className="stat-value">{formatDuration(replay.statistics.durationSeconds)}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Total Units</div>
                  <div className="stat-value">{replay.statistics.totalUnits}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Units Destroyed</div>
                  <div className="stat-value danger">{replay.statistics.unitsDestroyed}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Total Events</div>
                  <div className="stat-value">{replay.statistics.totalEvents}</div>
                </div>
              </div>

              <div className="stats-section">
                <h4>Force Comparison</h4>
                <div className="force-stats">
                  <div className="force-column blue">
                    <h5>Blue Force</h5>
                    <div>Units: {replay.statistics.blueForceUnits}</div>
                    <div>Destroyed: {replay.statistics.blueForceDestroyed}</div>
                    <div>Avg Health: {replay.statistics.blueForceAverageHealth.toFixed(1)}%</div>
                  </div>
                  <div className="force-column red">
                    <h5>Red Force</h5>
                    <div>Units: {replay.statistics.redForceUnits}</div>
                    <div>Destroyed: {replay.statistics.redForceDestroyed}</div>
                    <div>Avg Health: {replay.statistics.redForceAverageHealth.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h4>Activity Summary</h4>
                <div className="activity-stats">
                  <div>Attack Events: {replay.statistics.attackEvents}</div>
                  <div>Movement Events: {replay.statistics.movementEvents}</div>
                  <div>Communication Events: {replay.statistics.communicationEvents}</div>
                  <div>Actions Completed: {replay.statistics.completedActions}</div>
                  <div>Actions Failed: {replay.statistics.failedActions}</div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'events' && (
            <div className="events-panel">
              <h3>Event Timeline</h3>
              <div className="events-list">
                {replay.events.map((event, idx) => (
                  <div key={idx} className={`event-item ${event.eventType.toLowerCase()}`}>
                    <div className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="event-type">{event.eventType}</div>
                    <div className="event-description">{event.description}</div>
                    {event.unitId && <div className="event-unit">Unit: {event.unitId}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleReplayViewer;
