import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  Briefcase, CheckCircle2, XCircle, ChevronRight, 
  ChevronLeft, AlertCircle, ExternalLink, Calendar, Search 
} from 'lucide-react';
import SkeletonLoader from '../../../components/SkeletonLoader';

function ApplicationTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  // Fetch complete matched history on mount
  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch maximum items (e.g. 50) for tracking
      const response = await api.get('/api/jobs/history?limit=50');
      setJobs(response.data || []);
    } catch (err) {
      console.error('Failed to load tracking history:', err);
      setError('Could not retrieve your job pipeline history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle status update locally first for instant visual response, then update backend
  const updateStatus = async (jobId, newStatus) => {
    // Save backup state
    const previousJobs = [...jobs];
    
    // Update local state instantly
    setJobs(prev => prev.map(job => 
      job._id === jobId ? { ...job, status: newStatus } : job
    ));

    try {
      await api.patch(`/api/jobs/${jobId}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Restore previous state if request fails
      setJobs(previousJobs);
      setError('Failed to update job status on server. Please try again.');
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  // Filter jobs based on text search (title / company)
  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query)
    );
  });

  // Group by Kanban columns
  const columns = {
    matched: {
      id: 'matched',
      title: 'Discovered Matches',
      color: 'border-t-brand-primary text-indigo-400',
      bgColor: 'bg-brand-primary/2',
      items: filteredJobs.filter(j => j.status === 'matched' || !j.status)
    },
    applied: {
      id: 'applied',
      title: 'Applications Active',
      color: 'border-t-brand-secondary text-teal-400',
      bgColor: 'bg-teal-500/2',
      items: filteredJobs.filter(j => j.status === 'applied')
    },
    rejected: {
      id: 'rejected',
      title: 'Archived / Rejected',
      color: 'border-t-red-500/50 text-red-400',
      bgColor: 'bg-red-500/2',
      items: filteredJobs.filter(j => j.status === 'rejected')
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-left">
      
      {/* Filters and search block */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tracked jobs..."
            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          onClick={fetchHistory}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/8 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
        >
          Refresh Tracker
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl text-xs bg-brand-error/10 border border-brand-error/20 text-brand-error animate-shake">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="jobs" />
      ) : (
        /* Kanban Columns Container */
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 h-auto md:h-[calc(100vh-22rem)] md:min-h-[480px] md:overflow-hidden">
          
          {Object.values(columns).map(col => {
            const isHovered = draggedOverCol === col.id;
            return (
              <div 
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDraggedOverCol(col.id)}
                onDragLeave={() => {
                  setDraggedOverCol(prev => prev === col.id ? null : prev);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedOverCol(null);
                  const jobId = e.dataTransfer.getData('text/plain');
                  if (jobId) {
                    updateStatus(jobId, col.id);
                  }
                }}
                className={`flex flex-col rounded-2xl border transition-all duration-200 ${col.bgColor} h-[450px] md:h-full overflow-hidden shrink-0
                  ${isHovered ? 'border-brand-primary/40 ring-1 ring-brand-primary/20 bg-brand-primary/5 scale-[1.01]' : 'border-white/5'}`}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-white/5 border-t-[3px] ${col.color} flex items-center justify-between bg-black/25`}>
                  <span className="text-xs font-black uppercase tracking-wider">{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400">
                    {col.items.length}
                  </span>
                </div>

                {/* Cards scroll panel */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4.5 custom-scrollbar">
                  {col.items.length === 0 ? (
                    <div className="m-auto text-center py-12 text-slate-600 text-xs italic">
                      No jobs in this stage.
                    </div>
                  ) : (
                    col.items.map(job => (
                      <div 
                        key={job._id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', job._id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-950/20 hover:border-white/10 transition-all duration-200 flex flex-col gap-3 group relative cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-primary transition-colors" title={job.title}>
                              {job.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 truncate mt-0.5">{job.company}</span>
                          </div>
                          
                          {job.matchScore && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${
                              job.matchScore >= 85 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15'
                            }`}>
                              {job.matchScore}%
                            </span>
                          )}
                        </div>

                        {/* Info lines */}
                        <div className="flex flex-col gap-1 text-[9px] text-slate-500 pt-1.5 border-t border-white/2">
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="text-slate-400 truncate max-w-[100px]">{job.location || 'Remote'}</span>
                          </div>
                          {job.createdAt && (
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-0.5"><Calendar size={8} /> Added:</span>
                              <span className="text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex items-center justify-between gap-2 border-t border-white/2 pt-2.5 mt-1">
                          {/* Direct link */}
                          <a 
                            href={getAbsoluteUrl(job.applyUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-secondary hover:text-teal-300 transition-colors"
                          >
                            <span>Apply URL</span>
                            <ExternalLink size={8} />
                          </a>

                          {/* Status shifting arrows */}
                          <div className="flex gap-1">
                            {col.id === 'matched' && (
                              <>
                                <button 
                                  onClick={() => updateStatus(job._id, 'rejected')}
                                  className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                                  title="Archive / Reject"
                                >
                                  <XCircle size={10} />
                                </button>
                                <button 
                                  onClick={() => updateStatus(job._id, 'applied')}
                                  className="p-1 rounded bg-brand-secondary/15 border border-brand-secondary/25 text-brand-secondary hover:bg-brand-secondary/25 cursor-pointer transition-colors flex items-center gap-0.5 text-[8px] font-bold px-1.5"
                                  title="Move to Applied"
                                >
                                  <span>Apply</span>
                                  <ChevronRight size={8} />
                                </button>
                              </>
                            )}

                            {col.id === 'applied' && (
                              <>
                                <button 
                                  onClick={() => updateStatus(job._id, 'matched')}
                                  className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-0.5 text-[8px] font-bold px-1.5"
                                  title="Return to Discovered"
                                >
                                  <ChevronLeft size={8} />
                                  <span>Reset</span>
                                </button>
                                <button 
                                  onClick={() => updateStatus(job._id, 'rejected')}
                                  className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                                  title="Mark Rejected"
                                >
                                  <XCircle size={10} />
                                </button>
                              </>
                            )}

                            {col.id === 'rejected' && (
                              <button 
                                onClick={() => updateStatus(job._id, 'matched')}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-0.5 text-[8px] font-bold px-2"
                                title="Restore to Discovered"
                              >
                                <CheckCircle2 size={9} className="text-emerald-400" />
                                <span>Restore</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}

export default ApplicationTracker;
