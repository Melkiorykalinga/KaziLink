import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Search, Star, DollarSign, CheckCircle, Briefcase } from 'lucide-react';
import api from '../../services/api';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="mt-1 text-gray-500 text-sm">Ready to earn, {user?.fullName}?</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/worker/transactions')}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 font-medium text-sm"
            >
              <Briefcase size={16} className="mr-1.5" /> My Jobs
            </button>
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search nearby gigs..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Jobs Nearby" value={availableJobs.length} icon={<MapPin className="text-red-500" />} />
          <StatCard title="Applications Sent" value="0" icon={<CheckCircle className="text-blue-500" />} />
          <StatCard title="Jobs Completed" value="0" icon={<Star className="text-yellow-500" />} />
          <StatCard title="Total Earned" value="$0" icon={<DollarSign className="text-green-500" />} />
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
                          <span className="text-lg font-bold text-green-600">${job.payPerWorker}</span>
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
