import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Star, CheckCircle, Clock, TrendingUp, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { jobs } from '../data/mockData';
import StatsCard from '../components/StatsCard';
import Badge from '../components/Badge';
import './Dashboard.css';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gigs');
  const [availability, setAvailability] = useState(user?.workerProfile?.availabilityStatus || 'AVAILABLE_NOW');
  const [isUpdating, setIsUpdating] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user?.workerProfile?.availabilityStatus) {
      setAvailability(user.workerProfile.availabilityStatus);
    }
  }, [user]);

  useEffect(() => {
    // Load worker profile to get skills
    if (user?.id) {
      api.get(`/profile/worker/${user.id}`).then(res => {
        setSkills(res.data.worker.workerProfile?.verifiedSkills || []);
      }).catch(console.error);
    }
  }, [user]);

  const handleAvailabilityChange = async (e) => {
    const newStatus = e.target.value;
    setAvailability(newStatus);
    setIsUpdating(true);
    try {
      await api.patch('/profile/availability', { availabilityStatus: newStatus });
    } catch (err) {
      console.error('Failed to update availability', err);
      setAvailability(user?.workerProfile?.availabilityStatus || 'AVAILABLE_NOW');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    
    try {
      const res = await api.post('/profile/worker/skills', { name: newSkill.trim() });
      setSkills([...skills, res.data.skill]);
      setNewSkill('');
    } catch (err) {
      console.error('Failed to add skill', err);
      alert('Failed to add skill. You may have already added it.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE_NOW': return 'bg-green-500';
      case 'AVAILABLE_THIS_WEEK': return 'bg-yellow-500';
      case 'BUSY': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

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
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="page-title !mb-0">Worker <span className="gradient-text">Dashboard</span></h1>
              {user && (
                <div className="flex items-center text-sm font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 w-max">
                  <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(availability)} ${isUpdating ? 'animate-pulse' : ''}`}></span>
                  <select 
                    value={availability} 
                    onChange={handleAvailabilityChange}
                    disabled={isUpdating}
                    className="border-none bg-transparent outline-none cursor-pointer text-gray-700 font-semibold text-sm appearance-none pr-4"
                  >
                    <option value="AVAILABLE_NOW">Available Now (Niko Tayari)</option>
                    <option value="AVAILABLE_THIS_WEEK">Available This Week (Wiki Hii)</option>
                    <option value="BUSY">Busy (Niko Bize)</option>
                  </select>
                </div>
              )}
            </div>
            <p className="page-subtitle">Track your gigs, applications, and earnings.</p>
          </div>
          <div>
            <Link to={`/worker/${user?.id}`} className="btn btn-outline mr-3 bg-white">View Profile</Link>
            <Link to="/browse-jobs" className="btn btn-primary">Find New Jobs</Link>
          </div>
        </div>

        <div className="stats-row">
          <StatsCard icon={Briefcase} label="Active Gigs" value="3" trend="up" trendValue="+1" color="blue" />
          <StatsCard icon={DollarSign} label="Total Earnings" value="TSh 12,450" trend="up" trendValue="+18%" color="emerald" />
          <StatsCard icon={Star} label="Rating" value="4.9" color="amber" />
          <StatsCard icon={CheckCircle} label="Jobs Completed" value="203" trend="up" trendValue="+5" color="violet" />
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

        <div className="dash-tabs mt-8">
          {['gigs', 'applications', 'skills', 'earnings'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'gigs' ? 'My Gigs' : tab === 'applications' ? 'Applications' : tab === 'skills' ? 'My Skills' : 'Earnings'}
            </button>
          ))}
        </div>

        {activeTab === 'skills' && (
          <div className="card p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="text-accent-500" /> My Skills</h3>
            <p className="text-gray-600 mb-6">Add skills to your profile to stand out to employers. Once you complete jobs using these skills, they will become verified.</p>
            
            <form onSubmit={handleAddSkill} className="flex gap-3 mb-8 max-w-md">
              <input 
                type="text" 
                placeholder="e.g., Forklift Operation, Cleaning..." 
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 input-field !mb-0"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap flex items-center"><Plus size={18} className="mr-1" /> Add Skill</button>
            </form>

            <div className="flex flex-wrap gap-3">
              {skills.map(skill => (
                <div key={skill.id} className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${skill.isVerified ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  {skill.isVerified && <CheckCircle size={16} className="mr-2 text-teal-600" />}
                  {skill.name}
                  {!skill.isVerified && <span className="ml-2 text-xs text-gray-400 font-normal">(Self-reported)</span>}
                </div>
              ))}
              {skills.length === 0 && <p className="text-gray-400 italic">No skills added yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'gigs' && (
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
                  TSh {job.pay}/{job.payType === 'hourly' ? 'hr' : 'fixed'}
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
        )}

      </div>
    </div>
  );
}
