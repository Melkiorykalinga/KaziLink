import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import RatingStars from './RatingStars';
import Badge from './Badge';
import './WorkerCard.css';

export default function WorkerCard({ worker }) {
  const availabilityVariant = {
    available: 'success',
    busy: 'warning',
    offline: 'default',
  };

  return (
    <Link to={`/workers/${worker.id}`} className="worker-card card">
      <div className="worker-card-top">
        <div className="worker-avatar">{worker.avatar}</div>
        <Badge variant={availabilityVariant[worker.availability]} size="sm">
          {worker.availability === 'available' ? '🟢 Available' : worker.availability === 'busy' ? '🟡 Busy' : '⚪ Offline'}
        </Badge>
      </div>

      <div className="worker-info">
        <h3 className="worker-name">
          {worker.name}
          {worker.verified && <span className="verified-badge">✓</span>}
        </h3>
        <p className="worker-title">{worker.title}</p>
      </div>

      <RatingStars rating={worker.rating} size={14} />

      <div className="worker-stats-row">
        <span className="worker-stat">
          <Clock size={13} />
          {worker.completedJobs} jobs
        </span>
        <span className="worker-stat">
          <MapPin size={13} />
          {worker.location}
        </span>
      </div>

      <div className="worker-skills">
        {worker.skills.slice(0, 3).map(skill => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
        {worker.skills.length > 3 && (
          <span className="skill-tag more">+{worker.skills.length - 3}</span>
        )}
      </div>

      <div className="worker-badges">
        {worker.badges.slice(0, 3).map(badge => (
          <Badge key={badge} variant="violet" size="sm">{badge}</Badge>
        ))}
      </div>

      <div className="worker-card-footer">
        <div className="worker-rate">
          <DollarSign size={15} />
          <span>${worker.hourlyRate}/hr</span>
        </div>
        <span className="btn btn-sm btn-outline">View Profile</span>
      </div>
    </Link>
  );
}
