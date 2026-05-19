import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Search, Star, DollarSign, CheckCircle, Briefcase, ShieldCheck, Plus } from 'lucide-react';
import api from '../../services/api';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Features 1 & 4 states
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
    if (user?.id) {
      api.get(`/profile/worker/${user.id}`).then(res => {
        setSkills(res.data.worker.workerProfile?.verifiedSkills || []);
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    const fetchAvailableJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setAvailableJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableJobs();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 !mb-0">Worker Dashboard</h1>
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
            <p className="mt-1 text-gray-500 text-sm">Ready to earn, {user?.fullName}?</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/worker/${user?.id}`)}
              className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 font-medium text-sm"
            >
              View My Profile
            </button>
            <button
              onClick={() => navigate('/worker/transactions')}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 font-medium text-sm"
            >
              <Briefcase size={16} className="mr-1.5" /> My Jobs
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Jobs Nearby" value={availableJobs.length} icon={<MapPin className="text-red-500" />} />
          <StatCard title="Applications Sent" value="0" icon={<CheckCircle className="text-blue-500" />} />
          <StatCard title="Jobs Completed" value={user?.workerProfile?.totalJobsCompleted || "0"} icon={<Star className="text-yellow-500" />} />
          <StatCard title="Total Earned" value={`TSh ${(user?.workerProfile?.totalEarned || 0).toLocaleString()}`} icon={<DollarSign className="text-green-500" />} />
        </div>

        {/* My Skills Section (Feature 4) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-accent-500" /> My Skills
          </h2>
          <p className="text-gray-600 mb-6 text-sm">Add skills to your profile to stand out to employers. Once you complete jobs using these skills, they will become verified.</p>
          
          <form onSubmit={handleAddSkill} className="flex gap-3 mb-6 max-w-md">
            <input 
              type="text" 
              placeholder="e.g., Forklift Operation, Cleaning..." 
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              className="flex-1 w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center whitespace-nowrap">
              <Plus size={18} className="mr-1" /> Add Skill
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {skills.map(skill => (
              <div key={skill.id} className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${skill.isVerified ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                {skill.isVerified && <CheckCircle size={16} className="mr-2 text-teal-600" />}
                {skill.name}
                {!skill.isVerified && <span className="ml-2 text-xs text-gray-400 font-normal">(Self-reported)</span>}
              </div>
            ))}
            {skills.length === 0 && <p className="text-gray-400 italic text-sm">No skills added yet.</p>}
          </div>
        </div>

        {/* Discovery Section */}
        <div className="mb-6 flex justify-between items-end">
           <h2 className="text-xl font-bold text-gray-900">Recommended Gigs For You</h2>
           <button className="text-primary-600 font-medium hover:text-primary-500 text-sm">View Map</button>
        </div>

        {loading ? (
             <div className="text-center text-gray-500 py-10">Loading gigs...</div>
        ) : availableJobs.length === 0 ? (
             <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                   <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No gigs available right now</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Check back soon or expand your search radius to find more opportunities.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {availableJobs.map(job => (
                 <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-5">
                       <div className="flex justify-between items-start mb-4">
                          <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                             {job.category}
                          </span>
                          <span className="text-lg font-bold text-green-600">TSh {job.payPerWorker?.toLocaleString()}</span>
                       </div>
                       <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                       <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>
                       
                       <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin size={16} className="mr-2 text-gray-400" /> {job.locationAddress}
                       </div>
                    </div>
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                       <span className="text-xs font-medium text-gray-500">
                          {job.workersNeeded - job.workersAccepted} spots left
                       </span>
                       <button className="text-primary-600 font-semibold text-sm group-hover:text-primary-700">
                          Apply Now
                       </button>
                    </div>
                 </div>
               ))}
            </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className="p-3 bg-gray-50 rounded-lg mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default WorkerDashboard;
