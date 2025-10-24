import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { login, googleLogin } from '../api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      onLogin(response.data);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await googleLogin(credentialResponse.credential);
      onLogin(response.data);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="filled_blue"
          size="large"
          width="100%"
        />
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '1.5rem 0',
        color: '#999'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
        <span style={{ padding: '0 1rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
      </div>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login with Email</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
