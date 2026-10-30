import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle, PlayCircle, Loader, AlertCircle, DollarSign, MapPin, Phone, MessageSquareWarning } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:     { color: 'bg-indigo-100 text-indigo-800', labelEn: 'Ready to Start', labelSw: 'Tayari Kuanza Kazi' },
  FUNDED:      { color: 'bg-indigo-100 text-indigo-800', labelEn: 'Ready to Start', labelSw: 'Tayari Kuanza Kazi' },
  IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', labelEn: 'In Progress', labelSw: 'Kazi Inaendelea' },
  COMPLETED:   { color: 'bg-amber-100 text-amber-800', labelEn: 'Completed · Awaiting Direct Pay', labelSw: 'Imekamilika · Inasubiri Malipo' },
  VERIFYING:   { color: 'bg-blue-100 text-blue-800', labelEn: 'Employer Marked Paid · Confirm Below', labelSw: 'Mwajiri Amelipa · Thibitisha Hapa' },
  RELEASED:    { color: 'bg-emerald-100 text-emerald-800', labelEn: 'Payment Received ✓', labelSw: 'Malipo Yamepokelewa ✓' },
  CANCELLED:   { color: 'bg-red-100 text-red-800', labelEn: 'Cancelled', labelSw: 'Imesitishwa' },
};

const WorkerTransactions = () => {
  const { lang, t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Private Dispute / Admin Feedback modal state
  const [disputeModal, setDisputeModal] = useState(null);
  const [disputeText, setDisputeText] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions/my');
      setTransactions(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load jobs');
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
      setActionSuccess(lang === 'sw' ? 'Kazi imeanza! Kila la heri.' : 'Job started! Good luck.');
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
      setActionSuccess(
        lang === 'sw'
          ? 'Umeweka alama kazi imekamilika! Mwajiri sasa atakulipa moja kwa moja.'
          : 'Job marked as completed! The employer will now pay you directly.'
      );
      fetchTransactions();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to complete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReceipt = async (txId) => {
    setActionLoading(txId);
    setActionError('');
    setActionSuccess('');
    try {
      await api.post(`/transactions/confirm-receipt/${txId}`);
      setActionSuccess(t('wtx_paidSuccess'));
      fetchTransactions();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to confirm payment receipt');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeText.trim()) return;
    setActionLoading('dispute');
    setActionError('');
    try {
      await api.post(`/transactions/${disputeModal.id}/dispute`, {
        description: disputeText.trim()
      });
      setActionSuccess(
        lang === 'sw'
          ? '✓ Maoni/Malalamiko yako yametumwa kwa Admin pekee! Admin atawasiliana nawe.'
          : '✓ Your private report has been sent to the Admin only! Admin will follow up directly.'
      );
      setDisputeModal(null);
      setDisputeText('');
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to send report');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400"><Loader className="animate-spin mr-2" /> Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{t('wtx_title')}</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 w-max">
            {t('nav_freeBadge')}
          </span>
        </div>
        <p className="text-gray-500 mb-8">{t('wtx_subtitle')}</p>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2" /> {error}</div>}
        {actionSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center"><CheckCircle size={18} className="mr-2" /> {actionSuccess}</div>}
        {actionError && !disputeModal && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2" /> {actionError}</div>}

        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <Clock size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('wtx_noJobsTitle')}</h3>
            <p className="text-gray-400 text-sm">{t('wtx_noJobsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => {
              const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.FUNDED;
              return (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{tx.job?.title || 'Job'}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{t('wtx_employerLabel')}: <strong className="text-gray-700">{tx.employer?.fullName}</strong></span>
                          {tx.employer?.phone && (
                            <span className="inline-flex items-center text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                              <Phone size={12} className="mr-1" /> {tx.employer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.color} self-start`}>
                        {lang === 'sw' ? cfg.labelSw : cfg.labelEn}
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

                    {/* 100% Earnings (0% Commission) */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
                      <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-1">{t('wtx_youEarn')}</p>
                      <p className="text-2xl font-bold text-green-700">TSh {(tx.amount || tx.workerAmount)?.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">{t('wtx_zeroFeeNote')}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-3 flex-1">
                        {(tx.status === 'FUNDED' || tx.status === 'PENDING') && (
                          <button
                            onClick={() => handleStart(tx.id)}
                            disabled={actionLoading === tx.id}
                            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === tx.id ? <Loader className="animate-spin mr-2" size={16} /> : <PlayCircle size={16} className="mr-2" />}
                            {t('wtx_btnStartJob')}
                          </button>
                        )}
                        {tx.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleComplete(tx.id)}
                            disabled={actionLoading === tx.id}
                            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === tx.id ? <Loader className="animate-spin mr-2" size={16} /> : <CheckCircle size={16} className="mr-2" />}
                            {t('wtx_btnMarkComplete')}
                          </button>
                        )}
                        {tx.status === 'COMPLETED' && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <p className="text-sm text-amber-700 flex items-center">
                              <Clock size={15} className="mr-1.5 flex-shrink-0" /> {t('wtx_waitingEmployerPay')}
                            </p>
                            <button
                              onClick={() => handleConfirmReceipt(tx.id)}
                              disabled={actionLoading === tx.id}
                              className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm whitespace-nowrap cursor-pointer w-max"
                            >
                              {actionLoading === tx.id ? <Loader className="animate-spin mr-1.5" size={14} /> : <CheckCircle size={15} className="mr-1.5" />}
                              {t('wtx_btnConfirmReceipt')}
                            </button>
                          </div>
                        )}
                        {tx.status === 'VERIFYING' && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full bg-blue-50 p-3 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-800 font-medium flex items-center">
                              <DollarSign size={16} className="mr-1.5 flex-shrink-0 text-blue-600" /> {t('wtx_employerMarkedPaid')}
                            </p>
                            <button
                              onClick={() => handleConfirmReceipt(tx.id)}
                              disabled={actionLoading === tx.id}
                              className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md whitespace-nowrap cursor-pointer"
                            >
                              {actionLoading === tx.id ? <Loader className="animate-spin mr-1.5" size={15} /> : <CheckCircle size={16} className="mr-1.5" />}
                              {t('wtx_btnConfirmReceipt')}
                            </button>
                          </div>
                        )}
                        {tx.status === 'RELEASED' && (
                          <p className="text-sm text-emerald-700 font-semibold flex items-center">
                            <CheckCircle size={16} className="mr-1.5" /> {t('wtx_paidSuccess')} (TSh {(tx.amount || tx.workerAmount)?.toLocaleString()})
                          </p>
                        )}
                      </div>

                      {/* Private Report / Complaint to Admin Button */}
                      <button
                        type="button"
                        onClick={() => { setDisputeModal(tx); setDisputeText(''); setActionError(''); }}
                        className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <MessageSquareWarning size={14} className="mr-1.5" />
                        {lang === 'sw' ? 'Toa Maoni / Lalamika kwa Admin' : 'Report Issue to Admin'}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100">
                    <div className={`h-full transition-all duration-700 rounded-r ${
                      tx.status === 'PENDING' || tx.status === 'FUNDED' ? 'w-[25%] bg-indigo-500' :
                      tx.status === 'IN_PROGRESS' ? 'w-[50%] bg-purple-500' :
                      tx.status === 'COMPLETED' ? 'w-[75%] bg-amber-500' :
                      tx.status === 'VERIFYING' ? 'w-[90%] bg-blue-500' :
                      tx.status === 'RELEASED' ? 'w-full bg-emerald-500' :
                      'w-0 bg-red-400'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Private Dispute / Report to Admin Modal */}
        {disputeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDisputeModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-1">
                <MessageSquareWarning size={22} />
                <h3>{lang === 'sw' ? 'Tuma Maoni au Lalamiko kwa Admin' : 'Send Private Report to Admin'}</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {lang === 'sw'
                  ? '🔒 Ujumbe huu utaonekana na ADMIN PEKEE. Eleza changamoto iliyotokea kwenye kazi au malipo ili Admin awasiliane na mwajiri.'
                  : '🔒 This message is visible ONLY to the Admin. Describe what happened with the job or payment so Admin can follow up.'}
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-700 border border-gray-200">
                <div><strong>{lang === 'sw' ? 'Kazi' : 'Job'}:</strong> {disputeModal.job?.title}</div>
                <div><strong>{lang === 'sw' ? 'Mwajiri' : 'Employer'}:</strong> {disputeModal.employer?.fullName}</div>
              </div>

              {actionError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{actionError}</div>}

              <form onSubmit={handleDisputeSubmit}>
                <textarea
                  required
                  rows={4}
                  value={disputeText}
                  onChange={e => setDisputeText(e.target.value)}
                  placeholder={
                    lang === 'sw'
                      ? 'Andika hapa maoni yako (mfano: Nimemaliza kazi yote lakini mwajiri bado hajanilipa au simpati kwenye simu...)'
                      : 'Describe the issue (e.g., I completed the job as agreed but have not been paid yet...)'
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none mb-4"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDisputeModal(null)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'dispute'}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {actionLoading === 'dispute' ? <Loader className="animate-spin" size={18} /> : (lang === 'sw' ? 'Tuma kwa Admin' : 'Send to Admin')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerTransactions;
