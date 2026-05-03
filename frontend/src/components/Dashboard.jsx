import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('userInfo');
    if (data) {
      setUserInfo(JSON.parse(data));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!userInfo) return null;

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', width: '100%' }}>
      <h2>Patient Dashboard</h2>
      <p className="subtitle">Welcome to your health portal</p>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
        <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{userInfo.name}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Patient ID</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{userInfo.patient_id}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(58, 123, 213, 0.1))', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0, 210, 255, 0.3)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>AI Symptom Checker</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Experience our intelligent diagnostic tool.</p>
          <Link to="/symptoms" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Start New Diagnosis</Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Past Records</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>View your past AI diagnoses and doctor notes.</p>
          <Link to="/past-records" className="btn" style={{ background: 'rgba(255,255,255,0.1)', textDecoration: 'none', display: 'inline-block' }}>View History</Link>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={() => { sessionStorage.removeItem('userInfo'); navigate('/'); }} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
