import ApiUrl from '../enums/ApiUrl';

const AUTH_API = ApiUrl.AUTH_SERVICE;

class AuthService {
  getToken() {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || null;
  }

  setToken(token) {
    document.cookie = `token=${token}; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
  }

  removeToken() {
    document.cookie = 'token=; Secure; SameSite=Strict; Path=/; Max-Age=0';
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Sanitize inputs
    const sanitizedUsername = String(username).trim();
    const sanitizedPassword = String(password);
    
    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': 'nocheck'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: sanitizedUsername, 
          password: sanitizedPassword 
        })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      this.setToken(data.token);
      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error occurred');
      }
      throw error;
    }
  }

  async register(username, email, password) {
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
    
    // Sanitize inputs
    const sanitizedUsername = String(username).trim();
    const sanitizedEmail = String(email).trim();
    const sanitizedPassword = String(password);
    
    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': 'nocheck'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: sanitizedUsername, 
          email: sanitizedEmail, 
          password: sanitizedPassword 
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Registration failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error occurred');
      }
      throw error;
    }
  }

  logout() {
    this.removeToken();
  }

  getUserInfo() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.sub,
        role: payload.role
      };
    } catch {
      return null;
    }
  }

  async getProfile() {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${AUTH_API}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error occurred');
      }
      throw error;
    }
  }

  async updateProfile(email) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${AUTH_API}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error occurred');
      }
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${AUTH_API}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to change password');
      }

      return await response.text();
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error occurred');
      }
      throw error;
    }
  }
}

export default new AuthService();