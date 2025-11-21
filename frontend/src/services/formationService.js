import { API_BASE_URL } from './api';
import authService from './authService';

const FORMATION_API = `${API_BASE_URL}:8082/api/formations`;

class FormationService {
  getHeaders() {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userInfo?.id || ''
    };
  }

  async createFormation(formationData) {
    try {
      const response = await fetch(FORMATION_API, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(formationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create formation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating formation:', error);
      throw error;
    }
  }

  async getUserFormations() {
    try {
      const response = await fetch(FORMATION_API, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch formations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching formations:', error);
      throw error;
    }
  }

  async getFormation(formationId) {
    try {
      const response = await fetch(`${FORMATION_API}/${formationId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch formation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching formation:', error);
      throw error;
    }
  }

  async getSubordinateUnits(formationId) {
    try {
      const response = await fetch(`${FORMATION_API}/${formationId}/subordinates`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subordinate units');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subordinate units:', error);
      throw error;
    }
  }

  async moveFormation(formationId, newHqPosition) {
    try {
      const response = await fetch(`${FORMATION_API}/${formationId}/move`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(newHqPosition)
      });

      if (!response.ok) {
        throw new Error('Failed to move formation');
      }
    } catch (error) {
      console.error('Error moving formation:', error);
      throw error;
    }
  }

  async deleteFormation(formationId) {
    try {
      const response = await fetch(`${FORMATION_API}/${formationId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete formation');
      }
    } catch (error) {
      console.error('Error deleting formation:', error);
      throw error;
    }
  }
}

export default new FormationService();
