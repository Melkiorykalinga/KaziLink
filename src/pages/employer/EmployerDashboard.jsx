import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Briefcase, Users, CheckCircle, DollarSign, Plus, Phone, Star, Loader } from 'lucide-react';
import api from '../../services/api';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptWorker = async (jobId, appId) => {
    setAcceptingId(appId);
    setMessage('');
    try {
      await api.post(`/jobs/${jobId}/applications/${appId}/accept`);
      setMessage('✓ Worker accepted! You can track job progress & direct payment in Jobs & Payments.');
      await fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept worker');
    } finally {
      setAcceptingId(null);
    }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applications?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('emp_title')}</h1>
            <p className="mt-1 text-gray-500 text-sm">{t('emp_welcome')}, {user?.fullName}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/employer/transactions')}
              className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 font-medium cursor-pointer"
            >
              <DollarSign size={18} className="mr-1.5" /> {t('emp_btnTransactions')}
            </button>
            <button
              onClick={() => navigate('/employer/post-job')}
              className="flex items-center bg-accent-600 hover:bg-accent-500 text-white px-5 py-2.5 rounded-lg shadow-md transition-all active:scale-95 font-medium cursor-pointer"
            >
              <Plus size={18} className="mr-2" /> {t('emp_btnPostJob')}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
            <span className="font-medium text-sm">{message}</span>
            <button
              onClick={() => navigate('/employer/transactions')}
              className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              {t('emp_btnTransactions')} →
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title={t('emp_statActive')} value={jobs.filter(j => j.status === 'ACTIVE' || j.status === 'IN_PROGRESS').length || 0} icon={<Briefcase className="text-primary-500" />} />
          <StatCard title={t('emp_statApplicants')} value={totalApplicants} icon={<Users className="text-blue-500" />} />
          <StatCard title={t('emp_statCompleted')} value={jobs.filter(j => j.status === 'COMPLETED').length || 0} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title={t('emp_statFee')} value="0% (Free)" icon={<DollarSign className="text-emerald-500" />} />
        </div>

        {/* Jobs List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">{t('emp_recentJobs')}</h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {t('nav_freeBadge')}
            </span>
          </div>
          
          {loading ? (
            <div className="p-10 text-center text-gray-500">{t('emp_loadingJobs')}</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="bg-primary-50 p-4 rounded-full mb-4">
                <Briefcase size={32} className="text-primary-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t('emp_noJobsTitle')}</h3>
              <p className="text-gray-500 max-w-sm mx-auto">{t('emp_noJobsDesc')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {jobs.map(job => (
                <li key={job.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-primary-900">{job.title}</h4>
                      <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users size={14} className="mr-1" /> {job.workersNeeded} {t('emp_workersNeeded')} ({job.workersAccepted || 0} {t('emp_accepted')})
                        </span>
                        <span className="flex items-center font-semibold text-emerald-700">
                          <DollarSign size={14} className="mr-0.5" /> TSh {job.payPerWorker?.toLocaleString()}/worker (0% Fee)
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        job.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Applicants for this job */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      {t('emp_applicantsHeader')} ({job.applications?.length || 0})
                    </p>
                    {(!job.applications || job.applications.length === 0) ? (
                      <p className="text-sm text-gray-400 italic">{t('emp_noApplicantsYet')}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.applications.map(app => (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div>
                              <Link to={`/worker/${app.worker?.id}`} className="font-bold text-gray-900 hover:text-primary-600 text-sm">
                                {app.worker?.fullName || 'Worker'}
                              </Link>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center text-amber-600 font-semibold">
                                  <Star size={12} className="mr-1 fill-current" />
                                  {app.worker?.workerProfile?.averageRating?.toFixed(1) || 'New'}
                                </span>
                                {app.worker?.phone && (
                                  <span className="flex items-center">
                                    <Phone size={12} className="mr-1" /> {app.worker.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              {app.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleAcceptWorker(job.id, app.id)}
                                  disabled={acceptingId === app.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all flex items-center cursor-pointer disabled:opacity-50"
                                >
                                  {acceptingId === app.id ? <Loader size={14} className="animate-spin mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                                  {t('emp_btnAcceptWorker')}
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                                  {t('emp_workerAccepted')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
