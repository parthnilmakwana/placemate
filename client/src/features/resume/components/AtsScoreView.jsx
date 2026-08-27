import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { api } from '../../../services/api';

const AtsScoreView = ({ profile }) => {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      setLoading(true);
      try {
        const response = await api.post('/api/ats/analyze-profile', { profile });
        if (response.success) {
          setScoreData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch ATS score', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch so it doesn't spam the API on every keystroke
    const timeoutId = setTimeout(() => {
      if (profile) fetchScore();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  if (loading && !scoreData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-brand-primary">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-semibold text-text-main">Analyzing Resume for ATS...</p>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm">
        Failed to load ATS analysis.
      </div>
    );
  }

  const { score, feedback } = scoreData;

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-status-success';
    if (s >= 50) return 'text-status-warning';
    return 'text-status-error';
  };

  return (
    <div className="flex flex-col h-full w-full bg-brand-surface p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Zap className="text-brand-primary" /> Real-time ATS Score
          </h2>
          <p className="text-xs text-text-secondary mt-1">Based on enterprise parser standards</p>
        </div>
        <div className={`text-4xl font-extrabold ${getScoreColor(score)}`}>
          {score}%
        </div>
      </div>


      {/* Issues Section */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
          Issues
          {feedback.filter(f => !f.passed).length > 0 && (
            <span className="bg-status-error/10 text-status-error px-2 py-0.5 rounded-full text-xs">
              {feedback.filter(f => !f.passed).length} Found
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {feedback.filter(f => !f.passed).map((item, index) => (
            <div 
              key={index} 
              className="p-3 rounded-lg border border-status-error/20 bg-status-error/5 flex flex-col gap-2"
            >
              <div className="flex gap-2">
                <XCircle size={16} className="text-status-error shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text-main">{item.name}</h4>
                  <p className="text-xs mt-1 text-text-secondary">{item.message}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-3 py-1 text-xs font-semibold bg-brand-surface border border-brand-border rounded hover:bg-brand-surface-hover transition-colors">
                  Fix Issue
                </button>
              </div>
            </div>
          ))}
          {feedback.filter(f => !f.passed).length === 0 && (
            <div className="text-xs text-text-muted italic">No issues found. Great job!</div>
          )}
        </div>
      </div>

      {/* Passed Checks Section */}
      <div>
        <h3 className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
          Passed Checks
        </h3>
        <div className="space-y-2">
          {feedback.filter(f => f.passed).map((item, index) => (
            <div key={index} className="flex items-start gap-2 py-2">
              <CheckCircle size={16} className="text-status-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-text-main">{item.name}</h4>
                <p className="text-xs text-text-muted mt-0.5">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {score < 100 && (
        <div className="mt-8 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
          <h4 className="text-sm font-bold text-text-main mb-2">How to improve?</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Ensure your resume has standard section headings like "Experience", "Education", and "Skills". 
            Missing sections will cause Applicant Tracking Systems to fail parsing your data properly.
          </p>
        </div>
      )}
    </div>
  );
};

export default AtsScoreView;
