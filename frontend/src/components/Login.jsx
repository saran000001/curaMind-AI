import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        sessionStorage.setItem('userInfo', JSON.stringify(data.user));
        setNotification({ type: 'success', message: 'Login successful! Redirecting...' });
        if (data.user.role === 'Doctor') {
          setTimeout(() => navigate('/doctor-dashboard'), 1000);
        } else {
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      } else {
        setNotification({ type: 'error', message: data.message });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error occurred.' });
    }
  };

  return (
    <div className="glass-panel">
      <h2>Welcome Back</h2>
      <p className="subtitle">Secure portal access for patients and providers</p>
      
      {notification && (
        <div className={`notification ${notification.type}`} style={{ display: 'block' }}>
          {notification.message}
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            required 
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            className="form-control" 
            required 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn">Sign In</button>
      </form>
      
      <div className="auth-link">
        Don't have an account? <Link to="/register">Create one now</Link>
      </div>
    </div>
  );
}

export default Login;
