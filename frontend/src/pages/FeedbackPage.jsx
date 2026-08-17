import { useEffect, useState } from 'react';
import './FeedbackPage.css';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

function StarInput({ value, onChange }) {
  return (
    <div className="feedback-page__star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`feedback-page__star ${n <= value ? 'feedback-page__star--filled' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="feedback-page__star-display">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'feedback-page__star--filled' : ''}>★</span>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await feedbackService.getAll();
      setFeedbacks(res?.data || []);
    } catch {
      // list load fail ho to bhi form kaam kare
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError('Please select a rating.');
      return;
    }
    if (!message.trim()) {
      setError('Please write your feedback.');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.submit(rating, message.trim());
      setRating(0);
      setMessage('');
      loadFeedbacks();
    } catch {
      setError('Feedback submit nahi ho paya. Dobara try karo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <h1 className="feedback-page__title">Feedback</h1>

      <form className="feedback-page__form" onSubmit={handleSubmit}>
        <label className="feedback-page__label">Your rating</label>
        <StarInput value={rating} onChange={setRating} />

        <label className="feedback-page__label">Your feedback</label>
        <textarea
          className="feedback-page__textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Apna feedback likhein..."
          rows={4}
          maxLength={1000}
        />

        {error && <p className="feedback-page__error">{error}</p>}

        <button type="submit" className="feedback-page__submit-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <div className="feedback-page__list">
        {loading && <p className="feedback-page__status">Loading...</p>}
        {!loading && feedbacks.length === 0 && (
          <p className="feedback-page__status">Abhi tak koi feedback nahi hai.</p>
        )}
        {!loading && feedbacks.map((f) => (
          <div key={f.FeedbackId} className="feedback-page__card">
            {f.UserPicture ? (
              <img src={f.UserPicture} alt="" referrerPolicy="no-referrer" className="feedback-page__avatar" />
            ) : (
              <span className="feedback-page__avatar feedback-page__avatar--fallback">
                {(f.UserName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="feedback-page__card-body">
              <div className="feedback-page__card-header">
                <span className="feedback-page__card-name">{f.UserName || 'Unknown'}</span>
                <span className="feedback-page__card-date">
                  {new Date(f.CreatedAt).toLocaleDateString()}
                </span>
              </div>
              <StarDisplay rating={f.Rating} />
              <p className="feedback-page__card-message">{f.Message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}