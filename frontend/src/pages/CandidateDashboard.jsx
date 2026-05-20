import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  FileText, CheckCircle, AlertTriangle, UploadCloud,
  Trash2, Eye, X, Cpu, Shield, Star, BookOpen,
  Phone, Mail, Link, Code, Clock, BarChart2, ChevronDown, ChevronUp
} from 'lucide-react';

// ── helpers ─────────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 75 ? 'var(--success)' : s >= 45 ? 'var(--warning)' : 'var(--danger)';

const ScoreRing = ({ score, label, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{
      width: 90, height: 90, borderRadius: '50%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `conic-gradient(${color || scoreColor(score)} ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
    }}>
      <div style={{
        position: 'absolute', inset: 8, borderRadius: '50%',
        background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: color || scoreColor(score) }}>{score}</span>
      </div>
    </div>
    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
  </div>
);

const Badge = ({ text, color = 'var(--primary)' }) => (
  <span style={{
    background: `${color}22`, border: `1px solid ${color}55`,
    color, padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500,
    display: 'inline-block',
  }}>{text}</span>
);

const ContactIcon = ({ ok, Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6,
    color: ok ? 'var(--success)' : 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>
    <Icon size={14} />
    <span>{label}</span>
  </div>
);

// ── Category colors ──────────────────────────────────────────────────────────
const CAT_COLORS = {
  Languages:    '#818cf8',
  Frontend:     '#22d3ee',
  Backend:      '#34d399',
  Database:     '#fb923c',
  'Cloud/DevOps':'#a78bfa',
  'AI/ML':      '#f472b6',
  Blockchain:   '#fbbf24',
  Mobile:       '#60a5fa',
  Tools:        '#94a3b8',
  General:      '#64748b',
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ resume, onClose }) => {
  const ci = resume.contactInfo || {};
  const byCat = resume.skillsByCategory || {};
  const [showText, setShowText] = useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{
        background: 'linear-gradient(135deg,rgba(20,27,45,0.98),rgba(10,15,28,0.98))',
        border: '1px solid var(--glass-border)', borderRadius: 20,
        maxWidth: 780, width: '100%', maxHeight: '92vh', overflowY: 'auto',
        padding: '2rem', boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Resume Analysis Report</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {new Date(resume.createdAt).toLocaleString()} &nbsp;·&nbsp;
              {resume.wordCount} words &nbsp;·&nbsp;
              <span style={{ color: resume.mlOnline ? 'var(--success)' : 'var(--warning)' }}>
                {resume.analysisDepth}
              </span>
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
            color: 'white', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}><X size={16} /> Close</button>
        </div>

        {/* Score Row */}
        <div style={{
          display: 'flex', gap: '1.5rem', justifyContent: 'center',
          padding: '1.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: 14,
          marginBottom: '1.5rem', flexWrap: 'wrap',
        }}>
          <ScoreRing score={resume.trustScore}        label="Trust Score"    />
          <ScoreRing score={resume.confidenceScore}   label="AI Confidence" color="var(--accent)" />
          <ScoreRing score={resume.completenessScore} label="Completeness"  color="var(--warning)" />
        </div>

        {/* Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Contact */}
          <div style={{ padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contact Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ContactIcon ok={ci.email}    Icon={Mail}     label="Email" />
              <ContactIcon ok={ci.phone}    Icon={Phone}    label="Phone" />
              <ContactIcon ok={ci.linkedin} Icon={Link} label="LinkedIn" />
              <ContactIcon ok={ci.github}   Icon={Code}   label="GitHub" />
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Profile Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                <span>{resume.experienceYears != null ? `${resume.experienceYears} yrs` : 'Not specified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Education</span>
                <span>{resume.education?.length > 0 ? resume.education.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') : 'Not found'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Blockchain</span>
                <span style={{ color: resume.blockchainVerified ? 'var(--success)' : 'var(--text-muted)' }}>
                  {resume.blockchainVerified ? '✓ Verified' : 'Unverified'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Sections: </span>
                {resume.sectionsFound?.length > 0
                  ? resume.sectionsFound.map(s => <Badge key={s} text={s} color="#64748b" />)
                  : <span style={{ color: 'var(--text-muted)' }}>None detected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Skills by Category */}
        {Object.keys(byCat).length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Skills by Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(byCat).map(([cat, skills]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ minWidth: 100, fontSize: '0.8rem', color: CAT_COLORS[cat] || '#94a3b8', fontWeight: 600, paddingTop: 3 }}>{cat}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {skills.map(s => <Badge key={s} text={s} color={CAT_COLORS[cat] || '#94a3b8'} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flags */}
        {resume.flags?.length > 0 && (
          <div style={{ padding: '1rem 1.2rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '0.6rem', fontSize: '0.9rem' }}>⚠ Risk Flags</h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {resume.flags.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {/* Resume Text (collapsible) */}
        <div style={{ borderRadius: 12, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <button onClick={() => setShowText(p => !p)} style={{
            width: '100%', padding: '0.75rem 1.2rem', background: 'rgba(255,255,255,0.04)',
            border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem',
          }}>
            <span>Resume Text</span>
            {showText ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showText && (
            <div style={{ padding: '1rem 1.2rem', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)' }}>
              {resume.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CandidateDashboard = () => {
  const [resumeText, setResumeText]       = useState('');
  const [certHash, setCertHash]           = useState('');
  const [resumes, setResumes]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [toast, setToast]                 = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchMyResumes(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMyResumes = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/resume/my-resume', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResumes(res.data);
    } catch (err) { 
      console.error('Fetch resumes error:', err);
      showToast('Failed to load resumes', 'error'); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return showToast('Please paste your resume text', 'error');
    setLoading(true);
    try {
      await axios.post(
        'http://127.0.0.1:5000/api/resume/upload',
        { text: resumeText, certificateHashes: certHash ? [certHash] : [] },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setResumeText('');
      setCertHash('');
      showToast('Resume analyzed successfully!');
      fetchMyResumes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume submission?')) return;
    
    // Optimistic UI Update
    const originalResumes = [...resumes];
    setResumes(resumes.filter(r => r._id !== id));

    try {
      await axios.delete(`http://127.0.0.1:5000/api/resume/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      showToast('Resume deleted successfully');
    } catch (err) { 
      console.error('Delete error:', err);
      setResumes(originalResumes); // Revert on failure
      showToast(err.response?.data?.message || 'Delete failed', 'error'); 
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 500, fontSize: '0.9rem',
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
          color: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>{toast.msg}</div>
      )}

      <h1 style={{ marginBottom: '0.25rem' }}>Candidate Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong> — paste your resume below for AI analysis
      </p>

      <div className="grid grid-cols-2">
        {/* ── Upload Form ───────────────────────────────────────────── */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Cpu size={20} style={{ color: 'var(--accent)' }} />
            AI Resume Analysis
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Paste Resume Text *</label>
              <textarea
                className="form-input"
                rows={10}
                required
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder={`Paste your full resume here...\n\nExample:\nJohn Doe | john@email.com | LinkedIn | GitHub\n\nExperience: 3 years of experience in Full Stack Development\nSkills: Python, React, Node.js, MongoDB, Docker\n\nEducation: B.Tech Computer Science\n\nProjects: Built an e-commerce platform using React and Node.js...`}
                style={{ resize: 'vertical', minHeight: 200 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Shield size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--accent)' }} />
                Blockchain Certificate Hash (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                value={certHash}
                onChange={e => setCertHash(e.target.value)}
                placeholder="0x1a2b3c... (from your university issuer)"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Adding a verified hash boosts your Trust Score by +40 points
              </small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem' }}>
              {loading
                ? <><span className="spinner" /> Analyzing with AI...</>
                : <><UploadCloud size={18} /> Analyze Resume</>}
            </button>
          </form>

          {/* Tips */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(6,182,212,0.06)', borderRadius: 10, border: '1px solid rgba(6,182,212,0.2)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>💡 Tips for High Score</h4>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Include your email, phone, LinkedIn, GitHub</li>
              <li>Add proper sections: Experience, Education, Projects, Skills</li>
              <li>List specific technologies (Python, React, Docker etc.)</li>
              <li>Add a verified blockchain certificate hash for max trust</li>
            </ul>
          </div>
        </div>

        {/* ── Submissions List ──────────────────────────────────────── */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary)' }} />
            Your Submissions
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: 'rgba(79,70,229,0.2)', border: '1px solid var(--primary)', borderRadius: 20, padding: '2px 10px', color: 'var(--primary)' }}>
              {resumes.length}
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {resumes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>No submissions yet</p>
                <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Paste your resume and click Analyze</p>
              </div>
            ) : (
              resumes.map(r => {
                const ci = r.contactInfo || {};
                const byCat = r.skillsByCategory || {};
                return (
                  <div key={r._id} style={{
                    padding: '1.2rem', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    transition: 'border-color 0.2s',
                  }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={15} style={{ color: 'var(--primary)' }} />
                          Resume Submission
                          {r.blockchainVerified && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 10, padding: '1px 8px' }}>
                              ✓ Blockchain
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span><Clock size={11} style={{ display:'inline' }} /> {new Date(r.createdAt).toLocaleDateString()}</span>
                          <span>· {r.wordCount || 0} words</span>
                          {r.experienceYears && <span>· {r.experienceYears} yrs exp</span>}
                        </div>
                      </div>
                      {/* Mini score */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: scoreColor(r.trustScore) }}>{r.trustScore}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Trust</div>
                      </div>
                    </div>

                    {/* Score bars */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'AI Conf', val: r.confidenceScore, color: 'var(--accent)' },
                        { label: 'Complete', val: r.completenessScore, color: 'var(--warning)' },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                            <span>{label}</span><span style={{ color }}>{val}%</span>
                          </div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Skills preview */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {Object.entries(byCat).slice(0, 3).flatMap(([cat, skills]) =>
                        skills.slice(0, 2).map(s => <Badge key={s} text={s} color={CAT_COLORS[cat] || '#94a3b8'} />)
                      )}
                      {r.skills.length > 6 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{r.skills.length - 6} more</span>
                      )}
                    </div>

                    {/* Contact dots */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                      <ContactIcon ok={ci.email} Icon={Mail} label="Email" />
                      <ContactIcon ok={ci.phone} Icon={Phone} label="Phone" />
                      <ContactIcon ok={ci.linkedin} Icon={Link} label="LinkedIn" />
                      <ContactIcon ok={ci.github} Icon={Code} label="GitHub" />
                    </div>

                    {/* Flags preview */}
                    {r.flags?.length > 0 && (
                      <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--danger)' }}>
                        <AlertTriangle size={12} style={{ display: 'inline', marginRight: 5 }} />
                        {r.flags.length} risk flag{r.flags.length > 1 ? 's' : ''} detected
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button className="btn-outline" style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => setSelectedResume(r)}>
                        <Eye size={14} /> View Report
                      </button>
                      <button onClick={() => handleDelete(r._id)} style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: 'var(--danger)', borderRadius: 8, padding: '0.45rem 0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedResume && <DetailModal resume={selectedResume} onClose={() => setSelectedResume(null)} />}
    </div>
  );
};

export default CandidateDashboard;
