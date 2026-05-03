import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', dob: '', phone: '', email: '', password: '', role: 'Patient'
  });
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setNotification({ type: 'success', message: data.message });
        setTimeout(() => navigate('/'), 2500);
      } else {
        setNotification({ type: 'error', message: data.message });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error occurred.' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-panel">
      <h2>Create Account</h2>
      <p className="subtitle">Join our HIPAA compliant telehealth platform</p>
      
      {notification && (
        <div className={`notification ${notification.type}`} style={{ display: 'block' }}>
          {notification.message}
        </div>
      )}
      
      <form onSubmit={handleRegister}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>I am a:</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <label style={{ color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="radio" name="role" value="Patient" checked={formData.role === 'Patient'} onChange={handleChange} style={{ marginRight: '0.5rem' }} />
              Patient
            </label>
            <label style={{ color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="radio" name="role" value="Doctor" checked={formData.role === 'Doctor'} onChange={handleChange} style={{ marginRight: '0.5rem' }} />
              Doctor
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" className="form-control" required placeholder="John Doe" onChange={handleChange} />
        </div>
        
        {formData.role === 'Patient' && (
          <>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" className="form-control" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="form-control" required placeholder="+1 234 567 8900" onChange={handleChange} />
            </div>
          </>
        )}
        
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" className="form-control" required placeholder="name@example.com" onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" className="form-control" required placeholder="Create a strong password" onChange={handleChange} />
        </div>
        <button type="submit" className="btn">Register</button>
      </form>
      
      <div className="auth-link">
        Already have an account? <Link to="/">Sign In</Link>
      </div>
    </div>
  );
}

export default Register;
