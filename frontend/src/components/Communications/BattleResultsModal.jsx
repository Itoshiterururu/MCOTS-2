import React, { useState } from 'react';
import '../../styles/components/BattleResultsModal.css';
import { getPriorityColor, getOutcomeColor, getOutcomeText } from '../../utils/colors';

const BattleResultsModal = React.memo(({ isOpen, onClose, battleData }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen || !battleData) return null;

  const { battle_outcome, timeline = [], communications = [], details = [], units = [] } = battleData;



  return (
    <div className="battle-results-overlay">
      <div className="battle-results-modal">
        <div className="modal-header">
          <h2>🎯 Результати тактичної симуляції</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="battle-outcome">
          <span 
            className="outcome-badge"
            style={{ backgroundColor: getOutcomeColor(battle_outcome) }}
          >
            {getOutcomeText(battle_outcome)}
          </span>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              📊 Загальна інформація
            </button>
            <button 
              className={`tab ${activeTab === 'communications' ? 'active' : ''}`}
              onClick={() => setActiveTab('communications')}
            >
              📡 Рекомендації зв'язківцю ({communications.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'general' && (
              <div className="general-section">
                <div className="battle-summary">
                  <h3>⚔️ Результат бою</h3>
                </div>

                <div className="units-status">
                  <h3>👥 Стан підрозділів</h3>
                  <div className="units-grid">
                    {units.map((unit) => (
                      <div key={unit.id || unit.unitId} className="unit-card">
                        <div className="unit-header">
                          <span className={`faction-badge ${unit.faction?.toLowerCase()}`}>
                            {unit.faction === 'BLUE_FORCE' ? '🔵' : '🔴'} {unit.id}
                          </span>
                          <span className={`status-badge ${unit.status?.toLowerCase()}`}>
                            {unit.status}
                          </span>
                        </div>
                        <div className="unit-stats">
                          <div className="stat">
                            <span className="stat-label">Мораль:</span>
                            <span className="stat-value">{unit.morale || 'N/A'}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Особовий склад:</span>
                            <span className="stat-value">{unit.personnel || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {timeline.length > 0 && (
                  <div className="timeline-section">
                    <h3>⏱️ Хронологія подій</h3>
                    <div className="timeline-list">
                      {timeline.map((event, index) => (
                        <div key={`timeline-${index}`} className="timeline-item">
                          <div className="timeline-time">{event.time}</div>
                          <div className="timeline-event">{event.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            )}

            {activeTab === 'communications' && (
              <div className="communications-section">
                <h3>📡 Рекомендації для зв'язківця</h3>
                <div className="communications-list">
                  {communications.map((comm, index) => (
                    <div key={`comm-${index}`} className="communication-item">
                      <div className="comm-header">
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(comm.priority) }}
                        >
                          {comm.priority}
                        </span>
                      </div>
                      <div className="comm-message">{comm.message}</div>
                      <div className="comm-reasoning">
                        <strong>Обґрунтування:</strong> {comm.reasoning}
                      </div>
                    </div>
                  ))}
                  {communications.length === 0 && (
                    <div className="no-communications">
                      ✅ Немає критичних повідомлень для передачі
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BattleResultsModal;