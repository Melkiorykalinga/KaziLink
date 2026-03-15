import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Users, DollarSign, Calendar, ArrowLeft, Share2, CheckCircle, Building } from 'lucide-react';
import { jobs } from '../data/mockData';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import JobCard from '../components/JobCard';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const job = jobs.find(j => j.id === parseInt(id)) || jobs[0];
  const { applyToJob, applications } = useApp();
  const hasApplied = applications.includes(job.id);
  const similarJobs = jobs.filter(j => j.id !== job.id && j.category === job.category).slice(0, 3);

  const formatPay = () => {
    if (job.payType === 'hourly') return `$${job.pay}/hr`;
    if (job.payType === 'fixed') return `$${job.pay} fixed`;
    if (job.payType === 'yearly') return `$${(job.pay / 1000).toFixed(0)}k/year`;
    return `$${job.pay}`;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/browse-jobs" className="back-link">
          <ArrowLeft size={18} />
          Back to Jobs
        </Link>

        <div className="job-detail-layout">
          <main className="job-detail-main">
            <div className="job-detail-header card">
              <div className="jd-top-row">
                <div className="jd-company-row">
                  <span className="jd-company-logo">{job.companyLogo}</span>
                  <div>
                    <h1 className="jd-title">{job.title}</h1>
                    <p className="jd-company">{job.company} {job.verified && <span className="verified-badge">✓</span>}</p>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Share2 size={14} /> Share
                </button>
              </div>

              <div className="jd-meta-row">
                <span className="jd-meta"><MapPin size={15} /> {job.location}</span>
                <span className="jd-meta"><Clock size={15} /> {job.duration}</span>
                <span className="jd-meta"><Calendar size={15} /> {job.startTime}</span>
                <span className="jd-meta"><Users size={15} /> {job.applicants} applicants</span>
              </div>

              <div className="jd-tags">
                <Badge variant={job.type === 'gig' ? 'primary' : 'violet'}>
                  {job.type === 'gig' ? '⚡ Quick Gig' : '💼 Full-Time Position'}
                </Badge>
                {job.urgency !== 'normal' && (
                  <Badge variant={job.urgency === 'urgent' ? 'danger' : 'warning'}>
                    {job.urgency === 'urgent' ? '🔥 Urgent' : '⏰ Starts Today'}
                  </Badge>
                )}
                <Badge variant="success">
                  <DollarSign size={12} /> {formatPay()}
                </Badge>
              </div>
            </div>

            <div className="card jd-section">
              <h2>About This Role</h2>
              <p className="jd-description">{job.description}</p>
            </div>

            <div className="card jd-section">
              <h2>Requirements</h2>
              <ul className="jd-list">
                {job.requirements.map((req, i) => (
                  <li key={i}><CheckCircle size={16} className="list-icon" /> {req}</li>
                ))}
              </ul>
            </div>

            <div className="card jd-section">
              <h2>Benefits & Perks</h2>
              <div className="jd-benefits">
                {job.benefits.map((benefit, i) => (
                  <Badge key={i} variant="success" size="lg">{benefit}</Badge>
                ))}
              </div>
            </div>

            <div className="card jd-section">
              <h2>Skills Required</h2>
              <div className="jd-skills">
                {job.skills.map(skill => (
                  <Badge key={skill} variant="primary" size="lg">{skill}</Badge>
                ))}
              </div>
            </div>

            {similarJobs.length > 0 && (
              <div className="jd-similar">
                <h2>Similar Jobs</h2>
                <div className="similar-grid">
                  {similarJobs.map(j => <JobCard key={j.id} job={j} />)}
                </div>
              </div>
            )}
          </main>

          <aside className="job-detail-sidebar">
            <div className="card apply-card">
              <div className="apply-pay">
                <DollarSign size={20} />
                <span className="apply-pay-value">{formatPay()}</span>
              </div>
              <button
                className={`btn btn-lg ${hasApplied ? 'btn-applied-lg' : 'btn-primary'}`}
                onClick={() => !hasApplied && applyToJob(job.id)}
                style={{ width: '100%' }}
              >
                {hasApplied ? '✓ Application Submitted' : job.type === 'gig' ? '⚡ Quick Apply' : 'Apply Now'}
              </button>
              <p className="apply-note">
                {hasApplied ? 'The employer will review your application.' : 'Your profile will be shared with the employer.'}
              </p>
            </div>

            <div className="card employer-card">
              <h3><Building size={16} /> About the Employer</h3>
              <div className="employer-info">
                <span className="employer-logo">{job.companyLogo}</span>
                <div>
                  <span className="employer-name">{job.company}</span>
                  {job.verified && <Badge variant="success" size="sm">Verified</Badge>}
                </div>
              </div>
              <div className="employer-stats">
                <div className="emp-stat">
                  <span className="emp-stat-value">4.7</span>
                  <span className="emp-stat-label">Rating</span>
                </div>
                <div className="emp-stat">
                  <span className="emp-stat-value">23</span>
                  <span className="emp-stat-label">Jobs Posted</span>
                </div>
                <div className="emp-stat">
                  <span className="emp-stat-value">96%</span>
                  <span className="emp-stat-label">Hire Rate</span>
                </div>
              </div>
            </div>

            <div className="card">
              <p className="sidebar-note">
                <Clock size={14} /> Posted {job.postedDate}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
