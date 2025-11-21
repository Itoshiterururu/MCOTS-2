import authService from './authService';

const API_BASE = 'http://localhost:8080/api/v1/map';

class BattleHistoryService {
  async saveBattleResult(battleData) {
    const token = authService.getToken();
    const user = authService.getUserInfo();

    if (!token || !user) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/battle-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          timestamp: new Date().toISOString(),
          ...battleData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save battle result: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving battle result:', error);
      // Fallback to localStorage if backend fails
      this.saveToLocalStorage(battleData, user);
      return { success: true, fallback: true };
    }
  }

  async getBattleHistory() {
    const token = authService.getToken();
    const user = authService.getUserInfo();

    if (!token || !user) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/battle-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id
        }
      });

      if (!response.ok) {
        // If backend fails, load from localStorage
        return this.loadFromLocalStorage(user);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading battle history:', error);
      // Fallback to localStorage
      return this.loadFromLocalStorage(user);
    }
  }

  saveToLocalStorage(battleData, user) {
    const key = `battle_history_${user.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');

    existing.unshift({
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
      ...battleData
    });

    // Keep only last 50 battles
    if (existing.length > 50) {
      existing.splice(50);
    }

    localStorage.setItem(key, JSON.stringify(existing));
  }

  loadFromLocalStorage(user) {
    const key = `battle_history_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  async deleteBattleRecord(battleId) {
    const token = authService.getToken();
    const user = authService.getUserInfo();

    if (!token || !user) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/battle-history/${battleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id
        }
      });

      if (!response.ok) {
        // Fallback to localStorage
        this.deleteFromLocalStorage(battleId, user);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting battle record:', error);
      this.deleteFromLocalStorage(battleId, user);
      return { success: true, fallback: true };
    }
  }

  deleteFromLocalStorage(battleId, user) {
    const key = `battle_history_${user.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(b => b.id !== battleId);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Helper to calculate battle summary
  calculateBattleSummary(units) {
    const blueForce = units.filter(u => u.faction === 'BLUE_FORCE');
    const redForce = units.filter(u => u.faction === 'RED_FORCE');

    const blueDestroyed = blueForce.filter(u => u.status === 'DESTROYED' || u.personnel <= 0).length;
    const redDestroyed = redForce.filter(u => u.status === 'DESTROYED' || u.personnel <= 0).length;

    const blueFirepower = blueForce.reduce((sum, u) => sum + (u.firepower || 0), 0);
    const redFirepower = redForce.reduce((sum, u) => sum + (u.firepower || 0), 0);

    let outcome = 'ONGOING';
    if (blueDestroyed === blueForce.length && blueForce.length > 0) {
      outcome = 'RED_VICTORY';
    } else if (redDestroyed === redForce.length && redForce.length > 0) {
      outcome = 'BLUE_VICTORY';
    } else if (blueDestroyed === 0 && redDestroyed > 0) {
      outcome = 'BLUE_ADVANTAGE';
    } else if (redDestroyed === 0 && blueDestroyed > 0) {
      outcome = 'RED_ADVANTAGE';
    } else if (blueFirepower > redFirepower * 1.5) {
      outcome = 'BLUE_ADVANTAGE';
    } else if (redFirepower > blueFirepower * 1.5) {
      outcome = 'RED_ADVANTAGE';
    }

    return {
      outcome,
      blueForce: {
        totalUnits: blueForce.length,
        destroyedUnits: blueDestroyed,
        totalFirepower: blueFirepower,
        totalPersonnel: blueForce.reduce((sum, u) => sum + (u.personnel || 0), 0)
      },
      redForce: {
        totalUnits: redForce.length,
        destroyedUnits: redDestroyed,
        totalFirepower: redFirepower,
        totalPersonnel: redForce.reduce((sum, u) => sum + (u.personnel || 0), 0)
      }
    };
  }
}

export default new BattleHistoryService();
