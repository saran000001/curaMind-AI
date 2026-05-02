import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Result() {
  const [result, setResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const uData = sessionStorage.getItem('userInfo');
    if (uData) setUserInfo(JSON.parse(uData));

    const rData = sessionStorage.getItem('diagnosticResult');
    if (rData) {
      setResult(JSON.parse(rData));
    } else {
      navigate('/symptoms');
    }
  }, [navigate]);

  if (!result) return null;

  return (
    <div className="glass-panel" style={{ maxWidth: '700px' }}>
      <h2>Diagnostic Report</h2>
      <p className="subtitle">AI-generated preliminary analysis</p>

      {userInfo && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
          Patient: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{userInfo.name}</span> | 
          ID: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{userInfo.patient_id}</span>
        </div>
      )}
      
      <div className="result-card">
        <div className="result-item">
          <h3>Possible Diagnosis</h3>
          <p style={{ color: 'var(--primary)' }}>{result.diagnosis}</p>
        </div>
        <div className="result-item">
          <h3>AI Confidence Score</h3>
          <p>{result.confidence}</p>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: result.confidence, transition: 'width 1s ease-out' }}
            ></div>
          </div>
        </div>
        <div className="result-item">
          <h3>Recommendation</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{result.recommendation}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/symptoms" className="btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '0.8rem 2rem' }}>
          Run Another Check
        </Link>
      </div>
    </div>
  );
}

export default Result;
