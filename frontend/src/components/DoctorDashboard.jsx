import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DoctorDashboard() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('records');
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('userInfo');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.role !== 'Doctor') {
        navigate('/dashboard');
      } else {
        setUserInfo(parsed);
        fetchRecords();
        fetchUsers();
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchRecords = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/records/');
      const data = await res.json();
      if (data.status === 'success') {
        setRecords(data.records);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/users/');
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDiagnosis = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/records/${id}/confirm/`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="glass-panel" style={{ maxWidth: '900px', width: '100%' }}>
      <h2>Doctor Dashboard</h2>
      <p className="subtitle">Dr. {userInfo.name} | Admin Panel</p>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{users.length}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Total Patients</p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{records.length}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Total Reports</p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'orange' }}>{records.filter(r => r.status !== 'Confirmed by Doctor').length}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Pending Reviews</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('records')} className="btn" style={{ background: activeTab === 'records' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>Diagnosis Reports</button>
        <button onClick={() => setActiveTab('users')} className="btn" style={{ background: activeTab === 'users' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>Registered Patients</button>
      </div>

      {activeTab === 'records' && (
        <>
          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No pending records to review right now.
            </div>
          ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map(r => (
            <div key={r.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--text-main)' }}>Patient: {r.patient_name}</h3>
                <span style={{ 
                  background: r.status === 'Confirmed by Doctor' ? 'rgba(75, 255, 125, 0.2)' : 'rgba(255, 165, 0, 0.2)', 
                  color: r.status === 'Confirmed by Doctor' ? '#4bff7d' : 'orange', 
                  padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>
                  {r.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Symptoms:</p>
              <p style={{ marginBottom: '1rem' }}>"{r.symptoms}"</p>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>AI Prediction & Severity:</p>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1.5rem' }}>{r.ai_prediction} | <span style={{ color: r.severity === 'High' ? '#ff4b4b' : r.severity === 'Medium' ? 'orange' : '#4bff7d' }}>{r.severity}</span></p>
              
              {r.status !== 'Confirmed by Doctor' && (
                <button onClick={() => confirmDiagnosis(r.id)} className="btn" style={{ padding: '0.6rem 1.5rem', width: 'auto' }}>
                  Confirm Diagnosis
                </button>
              )}
            </div>
          ))}
        </div>
          )}
        </>
      )}

      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((u, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <p><strong>Name:</strong> {u.name} ({u.patient_id})</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email: {u.email} | Phone: {u.phone} | DOB: {u.dob}</p>
            </div>
          ))}
        </div>
      )}

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

export default DoctorDashboard;
