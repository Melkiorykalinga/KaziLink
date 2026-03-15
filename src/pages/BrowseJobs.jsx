import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Grid3X3, List } from 'lucide-react';
import { jobs, categories } from '../data/mockData';
import JobCard from '../components/JobCard';
import './BrowseJobs.css';

export default function BrowseJobs() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'gig' && job.type !== 'gig') return false;
    if (activeTab === 'fulltime' && job.type !== 'full-time') return false;
    if (selectedCategory !== 'all' && job.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return job.title.toLowerCase().includes(q) || 
             job.skills.some(s => s.toLowerCase().includes(q)) ||
             job.company.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            Find Your Next <span className="gradient-text">Opportunity</span>
          </h1>
          <p className="page-subtitle">
            Browse {jobs.length}+ jobs from verified employers. Filter by type, category, and more.
          </p>
        </div>

        {/* Tabs */}
        <div className="jobs-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Jobs
            <span className="tab-count">{jobs.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'gig' ? 'active' : ''}`}
            onClick={() => setActiveTab('gig')}
          >
            ⚡ Quick Gigs
            <span className="tab-count">{jobs.filter(j => j.type === 'gig').length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'fulltime' ? 'active' : ''}`}
            onClick={() => setActiveTab('fulltime')}
          >
            💼 Career Opportunities
            <span className="tab-count">{jobs.filter(j => j.type === 'full-time').length}</span>
          </button>
        </div>

        <div className="jobs-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filter-header">
              <h3><SlidersHorizontal size={16} /> Filters</h3>
            </div>

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="category" checked={selectedCategory === 'all'} onChange={() => setSelectedCategory('all')} />
                  <span>All Categories</span>
                </label>
                {categories.slice(0, 8).map(cat => (
                  <label key={cat.id} className="filter-option">
                    <input type="radio" name="category" checked={selectedCategory === cat.name} onChange={() => setSelectedCategory(cat.name)} />
                    <span>{cat.name}</span>
                    <span className="filter-count">{cat.count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Pay Range</h4>
              <div className="filter-options">
                <label className="filter-option"><input type="checkbox" /><span>Under $20/hr</span></label>
                <label className="filter-option"><input type="checkbox" /><span>$20 - $30/hr</span></label>
                <label className="filter-option"><input type="checkbox" /><span>$30 - $50/hr</span></label>
                <label className="filter-option"><input type="checkbox" /><span>$50+/hr</span></label>
              </div>
            </div>

            <div className="filter-group">
              <h4>Urgency</h4>
              <div className="filter-options">
                <label className="filter-option"><input type="checkbox" /><span>🔥 Urgent</span></label>
                <label className="filter-option"><input type="checkbox" /><span>⏰ Today</span></label>
                <label className="filter-option"><input type="checkbox" /><span>Normal</span></label>
              </div>
            </div>

            <div className="filter-group">
              <h4>Distance</h4>
              <div className="filter-options">
                <label className="filter-option"><input type="checkbox" /><span><MapPin size={12} /> Within 5 mi</span></label>
                <label className="filter-option"><input type="checkbox" /><span><MapPin size={12} /> Within 10 mi</span></label>
                <label className="filter-option"><input type="checkbox" /><span><MapPin size={12} /> Within 25 mi</span></label>
                <label className="filter-option"><input type="checkbox" /><span>🌐 Remote</span></label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="jobs-main">
            <div className="jobs-toolbar">
              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search jobs, skills, or companies..."
                  className="input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="toolbar-right">
                <button className="filter-toggle-btn btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
                <div className="view-toggle">
                  <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 size={16} /></button>
                  <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={16} /></button>
                </div>
              </div>
            </div>

            <p className="results-count">{filteredJobs.length} jobs found</p>

            <div className={`jobs-grid ${viewMode}`}>
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="no-results">
                <p>No jobs match your filters. Try broadening your search.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
