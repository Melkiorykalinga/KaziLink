import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle, PlayCircle, Loader, AlertCircle, DollarSign, Shield, MapPin, Calendar, Timer } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:     { color: 'bg-yellow-100 text-yellow-800', label: 'Awaiting Payment' },
  VERIFYING:   { color: 'bg-blue-100 text-blue-800', label: 'Verifying Payment' },
  FUNDED:      { color: 'bg-indigo-100 text-indigo-800', label: 'Ready to Start' },
  IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
  COMPLETED:   { color: 'bg-green-100 text-green-800', label: 'Completed' },
  RELEASED:    { color: 'bg-emerald-100 text-emerald-800', label: 'Payment Released' },
  CANCELLED:   { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
};

const WorkerTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions/my');
      setTransactions(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (txId) => {
    setActionLoading(txId);
    setActionError('');
    setActionSuccess('');
    try {
      await api.patch(`/transactions/start/${txId}`);
      setActionSuccess('Job started! Good luck.');
      fetchTransactions();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to start');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (txId) => {
    setActionLoading(txId);
    setActionError('');
    setActionSuccess('');
    try {
      await api.patch(`/transactions/complete/${txId}`);
      setActionSuccess('Job marked as completed! Awaiting employer to release payment.');
      fetchTransactions();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to complete');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400"><Loader className="animate-spin mr-2" /> Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
        <p className="text-gray-500 mb-8">Track your accepted jobs and escrow payments</p>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2" /> {error}</div>}
        {actionSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center"><CheckCircle size={18} className="mr-2" /> {actionSuccess}</div>}
        {actionError && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2" /> {actionError}</div>}

        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <Clock size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No active jobs</h3>
            <p className="text-gray-400 text-sm">Once an employer accepts you for a job, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => {
              const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
              return (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{tx.job?.title || 'Job'}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">By: <span className="font-medium text-gray-700">{tx.employer?.fullName}</span></p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.color} self-start`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Job Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      {tx.job?.locationAddress && (
                        <span className="flex items-center"><MapPin size={14} className="mr-1 text-gray-400" /> {tx.job.locationAddress}</span>
                      )}
                      {tx.job?.category && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{tx.job.category}</span>
                      )}
                    </div>

                    {/* Earnings */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">You Will Earn</p>
                      <p className="text-2xl font-bold text-green-700">KES {tx.workerAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">Total: KES {tx.amount?.toLocaleString()} · Platform fee: KES {tx.commission?.toLocaleString()}</p>
                    </div>

                    {/* State Machine Steps */}
                    <div className="flex items-center gap-1 mb-5 overflow-x-auto py-1">
                      {['PENDING', 'VERIFYING', 'FUNDED', 'IN_PROGRESS', 'COMPLETED', 'RELEASED'].map((step, i) => {
                        const stepOrder = ['PENDING', 'VERIFYING', 'FUNDED', 'IN_PROGRESS', 'COMPLETED', 'RELEASED'];
                        const currentIdx = stepOrder.indexOf(tx.status);
                        const stepIdx = i;
                        const isComplete = stepIdx <= currentIdx;
                        const isCurrent = stepIdx === currentIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className={`flex-shrink-0 w-3 h-3 rounded-full transition-all ${
                              isCurrent ? 'w-4 h-4 ring-4 ring-primary-100 bg-primary-500' :
                              isComplete ? 'bg-green-500' : 'bg-gray-200'
                            }`} title={step} />
                            {i < 5 && <div className={`flex-1 h-0.5 min-w-4 ${isComplete && stepIdx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {tx.status === 'FUNDED' && (
                        <button
                          onClick={() => handleStart(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                          {actionLoading === tx.id ? <Loader className="animate-spin mr-2" size={16} /> : <PlayCircle size={16} className="mr-2" />}
                          Start Job
                        </button>
                      )}
                      {tx.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleComplete(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                          {actionLoading === tx.id ? <Loader className="animate-spin mr-2" size={16} /> : <CheckCircle size={16} className="mr-2" />}
                          Mark Completed
                        </button>
                      )}
                      {tx.status === 'PENDING' && (
                        <p className="text-sm text-yellow-600 flex items-center"><Clock size={14} className="mr-1.5" /> Waiting for employer to send payment...</p>
                      )}
                      {tx.status === 'VERIFYING' && (
                        <p className="text-sm text-blue-600 flex items-center"><Shield size={14} className="mr-1.5" /> Payment is being verified by admin...</p>
                      )}
                      {tx.status === 'COMPLETED' && (
                        <p className="text-sm text-green-600 flex items-center"><Clock size={14} className="mr-1.5" /> Waiting for employer to release payment...</p>
                      )}
                      {tx.status === 'RELEASED' && (
                        <p className="text-sm text-emerald-700 font-semibold flex items-center"><DollarSign size={14} className="mr-1.5" /> Payment received! KES {tx.workerAmount?.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100">
                    <div className={`h-full transition-all duration-700 rounded-r ${
                      tx.status === 'PENDING' ? 'w-[16%] bg-yellow-400' :
                      tx.status === 'VERIFYING' ? 'w-[33%] bg-blue-400' :
                      tx.status === 'FUNDED' ? 'w-[50%] bg-indigo-500' :
                      tx.status === 'IN_PROGRESS' ? 'w-[66%] bg-purple-500' :
                      tx.status === 'COMPLETED' ? 'w-[83%] bg-green-500' :
                      tx.status === 'RELEASED' ? 'w-full bg-emerald-500' :
                      'w-0 bg-red-400'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerTransactions;
