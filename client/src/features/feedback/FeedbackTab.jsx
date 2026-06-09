import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Heart } from 'lucide-react';
import { api } from '../../services/api';

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
      <div className="w-full max-w-xl mx-auto glass-panel rounded-2xl p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center gap-5 animate-fade-in text-left">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 size={28} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-xl font-bold text-white">Thank you for your feedback!</h3>
          <p className="text-xs text-slate-400 leading-normal max-w-sm">
            Your notes have been sent to the engineering team. We read every submission to improve the PlaceMate platform.
          </p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
        >
          Submit More Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-2xl animate-fade-in text-left">
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <MessageSquare className="text-brand-primary animate-bounce-slow" size={24} />
          <span>Candidate Feedback</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          Encountered a bug or want a new theme? Write us suggestions to help shape PlaceMate.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-xl border border-white/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Category Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Feedback Category
            </label>
            <div className="relative bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-primary/50 transition-colors max-w-xs">
              <select
                className="w-full bg-transparent border-none py-3 px-4 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Bug Report" className="bg-slate-900">Bug Report</option>
                <option value="Suggestion" className="bg-slate-900">UI/UX Suggestion</option>
                <option value="Feature Request" className="bg-slate-900">Feature Request</option>
                <option value="Other" className="bg-slate-900">Other Remarks</option>
              </select>
            </div>
          </div>

          {/* Rating Emojis */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              How is your experience with PlaceMate?
            </label>
            <div className="flex gap-4 sm:gap-6 mt-1 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji.score}
                  type="button"
                  onClick={() => setRating(emoji.score)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-150 cursor-pointer w-14 sm:w-16 focus:outline-none focus:ring-1 focus:ring-brand-primary/30
                    ${rating === emoji.score 
                      ? 'bg-brand-primary/10 border-brand-primary/40 text-white scale-105' 
                      : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-350 hover:bg-black/30'}`}
                >
                  <span className="text-xl select-none">{emoji.char}</span>
                  <span className="text-[9px] font-bold tracking-tight">{emoji.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Description area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tell us more details
            </label>
            <textarea
              placeholder="What can we improve? Please be as detailed as possible..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-650 text-sm focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs cursor-pointer transition-all duration-250 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed self-start active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-primary/45"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                <span>Sending Notes...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Submit Feedback</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider self-center">
        <Heart size={11} className="text-brand-primary animate-pulse" />
        <span>Crafting the best placement toolkit together</span>
      </div>

    </div>
  );
}

export default FeedbackTab;
