import { useState } from 'react';
import authService from '../../services/authService';
import './Auth.css';

function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await authService.login(formData.username, formData.password);
      onLogin(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>MCOTS Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? 
          <button className="link-btn" onClick={onSwitchToRegister}>Register</button>
        </p>
      </div>
    </div>
  );
}

export default Login;