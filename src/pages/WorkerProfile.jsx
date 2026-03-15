import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, ArrowLeft, MessageSquare, Briefcase } from 'lucide-react';
import { workers, reviews } from '../data/mockData';
import RatingStars from '../components/RatingStars';
import Badge from '../components/Badge';
import ReviewCard from '../components/ReviewCard';
import './WorkerProfile.css';

export default function WorkerProfile() {
  const { id } = useParams();
  const worker = workers.find(w => w.id === parseInt(id)) || workers[0];
  const workerReviews = reviews.filter(r => r.workerId === worker.id);

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/browse-workers" className="back-link"><ArrowLeft size={18} /> Back to Workers</Link>

        <div className="profile-layout">
          <main className="profile-main">
            {/* Hero Banner */}
            <div className="profile-hero card">
              <div className="profile-banner"></div>
              <div className="profile-hero-content">
                <div className="profile-avatar-lg">{worker.avatar}</div>
                <div className="profile-hero-info">
                  <h1 className="profile-name">
                    {worker.name}
                    {worker.verified && <span className="verified-badge">✓</span>}
                  </h1>
                  <p className="profile-title">{worker.title}</p>
                  <div className="profile-hero-meta">
                    <span><MapPin size={14} /> {worker.location}</span>
                    <span><Calendar size={14} /> Member since {worker.memberSince}</span>
                    <RatingStars rating={worker.rating} size={14} />
                    <span className="review-count">({worker.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card profile-section">
              <h2>About</h2>
              <p className="profile-bio">{worker.bio}</p>
            </div>

            {/* Skills */}
            <div className="card profile-section">
              <h2>Skills</h2>
              <div className="profile-skills">
                {worker.skills.map(skill => (
                  <Badge key={skill} variant="primary" size="lg">{skill}</Badge>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="card profile-section">
              <h2>Experience</h2>
              <div className="experience-timeline">
                {worker.experience.map((exp, i) => (
                  <div key={i} className="exp-item">
                    <div className="exp-dot"></div>
                    <div className="exp-content">
                      <h4>{exp.role}</h4>
                      <p className="exp-company">{exp.company}</p>
                      <p className="exp-duration">{exp.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="card profile-section">
              <h2>Achievements</h2>
              <div className="profile-achievements">
                {worker.badges.map(badge => (
                  <div key={badge} className="achievement-card">
                    <span className="achievement-icon">🏆</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card profile-section">
              <h2>Reviews ({workerReviews.length})</h2>
              <div className="profile-reviews">
                {workerReviews.length > 0 ? (
                  workerReviews.map(review => <ReviewCard key={review.id} review={review} />)
                ) : (
                  <p className="no-reviews">No reviews yet.</p>
                )}
              </div>
            </div>
          </main>

          <aside className="profile-sidebar">
            <div className="card hire-card">
              <div className="hire-rate">
                <DollarSign size={20} />
                <span className="rate-value">${worker.hourlyRate}</span>
                <span className="rate-unit">/hr</span>
              </div>
              <Badge variant={worker.availability === 'available' ? 'success' : 'warning'} size="lg">
                {worker.availability === 'available' ? '🟢 Available Now' : '🟡 Currently Busy'}
              </Badge>
              <Link to="/messages" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <MessageSquare size={18} /> Contact
              </Link>
              <Link to="/post-job" className="btn btn-outline btn-lg" style={{ width: '100%' }}>
                <Briefcase size={18} /> Hire for a Job
              </Link>
            </div>

            <div className="card stats-summary">
              <div className="ps-stat">
                <span className="ps-stat-value">{worker.completedJobs}</span>
                <span className="ps-stat-label">Jobs Completed</span>
              </div>
              <div className="ps-stat">
                <span className="ps-stat-value">{worker.rating}</span>
                <span className="ps-stat-label">Avg Rating</span>
              </div>
              <div className="ps-stat">
                <span className="ps-stat-value">{worker.reviewCount}</span>
                <span className="ps-stat-label">Reviews</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
