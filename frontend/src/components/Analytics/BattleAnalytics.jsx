import React, { useState, useEffect } from 'react';
import battleHistoryService from '../../services/battleHistoryService';
import '../../styles/components/BattleAnalytics.css';

const BattleAnalytics = ({ units, isVisible, onClose }) => {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [battleTimeline, setBattleTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('statistics'); // statistics, recommendations, timeline
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveBattle = async () => {
    try {
      const summary = battleHistoryService.calculateBattleSummary(units);
      await battleHistoryService.saveBattleResult(summary);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save battle:', error);
      alert('Помилка збереження результатів бою');
    }
  };

  // Calculate battle statistics
  const stats = React.useMemo(() => {
    const blueForce = units.filter(u => u && u.faction === 'BLUE_FORCE');
    const redForce = units.filter(u => u && u.faction === 'RED_FORCE');

    const blueDestroyed = blueForce.filter(u => u && (u.status === 'DESTROYED' || (u.personnel !== undefined && u.personnel <= 0)));
    const redDestroyed = redForce.filter(u => u && (u.status === 'DESTROYED' || (u.personnel !== undefined && u.personnel <= 0)));

    const blueTotalPersonnel = blueForce.reduce((sum, u) => sum + (u.personnel || 0), 0);
    const redTotalPersonnel = redForce.reduce((sum, u) => sum + (u.personnel || 0), 0);

    const blueTotalVehicles = blueForce.reduce((sum, u) => sum + (u.vehicles || 0), 0);
    const redTotalVehicles = redForce.reduce((sum, u) => sum + (u.vehicles || 0), 0);

    const blueTotalFirepower = blueForce.reduce((sum, u) => sum + (u.firepower || 0), 0);
    const redTotalFirepower = redForce.reduce((sum, u) => sum + (u.firepower || 0), 0);

    const blueAvgMorale = blueForce.length > 0
      ? blueForce.reduce((sum, u) => sum + (u.morale || 0), 0) / blueForce.length
      : 0;
    const redAvgMorale = redForce.length > 0
      ? redForce.reduce((sum, u) => sum + (u.morale || 0), 0) / redForce.length
      : 0;

    const blueAvgSupply = blueForce.length > 0
      ? blueForce.reduce((sum, u) => sum + (u.supplyLevel || 0), 0) / blueForce.length
      : 0;
    const redAvgSupply = redForce.length > 0
      ? redForce.reduce((sum, u) => sum + (u.supplyLevel || 0), 0) / redForce.length
      : 0;

    return {
      blueForce: {
        totalUnits: blueForce.length,
        activeUnits: blueForce.length - blueDestroyed.length,
        destroyedUnits: blueDestroyed.length,
        personnel: blueTotalPersonnel,
        vehicles: blueTotalVehicles,
        firepower: blueTotalFirepower,
        avgMorale: Math.round(blueAvgMorale),
        avgSupply: Math.round(blueAvgSupply),
        units: blueForce
      },
      redForce: {
        totalUnits: redForce.length,
        activeUnits: redForce.length - redDestroyed.length,
        destroyedUnits: redDestroyed.length,
        personnel: redTotalPersonnel,
        vehicles: redTotalVehicles,
        firepower: redTotalFirepower,
        avgMorale: Math.round(redAvgMorale),
        avgSupply: Math.round(redAvgSupply),
        units: redForce
      }
    };
  }, [units]);

  // Fetch AI recommendations
  const fetchAiRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8084/api/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          battle_data: {
            blue_force: {
              units: stats.blueForce.activeUnits,
              personnel: stats.blueForce.personnel,
              vehicles: stats.blueForce.vehicles,
              firepower: stats.blueForce.firepower,
              morale: stats.blueForce.avgMorale,
              supply: stats.blueForce.avgSupply,
              status: stats.blueForce.destroyedUnits > 0 ? 'Зазнає втрат' : 'Операційний'
            },
            red_force: {
              units: stats.redForce.activeUnits,
              personnel: stats.redForce.personnel,
              vehicles: stats.redForce.vehicles,
              firepower: stats.redForce.firepower,
              morale: stats.redForce.avgMorale,
              supply: stats.redForce.avgSupply,
              status: stats.redForce.destroyedUnits > 0 ? 'Зазнає втрат' : 'Операційний'
            },
            casualties: {
              blue: stats.blueForce.destroyedUnits,
              red: stats.redForce.destroyedUnits
            }
          },
          terrain: 'mixed',
          weather: 'clear'
        })
      });

      const data = await response.json();

      // Transform the intelligence service response to expected format
      const transformed = {
        analysis: '',
        recommendations: [],
        threats: [],
        opportunities: []
      };

      // Extract battle outcome as analysis
      if (data.battle_outcome) {
        const outcomeMap = {
          'BLUE_VICTORY': 'Аналіз показує перевагу Синіх сил у поточній ситуації.',
          'RED_VICTORY': 'Аналіз показує перевагу Червоних сил у поточній ситуації.',
          'NEUTRAL': 'Ситуація збалансована. Обидві сторони мають рівні можливості.'
        };
        transformed.analysis = outcomeMap[data.battle_outcome] || 'Аналіз бойової ситуації виконано.';
      }

      // Extract details as part of analysis
      if (data.details && data.details.length > 0) {
        const detailsText = data.details.map(d => d.description).join(' ');
        transformed.analysis += ' ' + detailsText;
      }

      // Extract communications as recommendations
      if (data.communications && data.communications.length > 0) {
        data.communications.forEach(comm => {
          if (comm.message && comm.message.trim()) {
            const rec = `${comm.message}${comm.reasoning ? ' (' + comm.reasoning + ')' : ''}`;
            transformed.recommendations.push(rec);
          }
        });
      }

      // Add default recommendations if none provided
      if (transformed.recommendations.length === 0) {
        transformed.recommendations.push('Підтримувати поточні позиції');
        transformed.recommendations.push('Моніторити рух ворожих підрозділів');
        transformed.recommendations.push('Забезпечити готовність резервів');
      }

      // Analyze threats based on current situation
      if (stats.redForce.firepower > stats.blueForce.firepower) {
        transformed.threats.push('Ворог має перевагу у вогневій потужності');
      }
      if (stats.blueForce.avgMorale < 50) {
        transformed.threats.push('Низький моральний дух підрозділів');
      }
      if (stats.blueForce.avgSupply < 50) {
        transformed.threats.push('Низький рівень постачання');
      }
      if (stats.redForce.activeUnits > stats.blueForce.activeUnits) {
        transformed.threats.push('Чисельна перевага противника');
      }

      // Identify opportunities
      if (stats.blueForce.firepower > stats.redForce.firepower) {
        transformed.opportunities.push('Перевага у вогневій потужності - можливість контратаки');
      }
      if (stats.redForce.avgMorale < 50) {
        transformed.opportunities.push('Низький моральний дух ворога - сприятливий момент для наступу');
      }
      if (stats.blueForce.activeUnits > stats.redForce.activeUnits) {
        transformed.opportunities.push('Чисельна перевага - можливість оточення');
      }
      if (stats.redForce.destroyedUnits > 0) {
        transformed.opportunities.push('Ворог зазнав втрат - його позиції ослаблені');
      }

      setAiRecommendations(transformed);
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
      setAiRecommendations({
        analysis: 'Неможливо підключитися до служби розвідки. Робота у ручному режимі.',
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate battle timeline from unit changes
  useEffect(() => {
    const timeline = [];
    const now = new Date();

    const factionMap = {
      'BLUE_FORCE': 'Сині сили',
      'RED_FORCE': 'Червоні сили'
    };

    // Add unit events
    units.forEach(unit => {
      const factionName = factionMap[unit.faction] || unit.faction;

      if (unit.status === 'DESTROYED') {
        timeline.push({
          time: unit.updatedAt || now.toISOString(),
          type: 'destruction',
          faction: unit.faction,
          message: `${factionName} - підрозділ ${unit.unitType} знищено`,
          severity: 'critical'
        });
      } else if (unit.status === 'ATTACKING') {
        timeline.push({
          time: unit.updatedAt || now.toISOString(),
          type: 'combat',
          faction: unit.faction,
          message: `${factionName} - підрозділ ${unit.unitType} веде бій`,
          severity: 'high'
        });
      } else if (unit.status === 'MOVING') {
        timeline.push({
          time: unit.updatedAt || now.toISOString(),
          type: 'movement',
          faction: unit.faction,
          message: `${factionName} - підрозділ ${unit.unitType} переміщується`,
          severity: 'medium'
        });
      }

      // Check for low morale
      if (unit.morale < 30 && unit.status !== 'DESTROYED') {
        timeline.push({
          time: unit.updatedAt || now.toISOString(),
          type: 'morale',
          faction: unit.faction,
          message: `${factionName} - критично низький моральний дух ${unit.unitType} (${unit.morale}%)`,
          severity: 'high'
        });
      }

      // Check for low supply
      if (unit.supplyLevel < 30 && unit.status !== 'DESTROYED') {
        timeline.push({
          time: unit.updatedAt || now.toISOString(),
          type: 'supply',
          faction: unit.faction,
          message: `${factionName} - критично низький рівень постачання ${unit.unitType} (${unit.supplyLevel}%)`,
          severity: 'high'
        });
      }
    });

    // Sort by time (most recent first)
    timeline.sort((a, b) => new Date(b.time) - new Date(a.time));

    setBattleTimeline(timeline.slice(0, 20)); // Keep last 20 events
  }, [units]);

  if (!isVisible) return null;

  return (
    <div className="battle-analytics-overlay">
      <div className="battle-analytics-panel">
        <div className="analytics-header">
          <h2>⚔️ Бойова аналітика та розвідка</h2>
          <div className="header-buttons">
            <button className="save-battle-btn" onClick={handleSaveBattle} title="Зберегти результати бою">
              💾 {saveSuccess ? '✓ Збережено!' : 'Зберегти бій'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="analytics-tabs">
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            📊 Статистика
          </button>
          <button
            className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('recommendations');
              if (!aiRecommendations && !loading) {
                fetchAiRecommendations();
              }
            }}
          >
            🤖 Рекомендації ШІ
          </button>
          <button
            className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            📜 Хронологія бою
          </button>
        </div>

        <div className="analytics-content">
          {activeTab === 'statistics' && (
            <div className="statistics-view">
              <div className="force-comparison">
                <div className="force-stats blue-force-stats">
                  <h3>🔵 СИНІ СИЛИ</h3>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <span className="stat-label">Активні підрозділи</span>
                      <span className="stat-value">{stats.blueForce.activeUnits}/{stats.blueForce.totalUnits}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Знищено</span>
                      <span className="stat-value danger">{stats.blueForce.destroyedUnits}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Особовий склад</span>
                      <span className="stat-value">{stats.blueForce.personnel}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Техніка</span>
                      <span className="stat-value">{stats.blueForce.vehicles}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Вогнева міць</span>
                      <span className="stat-value">{stats.blueForce.firepower}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Сер. моральний дух</span>
                      <span className={`stat-value ${stats.blueForce.avgMorale < 30 ? 'danger' : stats.blueForce.avgMorale < 60 ? 'warning' : 'success'}`}>
                        {stats.blueForce.avgMorale}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Сер. постачання</span>
                      <span className={`stat-value ${stats.blueForce.avgSupply < 30 ? 'danger' : stats.blueForce.avgSupply < 60 ? 'warning' : 'success'}`}>
                        {stats.blueForce.avgSupply}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="vs-divider">VS</div>

                <div className="force-stats red-force-stats">
                  <h3>🔴 ЧЕРВОНІ СИЛИ</h3>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <span className="stat-label">Активні підрозділи</span>
                      <span className="stat-value">{stats.redForce.activeUnits}/{stats.redForce.totalUnits}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Знищено</span>
                      <span className="stat-value danger">{stats.redForce.destroyedUnits}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Особовий склад</span>
                      <span className="stat-value">{stats.redForce.personnel}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Техніка</span>
                      <span className="stat-value">{stats.redForce.vehicles}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Вогнева міць</span>
                      <span className="stat-value">{stats.redForce.firepower}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Сер. моральний дух</span>
                      <span className={`stat-value ${stats.redForce.avgMorale < 30 ? 'danger' : stats.redForce.avgMorale < 60 ? 'warning' : 'success'}`}>
                        {stats.redForce.avgMorale}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Сер. постачання</span>
                      <span className={`stat-value ${stats.redForce.avgSupply < 30 ? 'danger' : stats.redForce.avgSupply < 60 ? 'warning' : 'success'}`}>
                        {stats.redForce.avgSupply}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="combat-effectiveness">
                <h3>Аналіз бойової ефективності</h3>
                <div className="effectiveness-bars">
                  <div className="effectiveness-item">
                    <span className="label">Сила Синіх</span>
                    <div className="bar-container">
                      <div
                        className="bar blue-bar"
                        style={{ width: `${Math.min(100, (stats.blueForce.firepower / 10))}%` }}
                      ></div>
                    </div>
                    <span className="value">{stats.blueForce.firepower}</span>
                  </div>
                  <div className="effectiveness-item">
                    <span className="label">Сила Червоних</span>
                    <div className="bar-container">
                      <div
                        className="bar red-bar"
                        style={{ width: `${Math.min(100, (stats.redForce.firepower / 10))}%` }}
                      ></div>
                    </div>
                    <span className="value">{stats.redForce.firepower}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="recommendations-view">
              <div className="recommendations-header">
                <h3>🤖 Тактичний аналіз ШІ</h3>
                {!loading && (
                  <button className="refresh-btn" onClick={fetchAiRecommendations}>
                    🔄 Оновити аналіз
                  </button>
                )}
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Аналіз бойової ситуації...</p>
                </div>
              )}

              {!loading && aiRecommendations && (
                <div className="ai-analysis">
                  {aiRecommendations.error ? (
                    <div className="error-message">
                      <p>⚠️ {aiRecommendations.analysis}</p>
                    </div>
                  ) : (
                    <>
                      <div className="analysis-text">
                        <p>{aiRecommendations.analysis}</p>
                      </div>

                      {aiRecommendations.recommendations && aiRecommendations.recommendations.length > 0 && (
                        <div className="recommendations-list">
                          <h4>📋 Рекомендовані дії:</h4>
                          <ul>
                            {aiRecommendations.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiRecommendations.threats && aiRecommendations.threats.length > 0 && (
                        <div className="threats-list">
                          <h4>⚠️ Виявлені загрози:</h4>
                          <ul>
                            {aiRecommendations.threats.map((threat, idx) => (
                              <li key={idx} className="threat-item">{threat}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiRecommendations.opportunities && aiRecommendations.opportunities.length > 0 && (
                        <div className="opportunities-list">
                          <h4>✨ Тактичні можливості:</h4>
                          <ul>
                            {aiRecommendations.opportunities.map((opp, idx) => (
                              <li key={idx} className="opportunity-item">{opp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {!loading && !aiRecommendations && (
                <div className="empty-state">
                  <p>Натисніть "Оновити аналіз" для отримання тактичних рекомендацій на основі ШІ</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="timeline-view">
              <h3>📜 Хронологія бою</h3>
              {battleTimeline.length === 0 ? (
                <div className="empty-timeline">
                  <p>Поки що не зафіксовано значних подій</p>
                </div>
              ) : (
                <div className="timeline-events">
                  {battleTimeline.map((event, idx) => (
                    <div key={idx} className={`timeline-event ${event.severity}`}>
                      <div className="event-time">
                        {new Date(event.time).toLocaleTimeString()}
                      </div>
                      <div className="event-content">
                        <span className={`event-icon ${event.type}`}>
                          {event.type === 'destruction' && '💥'}
                          {event.type === 'combat' && '⚔️'}
                          {event.type === 'movement' && '🚚'}
                          {event.type === 'morale' && '😰'}
                          {event.type === 'supply' && '📦'}
                        </span>
                        <span className="event-message">{event.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleAnalytics;
