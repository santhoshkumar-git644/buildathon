export default function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <p>{review.rating} stars • {new Date(review.date).toLocaleDateString()}</p>
      <strong>{review.author}</strong>
      <p>{review.comment}</p>
      {review.photo && <small>Photo: {review.photo}</small>}
    </article>
  );
}
