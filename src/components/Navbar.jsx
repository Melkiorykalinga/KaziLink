import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, Briefcase, User, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { userRole, toggleRole } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = userRole === 'employer'
    ? [
        { path: '/browse-workers', label: 'Find Workers' },
        { path: '/post-job', label: 'Post a Job' },
        { path: '/employer-dashboard', label: 'Dashboard' },
        { path: '/messages', label: 'Messages' },
      ]
    : [
        { path: '/browse-jobs', label: 'Find Jobs' },
        { path: '/worker-dashboard', label: 'Dashboard' },
        { path: '/messages', label: 'Messages' },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"><Zap size={22} /></div>
          <span className="logo-text">Kazi<span className="logo-accent">Link</span></span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="role-switcher" onClick={toggleRole}>
            {userRole === 'employer' ? <Briefcase size={16} /> : <User size={16} />}
            <span>{userRole === 'employer' ? 'Employer' : 'Worker'}</span>
            <ChevronDown size={14} />
          </button>

          <button className="icon-btn notification-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>

          <div className="avatar-btn">
            <span>M</span>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
