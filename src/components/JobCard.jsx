import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Heart, Zap, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from './Badge';
import './JobCard.css';

export default function JobCard({ job }) {
  const { favorites, toggleFavorite, applyToJob, applications } = useApp();
  const isFav = favorites.includes(job.id);
  const hasApplied = applications.includes(job.id);

  const formatPay = () => {
    if (job.payType === 'hourly') return `$${job.pay}/hr`;
    if (job.payType === 'fixed') return `$${job.pay} fixed`;
    if (job.payType === 'yearly') return `$${(job.pay / 1000).toFixed(0)}k/yr`;
    return `$${job.pay}`;
  };

  const urgencyVariant = {
    urgent: 'danger',
    today: 'warning',
    normal: 'default',
  };

  return (
    <div className="job-card card">
      <div className="job-card-header">
        <div className="job-company-info">
          <span className="job-company-logo">{job.companyLogo}</span>
          <div>
            <span className="job-company-name">{job.company}</span>
            {job.verified && <span className="verified-badge" title="Verified">✓</span>}
          </div>
        </div>
        <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleFavorite(job.id); }}
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <Link to={`/jobs/${job.id}`} className="job-card-body">
        <h3 className="job-title">{job.title}</h3>

        <div className="job-meta">
          <span className="meta-item">
            <MapPin size={14} />
            {job.location}
          </span>
          {job.distance !== '—' && (
            <span className="meta-item">
              <Zap size={14} />
              {job.distance}
            </span>
          )}
          <span className="meta-item">
            <Clock size={14} />
            {job.duration}
          </span>
        </div>

        <div className="job-tags">
          <Badge variant={job.type === 'gig' ? 'primary' : 'violet'} size="sm">
            {job.type === 'gig' ? '⚡ Quick Gig' : '💼 Full-Time'}
          </Badge>
          {job.urgency !== 'normal' && (
            <Badge variant={urgencyVariant[job.urgency]} size="sm">
              {job.urgency === 'urgent' ? '🔥 Urgent' : '⏰ Today'}
            </Badge>
          )}
        </div>

        <div className="job-skills">
          {job.skills.slice(0, 3).map(skill => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {job.skills.length > 3 && (
            <span className="skill-tag more">+{job.skills.length - 3}</span>
          )}
        </div>
      </Link>

      <div className="job-card-footer">
        <div className="job-pay">
          <DollarSign size={16} />
          <span className="pay-amount">{formatPay()}</span>
        </div>
        <div className="job-footer-right">
          <span className="applicants-count">
            <Users size={14} />
            {job.applicants}
          </span>
          {job.type === 'gig' && (
            <button
              className={`btn btn-sm ${hasApplied ? 'btn-applied' : 'btn-primary'}`}
              onClick={() => !hasApplied && applyToJob(job.id)}
            >
              {hasApplied ? '✓ Applied' : 'Quick Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
