import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle, PlayCircle, Loader, AlertCircle, DollarSign, Shield, Star, Phone, MessageSquareWarning } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:     { color: 'bg-indigo-100 text-indigo-800', labelEn: 'Worker Accepted', labelSw: 'Mfanyakazi Amekubaliwa', icon: Clock },
  FUNDED:      { color: 'bg-indigo-100 text-indigo-800', labelEn: 'Ready to Start', labelSw: 'Tayari Kuanza Kazi', icon: PlayCircle },
  IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', labelEn: 'Job In Progress', labelSw: 'Kazi Inaendelea', icon: PlayCircle },
  COMPLETED:   { color: 'bg-amber-100 text-amber-800', labelEn: 'Job Done · Pay Worker', labelSw: 'Kazi Imeisha · Mlipe Mfanyakazi', icon: DollarSign },
  VERIFYING:   { color: 'bg-blue-100 text-blue-800', labelEn: 'Paid · Awaiting Worker Confirm', labelSw: 'Umelipa · Inasubiri Mfanyakazi', icon: Shield },
  RELEASED:    { color: 'bg-emerald-100 text-emerald-800', labelEn: 'Payment Confirmed ✓', labelSw: 'Malipo Yamethibitishwa ✓', icon: CheckCircle },
  CANCELLED:   { color: 'bg-red-100 text-red-800', labelEn: 'Cancelled', labelSw: 'Imesitishwa', icon: XCircle },
};

const EmployerTransactions = () => {
  const { lang, t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Rating modal state
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingText, setRatingText] = useState('');

  // Private Dispute / Admin Feedback modal state
  const [disputeModal, setDisputeModal] = useState(null); // transaction object
  const [disputeText, setDisputeText] = useState('');

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

  const handleMarkPaid = async (txId) => {
    setActionLoading(txId);
    setActionError('');
    try {
      await api.post(`/transactions/release/${txId}`);
      setActionSuccess(
        lang === 'sw'
          ? 'Umeweka alama kuwa umemlipa mfanyakazi! Sasa mfanyakazi atathibitisha kupokea.'
          : 'Marked as paid! The worker will now confirm receipt on their dashboard.'
      );
      fetchTransactions();
      setRatingModal(txId);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('rating');
    try {
      await api.post(`/transactions/${ratingModal}/rate`, {
        stars: ratingStars,
        reviewText: ratingText
      });
      setActionSuccess(lang === 'sw' ? 'Maoni na nyota vimetumwa!' : 'Worker endorsed successfully!');
      setRatingModal(null);
      setRatingStars(5);
      setRatingText('');
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to submit rating');
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
          <h1 className="text-3xl font-bold text-gray-900">{t('etx_title')}</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 w-max">
            {t('nav_freeBadge')}
          </span>
        </div>
        <p className="text-gray-500 mb-8">{t('etx_subtitle')}</p>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2 flex-shrink-0" /> {error}</div>}
        {actionSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center"><CheckCircle size={18} className="mr-2 flex-shrink-0" /> {actionSuccess}</div>}
        {actionError && !ratingModal && !disputeModal && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center"><AlertCircle size={18} className="mr-2 flex-shrink-0" /> {actionError}</div>}

        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <DollarSign size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('etx_noTxTitle')}</h3>
            <p className="text-gray-400 text-sm">{t('etx_noTxDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => {
              const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.FUNDED;
              const StatusIcon = cfg.icon;
              return (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{tx.job?.title || 'Job'}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{t('etx_workerLabel')}: <strong className="text-gray-800">{tx.worker?.fullName}</strong></span>
                          {tx.worker?.phone && (
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                              <Phone size={12} className="mr-1" /> {t('etx_phoneLabel')}: {tx.worker.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.color} self-start`}>
                        <StatusIcon size={14} className="mr-1.5" /> {lang === 'sw' ? cfg.labelSw : cfg.labelEn}
                      </span>
                    </div>

                    {/* Financial Details (0% Commission) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{t('etx_totalPay')}</p>
                        <p className="text-lg font-bold text-gray-900">TSh {tx.amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{t('etx_platformFee')}</p>
                        <p className="text-lg font-bold text-emerald-600">{t('etx_freeLabel')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{t('etx_netWorker')}</p>
                        <p className="text-lg font-bold text-green-700">TSh {(tx.amount || tx.workerAmount)?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-3">
                        {(tx.status === 'FUNDED' || tx.status === 'PENDING') && (
                          <p className="text-sm text-indigo-600 flex items-center">
                            <Clock size={15} className="mr-1.5" /> {t('etx_waitingWorkerStart')}
                          </p>
                        )}
                        {tx.status === 'IN_PROGRESS' && (
                          <p className="text-sm text-purple-600 flex items-center">
                            <PlayCircle size={15} className="mr-1.5" /> {t('etx_jobInProgress')}
                          </p>
                        )}
                        {tx.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleMarkPaid(tx.id)}
                            disabled={actionLoading === tx.id}
                            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === tx.id ? <Loader className="animate-spin mr-2" size={16} /> : <CheckCircle size={16} className="mr-2" />}
                            {t('etx_btnMarkPaid')} (TSh {tx.amount?.toLocaleString()})
                          </button>
                        )}
                        {tx.status === 'VERIFYING' && (
                          <>
                            <span className="flex items-center text-blue-700 font-medium text-sm">
                              <Clock size={16} className="mr-1.5" /> {t('etx_waitingWorkerConfirm')}
                            </span>
                            <button
                              onClick={() => { setRatingModal(tx.id); setActionError(''); }}
                              className="flex items-center bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm cursor-pointer"
                            >
                              <Star size={14} className="mr-1.5" /> {t('etx_btnRateWorker')}
                            </button>
                          </>
                        )}
                        {tx.status === 'RELEASED' && (
                          <>
                            <span className="flex items-center text-emerald-600 font-semibold text-sm">
                              <CheckCircle size={16} className="mr-1.5" /> {t('etx_paymentConfirmed')}
                            </span>
                            <button
                              onClick={() => { setRatingModal(tx.id); setActionError(''); }}
                              className="flex items-center bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm cursor-pointer"
                            >
                              <Star size={14} className="mr-1.5" /> {t('etx_btnRateWorker')}
                            </button>
                          </>
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
                    <div className={`h-full transition-all duration-500 ${
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
                  ? '🔒 Ujumbe huu utaonekana na ADMIN PEKEE. Eleza kama kuna changamoto kwenye kazi au sababu ya kutokamilisha malipo ili Admin awasiliane nanyi.'
                  : '🔒 This message is visible ONLY to the Admin. Describe any issue with the work or payment so Admin can follow up directly.'}
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-700 border border-gray-200">
                <div><strong>{lang === 'sw' ? 'Kazi' : 'Job'}:</strong> {disputeModal.job?.title}</div>
                <div><strong>{lang === 'sw' ? 'Mfanyakazi' : 'Worker'}:</strong> {disputeModal.worker?.fullName}</div>
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
                      ? 'Andika hapa maoni au sababu ya kulalamika (mfano: Mfanyakazi hajamaliza kazi vizuri au amechelewa sana...)'
                      : 'Describe what happened or why payment is withheld...'
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

        {/* Rating Modal */}
        {ratingModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRatingModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('etx_btnRateWorker')}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {lang === 'sw' ? 'Mpe mfanyakazi nyota na maoni mafupi kujenga uaminifu wake (max herufi 120).' : 'Write a short specific endorsement (max 120 characters).'}
              </p>

              {actionError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{actionError}</div>}

              <form onSubmit={handleRateSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingStars(star)}
                        className={`p-2 rounded-full cursor-pointer ${ratingStars >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star fill="currentColor" size={28} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'sw' ? 'Maoni / Uthibitisho (Hiari)' : 'Endorsement (Optional)'}
                  </label>
                  <textarea
                    maxLength={120}
                    value={ratingText}
                    onChange={e => setRatingText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                    rows="3"
                    placeholder={lang === 'sw' ? 'Mfano: Mwaminifu sana na amefanya kazi kwa wakati.' : 'E.g., Great attention to detail and very punctual.'}
                  ></textarea>
                  <div className="text-right text-xs text-gray-400 mt-1">{ratingText.length}/120</div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRatingModal(null)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'rating'}
                    className="flex-1 py-2.5 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {actionLoading === 'rating' ? <Loader className="animate-spin" size={18} /> : 'Submit'}
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

export default EmployerTransactions;
