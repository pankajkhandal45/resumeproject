import React, { useState } from 'react';
import { Award, Hash } from 'lucide-react';

const IssuerDashboard = () => {
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [generatedHash, setGeneratedHash] = useState('');

  const handleIssue = (e) => {
    e.preventDefault();
    // Simulate hash generation
    const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setGeneratedHash(mockHash);
  };

  return (
    <div>
      <h1>Issuer Portal (University)</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Issue verifiable credentials to the blockchain.</p>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <h3>Issue New Certificate</h3>
          <form onSubmit={handleIssue} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course / Degree</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              <Award size={20} /> Generate & Register Hash
            </button>
          </form>
        </div>

        <div className="glass-panel">
          <h3>Generated Credentials</h3>
          {generatedHash ? (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '500' }}>Successfully registered to Blockchain!</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  <Hash size={16} color="var(--text-muted)" />
                  <span style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>{generatedHash}</span>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Share this hash with {studentName} so they can link it to their profile.</p>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No certificates issued yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;
