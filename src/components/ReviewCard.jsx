import RatingStars from './RatingStars';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  return (
    <div className="review-card card">
      <div className="review-header">
        <div className="review-avatar">{review.reviewerName.charAt(0)}</div>
        <div className="review-meta">
          <span className="reviewer-name">{review.reviewerName}</span>
          <span className="review-date">{review.date}</span>
        </div>
        <RatingStars rating={review.rating} size={14} />
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  );
}
