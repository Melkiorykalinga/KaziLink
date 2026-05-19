import { Star, StarHalf } from 'lucide-react';

export default function RatingStars({ rating, size = 16, showValue = true }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalf && <StarHalf key="half" size={size} className="fill-yellow-400 text-yellow-400" />}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
      {showValue && <span className="ml-1 text-sm font-medium text-gray-700">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}
