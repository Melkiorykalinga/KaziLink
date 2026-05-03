import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const FundJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [job, setJob] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Let's assume we pass transactionId in state or we fetch the PENDING transaction for this job
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch Job Details
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data);

        // Fetch Transactions logic - wait since we only have `POST /create`, 
        // We'll mimic this by finding if there's any PENDING transaction locally or we'll create one blindly if none exists.
        // Actually, the route "POST /api/transactions/create" should be hit when Employer "Accepts" worker.
        // Here we assume the transaction is passed,, or we can just fetch it if we had a dedicated GET /api/transactions/:jobId 
        // For scope of this task: Let's assume we create it here if it doesn't exist just to map the flow smoothly.
        
        // As a prototype, let's create the PENDING transaction right now, using the first accepted worker
        const createRes = await api.post('/transactions/create', { 
           jobId: jobRes.data.id,
           workerId: "mockWorkerIdForNow", // Requires real Worker ID from context in production
           paymentMethod: "MPESA" 
        }).catch(err => {
           // If it already exists, that's fine, we will handle it via state management or an actual GET route.
           console.warn("Transaction might already exist or worker missing", err);
           return null;
        });

        if (createRes && createRes.data) {
           setTransaction(createRes.data);
        } else {
           // Fallback logic
        }

      } catch (err) {
        setError('Failed to load transaction details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [jobId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleFundJob = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please provide payment proof.');
      return;
    }

    // Since we don't have a reliable transaction ID without a GET transaction endpoint,
    // ensure your implementation securely queries the actual ID. For placeholder UI, we mock transactionId.
    const activeTransactionId = transaction?.id || "PLACEHOLDER_TRANSACTION_ID"; 

    const formData = new FormData();
    formData.append('transactionId', activeTransactionId);
    formData.append('paymentProof', file);

    setSubmitting(true);
    setError('');

    try {
      await api.post('/transactions/fund', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/employer/dashboard'); // Redirect on success
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fund job.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading escrow gateway...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fund Task via Escrow</h1>
        <p className="text-gray-500 mb-8">
          Upload your M-PESA or Airtel Money transfer receipt to secure the funds. 
          Funds will be held until you release them.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Job Summary */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
           <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Base Pay</span>
              <span className="font-medium">${job?.payPerWorker || "0.00"}</span>
           </div>
           <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Platform Commission (10%)</span>
              <span className="font-medium">${(job?.payPerWorker * 0.10).toFixed(2) || "0.00"}</span>
           </div>
           <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-gray-800 font-bold">Total to Pay</span>
              <span className="text-2xl font-bold text-green-600">
                 ${(job?.payPerWorker * 1.10).toFixed(2) || "0.00"}
              </span>
           </div>
        </div>

        <form onSubmit={handleFundJob}>
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Upload Payment Proof (Screenshot)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${preview ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 bg-gray-50'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              {preview ? (
                <div className="relative w-full max-h-64 flex justify-center">
                  <img src={preview} alt="Proof preview" className="max-h-64 object-contain rounded-lg" />
                </div>
              ) : (
                <>
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Click to select image file</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-bold"
          >
            {submitting ? <Loader className="animate-spin w-6 h-6" /> : "Fund via Escrow"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FundJob;
