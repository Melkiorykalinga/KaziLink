import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle, ArrowRight, PlayCircle, Upload, Loader, AlertCircle, DollarSign, Shield } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:     { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Payment', icon: Clock },
  VERIFYING:   { color: 'bg-blue-100 text-blue-800', label: 'Verifying', icon: Shield },
  FUNDED:      { color: 'bg-indigo-100 text-indigo-800', label: 'Funded', icon: DollarSign },
  IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', label: 'In Progress', icon: PlayCircle },
  COMPLETED:   { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
  RELEASED:    { color: 'bg-emerald-100 text-emerald-800', label: 'Released', icon: CheckCircle },
  CANCELLED:   { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircle },
};

const EmployerTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Fund modal state
  const [fundModal, setFundModal] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selected.type)) {
      setActionError('Only JPG and PNG images are allowed');
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setActionError('File must be under 2MB');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setActionError('');
  };

  const handleFund = async (txId) => {
    if (!file) {
      setActionError('Please select a payment proof image');
      return;
    }
    setActionLoading(txId);
    setActionError('');
    try {
      const formData = new FormData();
      formData.append('transactionId', txId);
      formData.append('paymentProof', file);
      await api.post('/transactions/fund', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActionSuccess('Payment proof uploaded! Awaiting admin verification.');
      setFundModal(null);
      setFile(null);
      setPreview(null);
      fetchTransactions();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Upload failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelease = async (txId) => {
    setActionLoading(txId);
    setActionError('');
    try {
      await api.post(`/transactions/release/${txId}`);
      setActionSuccess('Payment released to worker!');
      fetchTransactions();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Release failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400"><Loader className="animate-spin mr-2" /> Loading transactions...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Escrow Transactions</h1>
        <p className="text-gray-500 mb-8">Manage payments for your posted jobs</p>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2 flex-shrink-0" /> {error}</div>}
        {actionSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center"><CheckCircle size={18} className="mr-2 flex-shrink-0" /> {actionSuccess}</div>}
        {actionError && !fundModal && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2 flex-shrink-0" /> {actionError}</div>}

        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <DollarSign size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No transactions yet</h3>
            <p className="text-gray-400 text-sm">Transactions will appear here when you accept workers for your jobs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => {
              const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{tx.job?.title || 'Job'}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Worker: <span className="font-medium text-gray-700">{tx.worker?.fullName}</span></p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.color} self-start`}>
                        <StatusIcon size={14} className="mr-1.5" /> {cfg.label}
                      </span>
                    </div>

                    {/* Financial Details */}
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
                        <p className="text-lg font-bold text-gray-900">KES {tx.amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Commission</p>
                        <p className="text-lg font-bold text-red-500">KES {tx.commission?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Worker Gets</p>
                        <p className="text-lg font-bold text-green-600">KES {tx.workerAmount?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Payment proof preview */}
                    {tx.paymentProof && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Payment Proof</p>
                        <img src={tx.paymentProof} alt="Payment proof" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {tx.status === 'PENDING' && (
                        <button
                          onClick={() => { setFundModal(tx.id); setActionError(''); setActionSuccess(''); }}
                          className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95 shadow-sm"
                        >
                          <Upload size={16} className="mr-2" /> Upload Payment Proof
                        </button>
                      )}
                      {tx.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleRelease(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                          {actionLoading === tx.id ? <Loader className="animate-spin mr-2" size={16} /> : <DollarSign size={16} className="mr-2" />}
                          Release Payment
                        </button>
                      )}
                      {tx.status === 'RELEASED' && (
                        <span className="flex items-center text-emerald-600 font-medium text-sm"><CheckCircle size={16} className="mr-1.5" /> Payment Released</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-gray-100">
                    <div className={`h-full transition-all duration-500 ${
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

        {/* Fund Modal */}
        {fundModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setFundModal(null); setFile(null); setPreview(null); }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Upload Payment Proof</h3>
              <p className="text-sm text-gray-500 mb-6">Upload a screenshot of your M-Pesa or Airtel Money payment (JPG/PNG, max 2MB).</p>

              {actionError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{actionError}</div>}

              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${preview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">Click to select image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG or PNG · Max 2MB</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
              </label>

              {file && <p className="text-xs text-gray-500 mt-2 truncate">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setFundModal(null); setFile(null); setPreview(null); setActionError(''); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFund(fundModal)}
                  disabled={!file || actionLoading === fundModal}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading === fundModal ? <Loader className="animate-spin" size={18} /> : <>Submit <ArrowRight size={16} className="ml-1.5" /></>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerTransactions;
