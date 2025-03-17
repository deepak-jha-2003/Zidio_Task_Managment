import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './UserLogin.css';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/user/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      navigate('/user/dashboard'); // Redirect to the user dashboard
    } catch (err) {
      setError('Invalid Credentials');
    }
  };

  const toggleAdminLogin = () => {
    setShowAdminLogin(!showAdminLogin);
  };

  return (
    <div className="user-login-container">
      <h1>User Login</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="user-login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">Login</button>
      </form>
      <p className="forgot-password-link">
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
      <p className="signup-link">
        Don't have an account? <Link to="/user/signup">Sign Up</Link>
      </p>

      {/* Hidden admin login button */}
      <button onClick={toggleAdminLogin} className="admin-login-button">
        {showAdminLogin ? 'Hide Admin Login' : 'Show Admin Login'}
      </button>

      {/* Admin login form (conditionally rendered) */}
      {showAdminLogin && (
        <div className="admin-login-form">
          <h2>Admin Login</h2>
          <form onSubmit={(e) => { e.preventDefault(); navigate('/admin/login'); }}>
            <button type="submit" className="submit-button">Go to Admin Login</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserLogin;