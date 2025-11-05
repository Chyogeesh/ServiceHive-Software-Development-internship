import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          SlotSwapper
        </Link>
        {user && (
          <div className="nav-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            <Link to="/requests" className="nav-link">Requests</Link>
            <div className="nav-user">
              <span>{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
