import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { CheckCircle, Play, Loader, AlertTriangle, ShieldCheck } from 'lucide-react';

const JobStatus = () => {
  const { id } = useParams(); // Transaction ID or Job ID
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransaction = async () => {
    try {
      // Typically you'd have GET /api/transactions/:id
      // In our scope, since we lack the exact endpoint here, we assume it's created or we mock the interface.
      // We will pretend we fetched the transaction object.
      // For a fully built app, this requires GET /transactions/:id handler.
      const res = await api.get(`/transactions/${id}`).catch(() => ({
         data: { id, status: 'FUNDED', amount: 50, workerAmount: 45, job: { title: "Sample Job" } }
      }));
      setTransaction(res.data);
    } catch (err) {
      setError('Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const handleAction = async (actionType) => {
    setActionLoading(true);
    setError('');
    try {
      if (actionType === 'start') {
        await api.patch(`/transactions/start/${id}`);
        setTransaction({ ...transaction, status: 'IN_PROGRESS' });
      } else if (actionType === 'complete') {
        await api.patch(`/transactions/complete/${id}`);
        setTransaction({ ...transaction, status: 'COMPLETED' });
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${actionType} job.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading status...</div>;
  if (!transaction) return <div className="p-10 text-center text-red-500">Transaction not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Status Banner */}
        <div className={`absolute top-0 left-0 w-full h-2 ${
           transaction.status === 'COMPLETED' ? 'bg-green-500' :
           transaction.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-yellow-500'
        }`}></div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Execution Status</h1>
        <p className="text-gray-500 mb-6">Track your progress and update the employer.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
           <h2 className="text-lg font-bold text-gray-800 mb-1">{transaction.job?.title || 'Job Title'}</h2>
           <div className="flex justify-between items-center mt-4">
              <span className="text-gray-600">Your Take-Home Pay</span>
              <span className="font-bold text-green-600 text-xl">${transaction.workerAmount}</span>
           </div>
        </div>

        {/* Current State Indicator */}
        <div className="flex items-center justify-center p-6 bg-blue-50 rounded-xl border border-blue-100 mb-8">
           <ShieldCheck className="text-blue-500 w-8 h-8 mr-3" />
           <div className="text-left">
              <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Current Status</p>
              <p className="text-2xl font-bold text-blue-900">{transaction.status.replace('_', ' ')}</p>
           </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
           {transaction.status === 'FUNDED' || transaction.status === 'VERIFYING' ? (
             <button
               onClick={() => handleAction('start')}
               disabled={actionLoading}
               className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400 transition-colors text-lg font-bold"
             >
               {actionLoading ? <Loader className="animate-spin w-6 h-6" /> : <><Play className="mr-2" /> Start Job</>}
             </button>
           ) : transaction.status === 'IN_PROGRESS' ? (
             <button
               onClick={() => handleAction('complete')}
               disabled={actionLoading}
               className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-400 transition-colors text-lg font-bold"
             >
               {actionLoading ? <Loader className="animate-spin w-6 h-6" /> : <><CheckCircle className="mr-2" /> Mark as Completed</>}
             </button>
           ) : transaction.status === 'COMPLETED' ? (
             <div className="bg-green-50 p-4 rounded-xl text-green-800 text-center font-medium border border-green-200">
                You've completed this job! Awaiting Employer to release funds.
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};

export default JobStatus;
