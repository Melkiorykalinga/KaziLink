import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Star, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { jobs } from '../data/mockData';
import StatsCard from '../components/StatsCard';
import Badge from '../components/Badge';
import './Dashboard.css';

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('gigs');
  const myGigs = jobs.filter(j => j.type === 'gig').slice(0, 4);

  const earningsData = [
    { month: 'Oct', amount: 1200 },
    { month: 'Nov', amount: 1850 },
    { month: 'Dec', amount: 2100 },
    { month: 'Jan', amount: 1900 },
    { month: 'Feb', amount: 2400 },
    { month: 'Mar', amount: 2800 },
  ];
  const maxEarning = Math.max(...earningsData.map(e => e.amount));

  const statusSteps = [
    { label: 'Applied', icon: Clock, done: true },
    { label: 'Accepted', icon: CheckCircle, done: true },
    { label: 'In Progress', icon: TrendingUp, done: true },
    { label: 'Completed', icon: Star, done: false },
    { label: 'Paid', icon: DollarSign, done: false },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1 className="page-title">Worker <span className="gradient-text">Dashboard</span></h1>
            <p className="page-subtitle">Track your gigs, applications, and earnings.</p>
          </div>
          <Link to="/browse-jobs" className="btn btn-primary">Find New Jobs</Link>
        </div>

        <div className="stats-row">
          <StatsCard icon={Briefcase} label="Active Gigs" value="3" trend="up" trendValue="+1" color="blue" />
          <StatsCard icon={DollarSign} label="Total Earnings" value="$12,450" trend="up" trendValue="+18%" color="emerald" />
          <StatsCard icon={Star} label="Rating" value="4.9" color="amber" />
          <StatsCard icon={CheckCircle} label="Jobs Completed" value="203" trend="up" trendValue="+5" color="violet" />
        </div>

        {/* Earnings Chart */}
        <div className="card earnings-chart">
          <h3>Earnings Overview</h3>
          <div className="chart-container">
            {earningsData.map((d, i) => (
              <div key={i} className="chart-bar-wrap">
                <span className="chart-value">${(d.amount / 1000).toFixed(1)}k</span>
                <div className="chart-bar" style={{ height: `${(d.amount / maxEarning) * 100}%` }}></div>
                <span className="chart-label">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gig Status Timeline */}
        <div className="card gig-timeline-card">
          <h3>Current Gig Progress</h3>
          <p className="gig-timeline-job">Warehouse Associate — SwiftLogistics</p>
          <div className="gig-timeline">
            {statusSteps.map((s, i) => (
              <div key={i} className={`timeline-step ${s.done ? 'done' : ''}`}>
                <div className="timeline-dot"><s.icon size={14} /></div>
                <span>{s.label}</span>
                {i < statusSteps.length - 1 && <div className="timeline-line"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="dash-tabs">
          {['gigs', 'applications', 'earnings'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'gigs' ? 'My Gigs' : tab === 'applications' ? 'Applications' : 'Earnings'}
            </button>
          ))}
        </div>

        <div className="dash-table">
          <div className="table-header">
            <span className="col-job">Job</span>
            <span className="col-type">Pay</span>
            <span className="col-applicants">Date</span>
            <span className="col-status">Status</span>
          </div>
          {myGigs.map((job, i) => (
            <div key={job.id} className="table-row card">
              <div className="col-job">
                <span className="table-logo">{job.companyLogo}</span>
                <div>
                  <Link to={`/jobs/${job.id}`} className="table-job-title">{job.title}</Link>
                  <span className="table-job-meta">{job.company}</span>
                </div>
              </div>
              <span className="col-type" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                ${job.pay}/{job.payType === 'hourly' ? 'hr' : 'fixed'}
              </span>
              <span className="col-applicants">{job.postedDate}</span>
              <span className="col-status">
                <Badge variant={i === 0 ? 'warning' : i === 1 ? 'success' : 'primary'} size="sm">
                  {i === 0 ? 'In Progress' : i === 1 ? 'Completed' : 'Applied'}
                </Badge>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
