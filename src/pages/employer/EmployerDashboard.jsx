import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, CheckCircle, DollarSign, Plus, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch actual employer jobs here
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="mt-1 text-gray-500 text-sm">Welcome back, {user?.fullName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/employer/transactions')}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 font-medium"
            >
              <DollarSign size={18} className="mr-1.5" /> Transactions
            </button>
            <button className="flex items-center bg-accent-600 hover:bg-accent-500 text-white px-5 py-2.5 rounded-lg shadow-md transition-all active:scale-95 font-medium">
              <Plus size={18} className="mr-2" /> Post a New Job
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Jobs" value={jobs.filter(j => j.status === 'ACTIVE').length || 0} icon={<Briefcase className="text-primary-500" />} />
          <StatCard title="Total Applicants" value="0" icon={<Users className="text-blue-500" />} />
          <StatCard title="Jobs Completed" value={jobs.filter(j => j.status === 'COMPLETED').length || 0} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title="Total Spent" value="$0" icon={<DollarSign className="text-yellow-500" />} />
        </div>

        {/* Jobs List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Your Recent Jobs</h2>
          </div>
          
          {loading ? (
             <div className="p-10 text-center text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
             <div className="p-12 pl-12 text-center flex flex-col items-center">
                <div className="bg-primary-50 p-4 rounded-full mb-4">
                   <Briefcase size={32} className="text-primary-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Create your first gig to start receiving applicants from nearby workers.</p>
             </div>
          ) : (
            <ul className="divide-y divide-gray-100">
               {jobs.map(job => (
                 <li key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-semibold text-primary-900">{job.title}</h4>
                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                           <span className="flex items-center"><Users size={14} className="mr-1"/> {job.workersNeeded} workers</span>
                           <span className="flex items-center"><DollarSign size={14} className="mr-1"/> ${job.payPerWorker}/worker</span>
                        </div>
                      </div>
                      <div>
                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                           job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                         }`}>
                           {job.status}
                         </span>
                      </div>
                    </div>
                 </li>
               ))}
            </ul>
          )}
        </div>
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

export default EmployerDashboard;
