import React, { useState } from 'react';
import { Target, Loader2, CheckCircle, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';

const JobMatchView = ({ profile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/ats/analyze', { 
        jobDescription,
        profile 
      });
      
      if (response.success) {
        setAnalysis(response.data);
      } else {
        setError('Failed to analyze match.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-status-success';
    if (s >= 50) return 'text-status-warning';
    return 'text-status-error';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-brand-primary p-6">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-semibold text-text-main text-center">
          Analyzing your resume against the job description...<br/>
          <span className="text-xs text-text-secondary font-normal">This takes about 5-10 seconds using AI.</span>
        </p>
      </div>
    );
  }

  if (analysis) {
    const { jobMatch, keywordMatch } = analysis;
    
    return (
      <div className="flex flex-col h-full w-full bg-brand-surface p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAnalysis(null)}
              className="text-text-secondary hover:text-text-main text-xs flex items-center transition-colors"
            >
              <ChevronRight className="rotate-180" size={16} /> Back
            </button>
            <h2 className="text-lg font-bold text-text-main">Match Results</h2>
          </div>
          <div className={`text-3xl font-extrabold ${getScoreColor(jobMatch.score)}`}>
            {jobMatch.score}%
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-status-error" /> 
            Missing Critical Keywords
          </h3>
          {keywordMatch.missing && keywordMatch.missing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordMatch.missing.map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-status-error/10 text-status-error border border-status-error/20 rounded text-xs font-semibold">
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">Great! You have all the critical keywords.</p>
          )}
        </div>

        {/* Matched Keywords */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-status-success" /> 
            Matched Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywordMatch.matched.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-status-success/10 text-status-success border border-status-success/20 rounded text-xs font-semibold">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="space-y-4">
          <div className="p-4 bg-brand-bg/50 border border-brand-border rounded-xl">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2">Key Strengths</h4>
            <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
              {jobMatch.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          
          <div className="p-4 bg-brand-bg/50 border border-brand-border rounded-xl">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2">Critical Gaps</h4>
            <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
              {jobMatch.gaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-brand-surface p-6">
      <h2 className="text-lg font-bold text-text-main flex items-center gap-2 mb-2">
        <Target className="text-brand-primary" /> Target Job Match
      </h2>
      <p className="text-xs text-text-secondary mb-6 leading-relaxed">
        Paste the job description of the role you are applying for. Our AI will analyze your current editor content against the requirements and tell you exactly which keywords you are missing.
      </p>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full flex-1 bg-brand-bg border border-brand-border rounded-xl p-4 text-sm text-text-main focus:outline-none focus:border-brand-primary resize-none mb-4"
      />

      {error && <p className="text-xs text-status-error mb-4">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={!jobDescription.trim()}
        className="w-full py-3 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        Analyze Match
      </button>
    </div>
  );
};

export default JobMatchView;
