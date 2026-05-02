import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function PastRecords() {
  const [records, setRecords] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('userInfo');
    if (data) {
      const parsed = JSON.parse(data);
      setUserInfo(parsed);
      fetchPatientRecords(parsed.name);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchPatientRecords = async (patientName) => {
    try {
      const res = await fetch(`http://localhost:8000/api/records/patient/${patientName}/`);
      const data = await res.json();
      if (data.status === 'success') {
        setRecords(data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', width: '100%' }}>
      <h2>Past Records</h2>
      <p className="subtitle">Your diagnostic history</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading records...
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          You don't have any past diagnostic records yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map(r => (
            <div key={r.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Date: {r.created_at}</h3>
                <span style={{ 
                  background: r.status === 'Confirmed by Doctor' ? 'rgba(75, 255, 125, 0.2)' : 'rgba(255, 165, 0, 0.2)', 
                  color: r.status === 'Confirmed by Doctor' ? '#4bff7d' : 'orange', 
                  padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>
                  {r.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Symptoms Reported:</p>
              <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>"{r.symptoms}"</p>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>AI Prediction & Severity:</p>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{r.ai_prediction} | <span style={{ color: r.severity === 'High' ? '#ff4b4b' : r.severity === 'Medium' ? 'orange' : '#4bff7d' }}>{r.severity}</span></p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/dashboard" className="btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '0.8rem 2rem' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default PastRecords;
