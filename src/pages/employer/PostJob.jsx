import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, FileText, ListChecks, DollarSign, CheckCircle,
  ArrowRight, ArrowLeft, MapPin, Clock, Calendar, Users, Zap
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  'Construction', 'Cleaning', 'Delivery', 'Driving', 'Events',
  'Gardening', 'IT & Tech', 'Moving', 'Security', 'Warehousing', 'Other'
];

const initialForm = {
  title: '',
  description: '',
  category: '',
  workersNeeded: 1,
  jobDate: '',
  startTime: '',
  durationHours: '',
  locationAddress: '',
  payPerWorker: '',
  paymentMethod: 'MPESA',
  deadlineDate: '',
  deadlineTime: '18:00',
  specialRequirements: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Combine separate date + time fields into ISO strings
      const jobDateISO = new Date(`${formData.jobDate}T${formData.startTime}:00`).toISOString();
      const deadlineISO = new Date(`${formData.deadlineDate}T${formData.deadlineTime}:00`).toISOString();

      await api.post('/jobs', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        workersNeeded: Number(formData.workersNeeded),
        jobDate: jobDateISO,
        startTime: formData.startTime,
        durationHours: Number(formData.durationHours),
        locationAddress: formData.locationAddress,
        payPerWorker: Number(formData.payPerWorker),
        paymentMethod: formData.paymentMethod,
        applicationDeadline: deadlineISO,
        specialRequirements: formData.specialRequirements || null,
      });
      setStep(5); // success
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to post job. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Basics', icon: FileText },
    { num: 2, label: 'Schedule', icon: Calendar },
    { num: 3, label: 'Pay', icon: DollarSign },
    { num: 4, label: 'Review', icon: CheckCircle },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Post a <span style={{ color: '#6366f1' }}>New Job</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: 6 }}>Fill in the details to find the right workers.</p>
        </div>

        {/* Progress bar */}
        {step <= 4 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: 8 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step >= s.num ? '#6366f1' : '#e2e8f0',
                    color: step >= s.num ? '#fff' : '#94a3b8',
                    fontWeight: 700, fontSize: 14, transition: 'all .3s'
                  }}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span style={{ fontSize: 11, marginTop: 4, color: step >= s.num ? '#6366f1' : '#94a3b8', fontWeight: 600 }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 3, background: step > s.num ? '#6366f1' : '#e2e8f0', borderRadius: 2, transition: 'all .3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 1: Basics ── */}
        {step === 1 && (
          <Card title="Job Basics" icon={<FileText size={20} />}>
            <Field label="Job Title *">
              <input className="pj-input" placeholder="e.g. Warehouse Associate, Security Guard…"
                value={formData.title} onChange={e => update('title', e.target.value)} />
            </Field>
            <Field label="Category *">
              <select className="pj-input" value={formData.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Description *">
              <textarea className="pj-input pj-textarea" rows={4}
                placeholder="Describe the role, duties, and expectations…"
                value={formData.description} onChange={e => update('description', e.target.value)} />
            </Field>
            <Field label="Location Address *">
              <input className="pj-input" placeholder="e.g. Tom Mboya St, Nairobi CBD"
                value={formData.locationAddress} onChange={e => update('locationAddress', e.target.value)} />
            </Field>
            <Field label="Number of Workers Needed *">
              <input className="pj-input" type="number" min={1}
                value={formData.workersNeeded} onChange={e => update('workersNeeded', e.target.value)} />
            </Field>
            <Field label="Special Requirements">
              <textarea className="pj-input pj-textarea" rows={2}
                placeholder="e.g. Must have valid ID, own safety boots…"
                value={formData.specialRequirements} onChange={e => update('specialRequirements', e.target.value)} />
            </Field>
            <Actions onNext={() => setStep(2)} />
          </Card>
        )}

        {/* ── Step 2: Schedule ── */}
        {step === 2 && (
          <Card title="Schedule & Duration" icon={<Calendar size={20} />}>
            <Field label="Job Date *">
              <input className="pj-input" type="date"
                value={formData.jobDate} onChange={e => update('jobDate', e.target.value)} />
            </Field>
            <Field label="Start Time *">
              <input className="pj-input" type="time"
                value={formData.startTime} onChange={e => update('startTime', e.target.value)} />
            </Field>
            <Field label="Duration (hours) *">
              <input className="pj-input" type="number" min={0.5} step={0.5} placeholder="e.g. 8"
                value={formData.durationHours} onChange={e => update('durationHours', e.target.value)} />
            </Field>
            <Field label="Application Deadline Date *">
              <input className="pj-input" type="date"
                value={formData.deadlineDate} onChange={e => update('deadlineDate', e.target.value)} />
            </Field>
            <Field label="Application Deadline Time *">
              <input className="pj-input" type="time"
                value={formData.deadlineTime} onChange={e => update('deadlineTime', e.target.value)} />
            </Field>
            <Actions onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </Card>
        )}

        {/* ── Step 3: Pay ── */}
        {step === 3 && (
          <Card title="Compensation" icon={<DollarSign size={20} />}>
            <Field label="Pay Per Worker (KES) *">
              <input className="pj-input" type="number" min={1} placeholder="e.g. 1500"
                value={formData.payPerWorker} onChange={e => update('payPerWorker', e.target.value)} />
            </Field>
            {formData.payPerWorker && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#15803d', marginBottom: 12 }}>
                💰 Total payout: <strong>KES {(Number(formData.payPerWorker) * Number(formData.workersNeeded)).toLocaleString()}</strong> for {formData.workersNeeded} worker(s)
                <br />Platform fee (15%): <strong>KES {(Number(formData.payPerWorker) * 0.15 * Number(formData.workersNeeded)).toLocaleString()}</strong>
              </div>
            )}
            <Field label="Payment Method *">
              <select className="pj-input" value={formData.paymentMethod} onChange={e => update('paymentMethod', e.target.value)}>
                <option value="MPESA">M-Pesa</option>
                <option value="AIRTEL">Airtel Money</option>
              </select>
            </Field>
            <Actions onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Review →" />
          </Card>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <Card title="Review & Post" icon={<CheckCircle size={20} />}>
            <ReviewGrid data={formData} />
            <Actions onBack={() => setStep(3)} onNext={handleSubmit} nextLabel={loading ? 'Posting…' : '🚀 Post Job'} disabled={loading} />
          </Card>
        )}

        {/* ── Step 5: Success ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', background: '#fff', borderRadius: 16, padding: '3rem 2rem', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Job Posted Successfully!</h2>
            <p style={{ color: '#64748b', margin: '8px 0 28px' }}>
              Workers in your area will start seeing and applying to your job right away.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="pj-btn-primary" onClick={() => navigate('/employer/dashboard')}>
                View Dashboard
              </button>
              <button className="pj-btn-secondary" onClick={() => { setStep(1); setFormData(initialForm); }}>
                Post Another Job
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pj-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; font-size: 14px;
          outline: none; background: #f8fafc;
          transition: border-color .2s;
          font-family: inherit;
        }
        .pj-input:focus { border-color: #6366f1; background: #fff; }
        .pj-textarea { resize: vertical; }
        .pj-btn-primary {
          background: #6366f1; color: #fff; border: none;
          padding: 11px 24px; border-radius: 10px; font-size: 15px;
          font-weight: 600; cursor: pointer; transition: background .2s, transform .1s;
        }
        .pj-btn-primary:hover { background: #4f46e5; }
        .pj-btn-primary:active { transform: scale(.97); }
        .pj-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .pj-btn-secondary {
          background: #f1f5f9; color: #475569; border: none;
          padding: 11px 24px; border-radius: 10px; font-size: 15px;
          font-weight: 600; cursor: pointer; transition: background .2s;
        }
        .pj-btn-secondary:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function Card({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,.07)', marginBottom: 16 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginTop: 0, marginBottom: '1.25rem' }}>
        <span style={{ color: '#6366f1' }}>{icon}</span>{title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Actions({ onBack, onNext, nextLabel = 'Next →', disabled = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: onBack ? 'space-between' : 'flex-end', marginTop: 24 }}>
      {onBack && (
        <button className="pj-btn-secondary" onClick={onBack}>← Back</button>
      )}
      <button className="pj-btn-primary" onClick={onNext} disabled={disabled}>{nextLabel}</button>
    </div>
  );
}

function ReviewGrid({ data }) {
  const rows = [
    ['Title', data.title],
    ['Category', data.category],
    ['Workers Needed', data.workersNeeded],
    ['Location', data.locationAddress],
    ['Job Date', data.jobDate],
    ['Start Time', data.startTime],
    ['Duration', `${data.durationHours} hours`],
    ['Pay Per Worker', `KES ${Number(data.payPerWorker).toLocaleString()}`],
    ['Payment Method', data.paymentMethod],
    ['Application Deadline', data.deadlineDate && data.deadlineTime ? `${data.deadlineDate} at ${data.deadlineTime}` : '—'],
    ['Description', data.description],
    ['Special Requirements', data.specialRequirements || '—'],
  ];
  return (
    <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
          <span style={{ minWidth: 160, color: '#64748b', fontWeight: 600 }}>{label}</span>
          <span style={{ color: '#1e293b', wordBreak: 'break-word' }}>{value || '—'}</span>
        </div>
      ))}
    </div>
  );
}
