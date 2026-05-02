import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Symptoms() {
  const [symptoms, setSymptoms] = useState('');
  const [checkboxSymptoms, setCheckboxSymptoms] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [followupQuestion, setFollowupQuestion] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('userInfo');
    if (data) {
      setUserInfo(JSON.parse(data));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        symptoms: symptoms,
        checkbox_symptoms: checkboxSymptoms,
        age: age,
        gender: gender,
        patient_name: userInfo ? userInfo.name : 'Unknown'
      };
      const res = await fetch('http://localhost:8000/api/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        sessionStorage.setItem('diagnosticResult', JSON.stringify(data.result));
        navigate('/result');
      } else if (data.status === 'followup') {
        setFollowupQuestion(data.question);
        setSymptoms(symptoms + ' ');
      } else {
        setNotification({ type: 'error', message: 'Analysis failed.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '700px' }}>
      <h2>AI Symptom Checker</h2>
      <p className="subtitle">Describe how you're feeling for a preliminary diagnostic</p>
      
      {userInfo && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
          Patient: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{userInfo.name}</span> | 
          ID: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{userInfo.patient_id}</span>
        </div>
      )}

      {notification && (
        <div className={`notification ${notification.type}`} style={{ display: 'block' }}>
          {notification.message}
        </div>
      )}
      
      <form onSubmit={handleAnalyze}>
        {!followupQuestion && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Patient Age</label>
              <input 
                type="number" 
                className="form-control" 
                required 
                placeholder="E.g., 34"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Patient Gender</label>
              <select 
                className="form-control" 
                required 
                value={gender}
                onChange={e => setGender(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {followupQuestion && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(0,210,255,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.5rem' }}>🤖 AI Follow-up Question:</p>
            <p style={{ color: 'var(--primary)' }}>{followupQuestion}</p>
          </div>
        )}

        {!followupQuestion && (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Select Common Symptoms</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {['Fever', 'Cough', 'Headache', 'Nausea', 'Pain', 'Fatigue', 'Chills'].map(symp => (
                <label key={symp} style={{ color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    value={symp} 
                    onChange={e => {
                      if (e.target.checked) setCheckboxSymptoms([...checkboxSymptoms, symp]);
                      else setCheckboxSymptoms(checkboxSymptoms.filter(item => item !== symp));
                    }} 
                    style={{ marginRight: '0.5rem' }} 
                  />
                  {symp}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>{followupQuestion ? "Please provide more details below:" : "Additional details (Optional)"}</label>
          <textarea  
            className="form-control" 
            required 
            placeholder={followupQuestion ? "Type your response here..." : "E.g., I have been experiencing a mild headache and fever for the past 2 days..."}
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            autoFocus={!!followupQuestion}
          ></textarea>
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Analyzing...' : (followupQuestion ? 'Submit Additional Details' : 'Analyze Symptoms')}
        </button>
      </form>
    </div>
  );
}

export default Symptoms;
