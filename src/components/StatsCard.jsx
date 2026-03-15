import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

export default function StatsCard({ icon: Icon, label, value, trend, trendValue, color = 'blue' }) {
  return (
    <div className={`stats-card card stats-${color}`}>
      <div className="stats-icon-wrap">
        <Icon size={22} />
      </div>
      <div className="stats-info">
        <span className="stats-value">{value}</span>
        <span className="stats-label">{label}</span>
      </div>
      {trend && (
        <div className={`stats-trend ${trend}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
