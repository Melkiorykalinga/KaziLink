import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-gradient-line"></div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="logo-icon"><Zap size={18} /></div>
            <span className="logo-text">Kazi<span className="logo-accent">Link</span></span>
          </Link>
          <p className="footer-tagline">
            Making hiring as easy as ordering a ride. Connect with opportunities instantly.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-link"><Twitter size={18} /></a>
            <a href="#" className="social-link"><Linkedin size={18} /></a>
            <a href="#" className="social-link"><Github size={18} /></a>
            <a href="#" className="social-link"><Mail size={18} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>For Workers</h4>
          <Link to="/browse-jobs">Find Jobs</Link>
          <Link to="/browse-jobs">Quick Gigs</Link>
          <Link to="/browse-jobs">Career Opportunities</Link>
          <a href="#">How It Works</a>
        </div>

        <div className="footer-links-group">
          <h4>For Employers</h4>
          <Link to="/post-job">Post a Job</Link>
          <Link to="/browse-workers">Find Workers</Link>
          <a href="#">Pricing</a>
          <a href="#">Enterprise</a>
        </div>

        <div className="footer-links-group">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">Support</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 KaziLink. All rights reserved.</span>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
