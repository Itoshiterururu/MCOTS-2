import { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthPage({ onAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (userData) => {
    onAuthenticated(userData);
  };

  const handleRegister = (userData) => {
    onAuthenticated(userData);
  };

  return (
    <>
      {isLogin ? (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
}

export default AuthPage;