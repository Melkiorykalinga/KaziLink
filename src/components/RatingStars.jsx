import { Star } from 'lucide-react';
import './RatingStars.css';

export default function RatingStars({ rating, size = 16, showValue = true }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="rating-stars">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className="star filled" />
      ))}
      {hasHalf && <Star key="half" size={size} className="star half" />}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="star empty" />
      ))}
      {showValue && <span className="rating-value">{rating}</span>}
    </div>
  );
}
