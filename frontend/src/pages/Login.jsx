import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Candidate' });
  const [error, setError] = useState('');
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'Candidate') navigate('/candidate');
      else if (user.role === 'Recruiter') navigate('/recruiter');
      else if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Issuer') navigate('/issuer');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        if (res.role === 'Candidate') navigate('/candidate');
        else if (res.role === 'Recruiter') navigate('/recruiter');
        else if (res.role === 'Admin') navigate('/admin');
        else if (res.role === 'Issuer') navigate('/issuer');
      } else {
        setError(res.message);
      }
    } else {
      const res = await register(formData.name, formData.email, formData.password, formData.role);
      if (res.success) {
        setIsLogin(true);
        setError('Registration successful. Please login.');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                className="form-input" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{ backgroundColor: 'var(--bg-dark)' }}
              >
                <option value="Candidate">Candidate</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Issuer">Issuer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
