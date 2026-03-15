import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, ListChecks, DollarSign, CheckCircle, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';
import './PostJob.css';

export default function PostJob() {
  const navigate = useNavigate();
  const { postJob } = useApp();
  const [step, setStep] = useState(1);
  const [jobType, setJobType] = useState('gig');
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', skills: '',
    experience: 'any', requirements: '',
    payType: 'hourly', pay: '', duration: '', location: '',
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    postJob({
      ...formData,
      type: jobType,
      companyLogo: '🏢',
      company: 'Your Company',
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      requirements: formData.requirements.split('\n').filter(Boolean),
      benefits: ['Flexible schedule'],
      urgency: 'normal',
      distance: '—',
      verified: true,
    });
    setStep(5); // success state
  };

  const steps = [
    { num: 1, label: 'Basics', icon: FileText },
    { num: 2, label: 'Requirements', icon: ListChecks },
    { num: 3, label: 'Compensation', icon: DollarSign },
    { num: 4, label: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="page-wrapper">
      <div className="container post-job-container">
        <div className="post-job-header">
          <h1 className="page-title">
            Post a <span className="gradient-text">{jobType === 'gig' ? 'Quick Gig' : 'Full-Time Job'}</span>
          </h1>
          <p className="page-subtitle">
            Fill in the details and we'll match you with the best candidates.
          </p>
        </div>

        {/* Job Type Toggle */}
        <div className="job-type-toggle">
          <button className={`type-btn ${jobType === 'gig' ? 'active gig' : ''}`} onClick={() => setJobType('gig')}>
            <Zap size={18} /> Quick Gig
          </button>
          <button className={`type-btn ${jobType === 'fulltime' ? 'active fulltime' : ''}`} onClick={() => setJobType('fulltime')}>
            <Briefcase size={18} /> Full-Time Position
          </button>
        </div>

        {step <= 4 && (
          /* Progress Steps */
          <div className="progress-steps">
            {steps.map((s) => (
              <div key={s.num} className={`progress-step ${step >= s.num ? 'active' : ''} ${step === s.num ? 'current' : ''}`}>
                <div className="step-dot">
                  {step > s.num ? <CheckCircle size={16} /> : <s.icon size={16} />}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
            <div className="progress-line">
              <div className="progress-fill" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            </div>
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="form-step card animate-fade-in-up">
            <h2><FileText size={20} /> Job Basics</h2>
            <div className="form-group">
              <label>Job Title *</label>
              <input className="input-field" placeholder="e.g. Warehouse Associate, React Developer..." value={formData.title} onChange={e => update('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select className="input-field" value={formData.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="input-field textarea" placeholder="Describe the role, responsibilities, and what makes it great..." value={formData.description} onChange={e => update('description', e.target.value)} rows={5}></textarea>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input className="input-field" placeholder="e.g. Brooklyn, NY or Remote" value={formData.location} onChange={e => update('location', e.target.value)} />
            </div>
            <div className="form-actions">
              <div></div>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Next <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="form-step card animate-fade-in-up">
            <h2><ListChecks size={20} /> Requirements</h2>
            <div className="form-group">
              <label>Skills (comma-separated) *</label>
              <input className="input-field" placeholder="e.g. Heavy Lifting, Forklift, React, TypeScript" value={formData.skills} onChange={e => update('skills', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select className="input-field" value={formData.experience} onChange={e => update('experience', e.target.value)}>
                <option value="any">Any Level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
            <div className="form-group">
              <label>Requirements (one per line)</label>
              <textarea className="input-field textarea" placeholder="Must be 18+&#10;Background check required&#10;Own transportation" value={formData.requirements} onChange={e => update('requirements', e.target.value)} rows={4}></textarea>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Compensation */}
        {step === 3 && (
          <div className="form-step card animate-fade-in-up">
            <h2><DollarSign size={20} /> Compensation</h2>
            <div className="form-group">
              <label>Pay Type</label>
              <select className="input-field" value={formData.payType} onChange={e => update('payType', e.target.value)}>
                <option value="hourly">Hourly Rate</option>
                <option value="fixed">Fixed Amount</option>
                {jobType === 'fulltime' && <option value="yearly">Annual Salary</option>}
              </select>
            </div>
            <div className="form-group">
              <label>Amount ($) *</label>
              <input className="input-field" type="number" placeholder={formData.payType === 'yearly' ? 'e.g. 85000' : 'e.g. 25'} value={formData.pay} onChange={e => update('pay', e.target.value)} />
            </div>
            {jobType === 'gig' && (
              <div className="form-group">
                <label>Duration</label>
                <input className="input-field" placeholder="e.g. 6 hours, 2 days" value={formData.duration} onChange={e => update('duration', e.target.value)} />
              </div>
            )}
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Review <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="form-step card animate-fade-in-up">
            <h2><CheckCircle size={20} /> Review & Post</h2>
            <div className="review-grid">
              <div className="review-item"><span className="review-label">Title</span><span className="review-value">{formData.title || '—'}</span></div>
              <div className="review-item"><span className="review-label">Type</span><span className="review-value">{jobType === 'gig' ? '⚡ Quick Gig' : '💼 Full-Time'}</span></div>
              <div className="review-item"><span className="review-label">Category</span><span className="review-value">{formData.category || '—'}</span></div>
              <div className="review-item"><span className="review-label">Location</span><span className="review-value">{formData.location || '—'}</span></div>
              <div className="review-item"><span className="review-label">Pay</span><span className="review-value">${formData.pay} {formData.payType}</span></div>
              <div className="review-item full"><span className="review-label">Description</span><span className="review-value">{formData.description || '—'}</span></div>
              <div className="review-item full"><span className="review-label">Skills</span><span className="review-value">{formData.skills || '—'}</span></div>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(3)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit}>🚀 Post Job</button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 5 && (
          <div className="success-card card animate-scale-in">
            <div className="success-icon">🎉</div>
            <h2>Job Posted Successfully!</h2>
            <p>Your job is now live. Qualified workers will start applying within minutes.</p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate('/employer-dashboard')}>View Dashboard</button>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setFormData({ title: '', category: '', description: '', skills: '', experience: 'any', requirements: '', payType: 'hourly', pay: '', duration: '', location: '' }); }}>Post Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
