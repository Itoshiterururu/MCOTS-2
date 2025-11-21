import { API_BASE_URL } from './api';
import authService from './authService';

const REPLAY_API = `${API_BASE_URL}:8082/api/replays`;

class ReplayService {
  getHeaders() {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userInfo?.id || ''
    };
  }

  async startRecording(battleName, description = '') {
    try {
      const response = await fetch(`${REPLAY_API}/start`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ battleName, description })
      });

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      const response = await fetch(`${REPLAY_API}/stop`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to stop recording');
      }

      return await response.json();
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  async recordEvent(event) {
    try {
      const response = await fetch(`${REPLAY_API}/event`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        console.error('Failed to record event');
      }
    } catch (error) {
      console.error('Error recording event:', error);
    }
  }

  async captureSnapshot() {
    try {
      const response = await fetch(`${REPLAY_API}/snapshot`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('Failed to capture snapshot');
      }
    } catch (error) {
      console.error('Error capturing snapshot:', error);
    }
  }

  async getUserReplays() {
    try {
      const response = await fetch(REPLAY_API, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch replays');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replays:', error);
      throw error;
    }
  }

  async getReplay(replayId) {
    try {
      const response = await fetch(`${REPLAY_API}/${replayId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch replay');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replay:', error);
      throw error;
    }
  }

  async deleteReplay(replayId) {
    try {
      const response = await fetch(`${REPLAY_API}/${replayId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete replay');
      }
    } catch (error) {
      console.error('Error deleting replay:', error);
      throw error;
    }
  }
}

export default new ReplayService();
