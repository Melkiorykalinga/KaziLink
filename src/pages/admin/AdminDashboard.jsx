import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Briefcase, DollarSign, Activity, CheckCircle, AlertCircle, Shield, ArrowRight, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications'
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, verificationsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/transactions?status=VERIFYING')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setVerifications(verificationsRes.data);
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

  const handleVerify = async (txId) => {
    setActionLoading(txId);
    setMessage('');
    try {
      await api.patch(`/transactions/verify/${txId}`);
      setMessage('Payment successfully verified!');
      // Remove from list
      setVerifications(verifications.filter(tx => tx.id !== txId));
    } catch (err) {
      console.error(err);
      setMessage('Failed to verify payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (txId) => {
    if (!window.confirm('Are you sure you want to cancel this transaction? This cannot be undone.')) return;
    setActionLoading(txId);
    setMessage('');
    try {
      await api.patch(`/transactions/cancel/${txId}`);
      setMessage('Transaction cancelled.');
      setVerifications(verifications.filter(tx => tx.id !== txId));
    } catch (err) {
      console.error(err);
      setMessage('Failed to cancel transaction');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="mr-3 text-red-500" /> Admin Control Panel
            </h1>
            <p className="mt-1 text-gray-500 text-sm">Monitor platform metrics and verify payments.</p>
          </div>
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${activeTab === 'verifications' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Verifications 
              {verifications.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{verifications.length}</span>
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
              <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<Users className="text-blue-500" />} />
              <StatCard title="Total Jobs Posted" value={stats?.totalJobs || 0} icon={<Briefcase className="text-primary-500" />} />
              <StatCard title="Jobs Completed" value={stats?.completedJobs || 0} icon={<CheckCircleIcon className="text-green-500" />} />
              <StatCard title="Platform Revenue" value={`KES ${stats?.totalRevenue || 0}`} icon={<DollarSign className="text-yellow-500" />} />
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
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
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
                              className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
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
            {verifications.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">There are no pending payment verifications at the moment.</p>
              </div>
            ) : (
              verifications.map(tx => (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-6">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Shield size={14} className="mr-1.5" /> Verifying Payment
                      </span>
                      <span className="text-sm text-gray-500">{new Date(tx.updatedAt).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{tx.job?.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Employer (Payer)</p>
                        <p className="font-medium text-gray-900">{tx.employer?.fullName}</p>
                        <p className="text-sm text-gray-500">{tx.employer?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Worker (Payee)</p>
                        <p className="font-medium text-gray-900">{tx.worker?.fullName}</p>
                        <p className="text-sm text-gray-500">{tx.worker?.email}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 inline-block min-w-[200px]">
                      <p className="text-xs text-gray-500 uppercase">Amount to Verify</p>
                      <p className="text-2xl font-bold text-gray-900">KES {tx.amount?.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">Method: {tx.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Proof & Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-4 min-w-[300px]">
                    <div className="w-full">
                      <p className="text-sm font-medium text-gray-700 mb-2">Payment Proof Uploaded:</p>
                      {tx.paymentProof ? (
                        <a href={tx.paymentProof} target="_blank" rel="noreferrer" className="block w-full h-48 border border-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                          <img src={tx.paymentProof} alt="Proof" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          No image provided
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 w-full mt-2">
                      <button
                        onClick={() => handleCancel(tx.id)}
                        disabled={actionLoading === tx.id}
                        className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <XCircle size={18} className="mr-1.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleVerify(tx.id)}
                        disabled={actionLoading === tx.id}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {actionLoading === tx.id ? 'Processing...' : <><CheckCircleIcon size={18} className="mr-1.5" /> Approve</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircleIcon = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

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
