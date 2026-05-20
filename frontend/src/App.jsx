import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import IssuerDashboard from './pages/IssuerDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1c', color: 'white' }}>
      <div className="spinner"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/candidate" 
              element={<ProtectedRoute allowedRoles={['Candidate']}><CandidateDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/recruiter" 
              element={<ProtectedRoute allowedRoles={['Recruiter']}><RecruiterDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/admin" 
              element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/issuer" 
              element={<ProtectedRoute allowedRoles={['Issuer']}><IssuerDashboard /></ProtectedRoute>} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
