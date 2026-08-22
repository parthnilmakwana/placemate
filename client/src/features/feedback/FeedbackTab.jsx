import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Heart, Loader } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../../components/Button';

function FeedbackTab() {
  const [category, setCategory] = useState('Suggestion');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0); // 1 to 5 rating
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const emojis = [
    { score: 1, char: '😭', label: 'Very Poor' },
    { score: 2, char: '🙁', label: 'Poor' },
    { score: 3, char: '😐', label: 'Neutral' },
    { score: 4, char: '🙂', label: 'Good' },
    { score: 5, char: '😀', label: 'Excellent' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/api/feedback', {
        category,
        rating,
        text
      });
      setSubmitted(true);
      setText('');
      setRating(0);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto structured-panel rounded-lg p-8 border border-brand-border bg-brand-surface flex flex-col items-center justify-center text-center gap-5 text-left">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-status-success">
          <CheckCircle2 size={24} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-xl font-bold text-text-main">Thank you for your feedback!</h3>
          <p className="text-xs text-text-muted leading-normal max-w-sm">
            Your notes have been sent to the engineering team. We read every submission to improve the PlaceMate platform.
          </p>
        </div>
        <Button
          onClick={() => setSubmitted(false)}
          variant="secondary"
        >
          Submit More Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-2xl text-left font-body">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main flex items-center gap-2.5">
          <MessageSquare className="text-brand-primary" size={24} />
          <span>Candidate Feedback</span>
        </h2>
        <p className="text-xs md:text-sm text-text-muted">
          Encountered a bug or want a new theme? Write us suggestions to help shape PlaceMate.
        </p>
      </div>

      <div className="structured-panel rounded-lg p-6 md:p-8 border border-brand-border bg-brand-surface">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Category Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Feedback Category
            </label>
            <div className="relative bg-brand-bg border border-brand-border rounded-md overflow-hidden focus-within:border-brand-primary transition-colors max-w-xs">
              <select
                className="w-full bg-transparent border-none py-2.5 px-3 text-sm text-text-main focus:outline-none appearance-none cursor-pointer"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Bug Report" className="bg-brand-surface">Bug Report</option>
                <option value="Suggestion" className="bg-brand-surface">UI/UX Suggestion</option>
                <option value="Feature Request" className="bg-brand-surface">Feature Request</option>
                <option value="Other" className="bg-brand-surface">Other Remarks</option>
              </select>
            </div>
          </div>

          {/* Rating Emojis */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              How is your experience with PlaceMate?
            </label>
            <div className="flex gap-3 sm:gap-4 mt-1 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji.score}
                  type="button"
                  onClick={() => setRating(emoji.score)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md border transition-colors cursor-pointer w-14 sm:w-16 focus:outline-none
                    ${rating === emoji.score 
                      ? 'bg-brand-primary/10 border-brand-primary text-text-main' 
                      : 'bg-brand-bg border-brand-border text-text-disabled hover:text-text-secondary'}`}
                >
                  <span className="text-lg select-none">{emoji.char}</span>
                  <span className="text-[9px] font-semibold tracking-tight">{emoji.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Description area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Tell us more details
            </label>
            <textarea
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
              placeholder="What can we improve? Please be as detailed as possible..."
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-500 text-sm focus:border-brand-primary focus:outline-none transition-colors resize-none overflow-hidden"
              value={text}
              onChange={e => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-brand-error/10 border border-brand-error/20 rounded-md text-brand-error">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            variant="primary"
            className="self-start"
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                <span>Sending Notes...</span>
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                <span>Submit Feedback</span>
              </>
            )}
          </Button>

        </form>
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-2 text-[10px] text-text-disabled font-semibold uppercase tracking-wider self-center">
        <Heart size={11} className="text-text-muted" />
        <span>Crafting the best placement toolkit together</span>
      </div>

    </div>
  );
}

export default FeedbackTab;
