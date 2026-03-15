import { Link } from 'react-router-dom';
import { Zap, Shield, CreditCard, MapPin, ArrowRight, Users, Briefcase, Star, Clock, CheckCircle } from 'lucide-react';
import { platformStats, categories, reviews } from '../data/mockData';
import ReviewCard from '../components/ReviewCard';
import './Landing.css';

export default function Landing() {
  const features = [
    { icon: Zap, title: 'Instant Matching', desc: 'Post a job and get matched with qualified workers in minutes, not days.', color: 'blue' },
    { icon: Shield, title: 'Trust & Safety', desc: 'Verified profiles, background checks, and a rating system you can count on.', color: 'violet' },
    { icon: CreditCard, title: 'Fast Payments', desc: 'Secure payments processed within hours. No chasing invoices.', color: 'emerald' },
    { icon: MapPin, title: 'Location Smart', desc: 'Find workers nearby or hire remote talent. Distance-based matching built in.', color: 'amber' },
  ];

  const steps = [
    { num: '01', title: 'Post or Discover', desc: 'Employers post a gig or full-time role. Workers browse and search opportunities.', icon: Briefcase },
    { num: '02', title: 'Match & Apply', desc: 'Workers apply instantly. Employers review profiles, ratings, and select the best fit.', icon: Users },
    { num: '03', title: 'Work & Get Paid', desc: 'Track progress in real-time. Payments are automated and secured by the platform.', icon: CheckCircle },
  ];

  const stats = [
    { value: '12K+', label: 'Jobs Posted', icon: Briefcase },
    { value: '8K+', label: 'Active Workers', icon: Users },
    { value: '4.8', label: 'Avg Rating', icon: Star },
    { value: '<2hrs', label: 'Avg Payout', icon: Clock },
  ];

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fade-in-down">
            <Zap size={14} />
            <span>The Future of Hiring is Here</span>
          </div>

          <h1 className="hero-title animate-fade-in-up delay-1">
            Hire Talent<br />
            <span className="gradient-text">As Easy As</span><br />
            Ordering a Ride
          </h1>

          <p className="hero-description animate-fade-in-up delay-2">
            Post a job, get matched with verified workers instantly, and manage everything — 
            from gig work to full-time careers — all in one powerful platform.
          </p>

          <div className="hero-actions animate-fade-in-up delay-3">
            <Link to="/post-job" className="btn btn-primary btn-lg">
              <Briefcase size={18} />
              Hire Now
            </Link>
            <Link to="/browse-jobs" className="btn btn-secondary btn-lg">
              Find Work
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="hero-stats animate-fade-in-up delay-4">
            {stats.map((stat, i) => (
              <div key={i} className="hero-stat">
                <stat.icon size={18} className="hero-stat-icon" />
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why <span className="gradient-text">GigHire</span>?</h2>
            <p className="section-subtitle">
              Everything you need to hire and work, built into one seamless experience.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, i) => (
              <div key={i} className={`feature-card card animate-fade-in-up delay-${i + 1}`}>
                <div className={`feature-icon feature-icon-${feat.color}`}>
                  <feat.icon size={24} />
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
            <p className="section-subtitle">
              Three simple steps to get started — whether you're hiring or looking for work.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card animate-fade-in-up delay-2">
                <div className="step-number">{step.num}</div>
                <div className="step-icon-wrap">
                  <step.icon size={28} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
            <p className="section-subtitle">
              Find opportunities across dozens of industries and skill categories.
            </p>
          </div>

          <div className="categories-grid">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to="/browse-jobs" className="category-card card">
                <span className="category-count">{cat.count} jobs</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by <span className="gradient-text">Thousands</span></h2>
            <p className="section-subtitle">
              See what employers and workers are saying about GigHire.
            </p>
          </div>

          <div className="testimonials-grid">
            {reviews.slice(0, 3).map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-desc">
              Join thousands of employers and workers who are already using GigHire.
            </p>
            <div className="cta-actions">
              <Link to="/post-job" className="btn btn-primary btn-lg">Post Your First Job</Link>
              <Link to="/browse-jobs" className="btn btn-secondary btn-lg">Start Working Today</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
