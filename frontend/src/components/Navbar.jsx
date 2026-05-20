import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand flex items-center gap-2">
        <ShieldCheck size={28} color="#22d3ee" />
        <span>TrustVerify</span>
      </Link>
      
      <div className="nav-links">
        {user ? (
          <div className="flex items-center gap-4">
            <span style={{ color: 'var(--text-muted)' }}>Hello, {user.name}</span>
            <button className="btn-outline flex items-center gap-2" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
