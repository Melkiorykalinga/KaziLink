import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Briefcase, DollarSign, Activity, AlertCircle, Shield, XCircle, Phone, MessageSquareWarning, CheckCircle, Database, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'disputes'
  const [actionLoading, setActionLoading] = useState(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notesInput, setNotesInput] = useState({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, disputesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/disputes')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDisputes(disputesRes.data);
      const initialNotes = {};
      (disputesRes.data || []).forEach(d => {
        initialNotes[d.id] = d.adminNotes || '';
      });
      setNotesInput(initialNotes);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDispute = async (disputeId, status) => {
    setActionLoading(disputeId);
    setMessage('');
    try {
      const res = await api.patch(`/admin/disputes/${disputeId}`, {
        status,
        adminNotes: notesInput[disputeId] || ''
      });
      setDisputes(disputes.map(d => d.id === disputeId ? res.data : d));
      setMessage('✓ Ripoti imesasishwa kikamilifu! (Dispute updated)');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualCleanup = async () => {
    setCleanupLoading(true);
    setMessage('');
    try {
      const res = await api.post('/admin/cleanup');
      const r = res.data.cleanupResult || {};
      const totalCleaned =
        (r.expiredJobsRemoved || 0) +
        (r.completedJobsArchived || 0) +
        (r.oldApplicationsRemoved || 0) +
        (r.oldTransactionsRemoved || 0) +
        (r.resolvedDisputesRemoved || 0);
      await fetchAdminData();
      setMessage(
        totalCleaned > 0
          ? `✓ Smart Auto-Cleanup imekamilika! Rekodi ${totalCleaned} za zamani zimefutwa ili kutunza nafasi.`
          : '✓ Database ni safi! Hakuna kazi zilizopitwa na wakati (siku 7+) au kazi zilizokamilika za zamani (siku 30+) za kufuta kwa sasa.'
      );
    } catch (err) {
      console.error(err);
      setMessage('Failed to run cleanup');
    } finally {
      setCleanupLoading(false);
    }
  };

  const openCount = disputes.filter(d => d.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="mr-3 text-red-500" /> Admin Control Panel
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Simamia watumiaji na malalamiko/maoni ya siri kutoka kwa Waajiri na Wafanyakazi.
            </p>
          </div>
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Watumiaji & Mfumo (Overview)
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center cursor-pointer ${activeTab === 'disputes' ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MessageSquareWarning size={16} className="mr-1.5" />
              Maoni & Malalamiko (Disputes)
              {openCount > 0 && (
                <span className="ml-2 bg-red-600 text-white py-0.5 px-2 rounded-full text-xs">{openCount}</span>
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <AlertCircle size={18} className="mr-2" /> {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading metrics...</div>
        ) : activeTab === 'overview' ? (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Watumiaji Wote (Users)" value={stats?.totalUsers || 0} icon={<Users className="text-blue-500" />} />
              <StatCard title="Kazi Zilizopostiwa" value={stats?.totalJobs || 0} icon={<Briefcase className="text-primary-500" />} />
              <StatCard title="Kazi Zilizokamilika" value={stats?.completedJobs || 0} icon={<CheckCircle className="text-green-500" />} />
              <StatCard title="Malalamiko Wazi" value={openCount} icon={<MessageSquareWarning className="text-red-500" />} />
            </div>

            {/* Smart Auto-Cleanup & Storage Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                  <Database size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">
                      Smart Auto-Cleanup Active (Utunzaji wa Space ya Database)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Ukubwa: {stats?.storage?.sizeKB ?? 0.6} KB
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    • <strong>Siku 7:</strong> Kazi zilizopitwa na muda bila kufanyika hufutwa zenyewe.<br />
                    • <strong>Siku 30:</strong> Kazi zilizokamilika na malalamiko yaliyotatuliwa hufutwa baada ya siku 30 (huku <em>nyota/ratings</em> na idadi ya kazi za mfanyakazi zikibaki salama kwenye wasifu wake).
                  </p>
                </div>
              </div>
              <button
                onClick={handleManualCleanup}
                disabled={cleanupLoading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center shrink-0 transition-colors cursor-pointer"
              >
                <Trash2 size={15} className="mr-1.5" />
                {cleanupLoading ? 'Inasafisha...' : 'Safisha Sasa (Clean Up)'}
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">User Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {user.phone || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                             user.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user.role !== 'ADMIN' && (
                            <button 
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                              className={`cursor-pointer ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {user.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Hakuna Malalamiko Kwa Sasa!</h3>
                <p className="text-gray-500">Mwajiri au mfanyakazi akituma maoni/lalamiko ya siri, yataonekana hapa ili uwafuate moja kwa moja.</p>
              </div>
            ) : (
              disputes.map(d => {
                const employer = d.job?.employer;
                const worker = d.job?.transactions?.[0]?.worker;
                return (
                  <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          d.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                          d.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {d.status === 'OPEN' ? '🔴 MPYA (OPEN)' : d.status === 'IN_REVIEW' ? '🟡 INASHUGHULIKIWA' : '🟢 IMETATULIWA (RESOLVED)'}
                        </span>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded">
                          Aliyelalamika: {d.reporter?.role === 'EMPLOYER' ? 'MWAJIRI (Employer)' : 'MFANYAKAZI (Worker)'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString()}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Kazi: {d.job?.title || 'Job'} (TSh {d.job?.payPerWorker?.toLocaleString()})
                    </h3>

                    {/* Private Complaint Message */}
                    <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 mb-5">
                      <p className="text-xs font-bold uppercase text-red-700 mb-1">
                        Ujumbe / Sababu kutoka kwa {d.reporter?.fullName} ({d.reporter?.role}):
                      </p>
                      <p className="text-gray-900 text-sm whitespace-pre-wrap font-medium">{d.description}</p>
                    </div>

                    {/* Direct Contact Cards for Both Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs font-bold uppercase text-blue-700 mb-1">Mawasiliano ya Mwajiri (Employer)</p>
                        <p className="font-bold text-gray-900">{employer?.fullName || '—'}</p>
                        <p className="text-sm text-gray-600">{employer?.email}</p>
                        {employer?.phone && (
                          <p className="text-sm font-bold text-blue-800 mt-1 flex items-center">
                            <Phone size={14} className="mr-1.5" /> {employer.phone}
                          </p>
                        )}
                      </div>

                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-xs font-bold uppercase text-emerald-700 mb-1">Mawasiliano ya Mfanyakazi (Worker)</p>
                        <p className="font-bold text-gray-900">{worker?.fullName || (d.reporter?.role === 'WORKER' ? d.reporter?.fullName : '—')}</p>
                        <p className="text-sm text-gray-600">{worker?.email || (d.reporter?.role === 'WORKER' ? d.reporter?.email : '')}</p>
                        {(worker?.phone || (d.reporter?.role === 'WORKER' && d.reporter?.phone)) && (
                          <p className="text-sm font-bold text-emerald-800 mt-1 flex items-center">
                            <Phone size={14} className="mr-1.5" /> {worker?.phone || d.reporter?.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes & Resolution Actions */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Maamuzi / Kumbukumbu za Admin (Admin Notes)
                        </label>
                        <input
                          type="text"
                          value={notesInput[d.id] || ''}
                          onChange={e => setNotesInput({ ...notesInput, [d.id]: e.target.value })}
                          placeholder="Andika ulichokubaliana baada ya kuwapigia simu..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateDispute(d.id, 'IN_REVIEW')}
                          disabled={actionLoading === d.id}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Inashughulikiwa
                        </button>
                        <button
                          onClick={() => handleUpdateDispute(d.id, 'RESOLVED')}
                          disabled={actionLoading === d.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          ✓ Imetatuliwa (Resolved)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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

export default AdminDashboard;
