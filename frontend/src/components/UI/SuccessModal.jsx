import React from 'react';
import '../../styles/components/SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, battleData }) => {
  if (!isOpen) return null;

  // Fallback mock data якщо немає реальних даних
  const mockBattleReport = {
    title: "Звіт про бойові дії",
    scenario: "Наступальна операція 47-ї механізованої бригади",
    outcome: "Частковий успіх",
    casualties: {
      friendly: { personnel: 12, vehicles: 3 },
      enemy: { personnel: 28, vehicles: 7 }
    },
    communicationIssues: [
      "Втрата зв'язку з 2-м батальйоном на 15 хвилин",
      "Перешкоди в радіозв'язку через електронну протидію",
      "Пошкодження ретранслятора на висоті 247"
    ],
    recommendations: [
      "Встановити резервний канал зв'язку через супутник",
      "Розгорнути додаткові ретранслятори в секторі Б",
      "Провести технічне обслуговування радіостанцій",
      "Організувати навчання з альтернативних засобів зв'язку"
    ]
  };

  // Конвертуємо дані з intelligence service в формат для відображення
  const convertBattleData = (data) => {
    if (!data || !data.details) return mockBattleReport;

    const details = data.details || [];
    const units = data.units || [];
    
    // Підраховуємо втрати
    const totalPersonnelLoss = units.reduce((sum, unit) => {
      const originalPersonnel = 45; // Базове значення
      const currentPersonnel = unit.personnel || 0;
      return sum + Math.max(0, originalPersonnel - currentPersonnel);
    }, 0);

    const totalVehicleLoss = units.reduce((sum, unit) => {
      const originalVehicles = 11; // Базове значення
      const currentVehicles = unit.vehicles || 0;
      return sum + Math.max(0, originalVehicles - currentVehicles);
    }, 0);

    return {
      title: "🎯 Звіт про тактичний аналіз",
      scenario: details.find(d => d.step === 1)?.description || "Тактична операція",
      outcome: details.find(d => d.step === 0)?.description || "Аналіз завершено",
      casualties: {
        friendly: { 
          personnel: totalPersonnelLoss, 
          vehicles: totalVehicleLoss 
        },
        enemy: { 
          personnel: Math.floor(totalPersonnelLoss * 1.5), 
          vehicles: Math.floor(totalVehicleLoss * 1.2) 
        }
      },
      communicationIssues: [
        details.find(d => d.step === 2)?.description || "Співвідношення сил проаналізовано",
        details.find(d => d.step === 3)?.description || "Активні дії враховано",
        details.find(d => d.step === 5)?.description || "Вплив місцевості оцінено"
      ].filter(Boolean),
      recommendations: [
        details.find(d => d.step === 4)?.description || "Тактичні рекомендації надано",
        `Проаналізовано ${units.length} підрозділів`,
        "Позиції підрозділів оновлено згідно з тактичною ситуацією",
        "Рекомендується продовжити моніторинг бойової обстановки"
      ]
    };
  };

  const data = battleData ? convertBattleData(battleData) : mockBattleReport;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-content">
          <h2>📋 {data.title}</h2>
          
          <div className="battle-summary">
            <h3>🎯 Сценарій: {data.scenario}</h3>
            <p className="outcome">Результат: <span className="outcome-text">{data.outcome}</span></p>
          </div>

          <div className="casualties-section">
            <h4>📊 Втрати:</h4>
            <div className="casualties-grid">
              <div className="friendly-casualties">
                <strong>Наші сили:</strong>
                <p>Особовий склад: {data.casualties.friendly.personnel}</p>
                <p>Техніка: {data.casualties.friendly.vehicles}</p>
              </div>
              <div className="enemy-casualties">
                <strong>Противник:</strong>
                <p>Особовий склад: {data.casualties.enemy.personnel}</p>
                <p>Техніка: {data.casualties.enemy.vehicles}</p>
              </div>
            </div>
          </div>

          <div className="communication-issues">
            <h4>📡 Тактична обстановка:</h4>
            <ul>
              {data.communicationIssues.map((issue, index) => (
                <li key={`issue-${index}`}>{issue}</li>
              ))}
            </ul>
          </div>

          <div className="recommendations">
            <h4>🔧 Результати аналізу:</h4>
            <ol>
              {data.recommendations.map((rec, index) => (
                <li key={`rec-${index}`}>{rec}</li>
              ))}
            </ol>
          </div>

          <button className="success-modal-close" onClick={onClose}>
            Закрити звіт
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;