import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { workers } from '../data/mockData';
import WorkerCard from '../components/WorkerCard';
import './BrowseWorkers.css';

export default function BrowseWorkers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');

  const filteredWorkers = workers.filter(w => {
    if (filterAvailability !== 'all' && w.availability !== filterAvailability) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return w.name.toLowerCase().includes(q) || w.skills.some(s => s.toLowerCase().includes(q)) || w.title.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Find <span className="gradient-text">Top Talent</span></h1>
          <p className="page-subtitle">Browse verified workers with proven track records and instant availability.</p>
        </div>

        <div className="workers-toolbar">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search by name, skill, or title..." className="input-field" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-pills">
            {['all', 'available', 'busy'].map(f => (
              <button key={f} className={`pill-btn ${filterAvailability === f ? 'active' : ''}`} onClick={() => setFilterAvailability(f)}>
                {f === 'all' ? 'All' : f === 'available' ? '🟢 Available' : '🟡 Busy'}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">{filteredWorkers.length} workers found</p>

        <div className="workers-grid">
          {filteredWorkers.map(worker => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="no-results"><p>No workers match your search. Try different criteria.</p></div>
        )}
      </div>
    </div>
  );
}
