import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Search, ShieldAlert, ShieldCheck, X, Mail, Phone,
  Link, Code, Clock, BarChart2, ChevronDown, ChevronUp,
  User, Cpu, BookOpen, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// ── helpers ─────────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 75 ? 'var(--success)' : s >= 45 ? 'var(--warning)' : 'var(--danger)';

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

const Badge = ({ text, color = 'var(--primary)' }) => (
  <span style={{
    background: `${color}22`, border: `1px solid ${color}55`,
    color, padding: '2px 10px', borderRadius: 20,
    fontSize: '0.78rem', fontWeight: 500, display: 'inline-block',
  }}>{text}</span>
);

const ContactDot = ({ ok, Icon, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: '0.78rem',
    color: ok ? 'var(--success)' : 'rgba(255,255,255,0.2)',
  }}>
    <Icon size={13} />{label}
  </span>
);

const ScoreBar = ({ label, val, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
      <span>{label}</span><span style={{ color }}>{val}%</span>
    </div>
    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
      <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 3 }} />
    </div>
  </div>
);

// ── TrustRing ────────────────────────────────────────────────────────────────
const TrustRing = ({ score }) => {
  const color = scoreColor(score);
  const deg   = score * 3.6;
  return (
    <div style={{
      width: 100, height: 100, borderRadius: '50%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.07) 0deg)`,
    }}>
      <div style={{
        position: 'absolute', inset: 9, borderRadius: '50%',
        background: 'var(--bg-card)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.2rem', color }}>{score}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>TRUST</span>
      </div>
    </div>
  );
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ candidate, onClose }) => {
  const ci    = candidate.contactInfo  || {};
  const byCat = candidate.skillsByCategory || {};
  const [showText, setShowText] = useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{
        background: 'linear-gradient(135deg,rgba(20,27,45,0.98),rgba(10,15,28,0.98))',
        border: '1px solid var(--glass-border)', borderRadius: 20,
        maxWidth: 860, width: '100%', maxHeight: '92vh', overflowY: 'auto',
        padding: '2rem', boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>
              <User size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--primary)' }} />
              {candidate.userId.name}
            </h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>📧 {candidate.userId.email}</span>
              <span>· <Clock size={11} style={{ display:'inline' }} /> {new Date(candidate.createdAt).toLocaleDateString()}</span>
              <span>· {candidate.wordCount || 0} words</span>
              <span style={{ color: candidate.mlOnline ? 'var(--success)' : 'var(--warning)' }}>
                · {candidate.analysisDepth || 'Basic'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
            color: 'white', borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}><X size={16} /> Close</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Score Cards */}
            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Score Breakdown</h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.2rem' }}>
                {[
                  { label: 'Trust Score',    val: candidate.trustScore,        color: scoreColor(candidate.trustScore) },
                  { label: 'AI Confidence',  val: candidate.confidenceScore,   color: 'var(--accent)' },
                  { label: 'Completeness',   val: candidate.completenessScore, color: 'var(--warning)' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 700, color }}>{val ?? '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <ScoreBar label="AI Confidence"  val={candidate.confidenceScore}   color="var(--accent)"   />
                <ScoreBar label="Completeness"   val={candidate.completenessScore} color="var(--warning)"  />
              </div>
            </div>

            {/* Profile Info */}
            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Profile Info</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                  <strong>{candidate.experienceYears != null ? `${candidate.experienceYears} years` : 'Not specified'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Education</span>
                  <strong>{candidate.education?.length ? candidate.education.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') : 'Not found'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Blockchain</span>
                  <strong style={{ color: candidate.blockchainVerified ? 'var(--success)' : 'var(--text-muted)' }}>
                    {candidate.blockchainVerified ? '✓ Verified' : 'Unverified'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sections: </span>
                  <span style={{ fontSize: '0.8rem' }}>{candidate.sectionsFound?.join(', ') || 'None detected'}</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Contact Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ContactDot ok={ci.email}    Icon={Mail}     label="Email" />
                <ContactDot ok={ci.phone}    Icon={Phone}    label="Phone" />
                <ContactDot ok={ci.linkedin} Icon={Link} label="LinkedIn" />
                <ContactDot ok={ci.github}   Icon={Code}   label="GitHub" />
              </div>
            </div>

            {/* Risk Flags */}
            {candidate.flags?.length > 0 && (
              <div style={{ padding: '1rem 1.2rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12 }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Risk Flags ({candidate.flags.length})
                </h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {candidate.flags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Right column — skills + resume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Skills by category */}
            <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Skills ({candidate.skills?.length || 0})
              </h4>
              {Object.keys(byCat).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {Object.entries(byCat).map(([cat, skills]) => (
                    <div key={cat}>
                      <div style={{ fontSize: '0.72rem', color: CAT_COLORS[cat] || '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{cat}</div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {skills.map(s => <Badge key={s} text={s} color={CAT_COLORS[cat] || '#94a3b8'} />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {candidate.skills?.map(s => <Badge key={s} text={s} />)}
                </div>
              )}
            </div>

            {/* Collapsible resume text */}
            <div style={{ borderRadius: 12, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              <button onClick={() => setShowText(p => !p)} style={{
                width: '100%', padding: '0.75rem 1.2rem',
                background: 'rgba(255,255,255,0.04)', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem',
              }}>
                <span>Resume Text</span>
                {showText ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showText && (
                <div style={{ padding: '1rem 1.2rem', fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', maxHeight: 300, overflowY: 'auto' }}>
                  {candidate.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const RecruiterDashboard = () => {
  const [candidates, setCandidates]         = useState([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterMin, setFilterMin]           = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCandidates(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const filtered = candidates.filter(c => {
    const nameMatch  = c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const scoreOk    = (c.trustScore || 0) >= filterMin;
    return (nameMatch || skillMatch) && scoreOk;
  });

  // Stats
  const avgTrust = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + (c.trustScore || 0), 0) / candidates.length)
    : 0;
  const verified = candidates.filter(c => c.blockchainVerified).length;
  const flagged  = candidates.filter(c => c.flags?.length > 0).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Talent Pool</h1>
          <p style={{ color: 'var(--text-muted)' }}>{candidates.length} candidates · AI-verified profiles</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search name or skill..."
              style={{ paddingLeft: 34, width: 220 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterMin}
            onChange={e => setFilterMin(Number(e.target.value))}
            style={{
              background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
              color: 'white', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer',
            }}
          >
            <option value={0}>All Trust Scores</option>
            <option value={70}>70+ (High)</option>
            <option value={50}>50+ (Medium)</option>
            <option value={30}>30+ (Low+)</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Candidates', val: candidates.length, color: 'var(--primary)',  icon: <User size={20} /> },
          { label: 'Avg Trust Score',  val: avgTrust,          color: scoreColor(avgTrust), icon: <BarChart2 size={20} /> },
          { label: 'Blockchain Verified', val: verified,       color: 'var(--success)', icon: <ShieldCheck size={20} /> },
          { label: 'Flagged Profiles',   val: flagged,          color: 'var(--danger)',  icon: <ShieldAlert size={20} /> },
        ].map(({ label, val, color, icon }) => (
          <div key={label} style={{ padding: '1.2rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 14, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ color }}>{icon}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Candidate Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Search size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No candidates match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {filtered.map(c => {
            const ci    = c.contactInfo || {};
            const byCat = c.skillsByCategory || {};
            return (
              <div key={c._id} className="glass-panel" style={{ display: 'flex', gap: '1.5rem' }}>
                <TrustRing score={c.trustScore || 0} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name + badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: 2 }}>{c.userId?.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.userId?.email}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {c.blockchainVerified && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 10, padding: '2px 8px' }}>
                          ✓ Chain
                        </span>
                      )}
                      {c.experienceYears != null && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.experienceYears} yrs</span>
                      )}
                    </div>
                  </div>

                  {/* Score bars */}
                  <div style={{ display: 'flex', gap: '0.6rem', margin: '0.75rem 0' }}>
                    <div style={{ flex: 1 }}><ScoreBar label="AI Conf" val={c.confidenceScore || 0} color="var(--accent)" /></div>
                    <div style={{ flex: 1 }}><ScoreBar label="Complete" val={c.completenessScore || 0} color="var(--warning)" /></div>
                  </div>

                  {/* Skills preview */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {Object.entries(byCat).slice(0, 3).flatMap(([cat, skills]) =>
                      skills.slice(0, 2).map(s => <Badge key={s} text={s} color={CAT_COLORS[cat] || '#94a3b8'} />)
                    )}
                    {c.skills?.length > 6 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{c.skills.length - 6}</span>
                    )}
                  </div>

                  {/* Contact + flags row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <ContactDot ok={ci.email} Icon={Mail} label="" />
                      <ContactDot ok={ci.phone} Icon={Phone} label="" />
                      <ContactDot ok={ci.linkedin} Icon={Link} label="" />
                      <ContactDot ok={ci.github} Icon={Code} label="" />
                    </div>
                    {c.flags?.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={12} />{c.flags.length} flag{c.flags.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <button
                    className="btn-outline"
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => setSelectedCandidate(c)}
                  >
                    View Full Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCandidate && (
        <DetailModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  );
};

export default RecruiterDashboard;
