import React, { useState, useEffect } from 'react';
import replayService from '../../services/replayService';
import BattleReplayViewer from './BattleReplayViewer';
import '../../styles/components/ReplayManager.css';

const ReplayManager = ({ onClose }) => {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReplayId, setSelectedReplayId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [battleName, setBattleName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadReplays();
  }, []);

  const loadReplays = async () => {
    try {
      setLoading(true);
      const data = await replayService.getUserReplays();
      setReplays(data);

      // Check if there's an active recording
      const activeRecording = data.find(r => r.recording);
      setRecording(!!activeRecording);
    } catch (error) {
      console.error('Failed to load replays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    if (!battleName.trim()) {
      alert('Please enter a battle name');
      return;
    }

    try {
      await replayService.startRecording(battleName, description);
      setRecording(true);
      setShowStartDialog(false);
      setBattleName('');
      setDescription('');
      loadReplays();
    } catch (error) {
      alert('Failed to start recording. There might be an active recording already.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await replayService.stopRecording();
      setRecording(false);
      loadReplays();
    } catch (error) {
      alert('Failed to stop recording');
    }
  };

  const handleDeleteReplay = async (replayId) => {
    if (!window.confirm('Are you sure you want to delete this replay?')) {
      return;
    }

    try {
      await replayService.deleteReplay(replayId);
      loadReplays();
    } catch (error) {
      alert('Failed to delete replay');
    }
  };

  const handleViewReplay = (replayId) => {
    setSelectedReplayId(replayId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedReplayId) {
    return (
      <BattleReplayViewer
        replayId={selectedReplayId}
        onClose={() => setSelectedReplayId(null)}
      />
    );
  }

  return (
    <div className="replay-manager-overlay">
      <div className="replay-manager-modal">
        <div className="replay-manager-header">
          <h2>📹 Battle Replay Manager</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="replay-manager-actions">
          {recording ? (
            <button onClick={handleStopRecording} className="btn-stop-recording">
              ⏹️ Stop Recording
            </button>
          ) : (
            <button onClick={() => setShowStartDialog(true)} className="btn-start-recording">
              ⏺️ Start Recording
            </button>
          )}
          <button onClick={loadReplays} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>

        {showStartDialog && (
          <div className="start-dialog">
            <h3>Start Battle Recording</h3>
            <div className="form-group">
              <label>Battle Name *</label>
              <input
                type="text"
                value={battleName}
                onChange={(e) => setBattleName(e.target.value)}
                placeholder="Enter battle name"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows="3"
              />
            </div>
            <div className="dialog-actions">
              <button onClick={handleStartRecording} className="btn-primary">
                Start
              </button>
              <button onClick={() => setShowStartDialog(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="replay-list-container">
          {loading ? (
            <div className="loading">Loading replays...</div>
          ) : replays.length === 0 ? (
            <div className="empty-state">
              <p>No replays found</p>
              <p>Start recording a battle to create your first replay</p>
            </div>
          ) : (
            <div className="replay-list">
              {replays.map(replay => (
                <div key={replay.id} className="replay-item">
                  <div className="replay-icon">
                    {replay.recording ? (
                      <span className="recording-indicator">⏺️</span>
                    ) : (
                      <span>📹</span>
                    )}
                  </div>

                  <div className="replay-info">
                    <h3>{replay.battleName}</h3>
                    {replay.description && <p>{replay.description}</p>}
                    <div className="replay-meta">
                      <span>{formatDate(replay.createdAt)}</span>
                      {replay.statistics && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(replay.statistics.durationSeconds)}</span>
                          <span>•</span>
                          <span>{replay.snapshots.length} snapshots</span>
                          <span>•</span>
                          <span>{replay.events.length} events</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="replay-actions">
                    {!replay.recording && (
                      <>
                        <button
                          onClick={() => handleViewReplay(replay.id)}
                          className="btn-view"
                          title="View Replay"
                        >
                          ▶️ View
                        </button>
                        <button
                          onClick={() => handleDeleteReplay(replay.id)}
                          className="btn-delete"
                          title="Delete Replay"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {replay.recording && (
                      <div className="recording-status">
                        Recording in progress...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplayManager;
