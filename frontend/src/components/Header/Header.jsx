import authService from '../../services/authService';
import './Header.css';

function Header({ user, onLogout, onOpenScriptManager, onOpenAccount, onOpenReplayManager, onToggleBattleStats, onOpenAnalytics, showBattleStats }) {
  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <header className="app-header">
      <h1>MCOTS</h1>
      <div className="header-actions">
        <button onClick={onToggleBattleStats} className={`stats-toggle-btn ${showBattleStats ? 'active' : ''}`}>
          📊 {showBattleStats ? 'Приховати' : 'Показати'} статистику
        </button>
        <button onClick={onOpenAnalytics} className="analytics-btn">
          ⚔️ Бойова аналітика
        </button>
        <button onClick={onOpenScriptManager} className="script-manager-btn">
          🎭 Менеджер сценаріїв
        </button>
        <button onClick={onOpenReplayManager} className="replay-manager-btn">
          📹 Повтори боїв
        </button>
      </div>
      <div className="user-info">
        <button onClick={onOpenAccount} className="account-btn">
          👤 {user?.username}
        </button>
        <button onClick={handleLogout} className="logout-btn">Вийти</button>
      </div>
    </header>
  );
}

export default Header;