import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import battleHistoryService from '../../services/battleHistoryService';
import '../../styles/components/Account.css';

const UserAccount = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [battleHistory, setBattleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Profile form
  const [email, setEmail] = useState('');
  const [emailEditing, setEmailEditing] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    showCommsOverlay: localStorage.getItem('showCommsOverlay') !== 'false',
    autoRefreshUnits: localStorage.getItem('autoRefreshUnits') !== 'false',
    soundEnabled: localStorage.getItem('soundEnabled') === 'true'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadBattleHistory();
    }
  }, [activeTab]);

  const loadBattleHistory = async () => {
    try {
      setHistoryLoading(true);
      const history = await battleHistoryService.getBattleHistory();
      setBattleHistory(history);
    } catch (err) {
      console.error('Failed to load battle history:', err);
      setBattleHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async (battleId) => {
    try {
      await battleHistoryService.deleteBattleRecord(battleId);
      setBattleHistory(prev => prev.filter(b => b.id !== battleId));
      setSuccess('Запис бою видалено');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Не вдалося видалити запис');
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setEmail(data.email);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await authService.updateProfile(email);
      setProfile(updatedProfile);
      setEmailEditing(false);
      setSuccess('Email updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value.toString());

    // Apply theme immediately
    if (key === 'theme') {
      document.body.setAttribute('data-theme', value);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-badge admin';
      case 'OPERATOR': return 'role-badge operator';
      default: return 'role-badge viewer';
    }
  };

  return (
    <div className="account-overlay">
      <div className="account-modal">
        <div className="account-header">
          <h2>👤 Account Settings</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="account-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Профіль
          </button>
          <button
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Безпека
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Налаштування
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            📜 Історія боїв
          </button>
        </div>

        <div className="account-content">
          {loading ? (
            <div className="loading">Loading profile...</div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && profile && (
                <div className="profile-tab">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="profile-info">
                    <div className="info-row">
                      <label>Username</label>
                      <div className="info-value">{profile.username}</div>
                    </div>

                    <div className="info-row">
                      <label>Email</label>
                      {emailEditing ? (
                        <form onSubmit={handleUpdateEmail} className="email-form">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <div className="form-buttons">
                            <button type="submit" className="btn-save">Save</button>
                            <button
                              type="button"
                              className="btn-cancel"
                              onClick={() => {
                                setEmailEditing(false);
                                setEmail(profile.email);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="info-value editable" onClick={() => setEmailEditing(true)}>
                          {profile.email}
                          <span className="edit-icon">✏️</span>
                        </div>
                      )}
                    </div>

                    <div className="info-row">
                      <label>Role</label>
                      <div className="info-value">
                        <span className={getRoleBadgeClass(profile.role)}>
                          {profile.role}
                        </span>
                      </div>
                    </div>

                    <div className="info-row">
                      <label>User ID</label>
                      <div className="info-value id">{profile.id}</div>
                    </div>

                    <div className="info-row">
                      <label>Account Created</label>
                      <div className="info-value">{formatDate(profile.createdAt)}</div>
                    </div>

                    <div className="info-row">
                      <label>Status</label>
                      <div className="info-value">
                        <span className={`status-badge ${profile.enabled ? 'active' : 'disabled'}`}>
                          {profile.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="security-tab">
                  <h3>Change Password</h3>
                  <form onSubmit={handleChangePassword} className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button type="submit" className="btn-primary">
                      Update Password
                    </button>
                  </form>

                  <div className="security-info">
                    <h4>Security Tips</h4>
                    <ul>
                      <li>Use a strong password with letters, numbers, and symbols</li>
                      <li>Don't reuse passwords from other sites</li>
                      <li>Change your password regularly</li>
                      <li>Never share your password with anyone</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="settings-tab">
                  <h3>Application Settings</h3>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Theme</label>
                      <span className="setting-description">Choose your preferred color scheme</span>
                    </div>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <option value="dark">Dark Theme</option>
                      <option value="light">Light Theme</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Show Communications Overlay</label>
                      <span className="setting-description">Display comms coverage on map by default</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.showCommsOverlay}
                        onChange={(e) => handleSettingChange('showCommsOverlay', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Auto-refresh Units</label>
                      <span className="setting-description">Automatically update unit positions</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.autoRefreshUnits}
                        onChange={(e) => handleSettingChange('autoRefreshUnits', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Sound Effects</label>
                      <span className="setting-description">Enable audio notifications</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="settings-actions">
                    <button
                      className="btn-reset"
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Reset All Settings
                    </button>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="history-tab">
                  <div className="history-header">
                    <h3>📜 Історія боїв</h3>
                    <button className="btn-refresh" onClick={loadBattleHistory}>
                      🔄 Оновити
                    </button>
                  </div>

                  {historyLoading ? (
                    <div className="loading">Завантаження історії...</div>
                  ) : battleHistory.length === 0 ? (
                    <div className="empty-history">
                      <p>Історія боїв порожня</p>
                      <p className="hint">Збережіть результати бою після завершення симуляції</p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {battleHistory.map((battle, idx) => (
                        <div key={battle.id || idx} className="battle-record">
                          <div className="battle-header">
                            <div className="battle-date">
                              {new Date(battle.timestamp).toLocaleString('uk-UA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <button
                              className="btn-delete-history"
                              onClick={() => handleDeleteHistory(battle.id)}
                              title="Видалити"
                            >
                              🗑️
                            </button>
                          </div>

                          {battle.outcome && (
                            <div className={`battle-outcome ${battle.outcome.toLowerCase()}`}>
                              {battle.outcome === 'BLUE_VICTORY' && '🔵 Перемога Синіх сил'}
                              {battle.outcome === 'RED_VICTORY' && '🔴 Перемога Червоних сил'}
                              {battle.outcome === 'BLUE_ADVANTAGE' && '🔵 Перевага Синіх сил'}
                              {battle.outcome === 'RED_ADVANTAGE' && '🔴 Перевага Червоних сил'}
                              {battle.outcome === 'ONGOING' && '⚔️ Бій триває'}
                            </div>
                          )}

                          <div className="battle-stats">
                            <div className="force-summary blue">
                              <h4>🔵 Сині сили</h4>
                              <div className="stat-row">
                                <span>Підрозділи:</span>
                                <span>{battle.blueForce?.totalUnits || 0}</span>
                              </div>
                              <div className="stat-row">
                                <span>Знищено:</span>
                                <span className="casualties">{battle.blueForce?.destroyedUnits || 0}</span>
                              </div>
                              <div className="stat-row">
                                <span>Особовий склад:</span>
                                <span>{battle.blueForce?.totalPersonnel || 0}</span>
                              </div>
                              <div className="stat-row">
                                <span>Вогнева міць:</span>
                                <span>{battle.blueForce?.totalFirepower || 0}</span>
                              </div>
                            </div>

                            <div className="force-summary red">
                              <h4>🔴 Червоні сили</h4>
                              <div className="stat-row">
                                <span>Підрозділи:</span>
                                <span>{battle.redForce?.totalUnits || 0}</span>
                              </div>
                              <div className="stat-row">
                                <span>Знищено:</span>
                                <span className="casualties">{battle.redForce?.destroyedUnits || 0}</span>
                              </div>
                              <div className="stat-row">
                                <span>Особовий склад:</span>
                                <span>{battle.redForce?.totalPersonnel || 0}</span>
                              </div>
                              <div className="stat-row">
                                <span>Вогнева міць:</span>
                                <span>{battle.redForce?.totalFirepower || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
