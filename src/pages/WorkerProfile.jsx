import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, CheckCircle, ShieldCheck, Quote, ArrowLeft, MessageSquare } from 'lucide-react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import Badge from '../components/Badge';

export default function WorkerProfile() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, portfolioRes] = await Promise.all([
          api.get(`/profile/worker/${id}`),
          api.get(`/profile/worker/${id}/portfolio`)
        ]);
        setWorker(profileRes.data.worker);
        setPortfolio(portfolioRes.data.portfolio);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;
  if (!worker) return <div className="p-10 text-center text-red-500">Worker not found.</div>;

  const profile = worker.workerProfile || {};
  const skills = profile.verifiedSkills || [];
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'AVAILABLE_NOW': return { text: 'Available Now', color: 'bg-green-500', badge: 'success' };
      case 'AVAILABLE_THIS_WEEK': return { text: 'Available This Week', color: 'bg-yellow-500', badge: 'warning' };
      case 'BUSY': return { text: 'Busy', color: 'bg-gray-500', badge: 'default' };
      default: return { text: 'Unknown', color: 'bg-gray-300', badge: 'default' };
    }
  };

  const statusInfo = getStatusInfo(profile.availabilityStatus);
  const memberSince = new Date(worker.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Separate portfolio items with reviews (endorsements)
  const endorsements = portfolio.filter(p => p.reviewSnippet);

  return (
    <div className="page-wrapper bg-gray-50 min-h-screen py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <Link to="/browse-workers" className="back-link inline-flex items-center text-primary-600 hover:text-primary-800 mb-6 font-medium transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Workers
        </Link>

        <div className="profile-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="profile-main lg:col-span-2 space-y-6">
            {/* Hero Banner */}
            <div className="profile-hero bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="profile-banner h-32 bg-gradient-to-r from-primary-800 to-primary-600"></div>
              <div className="profile-hero-content px-6 pb-6 relative -mt-12 flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-primary-800 shrink-0">
                  {worker.fullName.charAt(0)}
                </div>
                <div className="profile-hero-info pt-2 sm:pt-14 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    {worker.fullName}
                    <div className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-200 text-gray-700">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`}></span>
                      {statusInfo.text}
                    </div>
                  </h1>
                  <p className="text-gray-600 mt-1">{profile.bio || 'General Worker'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center"><MapPin size={16} className="mr-1 text-gray-400" /> {worker.locationCity || 'Tanzania'}</span>
                    <span className="flex items-center"><Calendar size={16} className="mr-1 text-gray-400" /> Member since {memberSince}</span>
                    <div className="flex items-center gap-1">
                      <RatingStars rating={profile.averageRating} size={16} />
                      <span className="font-medium text-gray-700">({profile.totalJobsCompleted} jobs)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Skills (FEATURE 4) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-accent-500" /> Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.slice(0, 6).map(skill => (
                    <div key={skill.id} className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${skill.isVerified ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      {skill.isVerified && <CheckCircle size={14} className="mr-1.5 text-teal-600" />}
                      {skill.name}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No skills added yet.</p>
                )}
                {skills.length > 6 && (
                  <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-transparent">
                    +{skills.length - 6} more
                  </div>
                )}
              </div>
            </div>

            {/* Work Portfolio / Proof of Work (FEATURE 2) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Work History <span className="text-gray-400 font-normal">· Historia ya Kazi</span></span>
                <Badge variant="primary">{portfolio.length} Completed</Badge>
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {portfolio.length > 0 ? (
                  portfolio.map(item => (
                    <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors bg-gray-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {item.jobTitle}
                            <span className="inline-flex items-center text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              <CheckCircle size={12} className="mr-1" /> KaziLink Verified
                            </span>
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">For {item.employerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block mb-1">
                            {new Date(item.dateCompleted).toLocaleDateString()}
                          </span>
                          {item.stars && <RatingStars rating={item.stars} size={14} />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full flex items-center">
                          <Briefcase size={12} className="mr-1" /> {item.jobCategory}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Briefcase size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>No work history recorded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Employer Endorsements (FEATURE 3) */}
            {endorsements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Quote className="text-accent-500" /> Employer Endorsements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {endorsements.map(item => (
                    <div key={item.id} className="bg-primary-50 rounded-xl p-5 border border-primary-100 relative">
                      <Quote size={24} className="absolute top-4 right-4 text-primary-200 opacity-50" />
                      <p className="text-gray-800 italic text-sm mb-4 leading-relaxed relative z-10">
                        "{item.reviewSnippet}"
                      </p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-bold text-xs">
                          {item.employerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.employerName}</p>
                          <p className="text-xs text-gray-500">{new Date(item.dateCompleted).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="profile-sidebar space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <Badge variant={statusInfo.badge} size="lg" className="w-full justify-center py-2 text-sm">
                  <span className={`w-2 h-2 rounded-full mr-2 ${statusInfo.color}`}></span>
                  {statusInfo.text}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <Link to="/messages" className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-bold shadow-md transition-all active:scale-95">
                  <MessageSquare size={18} /> Contact Worker
                </Link>
                <Link to="/post-job" className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-900 border-2 border-primary-100 py-3 px-4 rounded-xl font-bold transition-all active:scale-95">
                  <Briefcase size={18} /> Hire for a Job
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="block text-2xl font-black text-gray-900">{profile.totalJobsCompleted || 0}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</span>
                </div>
                <div className="text-center border-l border-gray-100">
                  <span className="block text-2xl font-black text-gray-900">{profile.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
