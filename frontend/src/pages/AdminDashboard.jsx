import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ userCount: 0, resumeCount: 0 });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div>
      <h1>Platform Administration</h1>
      
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Users size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.userCount}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Registered Users</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <FileText size={32} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.resumeCount}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Processed Resumes</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Activity size={32} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Active</h2>
          <p style={{ color: 'var(--text-muted)' }}>System Status</p>
        </div>
      </div>

      <div className="glass-panel">
        <h3>Recent System Activity</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No critical alerts in the last 24 hours. The ML engine is processing resumes with an average latency of 120ms.</p>
        <button className="btn-outline" style={{ marginTop: '1.5rem' }}>View Full Audit Log</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
