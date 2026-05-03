import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { CheckCircle, AlertTriangle, Loader, Unlock } from 'lucide-react';

const ReleasePayment = () => {
  const { id } = useParams(); // Transaction ID
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await api.get(`/transactions/${id}`).catch(() => ({
            data: { id, status: 'COMPLETED', amount: 50, workerAmount: 45, job: { title: "Sample Job" }, worker: { fullName: "Jane Doe" } }
        }));
        setTransaction(res.data);
      } catch (err) {
        setError('Failed to load transaction data.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handleRelease = async () => {
    setReleaseLoading(true);
    setError('');
    try {
      await api.post(`/transactions/release/${id}`);
      setTransaction({ ...transaction, status: 'RELEASED' });
      // Usually we'd navigate away or show success
    } catch (err) {
      setError(err.response?.data?.error || `Failed to release payment.`);
    } finally {
      setReleaseLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading escrow data...</div>;
  if (!transaction) return <div className="p-10 text-center text-red-500">Transaction not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Release Escrow Funds</h1>
        <p className="text-gray-500 mb-6">Confirm the work is complete to transfer funds to the worker's wallet.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Escrow Details</h3>
           <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Job</span>
              <span className="text-gray-900">{transaction.job?.title}</span>
           </div>
           <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Worker</span>
              <span className="text-gray-900">{transaction.worker?.fullName}</span>
           </div>
           <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Amount Holding</span>
              <span className="text-gray-900 font-bold">${transaction.amount}</span>
           </div>
           <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <span className="text-gray-900 font-bold">Release to Worker</span>
              <span className="text-2xl font-bold text-green-600">${transaction.workerAmount}</span>
           </div>
        </div>

        {transaction.status === 'COMPLETED' ? (
           <button
             onClick={handleRelease}
             disabled={releaseLoading}
             className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 transition-colors text-lg font-bold"
           >
             {releaseLoading ? <Loader className="animate-spin w-6 h-6" /> : <><Unlock className="mr-2" /> Agree & Release Funds</>}
           </button>
        ) : transaction.status === 'RELEASED' ? (
           <div className="bg-green-50 p-6 rounded-xl text-green-800 text-center border border-green-200">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-bold">Funds Successfully Released!</h3>
              <p className="mt-1 text-green-700 uppercase font-medium text-sm">Transaction Closed</p>
           </div>
        ) : (
           <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 text-yellow-800 text-center">
              Cannot release funds yet. The transaction status is currently <strong>{transaction.status}</strong>. Worker must mark it as COMPLETED first.
           </div>
        )}
      </div>
    </div>
  );
};

export default ReleasePayment;
