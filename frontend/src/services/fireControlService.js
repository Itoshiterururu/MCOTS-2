import { API_BASE_URL } from './api';
import authService from './authService';

const FIRE_CONTROL_API = `${API_BASE_URL}:8082/api/fire-control`;

class FireControlService {
  getHeaders() {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userInfo?.id || ''
    };
  }

  // Field of Fire methods
  async setFieldOfFire(unitId, fieldOfFire) {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/units/${unitId}/field-of-fire`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(fieldOfFire)
      });

      if (!response.ok) {
        throw new Error('Failed to set field of fire');
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting field of fire:', error);
      throw error;
    }
  }

  async clearFieldOfFire(unitId) {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/units/${unitId}/field-of-fire`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to clear field of fire');
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing field of fire:', error);
      throw error;
    }
  }

  // Fire Mission methods
  async createFireMission(mission) {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/fire-missions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(mission)
      });

      if (!response.ok) {
        throw new Error('Failed to create fire mission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating fire mission:', error);
      throw error;
    }
  }

  async getUserFireMissions() {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/fire-missions`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fire missions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire missions:', error);
      throw error;
    }
  }

  async getFireMission(missionId) {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/fire-missions/${missionId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fire mission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire mission:', error);
      throw error;
    }
  }

  async updateFireMissionStatus(missionId, status) {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/fire-missions/${missionId}/status?status=${status}`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to update fire mission status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fire mission status:', error);
      throw error;
    }
  }

  async deleteFireMission(missionId) {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/fire-missions/${missionId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete fire mission');
      }
    } catch (error) {
      console.error('Error deleting fire mission:', error);
      throw error;
    }
  }

  async getActiveFireMissions() {
    try {
      const response = await fetch(`${FIRE_CONTROL_API}/fire-missions/active`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active fire missions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active fire missions:', error);
      throw error;
    }
  }
}

export default new FireControlService();
