import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, DollarSign, BarChart3, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { jobs, workers } from '../data/mockData';
import StatsCard from '../components/StatsCard';
import Badge from '../components/Badge';
import RatingStars from '../components/RatingStars';
import './Dashboard.css';

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState('active');
  const myJobs = jobs.slice(0, 5);
  const applicants = workers.slice(0, 4);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1 className="page-title">Employer <span className="gradient-text">Dashboard</span></h1>
            <p className="page-subtitle">Manage your job postings and review applicants.</p>
          </div>
          <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
        </div>

        <div className="stats-row">
          <StatsCard icon={Briefcase} label="Active Jobs" value="5" trend="up" trendValue="+2" color="blue" />
          <StatsCard icon={Users} label="Total Applicants" value="47" trend="up" trendValue="+12" color="violet" />
          <StatsCard icon={CheckCircle} label="Hires Made" value="23" trend="up" trendValue="+3" color="emerald" />
          <StatsCard icon={DollarSign} label="Total Spent" value="$4,250" trend="up" trendValue="+$800" color="amber" />
        </div>

        <div className="dash-tabs">
          {['active', 'past', 'applicants'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'active' ? 'Active Jobs' : tab === 'past' ? 'Past Jobs' : 'Applicants'}
            </button>
          ))}
        </div>

        {(activeTab === 'active' || activeTab === 'past') && (
          <div className="dash-table">
            <div className="table-header">
              <span className="col-job">Job</span>
              <span className="col-type">Type</span>
              <span className="col-applicants">Applicants</span>
              <span className="col-status">Status</span>
              <span className="col-actions">Actions</span>
            </div>
            {myJobs.map(job => (
              <div key={job.id} className="table-row card">
                <div className="col-job">
                  <span className="table-logo">{job.companyLogo}</span>
                  <div>
                    <Link to={`/jobs/${job.id}`} className="table-job-title">{job.title}</Link>
                    <span className="table-job-meta">{job.location} · {job.postedDate}</span>
                  </div>
                </div>
                <span className="col-type">
                  <Badge variant={job.type === 'gig' ? 'primary' : 'violet'} size="sm">{job.type === 'gig' ? 'Gig' : 'Full-Time'}</Badge>
                </span>
                <span className="col-applicants">
                  <Users size={14} /> {job.applicants}
                </span>
                <span className="col-status">
                  <Badge variant={activeTab === 'active' ? 'success' : 'default'} size="sm">
                    {activeTab === 'active' ? 'Active' : 'Completed'}
                  </Badge>
                </span>
                <span className="col-actions">
                  <button className="btn btn-sm btn-outline"><Eye size={14} /> View</button>
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="applicants-list">
            {applicants.map(worker => (
              <div key={worker.id} className="applicant-row card">
                <div className="applicant-info">
                  <span className="applicant-avatar">{worker.avatar}</span>
                  <div>
                    <Link to={`/workers/${worker.id}`} className="applicant-name">{worker.name}</Link>
                    <span className="applicant-title">{worker.title}</span>
                    <RatingStars rating={worker.rating} size={12} />
                  </div>
                </div>
                <div className="applicant-skills">
                  {worker.skills.slice(0, 3).map(s => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                </div>
                <div className="applicant-meta">
                  <span>${worker.hourlyRate}/hr</span>
                  <span>{worker.completedJobs} jobs</span>
                </div>
                <div className="applicant-actions">
                  <button className="btn btn-sm btn-primary"><CheckCircle size={14} /> Accept</button>
                  <button className="btn btn-sm btn-secondary"><XCircle size={14} /> Pass</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
